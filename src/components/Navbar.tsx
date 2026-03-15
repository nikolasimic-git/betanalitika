import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Menu, X, LogIn, LogOut, Crown, Shield } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth'

export default function Navbar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { user, logout, isPremium, isAdmin } = useAuth()

  const links = [
    { to: '/', label: 'Početna' },
    { to: '/picks', label: '⚽ Pikovi' },
    { to: '/history', label: '📊 Rezultati' },
    { to: '/pricing', label: '💎 Premium' },
    ...(isAdmin ? [{ to: '/admin', label: '🛡️ Admin' }] : []),
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-darker/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <TrendingUp className="h-7 w-7 text-accent" />
          <span>Bet<span className="text-accent">Analitika</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive(l.to)
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:text-white hover:bg-card'
              }`}
            >
              {l.label}
            </Link>
          ))}
          
          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-muted">
                {isPremium && <Crown className="h-3.5 w-3.5 text-gold" />}
                {isAdmin && <Shield className="h-3.5 w-3.5 text-accent" />}
                {user.name}
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-3 flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-darker transition-colors hover:bg-accent-dim"
            >
              <LogIn className="h-4 w-4" /> Prijava
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-muted">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-darker px-4 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                isActive(l.to) ? 'bg-accent/10 text-accent' : 'text-muted'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="mt-2 flex items-center justify-between px-4">
              <span className="flex items-center gap-1 text-sm text-muted">
                {isPremium && <Crown className="h-3.5 w-3.5 text-gold" />}
                {user.name}
              </span>
              <button onClick={() => { logout(); setOpen(false) }} className="text-sm text-muted hover:text-white">
                Odjavi se
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-lg bg-accent px-5 py-3 text-center text-sm font-semibold text-darker"
            >
              Prijava
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
