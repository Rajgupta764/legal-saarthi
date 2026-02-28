import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')

      if (token && userData) {
        try {
          // Verify token with backend
          const response = await api.post('/auth/verify-token')
          if (response.data.success) {
            setUser(JSON.parse(userData))
            setIsAuthenticated(true)
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
          }
        } catch (error) {
          // Token verification failed, clear storage
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
        }
      }
      
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data
        
        // Store auth data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        setUser(userData)
        setIsAuthenticated(true)
        
        return { 
          success: true, 
          message: 'लॉगिन सफल' 
        }
      } else {
        return { 
          success: false, 
          error: response.data.message || 'लॉगिन विफल' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'लॉगिन में त्रुटि। कृपया पुनः प्रयास करें।' 
      }
    }
  }

  // Signup function
  const signup = async (name, email, phone, password) => {
    try {
      const response = await api.post('/auth/signup', { 
        name, 
        email, 
        phone, 
        password 
      })
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data
        
        // Store auth data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        setUser(userData)
        setIsAuthenticated(true)
        
        return { 
          success: true, 
          message: 'पंजीकरण सफल' 
        }
      } else {
        return { 
          success: false, 
          error: response.data.message || 'पंजीकरण विफल' 
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'पंजीकरण में त्रुटि। कृपया पुनः प्रयास करें।' 
      }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
    setIsAuthenticated(false)
  }

  // Update user data
  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user_data', JSON.stringify(userData))
  }

  // Get current auth token
  const getToken = () => {
    return localStorage.getItem('auth_token')
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    getToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
