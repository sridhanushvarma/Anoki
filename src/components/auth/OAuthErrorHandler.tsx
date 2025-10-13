'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface OAuthErrorHandlerProps {
  error: string | null
  onDismiss: () => void
}

export default function OAuthErrorHandler({ error, onDismiss }: OAuthErrorHandlerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
    }
  }, [error])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Wait for animation to complete
  }

  const getErrorMessage = (error: string) => {
    if (error.includes('not configured')) {
      return {
        title: 'OAuth Not Configured',
        message: 'This OAuth provider is not set up yet. Please use email/password login or contact support.',
        action: 'Try Email Login'
      }
    }
    
    if (error.includes('client_id')) {
      return {
        title: 'Configuration Error',
        message: 'OAuth application is not properly configured. Please contact the administrator.',
        action: 'Contact Support'
      }
    }

    if (error.includes('invalid_request')) {
      return {
        title: 'Authentication Error',
        message: 'There was an issue with the authentication request. Please try again.',
        action: 'Try Again'
      }
    }

    return {
      title: 'Authentication Failed',
      message: error,
      action: 'Try Again'
    }
  }

  if (!error) return null

  const errorInfo = getErrorMessage(error)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {errorInfo.title}
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {errorInfo.message}
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleDismiss}
                    className="text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                  >
                    {errorInfo.action}
                  </button>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={handleDismiss}
                  className="inline-flex text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
