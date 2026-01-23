'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Save, Loader2, Calendar, DollarSign, Tag, Activity, FileText, Sparkles } from 'lucide-react'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]
  
  // Set max date to 5 years from now (reasonable campaign planning horizon)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 5)
  const maxDateString = maxDate.toISOString().split('T')[0]
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SEO' as 'SEO' | 'ADS' | 'SOCIAL' | 'EMAIL',
    status: 'draft' as 'draft' | 'active' | 'paused' | 'completed',
    startDate: '',
    endDate: '',
    budget: ''
  })
  
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    description: '',
    endDate: ''
  })

  // Validate form
  const validateForm = () => {
    const errors = { name: '', description: '', endDate: '' }
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Campaign name is required'
      isValid = false
    } else if (formData.name.length < 3) {
      errors.name = 'Campaign name must be at least 3 characters'
      isValid = false
    }

    if (!formData.description.trim()) {
      errors.description = 'Campaign description is required for AI content generation'
      isValid = false
    } else if (formData.description.length < 20) {
      errors.description = 'Description must be at least 20 characters for effective AI content generation'
      isValid = false
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = 'End date must be after start date'
        isValid = false
      }
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        setError('Please login to create campaigns')
        // Auth disabled - continue
        return
      }

      // Prepare data
      const campaignData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status
      }

      if (formData.startDate) {
        campaignData.startDate = formData.startDate
      }
      if (formData.endDate) {
        campaignData.endDate = formData.endDate
      }
      if (formData.budget && formData.budget.trim() !== '') {
        campaignData.budget = parseFloat(formData.budget)
      }

      const response = await fetch(`${apiUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('token')
          setError('Your session has expired. Please login again.')
          // Auth disabled - continue
          return
        }
        
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to create campaign')
      }

      // Success
      setSuccess('Campaign created successfully! Redirecting to dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Error creating campaign:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError(`Cannot connect to server. Please ensure the backend is running on ${apiUrl}`)
      } else {
        setError(error instanceof Error ? error.message : 'Failed to create campaign')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="bg-gradient-header shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mr-4 text-white border-white hover:bg-white hover:text-primary-dark"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="text-xl font-bold text-white">Create Campaign</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">New Marketing Campaign</h1>
            <p className="text-text-secondary text-sm">Create a new campaign to organize your marketing efforts</p>
          </div>

          {/* Success Display */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center">
              <div className="flex-shrink-0 mr-3">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-green-300">{success}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
              <div className="flex-shrink-0 mr-3">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="flex items-center text-sm font-medium text-white mb-2">
                <Tag className="h-4 w-4 mr-2" />
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setValidationErrors({ ...validationErrors, name: '' })
                }}
                className={`w-full px-4 py-3 bg-secondary-dark border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/10 focus:ring-primary-light-purple'
                }`}
                placeholder="e.g., Summer Product Launch 2024"
                maxLength={100}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
              )}
              <p className="mt-1 text-xs text-text-secondary">{formData.name.length}/100 characters</p>
            </div>

            {/* Campaign Description - Required for AI Content Generation */}
            <div>
              <label htmlFor="description" className="flex items-center text-sm font-medium text-white mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Campaign Description *
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-light-purple/20 text-primary-light-purple">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </span>
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  setValidationErrors({ ...validationErrors, description: '' })
                }}
                rows={5}
                className={`w-full px-4 py-3 bg-secondary-dark border rounded-lg text-white placeholder:text-gray-300 placeholder:opacity-80 focus:outline-none focus:ring-2 transition-all resize-none ${
                  validationErrors.description 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/10 focus:ring-primary-light-purple'
                }`}
                placeholder="Describe your campaign in detail. This description will be used by AI to automatically generate SEO content, social media posts, images, and other marketing materials when you deploy a chatbot for this campaign. Include details about your goals, target audience, products/services, and key messaging..."
                maxLength={2000}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
              )}
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-text-secondary">
                  {formData.description.length}/2000 characters
                  {formData.description.length < 20 && formData.description.length > 0 && (
                    <span className="ml-2 text-yellow-400">• Minimum 20 characters required</span>
                  )}
                </p>
              </div>
              <div className="mt-2 p-3 bg-primary-light-purple/10 border border-primary-light-purple/20 rounded-lg">
                <p className="text-xs text-text-secondary flex items-start">
                  <Sparkles className="h-4 w-4 mr-2 mt-0.5 text-primary-light-purple flex-shrink-0" />
                  <span>
                    <strong className="text-white">AI Content Generation:</strong> When you deploy a chatbot for this campaign, our AI will automatically create blog posts, social media content, SEO-optimized articles, and marketing images based on this description. Make it detailed and comprehensive for best results.
                  </span>
                </p>
              </div>
            </div>

            {/* Campaign Type */}
            <div>
              <label htmlFor="type" className="flex items-center text-sm font-medium text-white mb-2">
                <Activity className="h-4 w-4 mr-2" />
                Campaign Type *
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 bg-secondary-dark border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-light-purple cursor-pointer transition-all hover:border-white/20"
              >
                <option value="SEO">🔍 SEO - Search Engine Optimization</option>
                <option value="ADS">📢 ADS - Paid Advertising</option>
                <option value="SOCIAL">📱 SOCIAL - Social Media</option>
                <option value="EMAIL">📧 EMAIL - Email Marketing</option>
              </select>
              <p className="mt-1 text-xs text-text-secondary">Choose the primary focus of this campaign</p>
            </div>

            {/* Campaign Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                Initial Status *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'draft', label: 'Draft', icon: '📝', desc: 'Planning stage' },
                  { value: 'active', label: 'Active', icon: '✅', desc: 'Currently running' },
                  { value: 'paused', label: 'Paused', icon: '⏸️', desc: 'Temporarily stopped' },
                  { value: 'completed', label: 'Completed', icon: '🎉', desc: 'Finished' }
                ].map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: status.value as any })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.status === status.value
                        ? 'border-primary-light-purple bg-primary-light-purple/20'
                        : 'border-white/10 bg-secondary-dark hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2">{status.icon}</span>
                      <span className="font-medium text-white">{status.label}</span>
                    </div>
                    <p className="text-xs text-text-secondary">{status.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="flex items-center text-sm font-medium text-white mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  min={today}
                  max={maxDateString}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value })
                    setValidationErrors({ ...validationErrors, endDate: '' })
                  }}
                  className="w-full px-4 py-3 bg-secondary-dark border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-light-purple cursor-pointer transition-all hover:border-white/20"
                />
                <p className="mt-1 text-xs text-text-secondary">Campaign start date (up to 5 years ahead)</p>
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="flex items-center text-sm font-medium text-white mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  max={maxDateString}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value })
                    setValidationErrors({ ...validationErrors, endDate: '' })
                  }}
                  className={`w-full px-4 py-3 bg-secondary-dark border rounded-lg text-white focus:outline-none focus:ring-2 cursor-pointer transition-all hover:border-white/20 ${
                    validationErrors.endDate 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-white/10 focus:ring-primary-light-purple'
                  }`}
                />
                {validationErrors.endDate && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.endDate}</p>
                )}
                {!validationErrors.endDate && (
                  <p className="mt-1 text-xs text-text-secondary">Campaign end date (must be after start date)</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="flex items-center text-sm font-medium text-white mb-2">
                <DollarSign className="h-4 w-4 mr-2" />
                Campaign Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg">$</span>
                <input
                  type="number"
                  id="budget"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-secondary-dark border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-light-purple transition-all hover:border-white/20"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">USD</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {formData.budget && parseFloat(formData.budget) > 0
                  ? `Allocated budget: $${parseFloat(formData.budget).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : 'Leave blank if budget is not set yet'}
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="border-t border-white/10 pt-6 mt-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={loading || success !== ''}
                  className="flex-1 bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-pink hover:to-primary-light-purple text-white font-semibold py-3 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : success ? (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Created Successfully!
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="sm:w-32 text-white border-white/30 hover:bg-white hover:text-primary-dark py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-text-secondary mt-3 text-center">
                * Required fields must be filled before creating campaign
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
