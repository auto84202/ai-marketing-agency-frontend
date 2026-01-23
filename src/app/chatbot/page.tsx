'use client';

import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Settings, 
  BarChart3, 
  Calendar,
  ShoppingCart,
  HelpCircle,
  Languages,
  Bot,
  Play,
  Pause,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  Tag,
  Sparkles
} from 'lucide-react';

interface Chatbot {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  platform?: string;
  createdAt: string;
  _count: {
    conversations: number;
  };
  settings?: {
    personality?: string;
    language?: string;
    capabilities?: string[];
    faqData?: FAQItem[];
    bookingConfig?: BookingConfig;
    upsellingConfig?: UpsellingConfig;
    multilingualConfig?: MultilingualConfig;
  };
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  priority: number;
}

interface BookingConfig {
  enabled: boolean;
  services: Array<{
    id?: string;
    name: string;
    duration: number;
    price?: number;
  }>;
  timeSlots: Array<{
    day: string;
    start: string;
    end: string;
  }>;
  bookingUrl: string;
  confirmationMessage: string;
}

interface UpsellingConfig {
  enabled: boolean;
  products: Array<{
    id?: string;
    name: string;
    description: string;
    price: number;
    url?: string;
  }>;
  triggers: string[];
  maxSuggestions: number;
}

interface MultilingualConfig {
  enabled: boolean;
  defaultLanguage: string;
  supportedLanguages: string[]; // Array of language codes like 'en', 'es', 'fr'
  autoDetect: boolean;
}

