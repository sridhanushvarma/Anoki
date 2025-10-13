import { NextRequest, NextResponse } from 'next/server'
import { invalidateSession, logAuditEvent } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (refreshToken) {
      await invalidateSession(refreshToken)
      
      // Log logout event (we don't have user ID here, but that's okay)
      await logAuditEvent(null, 'LOGOUT', 'user', clientIp, userAgent)
    }

    // Clear cookies
    const response = NextResponse.json({ message: 'Logout successful' })
    
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    })

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
