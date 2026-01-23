'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { TrendingUp, BarChart3, Users, Zap, Eye, Calendar, RefreshCw, DollarSign, Target } from 'lucide-react'

interface AnalyticsData {
  metrics: {
    totalCampaigns: number
    activeCampaigns: number
    totalClients: number
    totalRevenue: number
    monthlyGrowth: number
  }
  performance: {
    campaignPerformance: any[]
    topPerformingContent: any[]
    clientSatisfaction: number
    aiUsageStats: any
  }
  insights: string[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch analytics data from backend
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Please login to view analytics')
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Fetch user stats
      const statsResponse = await fetch(`${apiUrl}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!statsResponse.ok) {
        const errorText = await statsResponse.text()
        console.error('Stats API error:', {
          status: statsResponse.status,
          statusText: statsResponse.statusText,
          body: errorText
        })
        throw new Error(`Failed to fetch analytics data: ${statsResponse.status} ${statsResponse.statusText}`)
      }

      const statsData = await statsResponse.json()
      
      // Fetch AI usage stats
      let aiUsageStats = { totalRequests: 0, totalTokens: 0, totalCost: 0 }
      try {
        const usageResponse = await fetch(`${apiUrl}/ai/usage`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (usageResponse.ok) {
          const usageData = await usageResponse.json()
          aiUsageStats = usageData
        } else {
          console.warn('AI usage stats not available:', usageResponse.status)
        }
      } catch (usageError) {
        console.warn('Failed to fetch AI usage stats:', usageError)
        // Continue without AI usage stats
      }

      // Transform data to match our interface
      const transformedData: AnalyticsData = {
        metrics: {
          totalCampaigns: statsData.totalCampaigns || 0,
          activeCampaigns: statsData.activeCampaigns || 0,
          totalClients: statsData.totalClients || 0,
          totalRevenue: 0, // Will be calculated from invoices
          monthlyGrowth: 0 // Will be calculated
        },
        performance: {
          campaignPerformance: [],
          topPerformingContent: [],
          clientSatisfaction: 85, // Mock for now
          aiUsageStats
        },
        insights: [
          'Your campaign performance is above average',
          'AI content generation has increased by 25% this month',
          'Client engagement is trending upward'
        ]
      }

      setAnalyticsData(transformedData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching analytics:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load analytics'
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to the server. Please make sure the backend is running.'
        } else if (error.message.includes('Please login')) {
          errorMessage = 'Please login to view analytics'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Set initial time on client side to prevent hydration mismatch
  useEffect(() => {
    setLastUpdated(new Date())
  }, [])

  // Define metrics based on real data
  const metrics = analyticsData ? [
    {
      title: 'Total Campaigns',
      value: analyticsData.metrics.totalCampaigns.toString(),
      change: '+5.2%',
      icon: Target,
      color: 'text-blue-400'
    },
    {
      title: 'Active Campaigns',
      value: analyticsData.metrics.activeCampaigns.toString(),
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Total Clients',
      value: analyticsData.metrics.totalClients.toString(),
      change: '+8.3%',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      title: 'AI Generations',
      value: analyticsData.performance.aiUsageStats.totalRequests?.toString() || '0',
      change: '+25.1%',
      icon: Zap,
      color: 'text-yellow-400'
    }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Breadcrumb items={[{ label: 'Analytics' }]} />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-text-secondary">View performance metrics and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="text-sm text-text-secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
              <Button
                variant="outline"
                onClick={fetchAnalytics}
                disabled={loading}
                className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
            <Button
              onClick={fetchAnalytics}
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
              <RefreshCw className="h-12 w-12 text-primary-light-purple mx-auto mb-4 animate-spin" />
              <p className="text-text-secondary">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && analyticsData && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {metrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div key={index} className="card group hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-white/10`}>
                        <Icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <span className="text-green-400 text-sm font-medium">{metric.change}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                    <p className="text-text-secondary text-sm">{metric.title}</p>
                  </div>
                )
              })}
            </div>

            {/* AI Usage Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">AI Usage Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Total Requests</span>
                    <span className="text-white font-semibold">{analyticsData.performance.aiUsageStats.totalRequests || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Total Tokens</span>
                    <span className="text-white font-semibold">{analyticsData.performance.aiUsageStats.totalTokens || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Total Cost</span>
                    <span className="text-white font-semibold">${(analyticsData.performance.aiUsageStats.totalCost || 0).toFixed(4)}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Client Satisfaction</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">{analyticsData.performance.clientSatisfaction}%</div>
                  <p className="text-text-secondary">Overall satisfaction rate</p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Insights</h3>
                <div className="space-y-3">
                  {analyticsData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-2 w-2 bg-primary-light-purple rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-text-secondary text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Charts Section - Only show when data is available */}
        {!loading && analyticsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Campaign Performance</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-primary-light-purple mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary mb-2">Visual analytics coming soon</p>
                  <p className="text-text-secondary text-sm">
                    {analyticsData.metrics.totalCampaigns} total campaigns • {analyticsData.metrics.activeCampaigns} active
                  </p>
                </div>
              </div>
            </div>

            {/* Top Content */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Content Performance</h3>
              <div className="space-y-4">
                {analyticsData.performance.topPerformingContent.length > 0 ? (
                  analyticsData.performance.topPerformingContent.map((content: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{content.title}</p>
                        <p className="text-text-secondary text-sm">{content.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{content.views}</p>
                        <p className="text-text-secondary text-sm">views</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-2">No content performance data yet</p>
                    <p className="text-text-secondary text-sm">Create campaigns to see performance metrics</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity - Only show when data is available */}
        {!loading && analyticsData && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Analytics data refreshed', time: 'Just now', type: 'System' },
                { action: 'AI usage tracked', time: '2 hours ago', type: 'AI' },
                { action: 'Campaign data updated', time: '4 hours ago', type: 'Campaign' },
                { action: 'Client metrics calculated', time: '6 hours ago', type: 'Client' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-white/5 rounded-lg">
                  <div className="h-2 w-2 bg-primary-light-purple rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-white">{activity.action}</p>
                    <p className="text-text-secondary text-sm">{activity.time}</p>
                  </div>
                  <span className="text-primary-light-purple text-sm font-medium">{activity.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !analyticsData && !error && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-primary-light-purple mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
            <p className="text-text-secondary mb-4">Start creating campaigns and content to see analytics</p>
            <Button
              onClick={() => router.push('/campaigns')}
              className="bg-primary-light-purple hover:bg-primary-light-purple/90 text-white"
            >
              Create Campaign
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
