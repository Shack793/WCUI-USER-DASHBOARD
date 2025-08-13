import api from '../lib/api'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'admin' | 'institution' | 'individual'
  phone?: string
  country?: string
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'institution' | 'individual'
  phone?: string
  country?: string
}

interface AuthResponse {
  token: string
  user: User
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('🔐 Starting login process...')
      console.log('🔐 Base URL:', import.meta.env.VITE_API_BASE_URL || 'https://admin.myeasydonate.com')
      console.log('🔐 Credentials:', { email: credentials.email, password: '[HIDDEN]' })
      console.log('🔐 Full URL will be:', `${import.meta.env.VITE_API_BASE_URL || 'https://admin.myeasydonate.com'}/api/v1/login`)
      
      const response = await api.post<AuthResponse>('/api/v1/login', credentials, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      
      console.log('🔐 Login response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      })
      
      if (response.data.token) {
        console.log('🔐 Token received, storing in localStorage')
        localStorage.setItem('authToken', response.data.token)
      } else {
        console.warn('🔐 No token in response!')
      }
      
      return response.data
    } catch (error: any) {
      console.error('🔐 Login error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      })
      throw new Error(error.response?.data?.message || 'Failed to login')
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/v1/register', data)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      return response.data
    } catch (error: any) {
      console.error('Registration error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        errors: error.response?.data?.errors,
        message: error.response?.data?.message,
        fullError: error
      })
      throw new Error(
        error.response?.data?.message || 
        (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : 'Failed to register')
      )
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/v1/logout')
      localStorage.removeItem('authToken')
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to logout')
    }
  },

  getUser: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get<AuthResponse>('/api/v1/user')
      return response.data
    } catch (error: any) {
      console.error('Get user error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get user data')
    }
  },

  // Token management
  getToken: (): string | null => {
    return localStorage.getItem('authToken')
  },

  setToken: (token: string): void => {
    localStorage.setItem('authToken', token)
  },

  removeToken: (): void => {
    localStorage.removeItem('authToken')
  },

  // Debug utility to inspect token
  debugToken: (): void => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('🔍 DEBUG: No token found')
      return
    }

    console.log('🔍 DEBUG: Token details:', {
      hasToken: !!token,
      tokenLength: token.length,
      tokenStart: token.substring(0, 50),
      tokenEnd: token.substring(token.length - 20),
      tokenType: typeof token,
      isJWTFormat: token.split('.').length === 3,
      parts: token.split('.').length
    })

    // Try to decode if it's a JWT
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]))
        const payload = JSON.parse(atob(parts[1]))
        console.log('🔍 DEBUG: JWT Header:', header)
        console.log('🔍 DEBUG: JWT Payload:', payload)
      } else {
        console.log('🔍 DEBUG: Not a JWT token - appears to be a simple string token')
      }
    } catch (error) {
      console.log('🔍 DEBUG: Could not decode token:', error)
    }
  },

  isTokenExpired: (): boolean => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('🔍 No token found')
      return true
    }
    
    console.log('🔍 Token found:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 50) + '...',
      tokenType: typeof token
    })
    
    try {
      // Check if token has the correct JWT format (3 parts separated by dots)
      const parts = token.split('.')
      console.log('🔍 Token parts:', {
        totalParts: parts.length,
        partLengths: parts.map(p => p.length),
        isJWTFormat: parts.length === 3
      })
      
      if (parts.length !== 3) {
        console.log('🔍 Invalid token format - not a standard JWT')
        console.log('🔍 Token appears to be a simple string token, treating as valid')
        // Many APIs use simple string tokens instead of JWT
        // Don't invalidate the token just because it's not JWT format
        return false
      }

      const payload = JSON.parse(atob(parts[1]))
      console.log('🔍 Token payload:', {
        hasExp: !!payload.exp,
        exp: payload.exp,
        iat: payload.iat,
        aud: payload.aud,
        sub: payload.sub
      })

      // If no expiration field, assume token is valid (some tokens don't have exp)
      if (!payload.exp) {
        console.log('🔍 Token has no expiration field - treating as valid')
        return false
      }

      const currentTime = Math.floor(Date.now() / 1000) // Convert to seconds
      const isExpired = payload.exp < currentTime
      const timeUntilExpiry = payload.exp - currentTime

      console.log('🔍 Token expiration check:', {
        exp: payload.exp,
        currentTime,
        isExpired,
        timeUntilExpiry: timeUntilExpiry > 0 ? `${Math.floor(timeUntilExpiry / 60)} minutes` : 'expired'
      })

      return isExpired
    } catch (error) {
      console.error('🔍 Error checking token expiration:', error)
      console.log('🔍 Token parse error, but keeping token (likely a simple string token)')
      // Don't treat parse errors as expiration - token might be a simple string
      return false
    }
  }
} 