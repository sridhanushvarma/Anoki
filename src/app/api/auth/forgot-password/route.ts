import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, logAuditEvent } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting
    if (!(await checkRateLimit(clientIp, 'FORGOT_PASSWORD'))) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body)
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
    // But only send email if user exists
    if (user && user.isActive) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Save reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        },
      })

      // Send reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken)
        
        await logAuditEvent(user.id, 'PASSWORD_RESET_REQUESTED', 'user', clientIp, userAgent)
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        // Don't expose email sending errors to the user
      }
    } else {
      // Log attempt for non-existent or inactive user
      await logAuditEvent(null, 'PASSWORD_RESET_FAILED', 'user', clientIp, userAgent, {
        email,
        reason: 'User not found or inactive',
      })
    }

    // Always return success message
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
