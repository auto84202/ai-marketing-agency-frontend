'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { 
  RefreshCw, 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  Tag,
  TrendingUp,
  Search,
  Image as ImageIcon
} from 'lucide-react'

interface InstagramPost {
  id: string
  content: string
  hashtags: string
  platform: string
  mediaUrls?: string
  metrics?: {
    likes?: number
    comments?: number
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

interface Hashtag {
  tag: string
  volume: number
  relevanceScore: number
}

export default function InstagramPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComments, setShowComments] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchInstagramData = async (refresh: boolean = false) => {
    try {
      setIsLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const url = refresh 
        ? 'http://localhost:3001/campaigns/instagram-posts?refresh=true'
        : 'http://localhost:3001/campaigns/instagram-posts'

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch Instagram posts')
      }

      const data = await response.json()
      setPosts(data.posts || [])
      setHashtags(data.hashtags || [])
    } catch (error) {
      console.error('Error fetching Instagram posts:', error)
      setError(error instanceof Error ? error.message : 'Failed to load Instagram posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInstagramData()
  }, [router])

  const handlePostClick = (post: InstagramPost, e?: React.MouseEvent) => {
    // Prevent click when clicking on interactive elements
    if (e?.target instanceof HTMLElement) {
      const target = e.target.closest('button, a, [role="button"], input, textarea')
      if (target) return
    }

    // Get permalink from multiple possible sources
    const metrics = post.metrics as any;
    let permalink = post.permalink || metrics?.permalink;
    
    // If no permalink, construct from platformPostId
    if (!permalink && post.platformPostId) {
      permalink = `https://www.instagram.com/p/${post.platformPostId}/`;
    }
    
    // Open Instagram post in new tab
    if (permalink) {
      window.open(permalink, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('No permalink available for post:', post.id);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      post.content.toLowerCase().includes(query) ||
      post.hashtags?.toLowerCase().includes(query) ||
      post.campaign?.name.toLowerCase().includes(query)
    )
  })

