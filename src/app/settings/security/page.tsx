'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import TwoFactorSetup from '@/components/auth/TwoFactorSetup'
import SessionManager from '@/components/auth/SessionManager'

interface User {
  id: string
  name: string
  email: string
  emailVerified: Date | null
  twoFactorEnabled: boolean
  provider: string
}

export default function SecuritySettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | '2fa' | 'sessions' | 'password'>('overview')
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [isDisabling2FA, setIsDisabling2FA] = useState(false)
  const [disable2FAForm, setDisable2FAForm] = useState({
    password: '',
    twoFactorToken: '',
    isBackupCode: false,
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsDisabling2FA(true)
    try {
      const response = await fetch('/api/auth/2fa/disable/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(disable2FAForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA')
      }

      // Refresh user data
      await fetchUserData()
      setDisable2FAForm({ password: '', twoFactorToken: '', isBackupCode: false })
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
    } finally {
      setIsDisabling2FA(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ShieldCheckIcon },
    { id: '2fa', name: 'Two-Factor Auth', icon: KeyIcon },
    { id: 'sessions', name: 'Active Sessions', icon: ComputerDesktopIcon },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Security Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your account security and privacy settings
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Account Status */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Account Security Status
                  </h3>
                  <div className="space-y-4">
                    {/* Email Verification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {user?.emailVerified ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Email Verification
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.emailVerified ? 'Verified' : 'Not verified'}
                          </p>
                        </div>
                      </div>
                      {!user?.emailVerified && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Verify Email
                        </button>
                      )}
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {user?.twoFactorEnabled ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('2fa')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {user?.twoFactorEnabled ? 'Manage' : 'Enable'}
                      </button>
                    </div>

                    {/* Account Type */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Account Type
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.provider === 'EMAIL' ? 'Email & Password' : `OAuth (${user?.provider})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Recommendations */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Security Recommendations
                  </h3>
                  <div className="space-y-3">
                    {!user?.twoFactorEnabled && (
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Enable Two-Factor Authentication
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                    )}
                    {!user?.emailVerified && (
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Verify Your Email
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Verify your email to enable password reset and security notifications
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === '2fa' && (
              <div className="space-y-6">
                {user?.twoFactorEnabled ? (
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication Enabled
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
                    </p>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                        Disable Two-Factor Authentication
                      </h4>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={disable2FAForm.password}
                            onChange={(e) => setDisable2FAForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            2FA Code or Backup Code
                          </label>
                          <input
                            type="text"
                            value={disable2FAForm.twoFactorToken}
                            onChange={(e) => setDisable2FAForm(prev => ({ ...prev, twoFactorToken: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isBackupCode"
                            checked={disable2FAForm.isBackupCode}
                            onChange={(e) => setDisable2FAForm(prev => ({ ...prev, isBackupCode: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isBackupCode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            This is a backup code
                          </label>
                        </div>
                        <button
                          onClick={handleDisable2FA}
                          disabled={isDisabling2FA || !disable2FAForm.password || !disable2FAForm.twoFactorToken}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                          {isDisabling2FA ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {!show2FASetup ? (
                      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <KeyIcon className="h-6 w-6 text-blue-600" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Two-Factor Authentication
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Add an extra layer of security to your account by requiring a second form of authentication.
                        </p>
                        <button
                          onClick={() => setShow2FASetup(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                          Enable Two-Factor Authentication
                        </button>
                      </div>
                    ) : (
                      <TwoFactorSetup
                        onComplete={() => {
                          setShow2FASetup(false)
                          fetchUserData()
                        }}
                        onCancel={() => setShow2FASetup(false)}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && <SessionManager />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
