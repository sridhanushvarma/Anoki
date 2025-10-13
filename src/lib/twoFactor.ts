import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  manualEntryKey: string
  backupCodes: string[]
}

export function generateTwoFactorSecret(userEmail: string, serviceName: string = 'Anoki'): TwoFactorSetup {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: serviceName,
    length: 32,
  })

  // Generate backup codes
  const backupCodes = generateBackupCodes()

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url || '',
    manualEntryKey: secret.base32,
    backupCodes,
  }
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export function verifyTwoFactorToken(secret: string, token: string, window: number = 1): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window, // Allow 1 step before/after for clock drift
  })
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  
  return codes
}

export function formatBackupCode(code: string): string {
  // Format as XXXX-XXXX for better readability
  return code.substring(0, 4) + '-' + code.substring(4)
}

export function validateBackupCode(inputCode: string, storedCodes: string[]): boolean {
  // Remove formatting and convert to uppercase
  const cleanCode = inputCode.replace(/[-\s]/g, '').toUpperCase()
  return storedCodes.includes(cleanCode)
}

export function removeUsedBackupCode(usedCode: string, storedCodes: string[]): string[] {
  const cleanCode = usedCode.replace(/[-\s]/g, '').toUpperCase()
  return storedCodes.filter(code => code !== cleanCode)
}

// Generate TOTP token for testing purposes
export function generateTOTPToken(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  })
}

// Check if 2FA is required for user
export function shouldRequireTwoFactor(user: any): boolean {
  return user.twoFactorEnabled && user.twoFactorSecret
}

// Validate 2FA setup completion
export function validateTwoFactorSetup(secret: string, verificationToken: string): boolean {
  if (!secret || !verificationToken) {
    return false
  }

  return verifyTwoFactorToken(secret, verificationToken)
}
