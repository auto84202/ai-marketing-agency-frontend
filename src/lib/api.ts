import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

// Create axios instance with base configuration
// Default to backend port 3001 (NestJS backend) when NEXT_PUBLIC_API_URL is not set
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
console.log('Axios configured with baseURL:', baseURL)

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and update activity time
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Update activity time on any API request
    if (typeof window !== 'undefined') {
      const now = Date.now()
      localStorage.setItem('last_activity_time', now.toString())
    }

    // Check both 'auth_token' and 'token' for compatibility
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    if (token) {
      // Merge existing headers with Authorization header in a type-safe way
      const existing = (config.headers as Record<string, string> | undefined) ?? {}
      config.headers = { ...existing, Authorization: `Bearer ${token}` } as InternalAxiosRequestConfig['headers']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML (wrong endpoint) - happens when Next.js routes catch API calls
    const contentType = response.headers['content-type'] || ''
    if (typeof response.data === 'string' && 
        (contentType.includes('text/html') || response.data.trim().startsWith('<!DOCTYPE'))) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const error = new Error(
        `Received HTML response instead of JSON. This usually means:\n` +
        `1. The backend server at ${apiUrl} is not running\n` +
        `2. NEXT_PUBLIC_API_URL is incorrect\n` +
        `3. The API request is being intercepted by Next.js routing\n\n` +
        `Please check that the backend server is running and accessible.`
      )
      return Promise.reject(error)
    }
    return response
  },
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        error.message = `Cannot connect to the server at ${apiUrl}. Please ensure:\n` +
          `1. The backend server is running (check http://localhost:3001/auth/health)\n` +
          `2. NEXT_PUBLIC_API_URL is set correctly in your .env.local file\n` +
          `3. There are no firewall or CORS issues blocking the connection`
      }
      return Promise.reject(error)
    }

    // Check if error response is HTML
    if (error.response?.data && 
        typeof error.response.data === 'string' && 
        error.response.data.trim().startsWith('<!DOCTYPE')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      error.message = `Backend server not responding correctly. Received HTML instead of JSON. ` +
        `Please verify the backend is running at ${apiUrl} and NEXT_PUBLIC_API_URL is set correctly.`
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear tokens and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('user_data')
      localStorage.removeItem('last_activity_time')
      // Only redirect if we're not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }, { timeout: 30000 }), // 30 second timeout for login
  
  register: (userData: {
    name: string
    email: string
    company?: string
    password: string
  }) => api.post('/auth/register', userData, { timeout: 30000 }), // 30 second timeout for registration
  
  getProfile: () => api.get('/auth/profile'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (data: { email: string; token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
}

// AI Services API
export const aiAPI = {
  generateContent: (data: {
    type: string
    prompt: string
    [key: string]: unknown
  }) => api.post('/ai/content/generate', data, { timeout: 30000 }), // 30 seconds timeout for general content generation
  
  generateBlogPost: (data: {
    topic: string
    options?: Record<string, unknown>
  }) => api.post('/ai/content/blog', data, { timeout: 30000 }), // 30 seconds timeout for blog post generation
  
  generateAdCopy: (data: {
    product: string
    targetAudience: string
    options?: Record<string, unknown>
  }) => api.post('/ai/content/ad-copy', data, { timeout: 30000 }), // 30 seconds timeout for ad copy generation
  
  generateVideoScript: (data: {
    topic: string
    duration: number
    options?: Record<string, unknown>
  }) => api.post('/ai/content/video-script', data, { timeout: 30000 }), // 30 seconds timeout for video script generation
  
  generateCaptions: (data: {
    platform: string
    content: string
    options?: Record<string, unknown>
  }) => api.post('/ai/content/captions', data, { timeout: 30000 }), // 30 seconds timeout for caption generation
  
  generateImages: (data: {
    prompt: string
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
    quality?: 'standard' | 'hd'
    style?: 'vivid' | 'natural'
    n?: number
  }) => api.post('/ai/images/generate', data, { timeout: 60000 }), // 60 seconds timeout for image generation
  
  generateSEO: (data: {
    keywords: string
    contentType: string
    [key: string]: unknown
  }) => api.post('/ai/seo/generate', data, { timeout: 30000 }), // 30 seconds timeout for SEO generation
  
  generateSocial: (data: {
    platform: string
    campaignId?: string
    [key: string]: unknown
  }) => api.post('/ai/social/generate', data, { timeout: 30000 }), // 30 seconds timeout for social media generation
  
  getUserContent: (params?: {
    type?: string
    limit?: number
    offset?: number
  }) => api.get('/ai/content', { params }),
  
  getContentById: (id: string) => api.get(`/ai/content/${id}`),
  
  createChatbot: (data: {
    name: string
    description: string
    platform: string
    webhookUrl?: string
    personality?: string
    language?: string
    capabilities?: string[]
    trainingData?: string
    clientId: string
    config?: Record<string, unknown>
  }) => api.post('/ai/chatbot/create', data),
  
  getAnalytics: (params?: {
    campaignId?: string
    startDate?: string
    endDate?: string
  }) => api.get('/ai/analytics', { params }),
  
  getUsageStats: (params?: {
    startDate?: string
    endDate?: string
  }) => api.get('/ai/usage', { params }),
}

// Clients API
export const clientsAPI = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/clients', { params }),
  
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (clientData: Record<string, unknown>) => api.post('/clients', clientData),

  update: (id: string, clientData: Record<string, unknown>) => api.patch(`/clients/${id}`, clientData),
  
  delete: (id: string) => api.delete(`/clients/${id}`),
  
  getAnalytics: (id: string) => api.get(`/clients/${id}/analytics`),
  
  getDashboard: (id: string) => api.get(`/clients/${id}/dashboard`),
}

// Campaigns API
export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  
  getById: (id: string) => api.get(`/campaigns/${id}`),
  
  create: (campaignData: Record<string, unknown>) => api.post('/campaigns', campaignData),
  
  update: (id: string, campaignData: Record<string, unknown>) => api.patch(`/campaigns/${id}`, campaignData),
  
  delete: (id: string) => api.delete(`/campaigns/${id}`),
}

// Billing API
export const billingAPI = {
  createCheckout: (data: Record<string, unknown>) => api.post('/billing/intent', data),
  
  createSubscriptionSession: (data: { priceId: string; userId?: string }) => 
    api.post('/billing/create-subscription-session', data),
  
  createPortalSession: (data?: { userId?: string }) => 
    api.post('/billing/create-portal-session', data || {}),
  
  getSubscription: (userId: string) => api.get(`/billing/subscription/${userId}`),
  
  cancelSubscription: (data?: { userId?: string }) => 
    api.post('/billing/cancel-subscription', data || {}),
  
  getInvoices: () => api.get('/billing/invoices'),
}

// Reports API
export const reportsAPI = {
  generate: (data: Record<string, unknown>) => api.post('/reports/generate', data),
  
  getAll: () => api.get('/reports'),
  
  getById: (id: string) => api.get(`/reports/${id}`),
}

// Users API
export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/users', { params }),
  
  getById: (id: string) => api.get(`/users/${id}`),
  
  create: (userData: Record<string, unknown>) => api.post('/users', userData),
  
  update: (id: string, userData: Record<string, unknown>) => api.patch(`/users/${id}`, userData),
  
  delete: (id: string) => api.delete(`/users/${id}`),
}

// Admin API
export const adminAPI = {
  getLastLoggedInUser: () => api.get('/admin/users/last-logged-in'),
}

// Workflow automation API
export const workflowsAPI = {
  listRuns: (params?: { status?: string }) => api.get('/workflows/runs', { params }),
  getRun: (id: string) => api.get(`/workflows/runs/${id}`),
  pauseRun: (id: string) => api.post(`/workflows/runs/${id}/pause`),
  resumeRun: (id: string) => api.post(`/workflows/runs/${id}/resume`),
  retryJob: (id: string) => api.post(`/workflows/jobs/${id}/retry`),
}

export default api
