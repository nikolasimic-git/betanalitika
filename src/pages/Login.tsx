import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/ToastContext'
import { LogIn, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const { t } = useLanguage()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('register.val.email'))
      return
    }
    if (password.length < 6) {
      setError(t('register.val.pass'))
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      addToast('success', t('login.success'))
      navigate('/picks')
    } catch (err: any) {
      const msg = err.message || t('login.error')
      setError(msg)
      addToast('error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in relative mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <div className="animate-scale-in relative rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{t('login.title')}</h1>

        {error && (
          <div className="animate-fade-in mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">{t('login.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-white transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
              placeholder={t('register.email.ph')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">{t('login.password')}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 pr-10 text-white transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white p-1"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="rounded border-border accent-accent"
            />
            <span className="text-sm text-muted">{t('login.remember')}</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-darker transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-accent-dim disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t('login.loading')}</>
            ) : (
              <><LogIn className="h-4 w-4" /> {t('login.submit')}</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          {t('login.no.account')}
          <Link to="/register" className="ml-1 font-medium text-accent hover:underline">
            {t('login.register')}
          </Link>
        </div>
      </div>
    </div>
  )
}
