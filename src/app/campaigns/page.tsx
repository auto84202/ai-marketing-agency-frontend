'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { BarChart3, Plus, Play, Pause, Trash2, Edit, Calendar, DollarSign } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'SEO' | 'ADS' | 'SOCIAL' | 'EMAIL'
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate?: string
  endDate?: string
  budget?: number
  createdAt: string
  updatedAt: string
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Fetch campaigns from backend
  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      // Auth disabled - proceed without token check

      const response = await fetch(`${apiUrl}/campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('token')
          setError('Session expired. Refreshing...')
          // Continue without redirect
        }
        
        if (response.status === 500) {
          throw new Error('Server error. Please make sure the backend is running.')
        }
        
        // Try to get error message from response
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setCampaigns(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError(`Cannot connect to server. Please ensure the backend is running on ${apiUrl}`)
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load campaigns')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleCreateCampaign = () => {
    router.push('/campaigns/create')
  }

  const handleEditCampaign = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}/edit`)
  }

  const handleViewCampaign = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`${apiUrl}/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId))
      } else {
        throw new Error('Failed to delete campaign')
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete campaign')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20'
      case 'paused':
        return 'text-yellow-400 bg-yellow-400/20'
      case 'completed':
        return 'text-blue-400 bg-blue-400/20'
      case 'draft':
        return 'text-gray-400 bg-gray-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SEO':
        return 'text-purple-400 bg-purple-400/20'
      case 'ADS':
        return 'text-orange-400 bg-orange-400/20'
      case 'SOCIAL':
        return 'text-pink-400 bg-pink-400/20'
      case 'EMAIL':
        return 'text-cyan-400 bg-cyan-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Breadcrumb items={[{ label: 'Campaigns' }]} />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Marketing Campaigns</h1>
            <p className="text-text-secondary">Create and manage your marketing campaigns</p>
          </div>
          <Button
            onClick={handleCreateCampaign}
            className="bg-primary-light-purple hover:bg-primary-pink text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
            <Button
              onClick={fetchCampaigns}
              className="mt-2 text-red-300 border-red-300 hover:bg-red-300 hover:text-red-900"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-primary-light-purple mx-auto mb-4 animate-pulse" />
              <p className="text-text-secondary">Loading campaigns...</p>
            </div>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && !error && (
          <>
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-primary-light-purple mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
                <p className="text-text-secondary mb-4">Create your first marketing campaign to get started</p>
                <Button
                  onClick={handleCreateCampaign}
                  className="bg-primary-light-purple hover:bg-primary-light-purple/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="card group hover:scale-105 transition-transform duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-primary-light-purple/20 mr-3">
                          <BarChart3 className="h-6 w-6 text-primary-light-purple" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                              {campaign.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {campaign.startDate && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-text-secondary mr-2" />
                          <span className="text-text-secondary">Start:</span>
                          <span className="text-white ml-2">
                            {new Date(campaign.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {campaign.endDate && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-text-secondary mr-2" />
                          <span className="text-text-secondary">End:</span>
                          <span className="text-white ml-2">
                            {new Date(campaign.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {campaign.budget && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 text-text-secondary mr-2" />
                          <span className="text-text-secondary">Budget:</span>
                          <span className="text-white ml-2">${campaign.budget.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-text-secondary mr-2" />
                        <span className="text-text-secondary">Created:</span>
                        <span className="text-white ml-2">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => handleViewCampaign(campaign.id)}
                        className="w-full bg-primary-light-purple hover:bg-primary-pink text-white"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Content
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditCampaign(campaign.id)}
                          variant="outline"
                          className="flex-1 text-white border-white/30 hover:bg-white hover:text-primary-dark"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          variant="outline"
                          className="text-red-300 border-red-300 hover:bg-red-300 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
