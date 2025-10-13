import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Validate input
    const validationResult = verifyEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { token } = validationResult.data

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'EMAIL_VERIFICATION',
        expires: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    })

    if (!verificationToken) {
      await logAuditEvent(null, 'EMAIL_VERIFICATION_FAILED', 'user', clientIp, userAgent, {
        token: token.substring(0, 8) + '...',
        reason: 'Invalid or expired token',
      })
      
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if email is already verified
    if (verificationToken.user?.emailVerified) {
      await logAuditEvent(verificationToken.userId, 'EMAIL_VERIFICATION_FAILED', 'user', clientIp, userAgent, {
        reason: 'Email already verified',
      })
      
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Verify the email
    if (verificationToken.userId) {
      await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      })
    }

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    // Send welcome email
    try {
      if (verificationToken.user) {
        await sendWelcomeEmail(verificationToken.user.email, verificationToken.user.name)
      }
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the verification if welcome email fails
    }

    // Log successful verification
    await logAuditEvent(verificationToken.userId, 'EMAIL_VERIFIED', 'user', clientIp, userAgent)

    return NextResponse.json({
      message: 'Email verified successfully! Welcome to Anoki.',
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify email via URL (for email links)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Use the same verification logic as POST
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ token }),
    })

    return await POST(postRequest)

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
