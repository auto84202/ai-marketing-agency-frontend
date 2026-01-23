'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { validateEmail } from '@/lib/password-strength'
import { authAPI } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [emailValidation, setEmailValidation] = useState(validateEmail(''))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate email
    const validation = validateEmail(email)
    setEmailValidation(validation)

    if (!validation.isValid) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await authAPI.forgotPassword(email.trim().toLowerCase())
      
      if (response.data?.success || response.data?.message) {
        setIsSubmitted(true)
      } else {
        setError(response.data?.message || 'Failed to send reset email')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send reset email. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 bg-primary-light-purple rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="ml-2 text-2xl font-bold text-white">MarketPro</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card py-8 px-4 sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Check your email
            </h2>
            
            <p className="text-text-secondary mb-6">
              We've sent a password reset link to <strong className="text-white">{email}</strong>
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-text-muted">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                  className="text-primary-light-purple hover:text-primary-pink font-medium"
                >
                  try again
                </button>
              </p>
              
              <Link
                href="/auth/login"
                className="inline-flex items-center text-primary-light-purple hover:text-primary-pink font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <div className="h-10 w-10 bg-primary-light-purple rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-white">MarketPro</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailValidation(validateEmail(e.target.value))
                  }}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 pl-10 placeholder-text-muted text-white shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                    email 
                      ? emailValidation.isValid 
                        ? 'border-green-500 bg-white/10 focus:border-green-500 focus:ring-green-500' 
                        : 'border-red-500 bg-white/10 focus:border-red-500 focus:ring-red-500'
                      : 'border-white/20 bg-white/10 focus:border-primary-light-purple focus:ring-primary-light-purple'
                  }`}
                  placeholder="Enter your email address"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                {email && (
                  <div className="absolute right-3 top-2.5">
                    {emailValidation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {email && !emailValidation.isValid && (
                <p className="mt-1 text-sm text-red-400">{emailValidation.message}</p>
              )}
              {email && emailValidation.isValid && (
                <p className="mt-1 text-sm text-green-400">✓ Valid email format</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-900/50 p-4 border border-red-500/50">
                <div className="flex">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !emailValidation.isValid}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-primary-light-purple hover:text-primary-pink font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
