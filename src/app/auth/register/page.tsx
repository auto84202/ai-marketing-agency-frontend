'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthService } from '@/lib/auth'
import { checkPasswordStrength, validateEmail } from '@/lib/password-strength'
import { Mail, Lock, Eye, EyeOff, User, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { OAuthButton } from '@/components/auth/OAuthButton'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card py-8 px-4 sm:px-10">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''))
  const [emailValidation, setEmailValidation] = useState(validateEmail(''))

  // Check if already logged in - redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    if (token) {
      router.replace('/dashboard')
    }
  }, [router])

  // Real-time validation effects
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password))
  }, [formData.password])

  useEffect(() => {
    setEmailValidation(validateEmail(formData.email))
  }, [formData.email])

  const validateForm = () => {
    // Name validation (min 2 chars, max 50)
    if (!formData.name.trim() || formData.name.length < 2) {
      setError('Name must be at least 2 characters long')
      return false
    }
    if (formData.name.length > 50) {
      setError('Name must not exceed 50 characters')
      return false
    }
    
    // Email validation
    if (!emailValidation.isValid) {
      setError(emailValidation.message || 'Please enter a valid email address')
      return false
    }
    
    // Password validation - must meet all requirements (score 5 = all requirements met)
    if (passwordStrength.score < 4) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
      return false
    }
    
    // Password must be at least 8 characters
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    
    // Password must not exceed 128 characters
    if (formData.password.length > 128) {
      setError('Password must not exceed 128 characters')
      return false
    }
    
    // Password confirmation match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (!validateForm()) {
      setIsLoading(false)
      return
    }
    
    try {
      setError(null) // Clear any previous errors
      
      const result = await AuthService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        company: formData.company?.trim() || undefined,
        password: formData.password,
      })
      
      // Registration successful - redirect to login
      alert('Registration successful! Please log in with your credentials.')
      
      // Redirect to login page
      const redirectTo = searchParams.get('redirect')
      const loginUrl = redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : '/auth/login'
      
      router.replace(loginUrl)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      setError(errorMessage) // Display error in UI instead of alert
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

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    window.location.href = `${apiUrl}/auth/google`
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-primary-light-purple hover:text-primary-pink">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
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
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white">
                Full Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-white/20 bg-white/10 px-3 py-2 pl-10 placeholder-text-muted text-white shadow-sm focus:border-primary-light-purple focus:outline-none focus:ring-primary-light-purple sm:text-sm"
                  placeholder="Enter your full name"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 pl-10 placeholder-text-muted text-white shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                    formData.email 
                      ? emailValidation.isValid 
                        ? 'border-green-500 bg-white/10 focus:border-green-500 focus:ring-green-500' 
                        : 'border-red-500 bg-white/10 focus:border-red-500 focus:ring-red-500'
                      : 'border-white/20 bg-white/10 focus:border-primary-light-purple focus:ring-primary-light-purple'
                  }`}
                  placeholder="Enter your email (e.g., user@gmail.com)"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                {formData.email && (
                  <div className="absolute right-3 top-2.5">
                    {emailValidation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {formData.email && !emailValidation.isValid && (
                <p className="mt-1 text-sm text-red-400">{emailValidation.message}</p>
              )}
              {formData.email && emailValidation.isValid && (
                <p className="mt-1 text-sm text-green-400">✓ Valid email format</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-white">
                Company (Optional)
              </label>
              <div className="mt-1 relative">
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={formData.company}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-white/20 bg-white/10 px-3 py-2 pl-10 placeholder-text-muted text-white shadow-sm focus:border-primary-light-purple focus:outline-none focus:ring-primary-light-purple sm:text-sm"
                  placeholder="Enter your company name"
                />
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 pl-10 pr-10 placeholder-text-muted text-white shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                    formData.password 
                      ? passwordStrength.score >= 3 
                        ? 'border-green-500 bg-white/10 focus:border-green-500 focus:ring-green-500' 
                        : 'border-red-500 bg-white/10 focus:border-red-500 focus:ring-red-500'
                      : 'border-white/20 bg-white/10 focus:border-primary-light-purple focus:ring-primary-light-purple'
                  }`}
                  placeholder="Create a strong password"
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
              {formData.password && (
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
                  
                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      {passwordStrength.requirements.length ? (
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.requirements.length ? 'text-green-400' : 'text-red-400'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.requirements.uppercase ? (
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.requirements.uppercase ? 'text-green-400' : 'text-red-400'}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.requirements.lowercase ? (
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.requirements.lowercase ? 'text-green-400' : 'text-red-400'}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.requirements.number ? (
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.requirements.number ? 'text-green-400' : 'text-red-400'}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      {passwordStrength.requirements.special ? (
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-2" />
                      )}
                      <span className={passwordStrength.requirements.special ? 'text-green-400' : 'text-red-400'}>
                        One special character (@$!%*?&)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirm Password
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
                      ? formData.password === formData.confirmPassword 
                        ? 'border-green-500 bg-white/10 focus:border-green-500 focus:ring-green-500' 
                        : 'border-red-500 bg-white/10 focus:border-red-500 focus:ring-red-500'
                      : 'border-white/20 bg-white/10 focus:border-primary-light-purple focus:ring-primary-light-purple'
                  }`}
                  placeholder="Confirm your password"
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
                    {formData.password === formData.confirmPassword ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1 text-sm text-green-400">✓ Passwords match</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary-light-purple focus:ring-primary-light-purple"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-white">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-light-purple hover:text-primary-pink">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-light-purple hover:text-primary-pink">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="mt-6">
              <OAuthButton
                provider="google"
                onClick={handleGoogleLogin}
                className="shadow-lg hover:shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
