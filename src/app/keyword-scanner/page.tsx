'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Search, Loader2, X, Bot, MessageSquare, ChevronDown, ChevronUp, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

interface KeywordResult {
  platform: 'facebook' | 'instagram' | 'x'
  content: string
  author: string
  location?: string
  timestamp: string
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  url?: string
}

interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function KeywordScannerPage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<KeywordResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    facebook: true,
    instagram: true,
    x: true
  })
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can analyze keyword trends across social media platforms, provide insights about engagement patterns, and help you understand where your keywords appear most frequently. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set())

  const togglePlatform = (platform: keyof typeof selectedPlatforms) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }

  const handleScan = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword to scan')
      return
    }

    setIsScanning(true)
    setResults([])
    setError(null)

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in.')
        setIsScanning(false)
        return
      }

      const platforms = Object.entries(selectedPlatforms)
        .filter(([_, selected]) => selected)
        .map(([platform]) => platform)

      if (platforms.length === 0) {
        setError('Please select at least one platform to scan')
        setIsScanning(false)
        return
      }

      console.log('Scanning keyword:', keyword, 'on platforms:', platforms)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/keyword-scanner/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          platforms
        })
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Scan results:', data)
        
        if (data.results && data.results.length > 0) {
          setResults(data.results)
        } else {
          // Show demo data if no real results found
          const demoResults: KeywordResult[] = [
            {
              platform: 'facebook',
              content: `Great insights about "${keyword}"! This keyword is trending in our industry. Check out our latest campaign focusing on this topic. #${keyword.replace(/\s+/g, '')}`,
              author: 'Demo Campaign',
              location: 'New York, USA',
              timestamp: new Date().toISOString(),
              engagement: {
                likes: 145,
                comments: 23,
                shares: 12
              },
              url: '#'
            },
            {
              platform: 'instagram',
              content: `📱 "${keyword}" is making waves! Our team has been working on innovative solutions. Stay tuned for updates! #innovation #${keyword.replace(/\s+/g, '')}`,
              author: 'Demo Campaign',
              location: 'Los Angeles, USA',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              engagement: {
                likes: 289,
                comments: 45,
                shares: 28
              },
              url: '#'
            },
            {
              platform: 'x',
              content: `Just launched our new initiative around "${keyword}". Excited to see where this takes us! Join the conversation 🚀`,
              author: 'Demo Campaign',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              engagement: {
                likes: 67,
                comments: 12,
                shares: 8
              },
              url: '#'
            }
          ]
          setResults(demoResults)
          setError('Showing demo results. Create campaigns and post content to see real results.')
        }
      } else {
        const errorData = await response.json().catch(() => null)
        setError(errorData?.message || `Failed to scan: ${response.status} ${response.statusText}`)
        console.error('Scan failed:', errorData)
      }
    } catch (error) {
      console.error('Error scanning:', error)
      setError(`Network error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`)
    } finally {
      setIsScanning(false)
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return

    const userMessage: AIMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/keyword-scanner/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            keyword,
            results: results.slice(0, 10),
            platforms: selectedPlatforms
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error chatting:', error)
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const toggleResultExpanded = (index: number) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-5 w-5" />
      case 'instagram':
        return <Instagram className="h-5 w-5" />
      case 'x':
        return <Twitter className="h-5 w-5" />
      default:
        return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'text-blue-500'
      case 'instagram':
        return 'text-pink-500'
      case 'x':
        return 'text-sky-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="h-8 w-8 text-primary-light-purple" />
            Keyword Scanner
          </h1>
          <p className="text-text-secondary">
            Scan social media platforms to discover where and how your keywords are being used
          </p>
        </div>

        {/* Search Section */}
        <div className="card mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Enter Keyword or Phrase
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  placeholder="e.g., sustainable fashion, AI technology..."
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-primary-light-purple focus:outline-none focus:ring-2 focus:ring-primary-light-purple"
                />
                <Button
                  onClick={handleScan}
                  disabled={isScanning || !keyword.trim()}
                  className="bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-pink hover:to-primary-light-purple disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Scan
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Select Platforms to Scan
              </label>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => togglePlatform('facebook')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedPlatforms.facebook
                      ? 'border-blue-500 bg-blue-500/20 text-blue-500'
                      : 'border-white/20 bg-white/5 text-white/50 hover:border-white/40'
                  }`}
                >
                  <Facebook className="h-5 w-5" />
                  <span className="font-semibold">Facebook</span>
                </button>

                <button
                  onClick={() => togglePlatform('instagram')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedPlatforms.instagram
                      ? 'border-pink-500 bg-pink-500/20 text-pink-500'
                      : 'border-white/20 bg-white/5 text-white/50 hover:border-white/40'
                  }`}
                >
                  <Instagram className="h-5 w-5" />
                  <span className="font-semibold">Instagram</span>
                </button>

                <button
                  onClick={() => togglePlatform('x')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedPlatforms.x
                      ? 'border-sky-500 bg-sky-500/20 text-sky-500'
                      : 'border-white/20 bg-white/5 text-white/50 hover:border-white/40'
                  }`}
                >
                  <Twitter className="h-5 w-5" />
                  <span className="font-semibold">X (Twitter)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scanning Status */}
        {isScanning && (
          <div className="card mb-8 text-center py-12">
            <Loader2 className="h-16 w-16 text-primary-light-purple mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">Scanning Platforms...</h3>
            <p className="text-text-secondary">
              Searching for "{keyword}" across selected platforms
            </p>
          </div>
        )}

        {/* Results Section */}
        {!isScanning && results.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Scan Results ({results.length} found)
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowChatbot(!showChatbot)}
                className="text-white border-white/30 hover:bg-white/10"
              >
                <Bot className="h-5 w-5 mr-2" />
                {showChatbot ? 'Hide' : 'Show'} AI Assistant
              </Button>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="border border-white/20 rounded-lg bg-white/5 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${getPlatformColor(result.platform)}`}>
                          {getPlatformIcon(result.platform)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{result.author}</p>
                          <p className="text-xs text-text-secondary">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleResultExpanded(index)}
                        className="text-white/70 hover:text-white"
                      >
                        {expandedResults.has(index) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-white mb-3 line-clamp-3">
                      {result.content}
                    </p>

                    {expandedResults.has(index) && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        {result.location && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <MapPin className="h-4 w-4" />
                            <span>{result.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-6 text-sm text-text-secondary">
                          <span>❤️ {result.engagement.likes} likes</span>
                          <span>💬 {result.engagement.comments} comments</span>
                          <span>🔁 {result.engagement.shares} shares</span>
                        </div>

                        {result.url && (
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary-light-purple hover:text-primary-pink text-sm"
                          >
                            View on {result.platform}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isScanning && results.length === 0 && keyword && !error && (
          <div className="card text-center py-12">
            <Search className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready to scan</h3>
            <p className="text-text-secondary">
              Click the "Scan" button to start searching
            </p>
          </div>
        )}

        {/* Getting Started */}
        {!isScanning && results.length === 0 && !keyword && (
          <div className="card text-center py-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Facebook className="h-12 w-12 text-blue-500" />
              <Instagram className="h-12 w-12 text-pink-500" />
              <Twitter className="h-12 w-12 text-sky-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start Your Keyword Scan</h3>
            <p className="text-text-secondary mb-4">
              Enter a keyword above and select platforms to scan
            </p>
            <div className="text-sm text-white/70">
              <p>✓ Scan Facebook, Instagram, and X (Twitter)</p>
              <p>✓ Find engagement metrics and locations</p>
              <p>✓ Get AI-powered insights</p>
            </div>
          </div>
        )}
      </main>

      {/* AI Chatbot Sidebar */}
      {showChatbot && (
        <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-secondary-dark border-l border-white/20 shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary-light-purple" />
              <h3 className="text-lg font-bold text-white">AI Assistant</h3>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="text-white/70 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-light-purple flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-light-purple text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isChatLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-light-purple flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Ask about keyword trends..."
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:border-primary-light-purple focus:outline-none focus:ring-2 focus:ring-primary-light-purple text-sm"
              />
              <Button
                onClick={handleChatSubmit}
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-primary-light-purple hover:bg-primary-pink"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

