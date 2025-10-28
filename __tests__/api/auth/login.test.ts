import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'
import { setupTestDb, teardownTestDb, createTestUser } from '../../helpers/testDb'

// Mock the auth utilities
jest.mock('@/lib/auth', () => ({
  verifyPassword: jest.fn().mockResolvedValue(false),
  generateAccessToken: jest.fn().mockReturnValue('access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  checkRateLimit: jest.fn().mockResolvedValue(true),
  logAuditEvent: jest.fn().mockResolvedValue(undefined),
  createSession: jest.fn().mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token'
  }),
  checkAccountLockout: jest.fn().mockResolvedValue(true),
  handleFailedLogin: jest.fn().mockResolvedValue(undefined),
}))

describe('/api/auth/login', () => {
  beforeEach(async () => {
    await setupTestDb()
    // Reset all mocks before each test
    jest.clearAllMocks()
    // Set default mock values
    const { verifyPassword, checkRateLimit, logAuditEvent, createSession } = require('@/lib/auth')
    verifyPassword.mockResolvedValue(false)
    checkRateLimit.mockResolvedValue(true)
    logAuditEvent.mockResolvedValue(undefined)
    createSession.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    })
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
  }

  describe('Successful Login', () => {
    test('should login user with correct credentials', async () => {
      // Create test user
      const user = await createTestUser({
        email: 'test@example.com',
        password: 'hashed-password'
      })

      // Mock password verification to return true
      const { verifyPassword } = require('@/lib/auth')
      verifyPassword.mockResolvedValueOnce(true)

      const requestBody = {
        email: 'test@example.com',
        password: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Login successful')
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(user.email)
      expect(data.user.id).toBe(user.id)
    })

    test('should set secure cookies on successful login', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'hashed-password'
      })

      const { verifyPassword } = require('@/lib/auth')
      verifyPassword.mockResolvedValueOnce(true)

      const requestBody = {
        email: 'test@example.com',
        password: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)

      const cookies = response.headers.getSetCookie()
      expect(cookies).toHaveLength(2) // accessToken and refreshToken
      
      const accessTokenCookie = cookies.find(cookie => cookie.startsWith('accessToken='))
      const refreshTokenCookie = cookies.find(cookie => cookie.startsWith('refreshToken='))
      
      expect(accessTokenCookie).toContain('HttpOnly')
      expect(refreshTokenCookie).toContain('HttpOnly')
    })
  })

  describe('Authentication Failures', () => {
    test('should reject non-existent user', async () => {
      const requestBody = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid email or password')
    })

    test('should reject incorrect password', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'hashed-password'
      })

      // Mock password verification to return false
      const { verifyPassword } = require('@/lib/auth')
      verifyPassword.mockResolvedValueOnce(false)

      const requestBody = {
        email: 'test@example.com',
        password: 'WrongPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid email or password')
    })

    test('should reject inactive user', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'hashed-password',
        isActive: false
      })

      const { verifyPassword } = require('@/lib/auth')
      verifyPassword.mockResolvedValueOnce(true)

      const requestBody = {
        email: 'test@example.com',
        password: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Account is deactivated')
    })
  })

  describe('Validation Errors', () => {
    test('should reject missing fields', async () => {
      const request = createRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
    })

    test('should reject invalid email format', async () => {
      const requestBody = {
        email: 'invalid-email',
        password: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    test('should reject empty password', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: ''
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })
  })

  describe('Rate Limiting', () => {
    test('should reject when rate limited', async () => {
      // Mock rate limit exceeded
      const { checkRateLimit } = require('@/lib/auth')
      checkRateLimit.mockResolvedValueOnce(false)

      const requestBody = {
        email: 'test@example.com',
        password: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Too many login attempts')
    })
  })

  describe('2FA Integration', () => {
    test('should handle 2FA enabled user', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'hashed-password',
        twoFactorEnabled: true,
        twoFactorSecret: 'test-secret'
      })

      const { verifyPassword } = require('@/lib/auth')
      verifyPassword.mockResolvedValueOnce(true)

      const requestBody = {
        email: 'test@example.com',
        password: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      // Should still login successfully (2FA verification is separate)
      expect(response.status).toBe(200)
      expect(data.user.twoFactorEnabled).toBe(true)
    })
  })
})
