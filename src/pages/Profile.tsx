import { useAuth } from '../auth'
import { Link } from 'react-router-dom'
import { User, Crown, Mail, Shield, BarChart3, Eye, ArrowRight } from 'lucide-react'

export default function Profile() {
  const { user, isPremium, isAdmin } = useAuth()

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <User className="mx-auto h-12 w-12 text-muted mb-4" />
        <h1 className="text-2xl font-bold mb-2">Nisi prijavljen</h1>
        <p className="text-muted mb-6">Prijavi se da vidiš svoj profil.</p>
        <Link to="/login" className="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-darker hover:bg-accent-dim">
          Prijavi se
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="animate-fade-in space-y-6">
        {/* User Info */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold">
                {user.name}
                {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                    <Crown className="h-3 w-3" /> Premium
                  </span>
                )}
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-muted mt-1">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Moj Plan */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-4">Moj plan</h2>
          {isPremium ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-gold" />
                <span className="font-semibold text-gold">Premium plan</span>
              </div>
              <p className="text-sm text-muted mb-1">Važi do: 31. decembar 2026.</p>
              <p className="text-sm text-accent mt-3">Hvala što si premium korisnik! 🎉</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted mb-4">Trenutno koristiš besplatan plan. Nadogradi na premium za sve pikove!</p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-darker hover:bg-accent-dim"
              >
                Nadogradi na Premium <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Pick History Summary */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-4">Statistika korišćenja</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold">142</p>
                <p className="text-xs text-muted">Pregledanih pikova</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                <BarChart3 className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-lg font-bold">28</p>
                <p className="text-xs text-muted">Dana aktivnosti</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
