import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function validate(): string | null {
    if (!name.trim()) return 'Ime je obavezno'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Unesite validan email'
    if (password.length < 6) return 'Lozinka mora imati najmanje 6 karaktera'
    if (password !== confirmPassword) return 'Lozinke se ne poklapaju'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/picks')
    } catch (err: any) {
      setError(err.message || 'Greška pri registraciji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in relative mx-auto max-w-md px-4 py-16">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <div className="animate-scale-in relative rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Registracija</h1>

        {error && (
          <div className="animate-fade-in mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Ime</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-white transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
              placeholder="Tvoje ime"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-white transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
              placeholder="email@primer.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Lozinka</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-white transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
              placeholder="Minimum 6 karaktera"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Potvrdi lozinku</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-4 py-2.5 text-white transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
              placeholder="Ponovi lozinku"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-darker transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-accent-dim disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Registracija...</>
            ) : (
              <><UserPlus className="h-4 w-4" /> Registruj se</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Već imaš nalog?
          <Link to="/login" className="ml-1 font-medium text-accent hover:underline">
            Prijavi se
          </Link>
        </div>
      </div>
    </div>
  )
}
