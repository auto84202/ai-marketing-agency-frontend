'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { 
  MessageSquare, 
  RefreshCw, 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  ThumbsUp,
  Tag,
  TrendingUp,
  Filter,
  Search,
  Calendar
} from 'lucide-react'

interface FacebookPost {
  id: string
  content: string
  hashtags: string
  platform: string
  metrics?: {
    likes?: number
    comments?: number
    shares?: number
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

export default function FacebookPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPost, setSelectedPost] = useState<FacebookPost | null>(null)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchFacebookData = async (refresh: boolean = false) => {
    try {
      setIsLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const url = refresh 
        ? 'http://localhost:3001/campaigns/facebook-posts?refresh=true'
        : 'http://localhost:3001/campaigns/facebook-posts'

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch Facebook posts')
      }

      const data = await response.json()
      setPosts(data.posts || [])
      setHashtags(data.hashtags || [])
    } catch (error) {
      console.error('Error fetching Facebook posts:', error)
      setError(error instanceof Error ? error.message : 'Failed to load Facebook posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFacebookData()
  }, [router])

  const handlePostClick = (post: FacebookPost, e?: React.MouseEvent) => {
    // Prevent click when clicking on interactive elements (comments, hashtags)
    if (e?.target instanceof HTMLElement) {
      const target = e.target.closest('button, a, [role="button"], input, textarea')
      if (target) return
    }

    // Get permalink from multiple possible sources
    const metrics = post.metrics as any;
    let permalink = post.permalink || metrics?.permalink;
    
    // If no permalink, construct from platformPostId
    if (!permalink && post.platformPostId) {
      // Facebook post IDs are usually in format: {page_id}_{post_id}
      if (post.platformPostId.includes('_')) {
        const [pageId, postId] = post.platformPostId.split('_');
        permalink = `https://www.facebook.com/${pageId}/posts/${postId}`;
      } else {
        permalink = `https://www.facebook.com/${post.platformPostId}`;
      }
    }
    
    // Open Facebook post in new tab
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
          <p className="text-text-secondary">Loading Facebook posts...</p>
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
              <MessageSquare className="h-8 w-8 text-primary-light-purple mr-3" />
              Facebook Posts
            </h1>
            <p className="text-text-secondary">View and manage Facebook posts, comments, and hashtags</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchFacebookData(true)}
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

          {/* Main Feed - Facebook Posts */}
          <div className="lg:col-span-2">
            {filteredPosts.length === 0 ? (
              <div className="card text-center py-16">
                <MessageSquare className="h-16 w-16 text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Facebook Posts Found</h3>
                <p className="text-text-secondary mb-6">
                  {searchQuery 
                    ? 'No posts match your search query.' 
                    : 'Create a chatbot with a campaign to fetch Facebook posts automatically.'}
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
                    {/* Post Header - Facebook style */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white text-base">Facebook Post</h3>
                            {post.campaign && (
                              <span className="text-xs bg-primary-light-purple/20 text-primary-light-purple px-2 py-0.5 rounded">
                                {post.campaign.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-text-secondary">
                              {post.postedAt ? formatDate(post.postedAt) : formatDate(post.createdAt)}
                            </p>
                            <span className="text-xs text-text-secondary">•</span>
                            <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
                              <path d="M12 6c-.553 0-1 .447-1 1v5c0 .553.447 1 1 1s1-.447 1-1V7c0-.553-.447-1-1-1z"/>
                              <circle cx="12" cy="15" r="1"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      {(post.permalink || post.platformPostId || (post.metrics as any)?.permalink) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePostClick(post, e)
                          }}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-500/10 border border-blue-500/20"
                          title="View this post on Facebook"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-xs font-medium">Open</span>
                        </button>
                      )}
                    </div>

                    {/* Post Content - Facebook style with clickable area */}
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
                            className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors cursor-pointer"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Engagement Metrics - Facebook style */}
                    {post.metrics && (
                      <div className="flex items-center justify-between text-sm text-text-secondary mb-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-4">
                          {(post.metrics.likes || 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <ThumbsUp className="h-3 w-3 text-white" />
                              </div>
                              <span>{post.metrics.likes || 0}</span>
                            </div>
                          )}
                          {(post.metrics.comments || post.commentCount || 0) > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowComments(showComments === post.id ? null : post.id)
                              }}
                              className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              <span>{post.metrics.comments || post.commentCount || 0} comments</span>
                            </button>
                          )}
                          {(post.metrics.shares || 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <span>{post.metrics.shares || 0} shares</span>
                            </div>
                          )}
                        </div>
                        {(post.permalink || post.platformPostId || (post.metrics as any)?.permalink) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePostClick(post, e)
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View on Facebook
                          </button>
                        )}
                      </div>
                    )}

                    {/* Comments Section - Facebook style */}
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
                                    // Fallback to initials if image fails to load
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : null}
                              {!comment.authorAvatar && (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                        className="text-sm text-blue-400 hover:text-blue-300 mt-2 font-medium"
                      >
                        View {post.commentCount > 0 ? `all ${post.commentCount}` : post.comments.length} {post.commentCount === 1 ? 'comment' : 'comments'}
                      </button>
                    )}

                    {/* Show More Comments Link */}
                    {post.commentCount > post.comments.length && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowComments(showComments === post.id ? null : post.id)
                        }}
                        className="text-sm text-primary-light-purple hover:text-primary-pink mt-2"
                      >
                        View all {post.commentCount} comments
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
                        sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 
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

