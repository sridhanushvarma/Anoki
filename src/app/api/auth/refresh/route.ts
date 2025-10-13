import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    const tokenData = verifyRefreshToken(refreshToken)
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Verify session exists and is active
    const session = await prisma.session.findUnique({
      where: { sessionToken: refreshToken, isActive: true },
      include: { user: true },
    })

    if (!session || session.expires < new Date() || !session.user.isActive) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(session.userId)

    // Update session with new access token
    await prisma.session.update({
      where: { id: session.id },
      data: { accessToken: newAccessToken },
    })

    // Set new access token cookie
    const response = NextResponse.json({ message: 'Token refreshed successfully' })
    
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
    })

    return response

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
