'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function AuthCallbackForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token')
        const userParam = searchParams.get('user')
        const error = searchParams.get('error')
        const message = searchParams.get('message')

        if (error) {
          setStatus('error')
          if (message) {
            // Decode the message if it's URL encoded
            try {
              setMessage(decodeURIComponent(message))
            } catch (e) {
              setMessage('OAuth authentication failed. Please try again.')
            }
          } else {
            setMessage('OAuth authentication failed. Please try again.')
          }
          
          // Don't redirect immediately, let user see error message
          setTimeout(() => router.replace('/auth/login'), 3000)
          return
        }

        if (token && userParam) {
          // Store the token and user data
          localStorage.setItem('auth_token', token)
          localStorage.setItem('token', token)

          try {
            const user = JSON.parse(decodeURIComponent(userParam))
            localStorage.setItem('user_data', JSON.stringify(user))
            localStorage.setItem('user', JSON.stringify(user))
          } catch (e) {
            console.error('Failed to parse user data:', e)
          }

          // Reset inactivity timer on OAuth login
          const now = Date.now()
          localStorage.setItem('last_activity_time', now.toString())

          setStatus('success')
          setMessage('Authentication successful! Redirecting to dashboard...')

          // Redirect immediately to dashboard (replace to avoid back button issues)
          router.replace('/dashboard')
        } else {
          setStatus('error')
          setMessage('Invalid authentication response. Please try again.')
          router.replace('/auth/login')
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('error')
        setMessage('An error occurred during authentication.')
        router.replace('/auth/login')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-10 w-10 bg-primary-light-purple rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card py-8 px-4 sm:px-10 text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light-purple mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
                <p className="text-text-secondary">Please wait while we complete your authentication.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                <p className="text-text-secondary">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
                <p className="text-text-secondary">{message}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackForm />
    </Suspense>
  )
}
