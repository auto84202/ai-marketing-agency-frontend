'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Edit, FileText, Image as ImageIcon, Hash, MessageSquare, Calendar, DollarSign, Tag, Activity, Sparkles, Copy, CheckCircle, Download, Eye, X, RefreshCw, ArrowLeft } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description?: string
  type: 'SEO' | 'ADS' | 'SOCIAL' | 'EMAIL'
  status: 'draft' | 'active' | 'paused' | 'completed'
  startDate?: string
  endDate?: string
  budget?: number
  createdAt: string
  updatedAt: string
}

interface AIContent {
  id: string
  type: string
  title?: string
  content: string
  prompt?: string
  status: string
  approvalStatus: string
  createdAt: string
  metadata?: any
  campaign?: {
    id: string
    name: string
  }
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [aiContent, setAiContent] = useState<AIContent[]>([])
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Fetch campaign details
  const fetchCampaign = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('Campaign not found')
          setTimeout(() => router.push('/campaigns'), 2000)
          return
        }
        throw new Error('Failed to fetch campaign')
      }

      const data = await response.json()
      setCampaign(data)
    } catch (error) {
      console.error('Error fetching campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  // Fetch generated content for this campaign
  const fetchCampaignContent = async () => {
    try {
      setContentLoading(true)
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      // Fetch with higher limit to get all recent content, sorted by newest first
      const aiResponse = await fetch(`${apiUrl}/ai/content?campaignId=${campaignId}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        const content = aiData?.data?.content || aiData?.data?.data?.content || aiData?.content || (Array.isArray(aiData?.data) ? aiData.data : [])
        // Content is already sorted by createdAt desc from backend, just take all
        setAiContent(Array.isArray(content) ? content : [])
      }
    } catch (error) {
      console.error('Error fetching campaign content:', error)
    } finally {
      setContentLoading(false)
    }
  }

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
      fetchCampaignContent()
    }
  }, [campaignId])

  // Refresh content function
  const handleRefreshContent = () => {
    fetchCampaignContent()
  }

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownloadImage = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch(error => {
        console.error('Error downloading image:', error)
        // Fallback: open in new tab
        window.open(url, '_blank')
      })
  }

  // Group content by type
  const images = aiContent.filter(item => item.type === 'IMAGE')
  const blogPosts = aiContent.filter(item => item.type === 'BLOG')
  const seoContent = aiContent.filter(item => item.type === 'SEO' || item.title?.includes('SEO'))
  const socialPosts = aiContent.filter(item => item.type === 'SOCIAL' || item.type === 'SOCIAL_POST')
  const videoScripts = aiContent.filter(item => item.type === 'VIDEO' || item.type === 'VIDEO_SCRIPT')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light-purple mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Campaign not found'}</p>
          <Button onClick={() => router.push('/campaigns')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </div>
    )
  }

  const hasContent = aiContent.length > 0

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Breadcrumb items={[
          { label: 'Campaigns', href: '/campaigns' },
          { label: campaign?.name || 'Campaign Details' }
        ]} />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{campaign?.name || 'Campaign Details'}</h1>
            <p className="text-text-secondary">Campaign Details & Generated Content</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefreshContent}
              disabled={contentLoading}
              variant="outline"
              className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${contentLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => router.push(`/campaigns/${campaignId}/edit`)}
              className="bg-primary-light-purple hover:bg-primary-pink text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Campaign
            </Button>
          </div>
        </div>
        {/* Campaign Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center mb-3">
              <Activity className="h-5 w-5 mr-2 text-primary-light-purple" />
              <h3 className="text-sm font-semibold text-white">Type</h3>
            </div>
            <p className="text-lg text-white">{campaign.type}</p>
          </div>
          <div className="card">
            <div className="flex items-center mb-3">
              <Tag className="h-5 w-5 mr-2 text-primary-light-purple" />
              <h3 className="text-sm font-semibold text-white">Status</h3>
            </div>
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
              campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
              campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
              campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          {campaign.budget && (
            <div className="card">
              <div className="flex items-center mb-3">
                <DollarSign className="h-5 w-5 mr-2 text-primary-light-purple" />
                <h3 className="text-sm font-semibold text-white">Budget</h3>
              </div>
              <p className="text-lg text-white">${campaign.budget.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Generated Content Sections */}
        {contentLoading ? (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light-purple mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading content...</p>
              </div>
            </div>
          </div>
        ) : !hasContent ? (
          <div className="card">
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-primary-light-purple mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary mb-2">No content generated yet</p>
              <p className="text-text-secondary text-sm">
                Deploy a chatbot for this campaign to automatically generate content
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Images Section */}
            {images.length > 0 && (
              <div className="card">
                <div className="flex items-center mb-6">
                  <ImageIcon className="h-5 w-5 mr-2 text-primary-light-purple" />
                  <h2 className="text-lg font-semibold text-white">Generated Images</h2>
                  <span className="ml-3 px-2 py-1 rounded text-xs bg-primary-light-purple/20 text-primary-light-purple">
                    {images.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((item) => {
                    const imageUrl = item.metadata?.imageUrl || item.content
                    const imageType = item.metadata?.imageType || 'image'
                    const filename = `${campaign.name}-${imageType}-${item.id}.png`
                    
                    return imageUrl ? (
                      <div key={item.id} className="relative group">
                        <div className="aspect-video bg-secondary-dark rounded-lg overflow-hidden border border-white/10">
                          <img 
                            src={imageUrl} 
                            alt={item.title || imageType}
                            className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => setSelectedImage(imageUrl)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedImage(imageUrl)
                                }}
                                className="bg-white/20 hover:bg-white/30 text-white border-0"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadImage(imageUrl, filename)
                                }}
                                className="bg-white/20 hover:bg-white/30 text-white border-0"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-text-secondary text-center capitalize">{imageType}</p>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Blog Posts Section */}
            {blogPosts.length > 0 && (
              <div className="card">
                <div className="flex items-center mb-6">
                  <FileText className="h-5 w-5 mr-2 text-primary-light-purple" />
                  <h2 className="text-lg font-semibold text-white">Blog Posts</h2>
                  <span className="ml-3 px-2 py-1 rounded text-xs bg-primary-light-purple/20 text-primary-light-purple">
                    {blogPosts.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {blogPosts.map((item) => (
                    <div key={item.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold">{item.title || 'Blog Post'}</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyContent(item.content, item.id)}
                          className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-3 mb-3">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {item.approvalStatus === 'pending' ? 'Pending Review' : item.approvalStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Content Section */}
            {seoContent.length > 0 && (
              <div className="card">
                <div className="flex items-center mb-6">
                  <Hash className="h-5 w-5 mr-2 text-primary-light-purple" />
                  <h2 className="text-lg font-semibold text-white">SEO Content</h2>
                  <span className="ml-3 px-2 py-1 rounded text-xs bg-primary-light-purple/20 text-primary-light-purple">
                    {seoContent.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {seoContent.map((item) => (
                    <div key={item.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold">{item.title || 'SEO Content'}</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyContent(item.content, item.id)}
                          className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-3 mb-3">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {item.approvalStatus === 'pending' ? 'Pending Review' : item.approvalStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Section */}
            {socialPosts.length > 0 && (
              <div className="card">
                <div className="flex items-center mb-6">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary-light-purple" />
                  <h2 className="text-lg font-semibold text-white">Social Media Posts</h2>
                  <span className="ml-3 px-2 py-1 rounded text-xs bg-primary-light-purple/20 text-primary-light-purple">
                    {socialPosts.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {socialPosts.map((item) => (
                    <div key={item.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold mb-1">Social Media Post</h3>
                          {item.metadata?.platform && (
                            <span className="text-xs text-text-secondary">{item.metadata.platform}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyContent(item.content, item.id)}
                          className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-text-secondary text-sm mb-3">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {item.approvalStatus === 'pending' ? 'Pending Review' : item.approvalStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Scripts Section */}
            {videoScripts.length > 0 && (
              <div className="card">
                <div className="flex items-center mb-6">
                  <FileText className="h-5 w-5 mr-2 text-primary-light-purple" />
                  <h2 className="text-lg font-semibold text-white">Video Scripts</h2>
                  <span className="ml-3 px-2 py-1 rounded text-xs bg-primary-light-purple/20 text-primary-light-purple">
                    {videoScripts.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {videoScripts.map((item) => (
                    <div key={item.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold">{item.title || 'Video Script'}</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyContent(item.content, item.id)}
                          className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-4 mb-3">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {item.approvalStatus === 'pending' ? 'Pending Review' : item.approvalStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="Full size"
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadImage(selectedImage, `${campaign.name}-image.png`)
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
