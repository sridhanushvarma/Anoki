import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, checkRateLimit, logAuditEvent, checkAccountLockout, handleFailedLogin } from '@/lib/auth'
import { addSecurityHeaders } from '@/lib/securityHeaders'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting
    if (!(await checkRateLimit(clientIp, 'LOGIN'))) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      ))
    }

    // Validate input
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      ))
    }

    const { email, password } = validationResult.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.password) {
      await logAuditEvent(null, 'LOGIN_FAILED', 'user', clientIp, userAgent, {
        email,
        reason: 'User not found or OAuth user',
      })
      
      // Record failed login attempt
      await prisma.loginAttempt.create({
        data: {
          email: email.toLowerCase(),
          ipAddress: clientIp,
          userAgent,
          success: false,
          failureReason: 'Invalid credentials',
        },
      })

      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      ))
    }

    // Check if user is active
    if (!user.isActive) {
      await logAuditEvent(user.id, 'LOGIN_FAILED', 'user', clientIp, userAgent, {
        email,
        reason: 'Account deactivated',
      })

      return addSecurityHeaders(NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      ))
    }

    // TODO: Re-enable account lockout after fixing Prisma client
    // Check if account is locked
    // if (!(await checkAccountLockout(user.id))) {
    //   await logAuditEvent(user.id, 'LOGIN_FAILED', 'user', clientIp, userAgent, {
    //     email,
    //     reason: 'Account locked',
    //   })
    //
    //   return NextResponse.json(
    //     { error: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' },
    //     { status: 423 } // 423 Locked
    //   )
    // }

    // Verify password
    const isValidPassword = await verifyPassword(user.password, password)
    if (!isValidPassword) {
      await logAuditEvent(user.id, 'LOGIN_FAILED', 'user', clientIp, userAgent, {
        email,
        reason: 'Invalid password',
      })

      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: email.toLowerCase(),
          ipAddress: clientIp,
          userAgent,
          success: false,
          failureReason: 'Invalid password',
        },
      })

      // TODO: Re-enable failed login handling after fixing Prisma client
      // await handleFailedLogin(user.id, clientIp)

      return addSecurityHeaders(NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      ))
    }

    // Create session
    const { accessToken, refreshToken } = await createSession(user.id, clientIp, userAgent)

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Record successful login attempt
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        email: email.toLowerCase(),
        ipAddress: clientIp,
        userAgent,
        success: true,
      },
    })

    // Log successful login
    await logAuditEvent(user.id, 'LOGIN_SUCCESS', 'user', clientIp, userAgent)

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      image: user.image,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
    }

    // Set HTTP-only cookies
    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
    })

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
    console.error('Login error:', error)
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