export default function ChatbotPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'faq' | 'booking' | 'upselling' | 'multilingual' | 'analytics'>('overview');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [newChatbot, setNewChatbot] = useState({
    name: '',
    description: '',
    personality: 'friendly',
    language: 'en',
    capabilities: ['general_chat', 'faq'],
    clientId: '',
    campaignId: '',
  });
  
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string; status: string }>>([]);

  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: '',
    keywords: '',
    priority: 5,
  });

  const [bookingConfig, setBookingConfig] = useState({
    enabled: false,
    services: [],
    timeSlots: [],
    bookingUrl: '',
    confirmationMessage: 'Your appointment has been booked successfully!',
  });

  const [upsellingConfig, setUpsellingConfig] = useState({
    enabled: false,
    products: [],
    triggers: ['interested', 'looking for', 'need help with'],
    maxSuggestions: 3,
  });

  const [multilingualConfig, setMultilingualConfig] = useState({
    enabled: false,
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    autoDetect: true,
  });

  // Base URL for backend API
  const BASE_URL = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:3001';

  // Helper to call backend and normalize errors + response parsing
  async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${BASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const res = await fetch(url, { ...options, headers });

    // If response is not OK, try to read JSON or text and throw a helpful error
    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      let bodyText = '';
      try {
        if (ct.includes('application/json')) {
          const json = await res.json();
          bodyText = json?.message || JSON.stringify(json);
        } else {
          bodyText = await res.text();
        }
      } catch {
        bodyText = `HTTP ${res.status} ${res.statusText}`;
      }
      const err = new Error(bodyText || `Request failed with status ${res.status}`) as Error & { status: number };
      err.status = res.status;
      throw err;
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return { text: await res.text() };
  }

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await apiFetch('/chatbot');
        setChatbots(result.data || []);
        
        // Fetch campaigns for campaign ID selection
        try {
          const campaignsResult = await apiFetch('/campaigns');
          setCampaigns(Array.isArray(campaignsResult) ? campaignsResult : []);
        } catch (campaignErr) {
          console.warn('Failed to fetch campaigns:', campaignErr);
        }
      } catch (err) {
        console.error('Error fetching chatbots:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chatbots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createChatbot = async () => {
    try {
      setError('');
      setSuccess('');
      
      const data = await apiFetch('/chatbot/create', {
        method: 'POST',
        body: JSON.stringify(newChatbot),
      });

      const saved = data.data || data;
      setChatbots([saved, ...chatbots]);
      setSelectedChatbot(saved);
      setIsCreating(false);
      setSuccess(`Chatbot "${saved.name}" created successfully!${saved.campaignId ? ' Images will be generated for the linked campaign.' : ''}`);
      setNewChatbot({
        name: '',
        description: '',
        personality: 'friendly',
        language: 'en',
        capabilities: ['general_chat', 'faq'],
        clientId: '',
        campaignId: '',
      });
    } catch (err) {
      console.error('Error creating chatbot:', err);
      setError(err instanceof Error ? err.message : 'Failed to create chatbot. Please try again.');
    }
  };

  const deployChatbot = async () => {
    if (!selectedChatbot) return;

    try {
      setError('');
      await apiFetch(`/chatbot/${selectedChatbot.id}/deploy`, {
        method: 'POST',
        body: JSON.stringify({ platform: selectedChatbot.platform || 'website' }),
      });
      setSuccess(`Chatbot "${selectedChatbot.name}" deployed successfully!`);
      
      // Update chatbot status to ACTIVE
      const updatedChatbots = chatbots.map(bot => 
        bot.id === selectedChatbot.id ? { ...bot, status: 'ACTIVE' as const } : bot
      );
      setChatbots(updatedChatbots);
      setSelectedChatbot({ ...selectedChatbot, status: 'ACTIVE' });
    } catch (err) {
      console.error('Error deploying chatbot:', err);
      setError(err instanceof Error ? err.message : 'Failed to deploy chatbot');
    }
  };

  const deleteChatbot = async () => {
    if (!selectedChatbot) return;

    if (!confirm(`Are you sure you want to delete "${selectedChatbot.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      await apiFetch(`/chatbot/${selectedChatbot.id}`, { method: 'DELETE' });

      setSuccess(`Chatbot "${selectedChatbot.name}" deleted successfully!`);
      
      // Remove from list and clear selection
      setChatbots(chatbots.filter(bot => bot.id !== selectedChatbot.id));
      setSelectedChatbot(null);
    } catch (err) {
      console.error('Error deleting chatbot:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete chatbot');
    }
  };

  const toggleChatbotStatus = async () => {
    if (!selectedChatbot) return;

    const newStatus = selectedChatbot.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      setError('');
      await apiFetch(`/chatbot/${selectedChatbot.id}/settings`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });

      setSuccess(`Chatbot ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully!`);
      
      // Update chatbot status (cast to union to satisfy TS)
      const updatedChatbots = chatbots.map(bot => 
        bot.id === selectedChatbot.id ? { ...bot, status: newStatus as 'ACTIVE' | 'INACTIVE' } : bot
      );
      setChatbots(updatedChatbots);
      setSelectedChatbot({ ...selectedChatbot, status: newStatus as 'ACTIVE' | 'INACTIVE' });
    } catch (err) {
      console.error('Error updating chatbot status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update chatbot status');
    }
  };

  const addFAQ = async () => {
    if (!selectedChatbot || !newFAQ.question || !newFAQ.answer) return;

    try {
      const faqItem: FAQItem = {
        id: Date.now().toString(),
        question: newFAQ.question,
        answer: newFAQ.answer,
        category: newFAQ.category,
        keywords: newFAQ.keywords.split(',').map(k => k.trim()),
        priority: newFAQ.priority,
      };

      await apiFetch(`/chatbot/${selectedChatbot.id}/faq`, {
        method: 'POST',
        body: JSON.stringify({ faqData: [...faqData, faqItem] }),
      });

      setFaqData([...faqData, faqItem]);
      setNewFAQ({
        question: '',
        answer: '',
        category: '',
        keywords: '',
        priority: 5,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add FAQ');
    }
  };

  const updateBookingConfig = async () => {
    if (!selectedChatbot) return;

    try {
      await apiFetch(`/chatbot/${selectedChatbot.id}/booking-config`, {
        method: 'POST',
        body: JSON.stringify(bookingConfig),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking config');
    }
  };

  const updateUpsellingConfig = async () => {
    if (!selectedChatbot) return;

    try {
      await apiFetch(`/chatbot/${selectedChatbot.id}/upselling-config`, {
        method: 'POST',
        body: JSON.stringify(upsellingConfig),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update upselling config');
    }
  };

  const updateMultilingualConfig = async () => {
    if (!selectedChatbot) return;

    try {
      await apiFetch(`/chatbot/${selectedChatbot.id}/multilingual-config`, {
        method: 'POST',
        body: JSON.stringify(multilingualConfig),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update multilingual config');
    }
  };

  // Load chatbot settings when a chatbot is selected
  useEffect(() => {
    if (selectedChatbot) {
      // Load FAQ data
      if (selectedChatbot.settings?.faqData) {
        setFaqData(selectedChatbot.settings.faqData as FAQItem[]);
      } else {
        setFaqData([]);
      }

      // Load booking config
      if (selectedChatbot.settings?.bookingConfig) {
        setBookingConfig({
          ...bookingConfig,
          ...(selectedChatbot.settings.bookingConfig as typeof bookingConfig),
        });
      }

      // Load upselling config
      if (selectedChatbot.settings?.upsellingConfig) {
        setUpsellingConfig({
          ...upsellingConfig,
          ...(selectedChatbot.settings.upsellingConfig as typeof upsellingConfig),
        });
      }

      // Load multilingual config
      if (selectedChatbot.settings?.multilingualConfig) {
        setMultilingualConfig({
          ...multilingualConfig,
          ...(selectedChatbot.settings.multilingualConfig as typeof multilingualConfig),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatbot?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-light-purple/20 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-light-purple border-t-transparent mx-auto absolute top-0 left-0"></div>
          </div>
          <h3 className="mt-6 text-lg font-medium text-white">Loading Chatbots</h3>
          <p className="mt-2 text-text-secondary">Please wait while we fetch your chatbots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light-purple/20 to-primary-pink/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary-light-purple" />
              </div>
              AI Chatbots
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              Create and manage intelligent chatbots for customer engagement
            </p>
          </div>
          <button
            onClick={() => {
              setError('');
              setIsCreating(true);
            }}
            className="bg-gradient-button text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            Create Chatbot
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 glass border-red-500/20 text-red-300 rounded-lg shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-300">Error</h4>
                <p className="text-red-200 mt-1">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 glass border-green-500/20 text-green-300 rounded-lg shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-300">Success</h4>
                <p className="text-green-200 mt-1">{success}</p>
                <button
                  onClick={() => setSuccess('')}
                  className="mt-2 text-sm text-green-400 hover:text-green-300 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chatbots List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-5 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">Your Chatbots</h2>
                <p className="text-sm text-text-secondary mt-1">{chatbots.length} chatbot{chatbots.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                {chatbots.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-light-purple/20 to-primary-pink/20 rounded-2xl flex items-center justify-center mb-5">
                      <MessageCircle className="h-10 w-10 text-primary-light-purple" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">No Chatbots Yet</h4>
                    <p className="text-text-secondary mb-6 text-sm">Get started by creating your first AI chatbot.</p>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="inline-flex items-center px-5 py-2.5 bg-gradient-button text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Chatbot
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {chatbots.map((chatbot) => (
                      <div
                        key={chatbot.id}
                        onClick={() => setSelectedChatbot(chatbot)}
                        className={`p-5 cursor-pointer hover:bg-white/5 transition-all duration-200 ${
                          selectedChatbot?.id === chatbot.id ? 'bg-gradient-to-r from-primary-light-purple/10 to-transparent border-l-4 border-primary-light-purple' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light-purple/20 to-primary-pink/20 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-primary-light-purple" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-base mb-1 truncate">{chatbot.name}</h3>
                              {chatbot.description && (
                                <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                                  {chatbot.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-text-muted">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  {chatbot._count.conversations}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(chatbot.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                              chatbot.status === 'ACTIVE' 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
                            }`}>
                              {chatbot.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chatbot Details */}
          <div className="lg:col-span-2">
            {selectedChatbot ? (
              <div className="card">
                {/* Tabs */}
                <div className="border-b border-white/10 bg-white/5">
                  <nav className="flex flex-wrap gap-1 px-4">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'faq', label: 'FAQ', icon: HelpCircle },
                      { id: 'booking', label: 'Booking', icon: Calendar },
                      { id: 'upselling', label: 'Upselling', icon: ShoppingCart },
                      { id: 'multilingual', label: 'Languages', icon: Languages },
                      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'overview'|'faq'|'booking'|'upselling'|'multilingual'|'analytics')}
                        className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all ${
                          activeTab === tab.id
                            ? 'border-primary-light-purple text-primary-light-purple bg-white/5'
                            : 'border-transparent text-text-muted hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Header Section */}
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-white">
                                {selectedChatbot.name}
                              </h3>
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                selectedChatbot.status === 'ACTIVE' 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
                              }`}>
                                {selectedChatbot.status}
                              </span>
                            </div>
                            {selectedChatbot.description && (
                              <p className="text-text-secondary text-sm">{selectedChatbot.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageCircle className="h-4 w-4 text-text-muted" />
                              <span className="text-xs font-medium text-text-muted uppercase">Conversations</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                              {selectedChatbot._count.conversations}
                            </p>
                          </div>
                          
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Tag className="h-4 w-4 text-text-muted" />
                              <span className="text-xs font-medium text-text-muted uppercase">Platform</span>
                            </div>
                            <p className="text-lg font-semibold text-white capitalize">
                              {selectedChatbot.platform || 'Website'}
                            </p>
                          </div>
                          
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-text-muted" />
                              <span className="text-xs font-medium text-text-muted uppercase">Created</span>
                            </div>
                            <p className="text-sm font-semibold text-white">
                              {new Date(selectedChatbot.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                        <button 
                          onClick={deployChatbot}
                          disabled={selectedChatbot.status === 'ACTIVE'}
                          className={`${
                            selectedChatbot.status === 'ACTIVE' 
                              ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed border border-gray-500/20' 
                              : 'bg-gradient-button hover:opacity-90 shadow-lg hover:shadow-xl'
                          } text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium text-sm`}
                        >
                          <Play className="h-4 w-4" />
                          {selectedChatbot.status === 'ACTIVE' ? 'Deployed' : 'Deploy Chatbot'}
                        </button>
                        <button 
                          onClick={toggleChatbotStatus}
                          className={`${
                            selectedChatbot.status === 'ACTIVE'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30'
                              : 'bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30'
                          } px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium text-sm`}
                        >
                          {selectedChatbot.status === 'ACTIVE' ? (
                            <>
                              <Pause className="h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Activate
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab('faq');
                          }}
                          className="bg-white/10 text-white border border-white/20 hover:bg-white/20 px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium text-sm"
                        >
                          <Settings className="h-4 w-4" />
                          Configure
                        </button>
                        <button 
                          onClick={deleteChatbot}
                          className="bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'faq' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">FAQ Management</h3>
                        
                        {/* Add FAQ Form */}
                        <div className="glass p-4 rounded-lg mb-6">
                          <h4 className="font-medium text-white mb-4">Add New FAQ</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Question
                              </label>
                              <input
                                type="text"
                                value={newFAQ.question}
                                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                                placeholder="What is your return policy?"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Category
                              </label>
                              <input
                                type="text"
                                value={newFAQ.category}
                                onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                                className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                                placeholder="Returns"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-white mb-1">
                                Answer
                              </label>
                              <textarea
                                value={newFAQ.answer}
                                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                                rows={3}
                                placeholder="We offer a 30-day return policy..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Keywords (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={newFAQ.keywords}
                                onChange={(e) => setNewFAQ({ ...newFAQ, keywords: e.target.value })}
                                className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                                placeholder="return, refund, exchange"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">
                                Priority (1-10)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={newFAQ.priority}
                                onChange={(e) => setNewFAQ({ ...newFAQ, priority: parseInt(e.target.value) })}
                                className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                              />
                            </div>
                          </div>
                          <button
                            onClick={addFAQ}
                            className="mt-4 bg-gradient-button text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                          >
                            Add FAQ
                          </button>
                        </div>

                        {/* FAQ List */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-white">Current FAQs</h4>
                          {faqData.length === 0 ? (
                            <p className="text-text-muted">No FAQs added yet.</p>
                          ) : (
                            faqData.map((faq) => (
                              <div key={faq.id} className="glass border border-primary-light-purple/20 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-white">{faq.question}</h5>
                                    <p className="text-text-secondary mt-1">{faq.answer}</p>
                                    <div className="flex items-center mt-2 space-x-4 text-sm text-text-muted">
                                      <span>Category: {faq.category}</span>
                                      <span>Priority: {faq.priority}</span>
                                      <span>Keywords: {faq.keywords.join(', ')}</span>
                                    </div>
                                  </div>
                                  <button className="text-red-400 hover:text-red-300">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'booking' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Booking Configuration</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="booking-enabled"
                              checked={bookingConfig.enabled}
                              onChange={(e) => setBookingConfig({ ...bookingConfig, enabled: e.target.checked })}
                              className="h-4 w-4 text-primary-light-purple focus:ring-primary-light-purple border-primary-light-purple/30 rounded bg-white/10"
                            />
                            <label htmlFor="booking-enabled" className="ml-2 text-sm font-medium text-white">
                              Enable booking functionality
                            </label>
                          </div>

                          {bookingConfig.enabled && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                  Booking URL
                                </label>
                                <input
                                  type="url"
                                  value={bookingConfig.bookingUrl}
                                  onChange={(e) => setBookingConfig({ ...bookingConfig, bookingUrl: e.target.value })}
                                  className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                                  placeholder="https://calendly.com/your-company"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                  Confirmation Message
                                </label>
                                <textarea
                                  value={bookingConfig.confirmationMessage}
                                  onChange={(e) => setBookingConfig({ ...bookingConfig, confirmationMessage: e.target.value })}
                                  className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                                  rows={3}
                                />
                              </div>
                            </>
                          )}

                          <button
                            onClick={updateBookingConfig}
                            className="bg-gradient-button text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                          >
                            Save Booking Config
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'upselling' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Upselling Configuration</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="upselling-enabled"
                              checked={upsellingConfig.enabled}
                              onChange={(e) => setUpsellingConfig({ ...upsellingConfig, enabled: e.target.checked })}
                              className="h-4 w-4 text-primary-light-purple focus:ring-primary-light-purple border-primary-light-purple/30 rounded bg-white/10"
                            />
                            <label htmlFor="upselling-enabled" className="ml-2 text-sm font-medium text-white">
                              Enable upselling suggestions
                            </label>
                          </div>

                          {upsellingConfig.enabled && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                  Trigger Words (comma-separated)
                                </label>
                                <input
                                  type="text"
                                  value={upsellingConfig.triggers.join(', ')}
                                  onChange={(e) => setUpsellingConfig({ 
                                    ...upsellingConfig, 
                                    triggers: e.target.value.split(',').map(t => t.trim()) 
                                  })}
                                  className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                                  placeholder="interested, looking for, need help with"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                  Max Suggestions
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={upsellingConfig.maxSuggestions}
                                  onChange={(e) => setUpsellingConfig({ 
                                    ...upsellingConfig, 
                                    maxSuggestions: parseInt(e.target.value) 
                                  })}
                                  className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                                />
                              </div>
                            </>
                          )}

                          <button
                            onClick={updateUpsellingConfig}
                            className="bg-gradient-button text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                          >
                            Save Upselling Config
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'multilingual' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Multilingual Configuration</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="multilingual-enabled"
                              checked={multilingualConfig.enabled}
                              onChange={(e) => setMultilingualConfig({ ...multilingualConfig, enabled: e.target.checked })}
                              className="h-4 w-4 text-primary-light-purple focus:ring-primary-light-purple border-primary-light-purple/30 rounded bg-white/10"
                            />
                            <label htmlFor="multilingual-enabled" className="ml-2 text-sm font-medium text-white">
                              Enable multilingual support
                            </label>
                          </div>

                          {multilingualConfig.enabled && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                  Default Language
                                </label>
                                <select
                                  value={multilingualConfig.defaultLanguage}
                                  onChange={(e) => setMultilingualConfig({ 
                                    ...multilingualConfig, 
                                    defaultLanguage: e.target.value 
                                  })}
                                  className="w-full p-2 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple bg-white/10 text-white appearance-none cursor-pointer"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C080FF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 12px center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '16px'
                                  }}
                                >
                                  <option value="en" className="bg-gray-800 text-white">English</option>
                                  <option value="es" className="bg-gray-800 text-white">Spanish</option>
                                  <option value="fr" className="bg-gray-800 text-white">French</option>
                                  <option value="de" className="bg-gray-800 text-white">German</option>
                                  <option value="it" className="bg-gray-800 text-white">Italian</option>
                                  <option value="pt" className="bg-gray-800 text-white">Portuguese</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                  Supported Languages
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  {['en', 'es', 'fr', 'de', 'it', 'pt'].map((lang) => (
                                    <label key={lang} className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={multilingualConfig.supportedLanguages.includes(lang)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setMultilingualConfig({
                                              ...multilingualConfig,
                                              supportedLanguages: [...multilingualConfig.supportedLanguages, lang]
                                            });
                                          } else {
                                            setMultilingualConfig({
                                              ...multilingualConfig,
                                              supportedLanguages: multilingualConfig.supportedLanguages.filter(l => l !== lang)
                                            });
                                          }
                                        }}
                                        className="h-4 w-4 text-primary-light-purple focus:ring-primary-light-purple border-primary-light-purple/30 rounded bg-white/10"
                                      />
                                      <span className="ml-2 text-sm text-white">
                                        {lang.toUpperCase()}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="auto-detect"
                                  checked={multilingualConfig.autoDetect}
                                  onChange={(e) => setMultilingualConfig({ ...multilingualConfig, autoDetect: e.target.checked })}
                                  className="h-4 w-4 text-primary-light-purple focus:ring-primary-light-purple border-primary-light-purple/30 rounded bg-white/10"
                                />
                                <label htmlFor="auto-detect" className="ml-2 text-sm font-medium text-white">
                                  Auto-detect language from user messages
                                </label>
                              </div>
                            </>
                          )}

                          <button
                            onClick={updateMultilingualConfig}
                            className="bg-gradient-button text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                          >
                            Save Multilingual Config
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'analytics' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Analytics</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="glass p-4 rounded-lg border border-blue-500/20">
                            <h4 className="text-sm font-medium text-blue-300">Total Conversations</h4>
                            <p className="text-2xl font-bold text-blue-200 mt-2">
                              {selectedChatbot._count.conversations}
                            </p>
                          </div>
                          <div className="glass p-4 rounded-lg border border-green-500/20">
                            <h4 className="text-sm font-medium text-green-300">Response Rate</h4>
                            <p className="text-2xl font-bold text-green-200 mt-2">98%</p>
                          </div>
                          <div className="glass p-4 rounded-lg border border-primary-light-purple/20">
                            <h4 className="text-sm font-medium text-primary-light-purple">Avg Response Time</h4>
                            <p className="text-2xl font-bold text-primary-light-purple mt-2">1.2s</p>
                          </div>
                          <div className="glass p-4 rounded-lg border border-orange-500/20">
                            <h4 className="text-sm font-medium text-orange-300">Satisfaction</h4>
                            <p className="text-2xl font-bold text-orange-200 mt-2">4.8/5</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-primary-light-purple/10 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="h-8 w-8 text-primary-light-purple" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No Chatbot Selected</h3>
                <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                  Choose a chatbot from the list to view and manage its settings, or create a new one to get started.
                </p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-button text-white rounded-lg hover:opacity-90 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Chatbot
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Chatbot Modal */}
        {isCreating && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setError('');
                setIsCreating(false);
                setNewChatbot({
                  name: '',
                  description: '',
                  personality: 'friendly',
                  language: 'en',
                  capabilities: ['general_chat', 'faq'],
                  clientId: '',
                  campaignId: '',
                });
              }
            }}
          >
            <div className="card p-6 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Create New Chatbot</h3>
                <button
                  onClick={() => {
                    setError('');
                    setIsCreating(false);
                    setNewChatbot({
                      name: '',
                      description: '',
                      personality: 'friendly',
                      language: 'en',
                      capabilities: ['general_chat', 'faq'],
                      clientId: '',
                      campaignId: '',
                    });
                  }}
                  className="text-text-muted hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newChatbot.name}
                    onChange={(e) => setNewChatbot({ ...newChatbot, name: e.target.value })}
                    className="w-full p-3 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple bg-white/10 text-white placeholder-text-muted"
                    placeholder="Customer Support Bot"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={newChatbot.description}
                    onChange={(e) => setNewChatbot({ ...newChatbot, description: e.target.value })}
                    className="w-full p-3 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple bg-white/10 text-white placeholder-text-muted resize-none"
                    rows={3}
                    placeholder="AI assistant for customer support..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Personality
                  </label>
                  <select
                    value={newChatbot.personality}
                    onChange={(e) => setNewChatbot({ ...newChatbot, personality: e.target.value })}
                    className="w-full p-3 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple bg-white/10 text-white appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C080FF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="friendly" className="bg-gray-800 text-white">Friendly</option>
                    <option value="professional" className="bg-gray-800 text-white">Professional</option>
                    <option value="casual" className="bg-gray-800 text-white">Casual</option>
                    <option value="expert" className="bg-gray-800 text-white">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Language
                  </label>
                  <select
                    value={newChatbot.language}
                    onChange={(e) => setNewChatbot({ ...newChatbot, language: e.target.value })}
                    className="w-full p-3 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple bg-white/10 text-white appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C080FF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="en" className="bg-gray-800 text-white">🇺🇸 English</option>
                    <option value="es" className="bg-gray-800 text-white">🇪🇸 Spanish</option>
                    <option value="fr" className="bg-gray-800 text-white">🇫🇷 French</option>
                    <option value="de" className="bg-gray-800 text-white">🇩🇪 German</option>
                    <option value="it" className="bg-gray-800 text-white">🇮🇹 Italian</option>
                    <option value="pt" className="bg-gray-800 text-white">🇵🇹 Portuguese</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-white mb-2">
                    <Tag className="h-4 w-4 mr-2" />
                    Campaign ID
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-light-purple/20 text-primary-light-purple">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Content
                    </span>
                  </label>
                  <select
                    value={newChatbot.campaignId}
                    onChange={async (e) => {
                      const selectedCampaignId = e.target.value;
                      setNewChatbot({ ...newChatbot, campaignId: selectedCampaignId });
                      
                      // Auto-generate images when campaign is selected
                      if (selectedCampaignId) {
                        try {
                          setError('');
                          setSuccess('Generating images for campaign... This may take a few moments.');
                          
                          const response = await apiFetch(`/chatbot/generate-campaign-content`, {
                            method: 'POST',
                            body: JSON.stringify({ campaignId: selectedCampaignId }),
                          });
                          
                          if (response.success) {
                            setSuccess('Image generation started! Images, blog posts, SEO content, and social media posts are being generated in the background. This may take a few minutes. Check your dashboard shortly.');
                          } else {
                            setError(response.message || 'Failed to start image generation. Please try again.');
                          }
                          
                          // Note: Images are generated in background, so we show immediate success
                          // Actual generation happens asynchronously on the backend
                        } catch (err) {
                          console.error('Error starting image generation:', err);
                          const errorMessage = err instanceof Error ? err.message : 'Failed to start image generation. Please check your campaign has a description and try again.';
                          setError(errorMessage);
                          setSuccess('');
                        }
                      }
                    }}
                    className="w-full p-3 border border-primary-light-purple/30 rounded-lg focus:ring-2 focus:ring-primary-light-purple focus:border-primary-light-purple bg-white/10 text-white appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C080FF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="" className="bg-gray-800 text-white">No Campaign (Optional)</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id} className="bg-gray-800 text-white">
                        {campaign.name} ({campaign.status})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-text-secondary">
                    Select a campaign to automatically generate images, blog posts, SEO content, and social media posts.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setError('');
                    setIsCreating(false);
                    setNewChatbot({
                      name: '',
                      description: '',
                      personality: 'friendly',
                      language: 'en',
                      capabilities: ['general_chat', 'faq'],
                      clientId: '',
                      campaignId: '',
                    });
                  }}
                  className="px-6 py-2 text-text-muted bg-white/10 border border-primary-light-purple/30 rounded-lg hover:bg-white/20 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newChatbot.name.trim()) {
                      setError('Please enter a chatbot name');
                      return;
                    }
                    try {
                      await createChatbot();
                    } catch (error) {
                      console.error('Error creating chatbot:', error);
                    }
                  }}
                  className="px-6 py-2 bg-gradient-button text-white rounded-lg hover:opacity-90 font-medium transition-all flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
