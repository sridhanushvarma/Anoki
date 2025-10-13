'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCodeIcon, KeyIcon, ShieldCheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'

interface TwoFactorSetupProps {
  onComplete?: () => void
  onCancel?: () => void
}

interface SetupData {
  qrCode: string
  manualEntryKey: string
  backupCodes: string[]
}

export default function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup')
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false)

  const handleSetup = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/setup/', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup 2FA')
      }

      setSetupData(data)
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token: verificationCode.trim(),
          isBackupCode: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join('\n')
      navigator.clipboard.writeText(codesText)
      setCopiedBackupCodes(true)
      setTimeout(() => setCopiedBackupCodes(false), 2000)
    }
  }

  const copyManualKey = () => {
    if (setupData?.manualEntryKey) {
      navigator.clipboard.writeText(setupData.manualEntryKey)
    }
  }

  if (step === 'setup') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="text-center mb-6">
          <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enable Two-Factor Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Add an extra layer of security to your account
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 text-sm font-semibold">1</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Install an authenticator app like Google Authenticator or Authy
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 text-sm font-semibold">2</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Scan the QR code or enter the setup key manually
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 text-sm font-semibold">3</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Enter the 6-digit code from your app to verify
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSetup}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Setting up...' : 'Get Started'}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  if (step === 'verify' && setupData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="text-center mb-6">
          <QrCodeIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Scan QR Code
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Use your authenticator app to scan this code
          </p>
        </div>

        <div className="text-center mb-6">
          {!showManualEntry ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={setupData.qrCode} 
                  alt="2FA QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <button
                onClick={() => setShowManualEntry(true)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Can't scan? Enter code manually
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Manual entry key:
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-white dark:bg-gray-800 p-2 rounded text-sm font-mono break-all">
                    {setupData.manualEntryKey}
                  </code>
                  <button
                    onClick={copyManualKey}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowManualEntry(false)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Show QR code instead
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter verification code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-lg font-mono"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleVerify}
              disabled={isLoading || verificationCode.length !== 6}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify & Enable'}
            </button>
            <button
              onClick={() => setStep('setup')}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (step === 'complete' && setupData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="text-center mb-6">
          <ShieldCheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            2FA Enabled Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Your account is now protected with two-factor authentication
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Save Your Backup Codes
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
            Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
          </p>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="text-gray-800 dark:text-gray-200">
                  {code.substring(0, 4)}-{code.substring(4)}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={copyBackupCodes}
            className="mt-3 flex items-center space-x-2 text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 text-sm"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            <span>{copiedBackupCodes ? 'Copied!' : 'Copy backup codes'}</span>
          </button>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Continue
        </button>
      </motion.div>
    )
  }

  return null
}
