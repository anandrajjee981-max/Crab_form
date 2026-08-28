import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../utils/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crab_user') || 'null') } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('crab_token') || null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const isAuthenticated = !!token && !!user

  const persist = (nextUser, nextToken) => {
    setUser(nextUser)
    setToken(nextToken)
    if (nextToken) localStorage.setItem('crab_token', nextToken)
    else localStorage.removeItem('crab_token')
    if (nextUser) localStorage.setItem('crab_user', JSON.stringify(nextUser))
    else localStorage.removeItem('crab_user')
  }

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true)
    try {
      const res = await api.register({ name, email, password })
      // register returns user only, need login afterwards or treat as success without token
      return res.data?.user || res
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      const nextUser = res.data?.user
      const nextToken = res.data?.token
      if (nextUser && nextToken) persist(nextUser, nextToken)
      return res
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    persist(null, null)
  }, [])

  const fetchMe = useCallback(async () => {
    if (!token) { setInitialized(true); return }
    try {
      const res = await api.me()
      const me = res.data?.user
      if (me) {
        localStorage.setItem('crab_user', JSON.stringify(me))
        setUser(me)
      }
    } catch {
      // token invalid
      persist(null, null)
    } finally {
      setInitialized(true)
    }
  }, [token])

  useEffect(() => {
    if (!initialized) fetchMe()
  }, [fetchMe, initialized])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
