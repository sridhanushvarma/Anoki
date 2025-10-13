import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export function getTestDb() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./test.db'
        }
      }
    })
  }
  return prisma
}

export async function setupTestDb() {
  const db = getTestDb()

  // Clean up existing data - handle tables that might not exist
  try {
    await db.auditLog.deleteMany()
  } catch (error) {
    // Table might not exist, ignore
  }

  try {
    await db.loginAttempt.deleteMany()
  } catch (error) {
    // Table might not exist, ignore
  }

  try {
    await db.session.deleteMany()
  } catch (error) {
    // Table might not exist, ignore
  }

  try {
    await db.verificationToken.deleteMany()
  } catch (error) {
    // Table might not exist, ignore
  }

  try {
    await db.userProfile.deleteMany()
  } catch (error) {
    // Table might not exist, ignore
  }

  try {
    await db.rateLimit.deleteMany()
  } catch (error) {
    // Table might not exist, ignore
  }

  try {
    await db.user.deleteMany()
  } catch (error) {
    // Table might not exist, ignore
  }

  // Reset the database auto-increment counters if using SQLite
  try {
    await db.$executeRaw`DELETE FROM sqlite_sequence WHERE name IN ('User', 'Session', 'LoginAttempt', 'AuditLog', 'VerificationToken', 'UserProfile', 'RateLimit')`
  } catch (error) {
    // Ignore if not SQLite or table doesn't exist
  }

  return db
}

export async function teardownTestDb() {
  if (prisma) {
    await prisma.$disconnect()
  }
}

export async function createTestUser(overrides: any = {}) {
  const db = getTestDb()

  // Generate unique email if not provided - use timestamp and random string for uniqueness
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substr(2, 9)
  const uniqueEmail = overrides.email || `test-${timestamp}-${randomStr}@example.com`

  const defaultUser = {
    email: uniqueEmail,
    name: 'Test User',
    password: '$argon2id$v=19$m=65536,t=3,p=1$randomsalt$randomhash', // Mock hashed password
    isActive: true,
    provider: 'EMAIL' as const,
    ...overrides,
    email: uniqueEmail // Ensure email is always unique
  }

  // Try to create user, if unique constraint fails, try with a different email
  try {
    return await db.user.create({
      data: defaultUser
    })
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      // Unique constraint violation on email, try again with a different email
      const retryEmail = `test-${Date.now()}-${Math.random().toString(36).substr(2, 12)}@example.com`
      return await db.user.create({
        data: {
          ...defaultUser,
          email: retryEmail
        }
      })
    }
    throw error
  }
}

export async function createTestSession(userId: string, overrides: any = {}) {
  const db = getTestDb()
  
  const defaultSession = {
    userId,
    sessionToken: 'test-session-token',
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ipAddress: '127.0.0.1',
    userAgent: 'test-user-agent',
    isActive: true,
    ...overrides
  }
  
  return await db.session.create({
    data: defaultSession
  })
}

export async function createTestVerificationToken(userId: string, overrides: any = {}) {
  const db = getTestDb()
  
  const defaultToken = {
    identifier: 'test@example.com',
    token: 'test-verification-token',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    type: 'EMAIL_VERIFICATION' as const,
    userId,
    ...overrides
  }
  
  return await db.verificationToken.create({
    data: defaultToken
  })
}

export async function createTestRateLimit(identifier: string, overrides: any = {}) {
  const db = getTestDb()
  
  const defaultRateLimit = {
    identifier,
    type: 'LOGIN',
    count: 1,
    windowStart: new Date(),
    ...overrides
  }
  
  return await db.rateLimit.create({
    data: defaultRateLimit
  })
}
