import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSession, checkRateLimit, logAuditEvent } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { addSecurityHeaders } from '@/lib/securityHeaders'
import crypto from 'crypto'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting
    if (!(await checkRateLimit(clientIp, 'REGISTER'))) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      ))
    }

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      ))
    }

    const { name, email, password } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      await logAuditEvent(null, 'REGISTER_FAILED', 'user', clientIp, userAgent, {
        email,
        reason: 'Email already exists',
      })
      return addSecurityHeaders(NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      ))
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        provider: 'EMAIL',
      },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
      },
    })

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        expires: verificationExpires,
        userId: user.id,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken)
      await logAuditEvent(user.id, 'VERIFICATION_EMAIL_SENT', 'user', clientIp, userAgent)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email sending fails
      await logAuditEvent(user.id, 'VERIFICATION_EMAIL_FAILED', 'user', clientIp, userAgent, {
        error: emailError instanceof Error ? emailError.message : 'Unknown email error',
      })
    }

    // Create session
    const { accessToken, refreshToken } = await createSession(user.id, clientIp, userAgent)

    // Log successful registration
    await logAuditEvent(user.id, 'REGISTER_SUCCESS', 'user', clientIp, userAgent)

    // Set HTTP-only cookies
    const response = NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      user,
      emailVerificationRequired: true,
    }, { status: 201 })

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return addSecurityHeaders(response)

  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)

    // Check for database connection errors
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      ))
    }

    return addSecurityHeaders(NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    ))
  }
}
