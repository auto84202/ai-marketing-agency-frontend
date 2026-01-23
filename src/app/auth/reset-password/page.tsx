'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { checkPasswordStrength } from '@/lib/password-strength'
import { authAPI } from '@/lib/api'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''))

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')
    
    if (email && token) {
      setFormData(prev => ({
        ...prev,
        email,
        token
      }))
    }
  }, [searchParams])

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.newPassword))
  }, [formData.newPassword])

  const validateForm = () => {
    if (!formData.email || !formData.token) {
      setError('Invalid reset link. Please request a new one.')
      return false
    }
    
    if (passwordStrength.score < 3) {
      setError('Password is too weak. Please choose a stronger password.')
      return false
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const response = await authAPI.resetPassword({
        email: formData.email.trim().toLowerCase(),
        token: formData.token.trim(),
        newPassword: formData.newPassword
      })

      if (response.data?.success || response.data?.message) {
        setIsSuccess(true)
      } else {
        setError(response.data?.message || 'Failed to reset password')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reset password. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isSuccess) {
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
              Password reset successful
            </h2>
            
            <p className="text-text-secondary mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            
            <Link
              href="/auth/login"
              className="w-full btn-primary inline-block text-center"
            >
              Sign in to your account
            </Link>
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-white">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 pl-10 pr-10 placeholder-text-muted text-white shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                    formData.newPassword 
                      ? passwordStrength.score >= 3 
                        ? 'border-green-500 bg-white/10 focus:border-green-500 focus:ring-green-500' 
                        : 'border-red-500 bg-white/10 focus:border-red-500 focus:ring-red-500'
                      : 'border-white/20 bg-white/10 focus:border-primary-light-purple focus:ring-primary-light-purple'
                  }`}
                  placeholder="Enter your new password"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 h-4 w-4 text-text-muted hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score === 0 ? 'w-0' :
                          passwordStrength.score === 1 ? 'w-1/4 bg-red-500' :
                          passwordStrength.score === 2 ? 'w-2/4 bg-orange-500' :
                          passwordStrength.score === 3 ? 'w-3/4 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score === 0 ? 'text-gray-400' :
                      passwordStrength.score === 1 ? 'text-red-400' :
                      passwordStrength.score === 2 ? 'text-orange-400' :
                      passwordStrength.score === 3 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength.level.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className={`mt-1 text-sm ${
                    passwordStrength.score >= 3 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {passwordStrength.feedback}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 pl-10 pr-10 placeholder-text-muted text-white shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                    formData.confirmPassword 
                      ? formData.newPassword === formData.confirmPassword 
                        ? 'border-green-500 bg-white/10 focus:border-green-500 focus:ring-green-500' 
                        : 'border-red-500 bg-white/10 focus:border-red-500 focus:ring-red-500'
                      : 'border-white/20 bg-white/10 focus:border-primary-light-purple focus:ring-primary-light-purple'
                  }`}
                  placeholder="Confirm your new password"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 h-4 w-4 text-text-muted hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {formData.confirmPassword && (
                  <div className="absolute right-8 top-2.5">
                    {formData.newPassword === formData.confirmPassword ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <p className="mt-1 text-sm text-green-400">✓ Passwords match</p>
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
                disabled={isLoading || passwordStrength.score < 3 || formData.newPassword !== formData.confirmPassword}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting password...
                  </>
                ) : (
                  'Reset password'
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
