import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { AdminInfo } from '../api/types'
import { clearSession, getAdmin, getToken, saveSession } from './session'

interface AuthValue {
  admin: AdminInfo | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(() => (getToken() ? getAdmin() : null))

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    saveSession(res.access_token, res.admin)
    setAdmin(res.admin)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setAdmin(null)
  }, [])

  const value = useMemo(
    () => ({ admin, isAuthenticated: admin !== null, login, logout }),
    [admin, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải nằm trong AuthProvider')
  return ctx
}
