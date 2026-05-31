import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSession, onAuthChange } from '../lib/auth'
import { isSupabaseEnabled } from '../lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  enabled: boolean
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, enabled: false })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setLoading(false)
      return
    }
    getSession().then((s) => {
      setUser(s?.user ?? null)
      setLoading(false)
    })
    return onAuthChange((s) => setUser(s?.user ?? null))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, enabled: isSupabaseEnabled }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
