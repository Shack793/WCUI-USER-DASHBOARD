import React, { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "../services/authApi"

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
        if (authApi.isTokenExpired()) {
          authApi.removeToken()
          setUser(null)
          return
        }

        const token = authApi.getToken()
        if (token) {
          const { user: userData } = await authApi.getUser()
          setUser(userData)
        }
      } catch (error) {
        console.error("Authentication error:", error)
        authApi.removeToken()
        setUser(null)
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