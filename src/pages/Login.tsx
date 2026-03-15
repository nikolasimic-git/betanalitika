import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { LogIn, UserPlus, AlertCircle } from 'lucide-react'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
      navigate('/picks')
    } catch (err: any) {
      setError(err.message || 'Greška')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isRegister ? 'Registracija' : 'Prijava'}
        </h1>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Ime</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-white focus:border-accent focus:outline-none"
                placeholder="Tvoje ime"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-white focus:border-accent focus:outline-none"
              placeholder="email@primer.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Lozinka</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-white focus:border-accent focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-darker transition-colors hover:bg-accent-dim disabled:opacity-50"
          >
            {loading ? 'Učitavanje...' : isRegister ? (
              <><UserPlus className="h-4 w-4" /> Registruj se</>
            ) : (
              <><LogIn className="h-4 w-4" /> Prijavi se</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          {isRegister ? 'Već imaš nalog?' : 'Nemaš nalog?'}
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="ml-1 font-medium text-accent hover:underline"
          >
            {isRegister ? 'Prijavi se' : 'Registruj se'}
          </button>
        </div>
      </div>
    </div>
  )
}
