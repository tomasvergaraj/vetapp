import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { clearToken, getToken, setToken } from './api'
import { fetchMe, login as apiLogin } from './endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await fetchMe()
      setUser(me)
    } catch {
      clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    // Escucha el evento de 401 del interceptor
    const handler = () => setUser(null)
    window.addEventListener('vetapp:unauthorized', handler)
    return () => window.removeEventListener('vetapp:unauthorized', handler)
  }, [refresh])

  const login = useCallback(async (email, password) => {
    const { access_token } = await apiLogin(email, password)
    setToken(access_token)
    const me = await fetchMe()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
