import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createSession, checkRateLimit, logAuditEvent } from '@/lib/auth'

const microsoftOAuthSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
})

interface MicrosoftTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
}

interface MicrosoftUserInfo {
  id: string
  userPrincipalName: string
  displayName: string
  givenName: string
  surname: string
  mail: string
  mobilePhone: string
  jobTitle: string
  preferredLanguage: string
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
    const validationResult = microsoftOAuthSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { code } = validationResult.data

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/auth/callback/microsoft`,
        scope: 'openid email profile',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Microsoft token exchange failed:', error)
      return NextResponse.json(
        { error: 'Failed to authenticate with Microsoft' },
        { status: 400 }
      )
    }

    const tokenData: MicrosoftTokenResponse = await tokenResponse.json()

    // Get user info from Microsoft Graph
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to get Microsoft user info')
      return NextResponse.json(
        { error: 'Failed to get user information from Microsoft' },
        { status: 400 }
      )
    }

    const microsoftUser: MicrosoftUserInfo = await userResponse.json()

    // Use mail or userPrincipalName as email
    const userEmail = microsoftUser.mail || microsoftUser.userPrincipalName

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unable to get email from Microsoft account' },
        { status: 400 }
      )
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
    })

    if (user) {
      // Update existing user with Microsoft info if needed
      if (user.provider !== 'MICROSOFT' || user.providerId !== microsoftUser.id) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'MICROSOFT',
            providerId: microsoftUser.id,
            emailVerified: new Date(), // Microsoft emails are considered verified
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
          email: userEmail.toLowerCase(),
          name: microsoftUser.displayName || `${microsoftUser.givenName} ${microsoftUser.surname}`.trim(),
          provider: 'MICROSOFT',
          providerId: microsoftUser.id,
          emailVerified: new Date(), // Microsoft emails are considered verified
          isActive: true,
        },
      })
    }

    // Create session
    const { accessToken, refreshToken } = await createSession(user.id, clientIp, userAgent)

    // Log successful OAuth login
    await logAuditEvent(user.id, 'OAUTH_LOGIN_SUCCESS', 'user', clientIp, userAgent, {
      provider: 'MICROSOFT',
      providerId: microsoftUser.id,
    })

    // Set HTTP-only cookies
    const response = NextResponse.json({
      message: 'Microsoft authentication successful',
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
    console.error('Microsoft OAuth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
