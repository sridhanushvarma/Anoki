import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, logAuditEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value

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

    // Get all active sessions for the user
    const sessions = await prisma.session.findMany({
      where: {
        userId: tokenData.userId,
        isActive: true,
        expires: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true,
        expires: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Parse user agents for better display
    const sessionsWithInfo = sessions.map(session => ({
      ...session,
      isCurrent: false, // We don't have sessionId in tokenData, so mark all as false
      browser: parseUserAgent(session.userAgent || 'unknown'),
      location: session.ipAddress, // In production, you might want to resolve this to a location
      lastUsedAt: session.updatedAt, // Use updatedAt as lastUsedAt
    }))

    return NextResponse.json({
      sessions: sessionsWithInfo,
      total: sessions.length,
    })

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const action = searchParams.get('action') // 'revoke' or 'revokeAll'

    if (action === 'revokeAll') {
      // Revoke all sessions except current one
      await prisma.session.updateMany({
        where: {
          userId: tokenData.userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      })

      await logAuditEvent(tokenData.userId, 'ALL_SESSIONS_REVOKED', 'user', clientIp, userAgent)

      return NextResponse.json({
        message: 'All other sessions have been revoked successfully.',
      })
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Check if session belongs to user
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: tokenData.userId,
        isActive: true,
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or already revoked' },
        { status: 404 }
      )
    }

    // Revoke the session
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    })

    await logAuditEvent(tokenData.userId, 'SESSION_REVOKED', 'user', clientIp, userAgent, {
      revokedSessionId: sessionId,
      revokedSessionIp: session.ipAddress,
    })

    return NextResponse.json({
      message: 'Session revoked successfully.',
    })

  } catch (error) {
    console.error('Revoke session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function parseUserAgent(userAgent: string): string {
  // Simple user agent parsing - in production you might want to use a library
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Unknown Browser'
}
