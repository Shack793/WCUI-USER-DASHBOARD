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
      const response = await api.post<AuthResponse>('/api/v1/login', credentials)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      return response.data
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
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
      const response = await api.get<AuthResponse>('/api/v1/me')
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

  isTokenExpired: (): boolean => {
    const token = localStorage.getItem('authToken')
    if (!token) return true
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }
} 