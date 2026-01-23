'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { aiAPI } from '@/lib/api'
import { ArrowLeft, Sparkles, Zap, FileText, Hash, MessageSquare, Image as ImageIcon, Video, Copy, Download, CheckCircle, AlertCircle, X } from 'lucide-react'

interface GeneratedContent {
  id?: string
  type: string
  title?: string
  content: string
  images?: Array<{ url?: string; b64_json?: string }>
  metadata?: any
  createdAt?: string
  tokensUsed?: number
  cost?: number
}

export default function AIContentPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [recentGenerations, setRecentGenerations] = useState<GeneratedContent[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)

  const contentTypes = [
    {
      id: 'blog',
      name: 'Blog Post',
      description: 'Create engaging blog articles',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'social',
      name: 'Social Media',
      description: 'Generate social media posts',
      icon: MessageSquare,
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'seo',
      name: 'SEO Content',
      description: 'Optimize content for search',
      icon: Hash,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'ad',
      name: 'Ad Copy',
      description: 'Create compelling advertisements',
      icon: Zap,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'image',
      name: 'Image Generation',
      description: 'Generate AI images',
      icon: ImageIcon,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'video',
      name: 'Video Script',
      description: 'Create video content scripts',
      icon: Video,
      color: 'from-red-500 to-red-600'
    }
  ]

  // Load recent generations on mount
  useEffect(() => {
    loadRecentGenerations()
  }, [])

  const loadRecentGenerations = async () => {
    setIsLoadingRecent(true)
    try {
      const response = await aiAPI.getUserContent({ limit: 10, offset: 0 })
      let content: GeneratedContent[] = []
      
      // Handle different response formats
      // Backend returns: { success: true, data: { content: [...], pagination: {...} } }
      if (response.data) {
        if (response.data.data?.content && Array.isArray(response.data.data.content)) {
          // Backend format: response.data.data.content
          content = response.data.data.content
        } else if (Array.isArray(response.data.data)) {
          // Direct array in data.data
          content = response.data.data
        } else if (Array.isArray(response.data)) {
          // Direct array in data
          content = response.data
        } else if (response.data.content && Array.isArray(response.data.content)) {
          // Array in data.content
          content = response.data.content
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Array in data.results
          content = response.data.results
        }
      }
      
      // Ensure content is an array and limit to 10 items
      if (Array.isArray(content)) {
        setRecentGenerations(content.slice(0, 10))
      } else {
        setRecentGenerations([])
      }
    } catch (err) {
      console.error('Failed to load recent generations:', err)
      // Don't show error for this, just keep empty list
      setRecentGenerations([])
    } finally {
      setIsLoadingRecent(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedType || !prompt.trim()) return
    
    setIsGenerating(true)
    setError(null)
    setGeneratedContent(null)

    try {
      let response: any

      switch (selectedType) {
        case 'blog':
          response = await aiAPI.generateBlogPost({
            topic: prompt,
            options: {}
          })
          break

        case 'social':
          response = await aiAPI.generateCaptions({
            platform: 'general',
            content: prompt,
            options: {}
          })
          break

        case 'seo':
          // Extract keywords from prompt (simple approach)
          // If comma-separated, split into array; otherwise use prompt as single keyword
          let keywords: string[] = []
          if (prompt.includes(',')) {
            keywords = prompt.split(',').map(k => k.trim()).filter(k => k.length > 0)
          } else {
            const trimmedPrompt = prompt.trim()
            keywords = trimmedPrompt.length > 0 ? [trimmedPrompt] : []
          }
          
          // Ensure we have at least one keyword
          if (keywords.length === 0) {
            keywords = [prompt.trim() || 'SEO content']
          }
          
          response = await aiAPI.generateSEO({
            keywords,
            contentType: 'article'
          })
          break

        case 'ad':
          // For ad copy, prompt should describe product and audience
          const parts = prompt.split(' for ').map(p => p.trim())
          const product = parts[0] || prompt
          const targetAudience = parts[1] || 'general audience'
          response = await aiAPI.generateAdCopy({
            product,
            targetAudience,
            options: {}
          })
          break

        case 'image':
          response = await aiAPI.generateImages({
            prompt,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid',
            n: 1
          })
          break

        case 'video':
          // Default to 5-minute video script
          response = await aiAPI.generateVideoScript({
            topic: prompt,
            duration: 5,
            options: {}
          })
          break

        default:
          // Fallback to general content generation
          response = await aiAPI.generateContent({
            type: selectedType,
            prompt,
            options: {}
          })
      }

      // Handle different response formats
      let content: GeneratedContent
      
      if (selectedType === 'image') {
        // Image generation response format
        content = {
          type: selectedType,
          content: prompt,
          images: response.data?.images || [],
          metadata: response.data?.metadata,
          tokensUsed: response.data?.tokensUsed,
          cost: response.data?.cost
        }
      } else {
        // Text content response format
        const data = response.data?.data || response.data
        content = {
          id: data?.id,
          type: selectedType,
          title: data?.title || prompt.substring(0, 50),
          content: data?.content || data?.text || data || 'Content generated successfully',
          metadata: data?.metadata || response.data?.metadata,
          createdAt: data?.createdAt,
          tokensUsed: data?.tokensUsed || response.data?.usage?.tokensUsed,
          cost: data?.cost || response.data?.usage?.cost
        }
      }

      setGeneratedContent(content)
      
      // Reload recent generations to include the new one
      await loadRecentGenerations()
      
      // Reset prompt after successful generation
      setPrompt('')
    } catch (err: any) {
      console.error('Generation error:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to generate content. Please try again.'
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="bg-gradient-header shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="mr-4 text-white border-white hover:bg-white hover:text-primary-dark"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-8 w-8 bg-primary-light-purple rounded flex items-center justify-center">
                <Sparkles className="text-white h-5 w-5" />
              </div>
              <span className="ml-2 text-xl font-bold text-white">AI Content Generator</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create AI Content</h1>
          <p className="text-text-secondary">Choose a content type and describe what you want to create</p>
        </div>

        {/* Content Type Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Choose Content Type</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`group cursor-pointer p-6 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedType === type.id
                      ? 'border-primary-light-purple bg-primary-light-purple/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${type.color} mr-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{type.name}</h3>
                  </div>
                  <p className="text-text-secondary text-sm">{type.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-md bg-red-500/20 border border-red-400/30 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-red-200">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Prompt Input */}
        {selectedType && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Describe Your Content</h2>
            <div className="card">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  selectedType === 'ad'
                    ? 'e.g., "New smartphone for tech enthusiasts"'
                    : selectedType === 'seo'
                    ? 'e.g., "artificial intelligence, machine learning, AI trends"'
                    : selectedType === 'image'
                    ? 'e.g., "A futuristic cityscape at sunset with flying cars"'
                    : `Describe the ${contentTypes.find(t => t.id === selectedType)?.name.toLowerCase()} you want to create...`
                }
                className="w-full h-32 p-4 bg-transparent border-none text-white placeholder-text-secondary resize-none focus:outline-none"
                disabled={isGenerating}
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        {selectedType && prompt.trim() && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-pink hover:to-primary-light-purple transform transition-all duration-300 hover:scale-105 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-3" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        )}

        {/* Generated Content Display */}
        {generatedContent && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Generated Content</h2>
              <div className="flex items-center gap-2">
                {generatedContent.content && !generatedContent.images && (
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(generatedContent.content)}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setGeneratedContent(null)}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="card">
              {generatedContent.images && generatedContent.images.length > 0 ? (
                // Image generation display
                <div className="space-y-4">
                  {generatedContent.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={`Generated ${idx + 1}`}
                          className="w-full rounded-lg shadow-lg"
                        />
                      ) : img.b64_json ? (
                        <img
                          src={`data:image/png;base64,${img.b64_json}`}
                          alt={`Generated ${idx + 1}`}
                          className="w-full rounded-lg shadow-lg"
                        />
                      ) : null}
                      {img.revised_prompt && (
                        <p className="text-sm text-text-secondary mt-2 italic">
                          Revised prompt: {img.revised_prompt}
                        </p>
                      )}
                      {img.url && (
                        <a
                          href={img.url}
                          download
                          className="inline-flex items-center mt-2 text-primary-light-purple hover:text-primary-pink"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Image
                        </a>
                      )}
                    </div>
                  ))}
                  {generatedContent.metadata && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-text-secondary">
                        Model: {generatedContent.metadata.model || 'dall-e-3'} | 
                        Size: {generatedContent.metadata.size || '1024x1024'} | 
                        Quality: {generatedContent.metadata.quality || 'standard'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Text content display
                <div className="space-y-4">
                  {generatedContent.title && (
                    <h3 className="text-2xl font-bold text-white">{generatedContent.title}</h3>
                  )}
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-white text-sm leading-relaxed font-sans bg-white/5 p-4 rounded-lg border border-white/10">
                      {generatedContent.content}
                    </pre>
                  </div>
                  {(generatedContent.tokensUsed || generatedContent.cost) && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-sm text-text-secondary">
                      {generatedContent.tokensUsed && (
                        <span>Tokens: {generatedContent.tokensUsed.toLocaleString()}</span>
                      )}
                      {generatedContent.cost && (
                        <span>Cost: ${generatedContent.cost.toFixed(4)}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Generations */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Generations</h2>
            <Button
              variant="outline"
              onClick={loadRecentGenerations}
              disabled={isLoadingRecent}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Refresh
            </Button>
          </div>
          
          {isLoadingRecent ? (
            <div className="card">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light-purple mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading recent generations...</p>
              </div>
            </div>
          ) : recentGenerations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {recentGenerations.map((item, idx) => (
                <div key={idx} className="card hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setGeneratedContent(item)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded bg-primary-light-purple/20 text-primary-light-purple">
                          {contentTypes.find(t => t.id === item.type)?.name || item.type}
                        </span>
                        {item.createdAt && (
                          <span className="text-xs text-text-secondary">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {item.title && (
                        <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                      )}
                      <p className="text-text-secondary text-sm line-clamp-2">
                        {typeof item.content === 'string' ? item.content.substring(0, 150) : 'Generated content'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-primary-light-purple mx-auto mb-4 opacity-50" />
                <p className="text-text-secondary">No content generated yet</p>
                <p className="text-text-secondary text-sm mt-2">Your AI-generated content will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
