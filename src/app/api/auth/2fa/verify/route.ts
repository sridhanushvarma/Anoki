import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAccessToken, logAuditEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyTwoFactorToken, validateBackupCode, removeUsedBackupCode } from '@/lib/twoFactor'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const verifyTwoFactorSchema = z.object({
  token: z.string().min(6, '2FA token must be at least 6 characters'),
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
    const validationResult = verifyTwoFactorSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { token, isBackupCode } = validationResult.data

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        email: true,
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

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not set up for this account' },
        { status: 400 }
      )
    }

    let isValid = false
    let updatedBackupCodes = user.twoFactorBackupCodes

    if (isBackupCode) {
      // Parse backup codes from JSON
      const backupCodes = user.twoFactorBackupCodes ? JSON.parse(user.twoFactorBackupCodes) : []
      isValid = validateBackupCode(token, backupCodes)

      if (isValid) {
        // Remove used backup code
        const newBackupCodes = removeUsedBackupCode(token, backupCodes)
        updatedBackupCodes = JSON.stringify(newBackupCodes)
      }
    } else {
      // Verify TOTP token
      isValid = verifyTwoFactorToken(user.twoFactorSecret, token)
    }

    if (!isValid) {
      await logAuditEvent(user.id, '2FA_VERIFICATION_FAILED', 'user', clientIp, userAgent, {
        isBackupCode,
        reason: 'Invalid token',
      })
      
      return NextResponse.json(
        { error: 'Invalid 2FA token' },
        { status: 401 }
      )
    }

    // If this is the first verification (enabling 2FA)
    if (!user.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorBackupCodes: updatedBackupCodes,
        },
      })

      await logAuditEvent(user.id, '2FA_ENABLED', 'user', clientIp, userAgent)

      const backupCodesArray = updatedBackupCodes ? JSON.parse(updatedBackupCodes) : []
      return NextResponse.json({
        message: '2FA has been successfully enabled for your account.',
        backupCodesRemaining: backupCodesArray.length,
      })
    }

    // Update backup codes if one was used
    if (isBackupCode && updatedBackupCodes !== user.twoFactorBackupCodes) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorBackupCodes: updatedBackupCodes,
        },
      })
    }

    await logAuditEvent(user.id, '2FA_VERIFICATION_SUCCESS', 'user', clientIp, userAgent, {
      isBackupCode,
    })

    const backupCodesArray = updatedBackupCodes ? JSON.parse(updatedBackupCodes) : []
    return NextResponse.json({
      message: '2FA verification successful.',
      backupCodesRemaining: backupCodesArray.length,
    })

  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
