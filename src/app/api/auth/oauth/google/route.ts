import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createSession, checkRateLimit, logAuditEvent } from '@/lib/auth'

const googleOAuthSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
})

interface GoogleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting
    if (!(await checkRateLimit(clientIp, 'OAUTH_LOGIN'))) {
      return NextResponse.json(
        { error: 'Too many OAuth attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate input
    const validationResult = googleOAuthSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { code } = validationResult.data

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/auth/callback/google`,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Google token exchange failed:', error)
      return NextResponse.json(
        { error: 'Failed to authenticate with Google' },
        { status: 400 }
      )
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json()

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to get Google user info')
      return NextResponse.json(
        { error: 'Failed to get user information from Google' },
        { status: 400 }
      )
    }

    const googleUser: GoogleUserInfo = await userResponse.json()

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    })

    if (user) {
      // Update existing user with Google info if needed
      if (user.provider !== 'GOOGLE' || user.providerId !== googleUser.id) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'GOOGLE',
            providerId: googleUser.id,
            image: googleUser.picture,
            emailVerified: googleUser.verified_email ? new Date() : null,
            lastLoginAt: new Date(),
          },
        })
      } else {
        // Just update last login
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          name: googleUser.name,
          image: googleUser.picture,
          provider: 'GOOGLE',
          providerId: googleUser.id,
          emailVerified: googleUser.verified_email ? new Date() : null,
          isActive: true,
        },
      })
    }

    // Create session
    const { accessToken, refreshToken } = await createSession(user.id, clientIp, userAgent)

    // Log successful OAuth login
    await logAuditEvent(user.id, 'OAUTH_LOGIN_SUCCESS', 'user', clientIp, userAgent, {
      provider: 'GOOGLE',
      providerId: googleUser.id,
    })

    // Set HTTP-only cookies
    const response = NextResponse.json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    }, { status: 200 })

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

    return response

  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
