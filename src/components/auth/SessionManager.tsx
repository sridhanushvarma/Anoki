'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ComputerDesktopIcon, 
  DevicePhoneMobileIcon, 
  GlobeAltIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Session {
  id: string
  ipAddress: string
  userAgent: string
  browser: string
  location: string
  createdAt: string
  lastUsedAt: string
  expires: string
  isCurrent: boolean
}

interface SessionsResponse {
  sessions: Session[]
  total: number
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [revoking, setRevoking] = useState<string | null>(null)
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/user/sessions/', {
        credentials: 'include',
      })

      const data: SessionsResponse = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      setSessions(data.sessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId)
    try {
      const response = await fetch(`/api/user/sessions/?sessionId=${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke session')
      }

      // Remove the revoked session from the list
      setSessions(sessions.filter(session => session.id !== sessionId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    setRevoking('all')
    try {
      const response = await fetch('/api/user/sessions/?action=revokeAll', {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke sessions')
      }

      // Keep only the current session
      setSessions(sessions.filter(session => session.isCurrent))
      setShowRevokeAllConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRevoking(null)
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile')) {
      return <DevicePhoneMobileIcon className="h-5 w-5" />
    }
    return <ComputerDesktopIcon className="h-5 w-5" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Active Sessions
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your active sessions and sign out of devices you don't recognize
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
        </div>
        {sessions.filter(s => !s.isCurrent).length > 0 && (
          <button
            onClick={() => setShowRevokeAllConfirm(true)}
            disabled={revoking === 'all'}
            className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors disabled:opacity-50"
          >
            {revoking === 'all' ? 'Revoking...' : 'Sign out all other sessions'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
              session.isCurrent 
                ? 'border-green-200 dark:border-green-700' 
                : 'border-gray-200 dark:border-gray-700'
            } p-6`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  session.isCurrent 
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {getDeviceIcon(session.userAgent)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {session.browser}
                    </h3>
                    {session.isCurrent && (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                        <ShieldCheckIcon className="h-3 w-3" />
                        <span>Current session</span>
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <GlobeAltIcon className="h-4 w-4" />
                      <span>{session.location}</span>
                    </div>
                    <div>
                      <span className="font-medium">Last active:</span> {getTimeAgo(session.lastUsedAt)}
                    </div>
                    <div>
                      <span className="font-medium">Signed in:</span> {formatDate(session.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span> {formatDate(session.expires)}
                    </div>
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => revokeSession(session.id)}
                  disabled={revoking === session.id}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors disabled:opacity-50"
                  title="Sign out this session"
                >
                  {revoking === session.id ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                  ) : (
                    <TrashIcon className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revoke All Confirmation Modal */}
      {showRevokeAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sign out all other sessions?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This will sign you out of all other devices and browsers. You'll need to sign in again on those devices.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={revokeAllOtherSessions}
                disabled={revoking === 'all'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {revoking === 'all' ? 'Signing out...' : 'Yes, sign out all'}
              </button>
              <button
                onClick={() => setShowRevokeAllConfirm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