  const filteredHashtags = hashtags.filter(hashtag => {
    if (!searchQuery) return true
    return hashtag.tag.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light-purple mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading Instagram posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg mr-3 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              Instagram Posts
            </h1>
            <p className="text-text-secondary">View and manage Instagram posts, comments, and hashtags</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchInstagramData(true)}
            disabled={isLoading}
            className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Live
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Trending Hashtags */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-primary-light-purple mr-2" />
                <h2 className="text-lg font-bold text-white">Trending Hashtags</h2>
              </div>
              
              {/* Search Hashtags */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light-purple"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredHashtags.length === 0 ? (
                  <p className="text-text-secondary text-sm">No hashtags found</p>
                ) : (
                  filteredHashtags.map((hashtag, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => setSearchQuery(hashtag.tag.replace('#', ''))}
                    >
                      <span className="text-primary-light-purple font-medium text-sm">{hashtag.tag}</span>
                      {hashtag.volume > 0 && (
                        <span className="text-xs text-text-secondary">{hashtag.volume}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Feed - Instagram Posts */}
          <div className="lg:col-span-2">
            {filteredPosts.length === 0 ? (
              <div className="card text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Instagram Posts Found</h3>
                <p className="text-text-secondary mb-6">
                  {searchQuery 
                    ? 'No posts match your search query.' 
                    : 'Create a chatbot with a campaign to fetch Instagram posts automatically.'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => router.push('/chatbot')}
                    className="bg-gradient-to-r from-primary-light-purple to-primary-pink text-white border-0"
                  >
                    Create Chatbot with Campaign
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="card hover:bg-white/5 transition-colors"
                  >
                    {/* Post Header - Instagram style */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white text-base">Instagram Post</h3>
                            {post.campaign && (
                              <span className="text-xs bg-primary-light-purple/20 text-primary-light-purple px-2 py-0.5 rounded">
                                {post.campaign.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary">
                            {post.postedAt ? formatDate(post.postedAt) : formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      {(post.permalink || post.platformPostId || (post.metrics as any)?.permalink) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePostClick(post, e)
                          }}
                          className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors p-2 rounded-lg hover:bg-pink-500/10 border border-pink-500/20"
                          title="View this post on Instagram"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-xs font-medium">Open</span>
                        </button>
                      )}
                    </div>

                    {/* Post Media */}
                    {post.mediaUrls && (
                      <div 
                        className="mb-3 cursor-pointer rounded-lg overflow-hidden"
                        onClick={(e) => handlePostClick(post, e)}
                      >
                        <img 
                          src={post.mediaUrls} 
                          alt={post.content?.substring(0, 50) || 'Instagram post'}
                          className="w-full h-auto max-h-96 object-cover hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            // Hide image if it fails to load
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Post Content - Clickable to open on Instagram */}
                    <div 
                      className="mb-3 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-colors"
                      onClick={(e) => handlePostClick(post, e)}
                    >
                      <p className="text-white whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.trim() && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.hashtags.split(',').filter(tag => tag.trim()).map((tag, idx) => (
                          <span
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSearchQuery(tag.trim().replace('#', ''))
                            }}
                            className="inline-flex items-center text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded hover:bg-pink-500/30 transition-colors cursor-pointer"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Engagement Metrics - Instagram style */}
                    {post.metrics && (
                      <div className="flex items-center justify-between text-sm text-text-secondary mb-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="h-5 w-5 text-red-400" fill="currentColor" />
                            <span>{post.metrics.likes || 0}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowComments(showComments === post.id ? null : post.id)
                            }}
                            className="flex items-center gap-1 hover:text-pink-400 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.metrics.comments || post.commentCount || 0}</span>
                          </button>
                        </div>
                        {(post.permalink || post.platformPostId || (post.metrics as any)?.permalink) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePostClick(post, e)
                            }}
                            className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View on Instagram
                          </button>
                        )}
                      </div>
                    )}

                    {/* Comments Section - Instagram style */}
                    {showComments === post.id && post.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-white">
                            {post.commentCount > post.comments.length 
                              ? `Viewing ${post.comments.length} of ${post.commentCount} comments`
                              : `All ${post.comments.length} comments`}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowComments(null)
                            }}
                            className="text-xs text-text-secondary hover:text-white"
                          >
                            Hide
                          </button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3 group hover:bg-white/5 rounded-lg p-2 transition-colors">
                              {comment.authorAvatar ? (
                                <img
                                  src={comment.authorAvatar}
                                  alt={comment.authorName}
                                  className="w-8 h-8 rounded-full flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-semibold">
                                    {comment.authorName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-semibold text-white text-sm">{comment.authorName}</span>
                                  {comment.sentiment && (
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      comment.sentiment === 'POSITIVE' 
                                        ? 'bg-green-500/20 text-green-300'
                                        : comment.sentiment === 'NEGATIVE'
                                        ? 'bg-red-500/20 text-red-300'
                                        : 'bg-gray-500/20 text-gray-300'
                                    }`}>
                                      {comment.sentiment}
                                    </span>
                                  )}
                                  <span className="text-xs text-text-muted">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed break-words">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show Comments Button if collapsed */}
                    {showComments !== post.id && post.comments.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowComments(post.id)
                        }}
                        className="text-sm text-pink-400 hover:text-pink-300 mt-2 font-medium"
                      >
                        View {post.commentCount > 0 ? `all ${post.commentCount}` : post.comments.length} {post.commentCount === 1 ? 'comment' : 'comments'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Stats */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-lg font-bold text-white mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary text-sm">Total Posts</span>
                    <span className="text-white font-semibold">{posts.length}</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary text-sm">Total Comments</span>
                    <span className="text-white font-semibold">
                      {posts.reduce((sum, post) => sum + (post.commentCount || 0), 0)}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary text-sm">Total Hashtags</span>
                    <span className="text-white font-semibold">{hashtags.length}</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-secondary text-sm">Total Engagement</span>
                    <span className="text-white font-semibold">
                      {posts.reduce((sum, post) => 
                        sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0), 
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

