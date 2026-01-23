'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthService } from '@/lib/auth'
import { validateEmail } from '@/lib/password-strength'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { OAuthButton } from '@/components/auth/OAuthButton'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl px-6 py-8 sm:px-10 border border-white/20">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailValidation, setEmailValidation] = useState(validateEmail(''))

  // Check if already logged in - redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    if (token) {
      router.replace('/dashboard')
    }
  }, [router])

  // Real-time email validation
  useEffect(() => {
    setEmailValidation(validateEmail(formData.email))
  }, [formData.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    // Validation
    if (!emailValidation.isValid) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }
    
    if (!formData.password || formData.password.length === 0) {
      setError('Password is required')
      setIsLoading(false)
      return
    }
    
    try {
      const result = await AuthService.login({
        email: formData.email.trim(),
        password: formData.password
      })
      
      // Success - redirect
      const redirectTo = searchParams.get('redirect') || '/dashboard'
      router.replace(redirectTo)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl px-6 py-8 sm:px-10 border border-white/20">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-primary-light-purple hover:text-primary-pink">
              create a new account
            </Link>
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-6">
          <OAuthButton
            provider="google"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="shadow-md"
          />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/10 backdrop-blur-sm text-text-secondary">
              Or continue with email
            </span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-500/20 border border-red-400/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white/5 text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-transparent ${
                  emailValidation.isValid || !formData.email
                    ? 'border-white/20'
                    : 'border-red-400'
                }`}
                placeholder="you@example.com"
              />
            </div>
            {formData.email && !emailValidation.isValid && (
              <p className="mt-1 text-sm text-red-400">{emailValidation.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light-purple focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Remember me checkbox can be added here if needed */}
            </div>
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary-light-purple hover:text-primary-pink"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !emailValidation.isValid}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-light-purple hover:bg-primary-pink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-1.657.672-3.138 1.757-4.243l1.414 1.414A5.98 5.98 0 006 12c0 1.657.672 3.138 1.757 4.243l-1.414 1.414A7.962 7.962 0 014 12z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
