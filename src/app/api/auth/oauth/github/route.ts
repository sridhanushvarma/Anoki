import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createSession, checkRateLimit, logAuditEvent } from '@/lib/auth'

const githubOAuthSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
})

interface GitHubTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

interface GitHubUserInfo {
  id: number
  login: string
  email: string
  name: string
  avatar_url: string
  location: string
  bio: string
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
    const validationResult = githubOAuthSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { code } = validationResult.data

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('GitHub token exchange failed:', error)
      return NextResponse.json(
        { error: 'Failed to authenticate with GitHub' },
        { status: 400 }
      )
    }

    const tokenData: GitHubTokenResponse = await tokenResponse.json()

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Anoki-App',
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to get GitHub user info')
      return NextResponse.json(
        { error: 'Failed to get user information from GitHub' },
        { status: 400 }
      )
    }

    const githubUser: GitHubUserInfo = await userResponse.json()

    // Get user email if not public
    let userEmail = githubUser.email
    if (!userEmail) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Anoki-App',
        },
      })

      if (emailResponse.ok) {
        const emails = await emailResponse.json()
        const primaryEmail = emails.find((email: any) => email.primary)
        userEmail = primaryEmail?.email || emails[0]?.email
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unable to get email from GitHub account' },
        { status: 400 }
      )
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
    })

    if (user) {
      // Update existing user with GitHub info if needed
      if (user.provider !== 'GITHUB' || user.providerId !== githubUser.id.toString()) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'GITHUB',
            providerId: githubUser.id.toString(),
            image: githubUser.avatar_url,
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
          name: githubUser.name || githubUser.login,
          image: githubUser.avatar_url,
          provider: 'GITHUB',
          providerId: githubUser.id.toString(),
          emailVerified: new Date(), // GitHub emails are considered verified
          isActive: true,
        },
      })
    }

    // Create session
    const { accessToken, refreshToken } = await createSession(user.id, clientIp, userAgent)

    // Log successful OAuth login
    await logAuditEvent(user.id, 'OAUTH_LOGIN_SUCCESS', 'user', clientIp, userAgent, {
      provider: 'GITHUB',
      providerId: githubUser.id.toString(),
    })

    // Set HTTP-only cookies
    const response = NextResponse.json({
      message: 'GitHub authentication successful',
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
    console.error('GitHub OAuth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
