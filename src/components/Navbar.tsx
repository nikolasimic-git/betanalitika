import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Menu, X, LogIn, LogOut, Crown, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../auth'

export default function Navbar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, isPremium, isAdmin } = useAuth()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', label: 'Početna' },
    { to: '/picks', label: '🎯 Pikovi' },
    { to: '/history', label: '📊 Rezultati' },
    { to: '/pricing', label: '💎 Premium' },
    ...(isAdmin ? [{ to: '/admin', label: '🛡️ Admin' }] : []),
  ]

  const desktopLinks = [
    ...links.slice(0, 4),
    { to: '/how-to-use', label: '📖 Vodič' },
    { to: '/contact', label: '✉️ Kontakt' },
    ...links.slice(4),
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className={`sticky top-0 z-50 border-b border-border bg-darker/80 backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold transition-opacity duration-200 hover:opacity-80">
          <TrendingUp className="h-7 w-7 text-accent" />
          <span>Bet<span className="text-accent">Analitika</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {desktopLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive(l.to)
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:text-white hover:bg-card'
              }`}
            >
              {l.label}
              {isActive(l.to) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-accent" />
              )}
            </Link>
          ))}
          
          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-1 text-sm text-muted hover:text-white transition-colors">
                {isPremium && <Crown className="h-3.5 w-3.5 text-gold" />}
                {isAdmin && <Shield className="h-3.5 w-3.5 text-accent" />}
                {user.name}
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-white"
                title="Odjavi se"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-3 flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-darker transition-transform duration-200 hover:scale-105 hover:bg-accent-dim"
            >
              <LogIn className="h-4 w-4" /> Prijava
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-muted" title="Meni">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-border bg-darker md:hidden transition-all duration-300 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-t-0'
        }`}
      >
        <div className="px-4 pb-4">
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
              <Link to="/profile" className="flex items-center gap-1 text-sm text-muted hover:text-white" onClick={() => setOpen(false)}>
                {isPremium && <Crown className="h-3.5 w-3.5 text-gold" />}
                {user.name}
              </Link>
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
      </div>
    </nav>
  )
}
