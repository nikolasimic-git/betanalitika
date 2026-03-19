import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from './lib/supabase'

interface User {
  id: string
  email: string
  name: string
  role: string
  tier: string
}

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isPremium: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, tier')
        .eq('id', userId)
        .single()
      if (data && !error) {
        setUser(data)
        return
      }
      console.warn('Profile query failed (likely RLS), using auth fallback:', error?.message)
    } catch (e) {
      console.warn('Profile query exception, using auth fallback:', e)
    }
    // Fallback: build user from auth metadata when RLS blocks profile query
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        role: authUser.user_metadata?.role || 'user',
        tier: authUser.user_metadata?.tier || 'free',
      })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  const register = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) throw new Error(error.message)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
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
