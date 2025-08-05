import React, { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "../services/authApi"
import api from "../lib/api"

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'institution' | 'individual'
  phone?: string
  country?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, password_confirmation: string, role: 'admin' | 'institution' | 'individual', phone?: string, country?: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const clearError = () => setError(null)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = authApi.getToken()
        if (!token) {
          console.log('🔍 No token found, user not authenticated')
          setLoading(false)
          return
        }

        console.log('🔍 Token found, checking if expired...')
        const isExpired = authApi.isTokenExpired()
        console.log('🔍 Token expiration result:', isExpired)
        
        if (isExpired) {
          console.log('🔍 Token expired, removing token')
          authApi.removeToken()
          setUser(null)
          setLoading(false)
          return
        }

        console.log('🔍 Token valid, fetching user data...')
        try {
          const { user: userData } = await authApi.getUser()
          console.log('🔍 User data fetched successfully:', userData)
          setUser(userData)
        } catch (userError: any) {
          console.log('Failed to fetch from /api/v1/user, trying alternative endpoint...')
          // Try alternative endpoint if /user fails
          try {
            const response = await api.get('/user/profile')
            if (response.data?.user) {
              console.log('User data fetched from profile endpoint:', response.data.user)
              setUser(response.data.user)
            } else if (response.data) {
              console.log('User data fetched from profile endpoint (direct):', response.data)
              setUser(response.data)
            } else {
              throw new Error('No user data in profile response')
            }
          } catch (profileError) {
            console.error('Both /user and /profile endpoints failed')
            throw userError // Throw the original error
          }
        }
      } catch (error: any) {
        console.error("Authentication error during refresh:", error)
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        // Only remove token if it's a 401 (unauthorized) or token is actually invalid
        if (error.response?.status === 401 || error.message.includes('token')) {
          console.log('Authentication failed, removing token')
          authApi.removeToken()
          setUser(null)
        } else {
          console.log('Network or other error, keeping token for retry')
          // Keep the user logged in for network errors, but show the error
          const token = authApi.getToken()
          if (token && !authApi.isTokenExpired()) {
            // Keep existing user state if we have a valid token
            console.log('Keeping user logged in despite network error')
            return
          }
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const { user: userData } = await authApi.login({ email, password })
      setUser(userData)
      navigate("/dashboard")
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    role: 'admin' | 'institution' | 'individual',
    phone?: string,
    country?: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      const { user: userData } = await authApi.register({
        name,
        email,
        password,
        password_confirmation,
        role,
        phone,
        country
      })
      setUser(userData)
      navigate("/dashboard")
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authApi.logout()
    } catch (error: any) {
      console.error("Logout error:", error)
    } finally {
      authApi.removeToken()
      setUser(null)
      navigate("/login")
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}