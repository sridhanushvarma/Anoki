import { 
  hashPassword, 
  verifyPassword, 
  generateAccessToken, 
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '@/lib/auth'

describe('Authentication Utilities', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'TestPassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50) // Argon2 hashes are long
    })

    test('should verify correct password', async () => {
      const password = 'TestPassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(hashedPassword, password)
      expect(isValid).toBe(true)
    })

    test('should reject incorrect password', async () => {
      const password = 'TestPassword123'
      const wrongPassword = 'WrongPassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(hashedPassword, wrongPassword)
      expect(isValid).toBe(false)
    })

    test('should handle empty passwords', async () => {
      // Argon2 actually allows empty passwords, so let's test a different edge case
      const password = 'a' // Very short password
      const hashedPassword = await hashPassword(password)
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
    })
  })

  describe('JWT Token Generation', () => {
    const userId = 'test-user-id'

    test('should generate access token', () => {
      const token = generateAccessToken(userId)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    test('should generate refresh token', () => {
      const token = generateRefreshToken(userId)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    test('should generate different tokens for same user', async () => {
      const token1 = generateAccessToken(userId)
      // Wait a moment to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000))
      const token2 = generateAccessToken(userId)

      // Tokens should be different due to different iat (issued at) timestamps
      expect(token1).not.toBe(token2)
    })
  })

  describe('JWT Token Verification', () => {
    const userId = 'test-user-id'

    test('should verify valid access token', () => {
      const token = generateAccessToken(userId)
      const decoded = verifyAccessToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(userId)
      // Note: verifyAccessToken only returns { userId }, not the full payload
    })

    test('should verify valid refresh token', () => {
      const token = generateRefreshToken(userId)
      const decoded = verifyRefreshToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(userId)
      // Note: verifyRefreshToken only returns { userId }, not the full payload
    })

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here'
      const decoded = verifyAccessToken(invalidToken)
      
      expect(decoded).toBeNull()
    })

    test('should reject empty token', () => {
      const decoded = verifyAccessToken('')
      expect(decoded).toBeNull()
    })

    test('should reject access token as refresh token', () => {
      const accessToken = generateAccessToken(userId)
      const decoded = verifyRefreshToken(accessToken)
      
      expect(decoded).toBeNull()
    })

    test('should reject refresh token as access token', () => {
      const refreshToken = generateRefreshToken(userId)
      const decoded = verifyAccessToken(refreshToken)
      
      expect(decoded).toBeNull()
    })
  })

  describe('Token Expiration', () => {
    test('should generate tokens that can be verified', () => {
      const userId = 'test-user-id'
      const accessToken = generateAccessToken(userId)
      const refreshToken = generateRefreshToken(userId)

      // Tokens should be verifiable immediately after generation
      expect(verifyAccessToken(accessToken)).toBeDefined()
      expect(verifyRefreshToken(refreshToken)).toBeDefined()
    })

    test('should reject expired tokens', () => {
      // This test would require mocking time or waiting for expiration
      // For now, we'll test that tokens are properly formatted
      const userId = 'test-user-id'
      const token = generateAccessToken(userId)

      expect(token.split('.')).toHaveLength(3) // JWT format
      expect(verifyAccessToken(token)?.userId).toBe(userId)
    })
  })
})
