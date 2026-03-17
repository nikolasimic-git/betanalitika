import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  tier: string
}

interface AuthCtx {
  user: User | null
  token: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isPremium: boolean
  isAdmin: boolean
}

const API = import.meta.env.DEV
  ? (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://uncle-double-mechanical-ski.trycloudflare.com')
  : ''

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('ba_token') || sessionStorage.getItem('ba_token'))

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => setUser(d.user))
        .catch(() => { setToken(null); localStorage.removeItem('ba_token'); sessionStorage.removeItem('ba_token') })
    }
  }, [token])

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Login failed')
    }
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    if (rememberMe) {
      localStorage.setItem('ba_token', data.token)
    } else {
      sessionStorage.setItem('ba_token', data.token)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Registration failed')
    }
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('ba_token', data.token)
  }

  const logout = () => {
    if (token) {
      fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem('ba_token')
    sessionStorage.removeItem('ba_token')
  }

  return (
    <AuthContext.Provider value={{
      user, token, login, register, logout,
      isPremium: user?.tier === 'premium',
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be within AuthProvider')
  return ctx
}
