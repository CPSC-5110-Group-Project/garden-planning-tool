import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isGuest: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API = import.meta.env.VITE_API_URL

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem('garden_auth')
      if (raw) return JSON.parse(raw)
    } catch {}
    return { user: null, token: null, isGuest: true }
  })

  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem('garden_auth', JSON.stringify(state))
    } else {
      localStorage.removeItem('garden_auth')
    }
  }, [state])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Login failed')
    }
    const data = await res.json()
    setState({ user: data.user, token: data.access_token, isGuest: false })
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Registration failed')
    }
    const data = await res.json()
    if (data.access_token) {
      setState({ user: data.user, token: data.access_token, isGuest: false })
    }
  }

  const logout = () => {
    setState({ user: null, token: null, isGuest: true })
    localStorage.removeItem('garden_auth')
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
