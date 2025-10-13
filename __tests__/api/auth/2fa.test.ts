import { NextRequest } from 'next/server'
import { POST as SetupPOST } from '@/app/api/auth/2fa/setup/route'
import { POST as VerifyPOST } from '@/app/api/auth/2fa/verify/route'
import { POST as DisablePOST } from '@/app/api/auth/2fa/disable/route'
import { setupTestDb, teardownTestDb, createTestUser } from '../../helpers/testDb'

// Mock the auth utilities
jest.mock('@/lib/auth', () => ({
  verifyAccessToken: jest.fn(),
  verifyPassword: jest.fn(),
  logAuditEvent: jest.fn().mockResolvedValue(undefined)
}))

// Mock the 2FA utilities
jest.mock('@/lib/twoFactor', () => ({
  generateTwoFactorSecret: jest.fn().mockReturnValue({
    secret: 'JBSWY3DPEHPK3PXP',
    qrCodeUrl: 'otpauth://totp/test',
    manualEntryKey: 'JBSWY3DPEHPK3PXP',
    backupCodes: ['ABCD1234', 'EFGH5678', 'IJKL9012']
  }),
  generateQRCode: jest.fn().mockResolvedValue('data:image/png;base64,test'),
  verifyTwoFactorToken: jest.fn(),
  validateBackupCode: jest.fn(),
  removeUsedBackupCode: jest.fn()
}))

describe('2FA API Endpoints', () => {
  beforeEach(async () => {
    await setupTestDb()
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  const createAuthenticatedRequest = (url: string, body: any = {}, userId: string = 'test-user-id') => {
    const { verifyAccessToken } = require('@/lib/auth')
    verifyAccessToken.mockReturnValue({ userId, sessionId: 'test-session-id' })

    return new NextRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'accessToken=valid-token'
      },
      body: JSON.stringify(body)
    })
  }

  describe('/api/auth/2fa/setup', () => {
    test('should setup 2FA for authenticated user', async () => {
      const user = await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        twoFactorEnabled: false
      })

      const request = createAuthenticatedRequest('http://localhost:3000/api/auth/2fa/setup')
      const response = await SetupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toContain('2FA setup initiated')
      expect(data.qrCode).toBeDefined()
      expect(data.manualEntryKey).toBeDefined()
      expect(data.backupCodes).toHaveLength(3)
    })

    test('should reject unauthenticated request', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await SetupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    test('should reject if 2FA already enabled', async () => {
      await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        twoFactorEnabled: true
      })

      const request = createAuthenticatedRequest('http://localhost:3000/api/auth/2fa/setup')
      const response = await SetupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('2FA is already enabled for this account')
    })
  })

  describe('/api/auth/2fa/verify', () => {
    test('should verify TOTP token and enable 2FA', async () => {
      await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        twoFactorEnabled: false,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      })

      const { verifyTwoFactorToken } = require('@/lib/twoFactor')
      verifyTwoFactorToken.mockReturnValue(true)

      const requestBody = {
        token: '123456',
        isBackupCode: false
      }

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/auth/2fa/verify',
        requestBody
      )
      const response = await VerifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toContain('2FA has been successfully enabled')
    })

    test('should verify backup code', async () => {
      await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorBackupCodes: JSON.stringify(['ABCD1234', 'EFGH5678'])
      })

      const { validateBackupCode, removeUsedBackupCode } = require('@/lib/twoFactor')
      validateBackupCode.mockReturnValue(true)
      removeUsedBackupCode.mockReturnValue(['EFGH5678'])

      const requestBody = {
        token: 'ABCD1234',
        isBackupCode: true
      }

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/auth/2fa/verify',
        requestBody
      )
      const response = await VerifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toContain('2FA verification successful')
      expect(data.backupCodesRemaining).toBe(1)
    })

    test('should reject invalid TOTP token', async () => {
      await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        twoFactorEnabled: false,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      })

      const { verifyTwoFactorToken } = require('@/lib/twoFactor')
      verifyTwoFactorToken.mockReturnValue(false)

      const requestBody = {
        token: '000000',
        isBackupCode: false
      }

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/auth/2fa/verify',
        requestBody
      )
      const response = await VerifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid 2FA token')
    })

    test('should reject invalid backup code', async () => {
      await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorBackupCodes: JSON.stringify(['ABCD1234', 'EFGH5678'])
      })

      const { validateBackupCode } = require('@/lib/twoFactor')
      validateBackupCode.mockReturnValue(false)

      const requestBody = {
        token: 'INVALID1',
        isBackupCode: true
      }

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/auth/2fa/verify',
        requestBody
      )
      const response = await VerifyPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid 2FA token')
    })
  })

  describe('/api/auth/2fa/disable', () => {
    test('should disable 2FA with correct password and token', async () => {
      await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      })

      const { verifyPassword } = require('@/lib/auth')
      const { verifyTwoFactorToken } = require('@/lib/twoFactor')
      verifyPassword.mockResolvedValue(true)
      verifyTwoFactorToken.mockReturnValue(true)

      const requestBody = {
        password: 'TestPassword123',
        twoFactorToken: '123456',
        isBackupCode: false
      }

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/auth/2fa/disable',
        requestBody
      )
      const response = await DisablePOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toContain('2FA has been disabled')
    })

    test('should reject incorrect password', async () => {
      await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      })

      const { verifyPassword } = require('@/lib/auth')
      verifyPassword.mockResolvedValue(false)

      const requestBody = {
        password: 'WrongPassword123',
        twoFactorToken: '123456',
        isBackupCode: false
      }

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/auth/2fa/disable',
        requestBody
      )
      const response = await DisablePOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid password')
    })

    test('should reject if 2FA not enabled', async () => {
      await createTestUser({
        id: 'test-user-id',
        email: 'test@example.com',
        twoFactorEnabled: false
      })

      const requestBody = {
        password: 'TestPassword123',
        twoFactorToken: '123456',
        isBackupCode: false
      }

      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/auth/2fa/disable',
        requestBody
      )
      const response = await DisablePOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('2FA is not enabled for this account')
    })
  })
})
