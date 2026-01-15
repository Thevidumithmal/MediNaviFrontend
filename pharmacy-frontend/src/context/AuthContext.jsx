import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const LS_TOKEN = 'token'
const LS_USER = 'user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN) || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(LS_USER)
    return raw ? JSON.parse(raw) : null
  })

  // Inactivity auto-logout (default 30 minutes, configurable via VITE_IDLE_TIMEOUT_MINUTES)
  const IDLE_TIMEOUT_MIN = Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES || 30)
  const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MIN * 60 * 1000

  useEffect(() => {
    if (token) localStorage.setItem(LS_TOKEN, token)
    else localStorage.removeItem(LS_TOKEN)
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user))
    else localStorage.removeItem(LS_USER)
  }, [user])

  const login = (loginResponse) => {
    setToken(loginResponse.token)
    setUser(loginResponse.user)
  }

  const logout = () => {
    setToken('')
    setUser(null)
  }

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,
    role: user?.role || null,
    pharmacyId: user?.pharmacyId || null,
    login,
    logout
  }), [token, user])

  // Setup idle timer only when authenticated
  useEffect(() => {
    if (!token) return

    let timerId
    const resetTimer = () => {
      if (timerId) clearTimeout(timerId)
      timerId = setTimeout(() => {
        // Auto-logout on inactivity
        setToken('')
        setUser(null)
      }, IDLE_TIMEOUT_MS)
    }

    const onActivity = () => {
      if (document.visibilityState === 'hidden') return
      resetTimer()
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'visibilitychange']
    events.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }))

    // start timer immediately
    resetTimer()

    return () => {
      if (timerId) clearTimeout(timerId)
      events.forEach((evt) => window.removeEventListener(evt, onActivity))
    }
  }, [token, IDLE_TIMEOUT_MS])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
