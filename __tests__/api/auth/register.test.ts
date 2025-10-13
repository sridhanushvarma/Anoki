import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/register/route'
import { setupTestDb, teardownTestDb, createTestUser } from '../../helpers/testDb'

// Mock the auth utilities
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  generateAccessToken: jest.fn().mockReturnValue('access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
  checkRateLimit: jest.fn().mockResolvedValue(true),
  logAuditEvent: jest.fn().mockResolvedValue(undefined),
  createSession: jest.fn().mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token'
  })
}))

// Mock the email utilities
jest.mock('@/lib/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined)
}))

describe('/api/auth/register', () => {
  beforeEach(async () => {
    await setupTestDb()
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
  }

  describe('Successful Registration', () => {
    test('should register new user successfully', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toContain('Registration successful')
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(requestBody.email)
      expect(data.user.name).toBe(requestBody.name)
      expect(data.emailVerificationRequired).toBe(true)
    })

    test('should set secure cookies', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)

      const cookies = response.headers.getSetCookie()
      expect(cookies).toHaveLength(2) // accessToken and refreshToken
      
      const accessTokenCookie = cookies.find(cookie => cookie.startsWith('accessToken='))
      const refreshTokenCookie = cookies.find(cookie => cookie.startsWith('refreshToken='))
      
      expect(accessTokenCookie).toContain('HttpOnly')
      expect(accessTokenCookie).toContain('SameSite=strict')
      expect(refreshTokenCookie).toContain('HttpOnly')
      expect(refreshTokenCookie).toContain('SameSite=strict')
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

    test('should reject invalid email', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    test('should reject weak password', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    test('should reject mismatched passwords', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'DifferentPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })
  })

  describe('Duplicate Email', () => {
    test('should reject duplicate email', async () => {
      // Create existing user
      await createTestUser({ email: 'test@example.com' })

      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('User with this email already exists')
    })
  })

  describe('Rate Limiting', () => {
    test('should reject when rate limited', async () => {
      // Mock rate limit exceeded
      const { checkRateLimit } = require('@/lib/auth')
      checkRateLimit.mockResolvedValueOnce(false)

      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Too many registration attempts')
    })
  })

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const requestBody = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123'
      }

      const request = createRequest(requestBody)
      const response = await POST(request)

      expect(response.headers.get('x-content-type-options')).toBe('nosniff')
      expect(response.headers.get('x-frame-options')).toBe('DENY')
      expect(response.headers.get('x-xss-protection')).toBe('1; mode=block')
      expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
    })
  })
})
