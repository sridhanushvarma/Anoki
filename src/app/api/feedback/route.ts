import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const feedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  rating: z.number().min(1).max(5).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    // Validate input
    const validationResult = feedbackSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { name, email, type, message, rating } = validationResult.data

    // Save feedback to database
    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        type,
        message,
        rating: rating || null,
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Log the feedback submission
    console.log('Feedback submitted:', {
      id: feedback.id,
      type,
      email,
      timestamp: feedback.createdAt,
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback! We appreciate your input.',
      feedbackId: feedback.id,
    }, { status: 201 })

  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get feedback statistics (public endpoint)
    const totalFeedback = await prisma.feedback.count()
    const feedbackByType = await prisma.feedback.groupBy({
      by: ['type'],
      _count: true,
    })

    const averageRating = await prisma.feedback.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        rating: {
          not: null,
        },
      },
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalFeedback,
        byType: feedbackByType,
        averageRating: averageRating._avg.rating || 0,
      },
    })

  } catch (error) {
    console.error('Error fetching feedback stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

