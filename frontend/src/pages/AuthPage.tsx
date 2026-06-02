import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        navigate('/editor')
      } else {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return }
        await register(email, password, name.trim())
        setSuccess('Account created! You can now log in.')
        setMode('login')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col items-center justify-center px-4">
<div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6V6.75a6 6 0 0 0-12 0v6a6 6 0 0 0 6 6Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75V21M8.25 21h7.5" />
          </svg>
          <span className="font-bold text-text-header text-xl">Garden Planner</span>
        </div>

        {/* Card */}
        <div className="bg-code-bg border border-border-main rounded-2xl p-8">
          {/* Toggle */}
          <div className="flex bg-bg-main rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${mode === 'login' ? 'bg-accent text-white' : 'text-text-main/60 hover:text-text-main'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${mode === 'register' ? 'bg-accent text-white' : 'text-text-main/60 hover:text-text-main'}`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-xl font-bold text-text-header mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-text-main/50 mb-6">
            {mode === 'login'
              ? 'Log in to access your garden and AI assistant.'
              : 'Sign up to unlock full AI garden features.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-text-main/60 mb-1.5">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Abdi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-main placeholder-text-main/30 outline-none focus:border-accent/60 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-text-main/60 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-main placeholder-text-main/30 outline-none focus:border-accent/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-main/60 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-bg-main border border-border-main rounded-lg px-4 py-2.5 text-sm text-text-main placeholder-text-main/30 outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}
            {success && (
              <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-1"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-main text-center">
            <button
              onClick={() => navigate('/editor')}
              className="text-xs text-text-main/40 hover:text-text-main/70 transition-colors"
            >
              Continue without account (limited features)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
