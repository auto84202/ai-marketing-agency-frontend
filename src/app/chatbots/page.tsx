'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { MessageSquare, Plus, Settings, Play, Pause, Trash2, Edit, Bot, Calendar, Activity, MessageCircle } from 'lucide-react'

interface Chatbot {
  id: string
  name: string
  description?: string
  status: 'ACTIVE' | 'INACTIVE' | 'TRAINING'
  platform?: string
  campaignId?: string
  campaign?: {
    id: string
    name: string
  }
  createdAt: string
  lastUsed?: string
}

export default function ChatbotsPage() {
  const router = useRouter()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Fetch chatbots from backend
  const fetchChatbots = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/chatbot`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch chatbots')
      }

      const data = await response.json()
      const chatbotsData = data.data || data
      const bots = Array.isArray(chatbotsData) ? chatbotsData : []
      setChatbots(bots)
      
      // Auto-select first chatbot if available
      if (bots.length > 0 && !selectedChatbot) {
        setSelectedChatbot(bots[0])
      }
    } catch (error) {
      console.error('Error fetching chatbots:', error)
      setError(error instanceof Error ? error.message : 'Failed to load chatbots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChatbots()
  }, [])

  const handleCreateChatbot = () => {
    router.push('/chatbot')
  }

  const handleSelectChatbot = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot)
  }

  const handleEditChatbot = (chatbotId: string) => {
    router.push(`/chatbot`)
  }

  const handleChatWithBot = (chatbotId: string) => {
    router.push(`/chat/${chatbotId}`)
  }

  const handleDeleteChatbot = async (chatbotId: string) => {
    if (!confirm('Are you sure you want to delete this chatbot?')) return
    
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/chatbot/${chatbotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        const updated = chatbots.filter(bot => bot.id !== chatbotId)
        setChatbots(updated)
        if (selectedChatbot?.id === chatbotId) {
          setSelectedChatbot(updated.length > 0 ? updated[0] : null)
        }
      } else {
        // Get error message from response
        let errorMessage = 'Failed to delete chatbot'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error deleting chatbot:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete chatbot')
    }
  }

  const handleActivateChatbot = async (chatbotId: string) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/chatbot/${chatbotId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchChatbots()
      } else {
        throw new Error('Failed to activate chatbot')
      }
    } catch (error) {
      console.error('Error activating chatbot:', error)
      setError(error instanceof Error ? error.message : 'Failed to activate chatbot')
    }
  }

  const handleDeactivateChatbot = async (chatbotId: string) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) return

      // Update chatbot settings to INACTIVE status
      const response = await fetch(`http://localhost:3001/chatbot/${chatbotId}/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'INACTIVE' })
      })

      if (response.ok) {
        await fetchChatbots()
      } else {
        throw new Error('Failed to deactivate chatbot')
      }
    } catch (error) {
      console.error('Error deactivating chatbot:', error)
      setError(error instanceof Error ? error.message : 'Failed to deactivate chatbot')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-400 bg-green-400/20 border-green-400/30'
      case 'INACTIVE':
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
      case 'TRAINING':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-primary-light-purple mx-auto mb-4 animate-pulse" />
          <p className="text-text-secondary">Loading chatbots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <Breadcrumb items={[{ label: 'Chatbots' }]} />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Chatbots</h1>
            <p className="text-text-secondary">Create and manage intelligent chatbots</p>
          </div>
          <Button
            onClick={handleCreateChatbot}
            className="bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-pink hover:to-primary-light-purple text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Chatbot
          </Button>
        </div>
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300">{error}</p>
            <Button
              onClick={fetchChatbots}
              className="mt-2 text-red-300 border-red-300 hover:bg-red-300 hover:text-red-900"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Content Layout */}
        {chatbots.length === 0 ? (
          <div className="card text-center py-16">
            <MessageSquare className="h-20 w-20 text-primary-light-purple mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-2">No Chatbots Yet</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Create your first AI chatbot to start automating customer engagement and content generation
            </p>
            <Button
              onClick={handleCreateChatbot}
              className="bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-pink hover:to-primary-light-purple text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Chatbot
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Chatbot List */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-lg font-bold text-white mb-4">Your Chatbots</h2>
                <div className="space-y-3">
                  {chatbots.map((chatbot) => (
                    <div
                      key={chatbot.id}
                      onClick={() => handleSelectChatbot(chatbot)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedChatbot?.id === chatbot.id
                          ? 'bg-primary-light-purple/20 border-primary-light-purple border-opacity-50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center flex-1 min-w-0">
                          <Bot className="h-5 w-5 text-primary-light-purple mr-2 flex-shrink-0" />
                          <h3 className="text-sm font-semibold text-white truncate">{chatbot.name}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(chatbot.status)} ml-2 flex-shrink-0`}>
                          {chatbot.status}
                        </span>
                      </div>
                      {chatbot.description && (
                        <p className="text-xs text-text-secondary mb-2 line-clamp-1">{chatbot.description}</p>
                      )}
                      {chatbot.campaign && (
                        <p className="text-xs text-primary-light-purple truncate">Campaign: {chatbot.campaign.name}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-text-secondary">
                          {new Date(chatbot.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {chatbot.status === 'ACTIVE' && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleChatWithBot(chatbot.id)
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-primary-light-purple hover:text-primary-pink"
                              title="Chat with bot"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditChatbot(chatbot.id)
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-text-secondary hover:text-white"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Chatbot Details */}
            <div className="lg:col-span-2">
              {selectedChatbot ? (
                <div className="card">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <Bot className="h-6 w-6 text-primary-light-purple mr-2" />
                        <h2 className="text-2xl font-bold text-white">{selectedChatbot.name}</h2>
                        <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedChatbot.status)}`}>
                          {selectedChatbot.status}
                        </span>
                      </div>
                      {selectedChatbot.description && (
                        <p className="text-text-secondary">{selectedChatbot.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedChatbot.status === 'ACTIVE' && (
                        <Button
                          onClick={() => handleChatWithBot(selectedChatbot.id)}
                          className="bg-gradient-to-r from-primary-light-purple to-primary-pink hover:from-primary-pink hover:to-primary-light-purple text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat with Bot
                        </Button>
                      )}
                      {selectedChatbot.status !== 'ACTIVE' && (
                        <Button
                          onClick={() => handleActivateChatbot(selectedChatbot.id)}
                          variant="outline"
                          className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      {selectedChatbot.status === 'ACTIVE' && (
                        <Button
                          onClick={() => handleDeactivateChatbot(selectedChatbot.id)}
                          variant="outline"
                          className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Deactivate
                        </Button>
                      )}
                      <Button
                        onClick={() => handleEditChatbot(selectedChatbot.id)}
                        variant="outline"
                        className="text-white border-white/30 hover:bg-white hover:text-primary-dark"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteChatbot(selectedChatbot.id)}
                        variant="outline"
                        className="text-red-300 border-red-300 hover:bg-red-300 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Activity className="h-4 w-4 text-primary-light-purple mr-2" />
                        <span className="text-sm text-text-secondary">Platform</span>
                      </div>
                      <p className="text-white font-semibold">{selectedChatbot.platform || 'Web'}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-primary-light-purple mr-2" />
                        <span className="text-sm text-text-secondary">Created</span>
                      </div>
                      <p className="text-white font-semibold">
                        {new Date(selectedChatbot.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {selectedChatbot.lastUsed && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 text-primary-light-purple mr-2" />
                          <span className="text-sm text-text-secondary">Last Used</span>
                        </div>
                        <p className="text-white font-semibold">
                          {new Date(selectedChatbot.lastUsed).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {selectedChatbot.campaign && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Activity className="h-4 w-4 text-primary-light-purple mr-2" />
                          <span className="text-sm text-text-secondary">Campaign</span>
                        </div>
                        <p className="text-white font-semibold">{selectedChatbot.campaign.name}</p>
                      </div>
                    )}
                  </div>

                  {selectedChatbot.campaign && (
                    <div className="border-t border-white/10 pt-6">
                      <Button
                        onClick={() => router.push(`/campaigns/${selectedChatbot.campaignId}`)}
                        className="w-full bg-primary-light-purple hover:bg-primary-pink text-white"
                      >
                        View Campaign Content
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card flex flex-col items-center justify-center py-16">
                  <MessageSquare className="h-20 w-20 text-primary-light-purple mb-6 opacity-50" />
                  <h2 className="text-2xl font-bold text-white mb-2">No Chatbot Selected</h2>
                  <p className="text-text-secondary text-center mb-6 max-w-md">
                    Select a chatbot from the list to view and manage its settings
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
