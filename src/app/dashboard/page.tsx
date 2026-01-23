'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { AuthService } from '@/lib/auth'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { BarChart3, Users, Zap, MessageSquare, RefreshCw, Image as ImageIcon, FileText, Plus, Eye, Settings, User, TrendingUp, Bot, Search } from 'lucide-react'

interface DashboardStats {
  totalCampaigns: number
  activeCampaigns: number
  totalClients: number
  totalChatbots: number
  aiGenerations: number
}

interface RecentImageMetadata {
  imageUrl?: string
  [key: string]: unknown
}

interface RecentImage {
  id: string
  title?: string
  content: string
  metadata?: RecentImageMetadata
  campaign?: {
    id: string
    name: string
  }
  createdAt: string
}

interface FacebookPost {
  id: string
  content: string
  hashtags: string
  platform: string
  metrics?: {
    likes?: number
    comments?: number
    shares?: number
    permalink?: string
  }
  postedAt?: string
  createdAt: string
  platformPostId?: string
  permalink?: string | null
  campaign?: {
    id: string
    name: string
  }
  comments: Array<{
    id: string
    content: string
    authorName: string
    authorAvatar?: string
    createdAt: string
    sentiment?: string
  }>
  commentCount: number
}


export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalClients: 0,
    totalChatbots: 0,
    aiGenerations: 0
  })
  const [recentImages, setRecentImages] = useState<RecentImage[]>([])
  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[]>([])
  const [instagramPosts, setInstagramPosts] = useState<FacebookPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [userName, setUserName] = useState('')

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setStatsLoading(true)
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Fetch user profile
      try {
        const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (profileResponse.ok) {
          const profile = await profileResponse.json()
          setUserName(profile.name || 'User')
        }
      } catch {
        // Silently handle profile fetch errors
      }

      // Fetch campaigns
      const campaignsResponse = await fetch(`${apiUrl}/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      let campaignsData = []
      if (campaignsResponse.ok) {
        campaignsData = await campaignsResponse.json()
      }

      // Fetch chatbots
      const chatbotsResponse = await fetch(`${apiUrl}/chatbot`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      let chatbotsData = []
      if (chatbotsResponse.ok) {
        const chatbotData = await chatbotsResponse.json()
        chatbotsData = chatbotData.data || chatbotData
      }

      // Fetch clients
      const clientsResponse = await fetch(`${apiUrl}/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      let clientsData = []
      if (clientsResponse.ok) {
        clientsData = await clientsResponse.json()
      }

      // Fetch all generated images for count
      const allImagesResponse = await fetch(`${apiUrl}/ai/content?type=IMAGE&limit=1000`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      let allImages = []
      if (allImagesResponse.ok) {
        try {
          const allImagesData = await allImagesResponse.json()
          allImages = allImagesData?.success && allImagesData?.data?.content 
            ? allImagesData.data.content 
            : allImagesData?.data?.content || allImagesData?.content || (Array.isArray(allImagesData?.data) ? allImagesData.data : []) || (Array.isArray(allImagesData) ? allImagesData : [])
        } catch (e) {
          console.warn('Failed to parse all images response:', e)
        }
      }

      // Fetch recent generated images for dashboard display
      const imagesResponse = await fetch(`${apiUrl}/ai/content?type=IMAGE&limit=6`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      let recentImagesList = []
      if (imagesResponse.ok) {
        try {
          const imagesData = await imagesResponse.json()
          recentImagesList = imagesData?.success && imagesData?.data?.content
            ? imagesData.data.content
            : imagesData?.data?.content || imagesData?.content || (Array.isArray(imagesData?.data) ? imagesData.data : []) || (Array.isArray(imagesData) ? imagesData : [])
          setRecentImages(Array.isArray(recentImagesList) ? recentImagesList.slice(0, 6) : [])
        } catch (e) {
          console.warn('Failed to parse recent images response:', e)
        }
      }

      // Fetch Facebook posts with comments
      try {
        const facebookResponse = await fetch('http://localhost:3001/campaigns/facebook-posts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (facebookResponse.ok) {
          const facebookData = await facebookResponse.json()
          setFacebookPosts(facebookData.posts || [])
        }
      } catch (e) {
        console.warn('Failed to fetch Facebook posts:', e)
      }

      // Fetch Instagram posts with comments
      try {
        const instagramResponse = await fetch('http://localhost:3001/campaigns/instagram-posts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (instagramResponse.ok) {
          const instagramData = await instagramResponse.json()
          setInstagramPosts(instagramData.posts || [])
        }
      } catch (e) {
        console.warn('Failed to fetch Instagram posts:', e)
      }

      setStats({
        totalCampaigns: campaignsData.length || 0,
        activeCampaigns: campaignsData.filter((c: { status: string }) => c.status === 'active').length || 0,
        totalClients: Array.isArray(clientsData) ? clientsData.length : 0,
        totalChatbots: Array.isArray(chatbotsData) ? chatbotsData.length : 0,
        aiGenerations: Array.isArray(allImages) ? allImages.length : 0
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setStatsLoading(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/auth/login')
      return
    }
    fetchDashboardData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light-purple mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Dashboard Header with Refresh */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-text-secondary">Welcome back, {userName || 'User'}! Here&apos;s your overview.</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            disabled={statsLoading}
            className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push('/campaigns')}>
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-light-purple mr-4" />
              <div>
                <p className="text-sm text-text-secondary mb-1">Campaigns</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats.totalCampaigns}
                </p>
                <p className="text-xs text-green-400 mt-1">{stats.activeCampaigns} active</p>
              </div>
            </div>
          </div>

          <div className="card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push('/chatbots')}>
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-primary-light-purple mr-4" />
              <div>
                <p className="text-sm text-text-secondary mb-1">Chatbots</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats.totalChatbots}
                </p>
              </div>
            </div>
          </div>

          <div className="card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push('/clients')}>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-light-purple mr-4" />
              <div>
                <p className="text-sm text-text-secondary mb-1">Clients</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats.totalClients}
                </p>
              </div>
            </div>
          </div>

          <div className="card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push('/images/history')}>
            <div className="flex items-center">
              <ImageIcon className="h-8 w-8 text-primary-light-purple mr-4" />
              <div>
                <p className="text-sm text-text-secondary mb-1">Generated Images</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats.aiGenerations}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Scanner - Featured Section */}
        <div className="card mb-8 bg-gradient-to-br from-primary-light-purple to-primary-pink border-2 border-white/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Search className="h-12 w-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">Keyword Scanner</h2>
                <p className="text-white/90 drop-shadow-md">Discover trending keywords across social media platforms</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/keyword-scanner')}
              className="bg-white text-primary-dark-purple hover:bg-white/90 text-lg px-8 py-6 font-bold shadow-xl"
            >
              <Search className="h-6 w-6 mr-2" />
              Start Scanning
            </Button>
          </div>
        </div>

        {/* Recent Generated Images */}
        {recentImages.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ImageIcon className="h-6 w-6 text-primary-light-purple mr-2" />
                <h2 className="text-xl font-bold text-white">Recent Generated Images</h2>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/images/history')}
                className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentImages.map((image) => {
                const imageUrl = image.metadata?.imageUrl || image.content
                return imageUrl ? (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer"
                    onClick={() => router.push(`/campaigns/${image.campaign?.id || ''}`)}
                  >
                    <div className="aspect-square bg-secondary-dark rounded-lg overflow-hidden border border-white/10 relative">
                      <NextImage 
                        src={imageUrl} 
                        alt={image.title || 'Generated image'}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {image.campaign && (
                      <p className="text-xs text-text-secondary mt-2 truncate">{image.campaign.name}</p>
                    )}
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Social Media Posts Section */}
        {(facebookPosts.length > 0 || instagramPosts.length > 0) && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Social Media Posts</h2>
            <div className="flex items-center gap-4">
              {facebookPosts.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/facebook')}
                    className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full hover:from-blue-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                    title="View Facebook Posts"
                  >
                    <svg 
                      className="w-8 h-8 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white bg-gray-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      View Facebook ({facebookPosts.length})
                    </span>
                  </button>
                  <span className="text-sm text-text-secondary">{facebookPosts.length} posts</span>
                </div>
              )}
              
              {instagramPosts.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/instagram')}
                    className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full hover:from-purple-400 hover:via-pink-400 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                    title="View Instagram Posts"
                  >
                    <svg 
                      className="w-8 h-8 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white bg-gray-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      View Instagram ({instagramPosts.length})
                    </span>
                  </button>
                  <span className="text-sm text-text-secondary">{instagramPosts.length} posts</span>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Primary Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Create New</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button
              onClick={() => router.push('/campaigns/create')}
              className="h-32 flex-col bg-gradient-to-br from-primary-light-purple to-primary-pink hover:from-primary-pink hover:to-primary-light-purple text-white border-0"
            >
              <Plus className="h-8 w-8 mb-2" />
              <span className="text-lg font-semibold">Create Campaign</span>
              <span className="text-sm opacity-80 mt-1">Start new marketing campaign</span>
            </Button>

            <Button
              onClick={() => router.push('/chatbots')}
              variant="outline"
              className="h-32 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Bot className="h-8 w-8 mb-2" />
              <span className="text-lg font-semibold">Create Chatbot</span>
              <span className="text-sm opacity-80 mt-1">Deploy AI chatbot</span>
            </Button>

            <Button
              onClick={() => router.push('/clients')}
              variant="outline"
              className="h-32 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Users className="h-8 w-8 mb-2" />
              <span className="text-lg font-semibold">Manage Clients</span>
              <span className="text-sm opacity-80 mt-1">View & manage clients</span>
            </Button>

            <Button
              onClick={() => router.push('/keyword-scanner')}
              variant="outline"
              className="h-32 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Search className="h-8 w-8 mb-2" />
              <span className="text-lg font-semibold">Keyword Scanner</span>
              <span className="text-sm opacity-80 mt-1">Discover trending keywords</span>
            </Button>
          </div>
        </div>

        {/* Manage Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/campaigns')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">Campaigns</span>
              <span className="text-xs opacity-70 mt-1">{stats.totalCampaigns} total</span>
            </Button>

            <Button
              onClick={() => router.push('/chatbots')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <MessageSquare className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">Chatbots</span>
              <span className="text-xs opacity-70 mt-1">{stats.totalChatbots} bots</span>
            </Button>

            <Button
              onClick={() => router.push('/clients')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">Clients</span>
              <span className="text-xs opacity-70 mt-1">{stats.totalClients} clients</span>
            </Button>

            <Button
              onClick={() => router.push('/ai/content')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">AI Content</span>
              <span className="text-xs opacity-70 mt-1">All generated</span>
            </Button>

            {facebookPosts.length > 0 && (
              <Button
                onClick={() => router.push('/facebook')}
                variant="outline"
                className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                <span className="text-sm font-semibold">Facebook Posts</span>
                <span className="text-xs opacity-70 mt-1">{facebookPosts.length} posts</span>
              </Button>
            )}

            <Button
              onClick={() => router.push('/images/history')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ImageIcon className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">Image History</span>
              <span className="text-xs opacity-70 mt-1">{stats.aiGenerations} images</span>
            </Button>
          </div>
        </div>

        {/* Analytics & Reports */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Analytics & Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => router.push('/analytics')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">Analytics</span>
              <span className="text-xs opacity-70 mt-1">View performance metrics</span>
            </Button>

            <Button
              onClick={() => router.push('/dashboard/workflows')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Zap className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">Workflows</span>
              <span className="text-xs opacity-70 mt-1">Automation workflows</span>
            </Button>
          </div>
        </div>

        {/* Settings & Profile */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/profile')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <User className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">Profile</span>
              <span className="text-xs opacity-70 mt-1">Edit your profile</span>
            </Button>

            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
              className="h-24 flex-col bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm font-semibold">Settings</span>
              <span className="text-xs opacity-70 mt-1">App configuration</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
