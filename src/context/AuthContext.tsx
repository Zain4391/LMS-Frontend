import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { setToken, clearToken } from '@/lib/axios'
import type { AuthUser, LoginResponse } from '@/types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (response: LoginResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('lms_user')
    if (!raw) return null
    const user = JSON.parse(raw) as AuthUser
    if (!user.id || !user.token) {
      localStorage.removeItem('lms_user')
      localStorage.removeItem('lms_token')
      return null
    }
    return user
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)

  const login = useCallback((response: LoginResponse) => {
    const authUser: AuthUser = {
      id: response.id,
      email: response.email,
      name: response.name,
      role: response.role,
      token: response.token,
    }
    setToken(response.token)
    localStorage.setItem('lms_user', JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
