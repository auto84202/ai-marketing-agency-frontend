'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Save, Loader2, Calendar, DollarSign, Tag, Activity, FileText } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description?: string
  type: 'SEO' | 'ADS' | 'SOCIAL' | 'EMAIL'
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate?: string
  endDate?: string
  budget?: number
}

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
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
    endDate: ''
  })

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
        if (!token) {
          setError('Please login to edit campaigns')
          // Auth disabled - continue
          return
        }

        const response = await fetch(`${apiUrl}/campaigns/${campaignId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('token')
            setError('Your session has expired. Please login again.')
            // Auth disabled - continue
            return
          }
          if (response.status === 404) {
            setError('Campaign not found')
            router.replace('/campaigns')
            return
          }
          throw new Error('Failed to fetch campaign')
        }

        const campaign: Campaign = await response.json()

        // Format dates for input fields
        const startDate = campaign.startDate 
          ? new Date(campaign.startDate).toISOString().split('T')[0]
          : ''
        const endDate = campaign.endDate 
          ? new Date(campaign.endDate).toISOString().split('T')[0]
          : ''

        setFormData({
          name: campaign.name,
          description: campaign.description || '',
          type: campaign.type,
          status: campaign.status,
          startDate,
          endDate,
          budget: campaign.budget ? campaign.budget.toString() : ''
        })
      } catch (error) {
        console.error('Error fetching campaign:', error)
        setError(error instanceof Error ? error.message : 'Failed to load campaign')
      } finally {
        setFetchLoading(false)
      }
    }

    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId, router, apiUrl])

  // Validate form
  const validateForm = () => {
    const errors = { name: '', endDate: '' }
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Campaign name is required'
      isValid = false
    } else if (formData.name.length < 3) {
      errors.name = 'Campaign name must be at least 3 characters'
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
        setError('Please login to update campaigns')
        // Auth disabled - continue
        return
      }

      // Prepare data
      type CampaignUpdatePayload = {
        name: string;
        description: string;
        type: 'SEO' | 'ADS' | 'SOCIAL' | 'EMAIL';
        status: 'draft' | 'active' | 'paused' | 'completed';
        startDate?: string;
        endDate?: string;
        budget?: number;
      }

      const campaignData: CampaignUpdatePayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
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

      const response = await fetch(`${apiUrl}/campaigns/${campaignId}`, {
        method: 'PUT',
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
        throw new Error(errorData?.message || 'Failed to update campaign')
      }

      // Success
      setSuccess('Campaign updated successfully! Redirecting...')
      setTimeout(() => {
        router.push(`/campaigns/${campaignId}`)
      }, 1500)
    } catch (error) {
      console.error('Error updating campaign:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError(`Cannot connect to server. Please ensure the backend is running on ${apiUrl}`)
      } else {
        setError(error instanceof Error ? error.message : 'Failed to update campaign')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-light-purple mx-auto mb-4 animate-spin" />
          <p className="text-text-secondary">Loading campaign...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <Breadcrumb items={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: 'Edit Campaign' }
        ]} />
        
        <div className="card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Edit Marketing Campaign</h1>
            <p className="text-text-secondary text-sm">Update your campaign details and settings</p>
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

            {/* Campaign Description */}
            <div>
              <label htmlFor="description" className="flex items-center text-sm font-medium text-white mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Campaign Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-secondary-dark border border-white/10 rounded-lg text-white placeholder:text-gray-300 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-light-purple transition-all resize-none"
                placeholder="Describe your campaign in detail..."
                maxLength={2000}
              />
              <p className="mt-1 text-xs text-text-secondary">{formData.description.length}/2000 characters</p>
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
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'SEO' | 'ADS' | 'SOCIAL' | 'EMAIL' })}
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
                Campaign Status *
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
                    onClick={() => setFormData({ ...formData, status: status.value as 'draft' | 'active' | 'paused' | 'completed' })}
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
                      Saving Changes...
                    </>
                  ) : success ? (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Updated Successfully!
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
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
                * Required fields must be filled before saving changes
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
