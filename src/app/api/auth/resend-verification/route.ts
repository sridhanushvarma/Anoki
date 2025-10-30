import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, logAuditEvent } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting
    if (!(await checkRateLimit(clientIp, 'RESEND_VERIFICATION'))) {
      return NextResponse.json(
        { error: 'Too many verification email requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate input
    const validationResult = resendVerificationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user || !user.isActive) {
      await logAuditEvent(null, 'RESEND_VERIFICATION_FAILED', 'user', clientIp, userAgent, {
        email,
        reason: 'User not found or inactive',
      })
      
      return NextResponse.json({
        message: 'If an account with that email exists and is not verified, a verification email has been sent.',
      })
    }

    // Check if email is already verified
    if (user.emailVerified) {
      await logAuditEvent(user.id, 'RESEND_VERIFICATION_FAILED', 'user', clientIp, userAgent, {
        email,
        reason: 'Email already verified',
      })
      
      return NextResponse.json({
        message: 'Email is already verified.',
      })
    }

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
      },
    })

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        userId: user.id,
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        expires: verificationExpires,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken)
      await logAuditEvent(user.id, 'VERIFICATION_EMAIL_RESENT', 'user', clientIp, userAgent)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      await logAuditEvent(user.id, 'VERIFICATION_EMAIL_FAILED', 'user', clientIp, userAgent, {
        error: emailError instanceof Error ? emailError.message : 'Unknown email error',
      })
      
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent successfully. Please check your inbox.',
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
