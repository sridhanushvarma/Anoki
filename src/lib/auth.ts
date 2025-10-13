import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { User } from '@prisma/client'

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  })
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, password)
  } catch (error) {
    return false
  }
}

// JWT utilities
export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )
}

export function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.type !== 'access') return null
    return { userId: decoded.userId }
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any
    if (decoded.type !== 'refresh') return null
    return { userId: decoded.userId }
  } catch (error) {
    return null
  }
}

// Session utilities
export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken(userId)
  
  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken: refreshToken,
      accessToken,
      refreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress,
      userAgent,
    },
  })

  return {
    session,
    accessToken,
    refreshToken,
  }
}

export async function validateSession(sessionToken: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken, isActive: true },
    include: { user: true },
  })

  if (!session || session.expires < new Date()) {
    return null
  }

  return session.user
}

export async function invalidateSession(sessionToken: string): Promise<void> {
  await prisma.session.updateMany({
    where: { sessionToken },
    data: { isActive: false },
  })
}

// Rate limiting utilities
export async function checkRateLimit(identifier: string, action: string): Promise<boolean> {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
  const maxAttempts = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5')
  
  const windowStart = new Date(Date.now() - windowMs)
  
  // Clean up old rate limit records
  await prisma.rateLimit.deleteMany({
    where: {
      windowStart: { lt: windowStart },
    },
  })

  // Check current rate limit
  const currentWindow = new Date(Math.floor(Date.now() / windowMs) * windowMs)
  
  const rateLimit = await prisma.rateLimit.findUnique({
    where: {
      identifier_action_windowStart: {
        identifier,
        action,
        windowStart: currentWindow,
      },
    },
  })

  if (rateLimit && rateLimit.count >= maxAttempts) {
    return false
  }

  // Increment or create rate limit record
  await prisma.rateLimit.upsert({
    where: {
      identifier_action_windowStart: {
        identifier,
        action,
        windowStart: currentWindow,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      identifier,
      action,
      windowStart: currentWindow,
      count: 1,
    },
  })

  return true
}

// Audit logging
export async function logAuditEvent(
  userId: string | null,
  action: string,
  resource?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: any
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      ipAddress,
      userAgent,
      metadata,
    },
  })
}

// Account lockout functions
export async function checkAccountLockout(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  })

  if (!user || !user.isActive) {
    return false
  }

  return true
}

export async function handleFailedLogin(userId: string, clientIp: string): Promise<void> {
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      userId,
      success: false,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
      },
    },
  })

  // Log failed attempt for audit purposes
  if (failedAttempts >= 4) { // This will be the 5th attempt
    await logAuditEvent(userId, 'MULTIPLE_FAILED_LOGINS', 'user', clientIp, 'system', {
      reason: 'Multiple failed login attempts detected',
      failedAttempts: failedAttempts + 1,
    })
  }
}
