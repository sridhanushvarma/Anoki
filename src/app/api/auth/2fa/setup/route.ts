import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, logAuditEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTwoFactorSecret, generateQRCode } from '@/lib/twoFactor'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account' },
        { status: 400 }
      )
    }

    // Generate 2FA secret and QR code
    const twoFactorSetup = generateTwoFactorSecret(user.email, 'Anoki')
    const qrCodeDataUrl = await generateQRCode(twoFactorSetup.qrCodeUrl)

    // Store the secret and backup codes temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: twoFactorSetup.secret,
        twoFactorBackupCodes: JSON.stringify(twoFactorSetup.backupCodes),
        // Don't enable 2FA yet - user needs to verify first
      },
    })

    // Log 2FA setup initiation
    await logAuditEvent(user.id, '2FA_SETUP_INITIATED', 'user', clientIp, userAgent)

    return NextResponse.json({
      message: '2FA setup initiated. Please scan the QR code with your authenticator app.',
      qrCode: qrCodeDataUrl,
      manualEntryKey: twoFactorSetup.manualEntryKey,
      backupCodes: twoFactorSetup.backupCodes,
    })

  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
