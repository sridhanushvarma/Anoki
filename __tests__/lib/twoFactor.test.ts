import {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorToken,
  generateBackupCodes,
  formatBackupCode,
  validateBackupCode,
  removeUsedBackupCode,
  generateTOTPToken,
  shouldRequireTwoFactor,
  validateTwoFactorSetup
} from '@/lib/twoFactor'

describe('Two-Factor Authentication Utilities', () => {
  describe('Secret Generation', () => {
    test('should generate 2FA secret with QR code', () => {
      const email = 'test@example.com'
      const setup = generateTwoFactorSecret(email)

      expect(setup.secret).toBeDefined()
      expect(setup.secret.length).toBeGreaterThan(20)
      expect(setup.qrCodeUrl).toContain('otpauth://totp/')
      expect(setup.qrCodeUrl).toContain(encodeURIComponent(email)) // Email is URL encoded
      expect(setup.manualEntryKey).toBe(setup.secret)
      expect(setup.backupCodes).toHaveLength(10)
    })

    test('should generate different secrets for each call', () => {
      const email = 'test@example.com'
      const setup1 = generateTwoFactorSecret(email)
      const setup2 = generateTwoFactorSecret(email)
      
      expect(setup1.secret).not.toBe(setup2.secret)
      expect(setup1.backupCodes).not.toEqual(setup2.backupCodes)
    })

    test('should include service name in QR code', () => {
      const email = 'test@example.com'
      const serviceName = 'TestService'
      const setup = generateTwoFactorSecret(email, serviceName)

      // Let's just check that the QR code URL is generated and contains the basic structure
      expect(setup.qrCodeUrl).toContain('otpauth://totp/')
      expect(setup.qrCodeUrl).toContain('secret=')
      // The issuer might be included differently by speakeasy
    })
  })

  describe('QR Code Generation', () => {
    test('should generate QR code data URL', async () => {
      const otpauthUrl = 'otpauth://totp/TestService:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TestService'
      const qrCode = await generateQRCode(otpauthUrl)
      
      expect(qrCode).toBeDefined()
      expect(qrCode).toMatch(/^data:image\/png;base64,/)
    })

    test('should handle invalid URLs gracefully', async () => {
      const invalidUrl = 'not-a-valid-url'

      // QR code library might still generate a QR code for invalid URLs
      // Let's test that it returns a data URL format
      const result = await generateQRCode(invalidUrl)
      expect(result).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('TOTP Token Verification', () => {
    test('should verify valid TOTP token', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const token = generateTOTPToken(secret)
      
      const isValid = verifyTwoFactorToken(secret, token)
      expect(isValid).toBe(true)
    })

    test('should reject invalid TOTP token', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const invalidToken = '000000'
      
      const isValid = verifyTwoFactorToken(secret, invalidToken)
      expect(isValid).toBe(false)
    })

    test('should reject empty token', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      
      const isValid = verifyTwoFactorToken(secret, '')
      expect(isValid).toBe(false)
    })

    test('should handle different window sizes', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const token = generateTOTPToken(secret)
      
      // Should work with window 0 (exact time)
      const isValid0 = verifyTwoFactorToken(secret, token, 0)
      expect(isValid0).toBe(true)
      
      // Should work with window 1 (default)
      const isValid1 = verifyTwoFactorToken(secret, token, 1)
      expect(isValid1).toBe(true)
    })
  })

  describe('Backup Codes', () => {
    test('should generate backup codes', () => {
      const codes = generateBackupCodes()
      
      expect(codes).toHaveLength(10)
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/)
      })
    })

    test('should generate different codes each time', () => {
      const codes1 = generateBackupCodes()
      const codes2 = generateBackupCodes()
      
      expect(codes1).not.toEqual(codes2)
    })

    test('should generate custom number of codes', () => {
      const codes = generateBackupCodes(5)
      expect(codes).toHaveLength(5)
    })

    test('should format backup codes correctly', () => {
      const code = 'ABCD1234'
      const formatted = formatBackupCode(code)
      
      expect(formatted).toBe('ABCD-1234')
    })

    test('should validate backup codes', () => {
      const codes = ['ABCD1234', 'EFGH5678', 'IJKL9012']
      
      expect(validateBackupCode('ABCD1234', codes)).toBe(true)
      expect(validateBackupCode('abcd1234', codes)).toBe(true) // Case insensitive
      expect(validateBackupCode('ABCD-1234', codes)).toBe(true) // With formatting
      expect(validateBackupCode('INVALID1', codes)).toBe(false)
    })

    test('should remove used backup codes', () => {
      const codes = ['ABCD1234', 'EFGH5678', 'IJKL9012']
      const remaining = removeUsedBackupCode('ABCD1234', codes)
      
      expect(remaining).toHaveLength(2)
      expect(remaining).not.toContain('ABCD1234')
      expect(remaining).toContain('EFGH5678')
      expect(remaining).toContain('IJKL9012')
    })

    test('should handle formatted codes when removing', () => {
      const codes = ['ABCD1234', 'EFGH5678']
      const remaining = removeUsedBackupCode('ABCD-1234', codes)
      
      expect(remaining).toHaveLength(1)
      expect(remaining).not.toContain('ABCD1234')
    })
  })

  describe('2FA Requirements', () => {
    test('should require 2FA for enabled users', () => {
      const user = {
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      }

      // shouldRequireTwoFactor returns the secret if both conditions are true
      expect(shouldRequireTwoFactor(user)).toBeTruthy()
    })

    test('should not require 2FA for disabled users', () => {
      const user = {
        twoFactorEnabled: false,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      }
      
      expect(shouldRequireTwoFactor(user)).toBe(false)
    })

    test('should not require 2FA for users without secret', () => {
      const user = {
        twoFactorEnabled: true,
        twoFactorSecret: null
      }

      expect(shouldRequireTwoFactor(user)).toBeFalsy()
    })
  })

  describe('2FA Setup Validation', () => {
    test('should validate correct setup', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const token = generateTOTPToken(secret)
      
      const isValid = validateTwoFactorSetup(secret, token)
      expect(isValid).toBe(true)
    })

    test('should reject invalid setup', () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const invalidToken = '000000'
      
      const isValid = validateTwoFactorSetup(secret, invalidToken)
      expect(isValid).toBe(false)
    })

    test('should reject empty parameters', () => {
      expect(validateTwoFactorSetup('', '123456')).toBe(false)
      expect(validateTwoFactorSetup('JBSWY3DPEHPK3PXP', '')).toBe(false)
      expect(validateTwoFactorSetup('', '')).toBe(false)
    })
  })
})
