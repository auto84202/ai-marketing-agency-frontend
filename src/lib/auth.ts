import { authAPI } from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  company?: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export class AuthService {
  /**
   * Secure login implementation
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    try {
      const response = await authAPI.login(credentials.email.trim().toLowerCase(), credentials.password)

      const responseData = response.data
      
      // Check if response is HTML (wrong endpoint)
      if (typeof responseData === 'string' && responseData.trim().startsWith('<!DOCTYPE')) {
        throw new Error('Backend server not responding correctly. Please check your connection.')
      }

      // Extract token and user data
      const token = responseData?.access_token || responseData?.token
      const user = responseData?.user || responseData?.data?.user

      if (!token) {
        throw new Error('No access token received from server.')
      }

      // Store token and user data
      localStorage.setItem('auth_token', token)
      localStorage.setItem('token', token)
      
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('user_data', JSON.stringify(user))
      }

      // Reset inactivity timer on login - set to current time
      const now = Date.now()
      localStorage.setItem('last_activity_time', now.toString())

      return { access_token: token, user }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Login failed. Please check your credentials.'
      throw new Error(message)
    }
  }

  static async register(userData: RegisterData): Promise<any> {
    try {
      const response = await authAPI.register(userData)
      return response.data
    } catch (error: any) {
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 
                       (Array.isArray(error.response.data?.message) 
                         ? error.response.data.message.join(', ') 
                         : error.response.data?.error || 
                         error.message || 
                         'Registration failed')
        throw new Error(message)
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Cannot connect to the server. Please ensure the backend is running on port 3001.')
      } else {
        // Something else happened
        throw new Error(error.message || 'Registration failed. Please try again.')
      }
    }
  }

  static async getProfile(): Promise<any> {
    try {
      const response = await authAPI.getProfile()
      return response.data
    } catch (error: any) {
      console.error('Profile fetch error:', error)
      throw new Error('Failed to fetch user profile')
    }
  }

  static logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_data')
    localStorage.removeItem('last_activity_time')
    window.location.href = '/auth/login'
  }

  static isAuthenticated(): boolean {
    return !!(localStorage.getItem('auth_token') || localStorage.getItem('token'))
  }

  static getToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('auth_token')
  }
}
