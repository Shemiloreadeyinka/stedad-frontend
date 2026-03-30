import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '@/lib/api'

const AuthContext = createContext(null)

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('stedad_user') ?? 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(getStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem('stedad_token'))

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    const { token: tok, user: usr } = data

    localStorage.setItem('stedad_token', tok)
    localStorage.setItem('stedad_user',  JSON.stringify(usr))
    setToken(tok)
    setUser(usr)
    return usr
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.removeItem('stedad_token')
    localStorage.removeItem('stedad_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
