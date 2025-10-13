'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface OAuthLoginProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  className?: string
}

export default function OAuthLogin({ onSuccess, onError, className = '' }: OAuthLoginProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading('google')

    try {
      // Check if client ID is configured
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        throw new Error('Google OAuth is not configured. Please contact the administrator.')
      }

      // Create OAuth URL
      const redirectUri = `${window.location.origin}/auth/callback/google`
      const scope = 'openid email profile'
      const state = Math.random().toString(36).substring(2, 15)

      // Store state for verification
      sessionStorage.setItem('oauth_state', state)

      const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      oauthUrl.searchParams.set('client_id', clientId)
      oauthUrl.searchParams.set('redirect_uri', redirectUri)
      oauthUrl.searchParams.set('response_type', 'code')
      oauthUrl.searchParams.set('scope', scope)
      oauthUrl.searchParams.set('state', state)

      // Redirect to Google OAuth
      window.location.href = oauthUrl.toString()
    } catch (error) {
      setIsLoading(null)
      onError?.(error instanceof Error ? error.message : 'OAuth login failed')
    }
  }

  const handleGitHubLogin = async () => {
    setIsLoading('github')

    try {
      // Check if client ID is configured
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
      if (!clientId) {
        throw new Error('GitHub OAuth is not configured. Please contact the administrator.')
      }

      // Create OAuth URL
      const redirectUri = `${window.location.origin}/auth/callback/github`
      const scope = 'user:email'
      const state = Math.random().toString(36).substring(2, 15)

      // Store state for verification
      sessionStorage.setItem('oauth_state', state)

      const oauthUrl = new URL('https://github.com/login/oauth/authorize')
      oauthUrl.searchParams.set('client_id', clientId)
      oauthUrl.searchParams.set('redirect_uri', redirectUri)
      oauthUrl.searchParams.set('scope', scope)
      oauthUrl.searchParams.set('state', state)

      // Redirect to GitHub OAuth
      window.location.href = oauthUrl.toString()
    } catch (error) {
      setIsLoading(null)
      onError?.(error instanceof Error ? error.message : 'OAuth login failed')
    }
  }

  const handleMicrosoftLogin = async () => {
    setIsLoading('microsoft')

    try {
      // Check if client ID is configured
      const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
      if (!clientId) {
        throw new Error('Microsoft OAuth is not configured. Please contact the administrator.')
      }

      // Create OAuth URL
      const redirectUri = `${window.location.origin}/auth/callback/microsoft`
      const scope = 'openid email profile'
      const state = Math.random().toString(36).substring(2, 15)

      // Store state for verification
      sessionStorage.setItem('oauth_state', state)

      const oauthUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
      oauthUrl.searchParams.set('client_id', clientId)
      oauthUrl.searchParams.set('redirect_uri', redirectUri)
      oauthUrl.searchParams.set('response_type', 'code')
      oauthUrl.searchParams.set('scope', scope)
      oauthUrl.searchParams.set('state', state)

      // Redirect to Microsoft OAuth
      window.location.href = oauthUrl.toString()
    } catch (error) {
      setIsLoading(null)
      onError?.(error instanceof Error ? error.message : 'OAuth login failed')
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Google OAuth */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          disabled={isLoading !== null}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading === 'google' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"></div>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </motion.button>

        {/* GitHub OAuth */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGitHubLogin}
          disabled={isLoading !== null}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading === 'github' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"></div>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </>
          )}
        </motion.button>

        {/* Microsoft OAuth */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMicrosoftLogin}
          disabled={isLoading !== null}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading === 'microsoft' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"></div>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#f25022" d="M1 1h10v10H1z"/>
                <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                <path fill="#7fba00" d="M1 13h10v10H1z"/>
                <path fill="#ffb900" d="M13 13h10v10H13z"/>
              </svg>
              Continue with Microsoft
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
