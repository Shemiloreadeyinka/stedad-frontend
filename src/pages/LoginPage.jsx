import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Receipt, Loader2 } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [form,    setForm]    = useState({ staffId: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const from = location.state?.from?.pathname ?? '/'

  const handleChange = (e) => {
    setError('')
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.staffId || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login({ StaffId: form.staffId, password: form.password })
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian-950 bg-grid-subtle [background-size:32px_32px] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-receipt-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-receipt-gold/10 border border-receipt-gold/30 flex items-center justify-center mx-auto mb-4 shadow-gold">
            <Receipt size={24} className="text-receipt-gold" />
          </div>
          <h1 className="font-display text-3xl text-white">Stedad</h1>
          <p className="font-mono text-obsidian-500 text-xs tracking-widest mt-1">ADMIN RECEIPTIFY</p>
        </div>

        {/* Card */}
        <div className="glass-card p-7 shadow-panel">
          <p className="text-obsidian-400 text-sm mb-6 text-center">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Staff ID</label>
              <input
                name="staffId"
                value={form.staffId}
                onChange={handleChange}
                placeholder="e.g. STF-001"
                autoComplete="username"
                className="field font-mono"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-500 hover:text-obsidian-300 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-4 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 py-3 text-base"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-obsidian-600 text-xs mt-6 font-mono">
          STEDAD © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
