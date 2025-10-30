import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAccessToken, logAuditEvent, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyTwoFactorToken, validateBackupCode } from '@/lib/twoFactor'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const disableTwoFactorSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  twoFactorToken: z.string().min(6, '2FA token must be at least 6 characters').optional(),
  isBackupCode: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const accessToken = request.cookies.get('accessToken')?.value
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const tokenData = verifyAccessToken(accessToken)
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      )
    }

    // Validate input
    const validationResult = disableTwoFactorSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { password, twoFactorToken, isBackupCode } = validationResult.data

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        email: true,
        password: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      )
    }

    // Verify password
    if (!user.password || !(await verifyPassword(user.password, password))) {
      await logAuditEvent(user.id, '2FA_DISABLE_FAILED', 'user', clientIp, userAgent, {
        reason: 'Invalid password',
      })
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Verify 2FA token if provided
    if (twoFactorToken) {
      let isValidToken = false

      if (isBackupCode) {
        const backupCodes = user.twoFactorBackupCodes ? JSON.parse(user.twoFactorBackupCodes) : []
        isValidToken = validateBackupCode(twoFactorToken, backupCodes)
      } else {
        isValidToken = verifyTwoFactorToken(user.twoFactorSecret!, twoFactorToken)
      }

      if (!isValidToken) {
        await logAuditEvent(user.id, '2FA_DISABLE_FAILED', 'user', clientIp, userAgent, {
          reason: 'Invalid 2FA token',
          isBackupCode,
        })
        
        return NextResponse.json(
          { error: 'Invalid 2FA token' },
          { status: 401 }
        )
      }
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    })

    // Invalidate all sessions for security
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    })

    await logAuditEvent(user.id, '2FA_DISABLED', 'user', clientIp, userAgent)

    return NextResponse.json({
      message: '2FA has been disabled for your account. All sessions have been invalidated for security.',
    })

  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
