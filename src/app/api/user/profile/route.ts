import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAccessToken, logAuditEvent } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateProfileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  preferences: z.record(z.string(), z.any()).optional(),
})

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

    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      include: {
        userProfile: true,
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const validationResult = updateProfileSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const profileData = validationResult.data

    // Update or create user profile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: tokenData.userId },
      update: profileData,
      create: {
        userId: tokenData.userId,
        ...profileData,
      },
    })

    // Log profile update
    await logAuditEvent(tokenData.userId, 'PROFILE_UPDATED', 'user_profile', clientIp, userAgent, {
      updatedFields: Object.keys(profileData),
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
