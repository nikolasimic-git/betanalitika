import { TrendingUp, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="animate-fade-in bg-darker mt-16">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo + description */}
          <div>
            <div className="flex items-center gap-2 text-lg font-bold mb-3">
              <TrendingUp className="h-5 w-5 text-accent" />
              Bet<span className="text-accent">Analitika</span>
            </div>
            <p className="text-sm text-muted">
              AI analizira statistiku, ti donosiš odluke. Klađenje nosi rizik — igraj odgovorno.
            </p>
          </div>

          {/* Column 2: Linkovi */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Linkovi</h3>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <Link to="/picks" className="transition-colors duration-200 hover:text-accent">🎯 Pikovi</Link>
              <Link to="/history" className="transition-colors duration-200 hover:text-accent">📊 Rezultati</Link>
              <Link to="/pricing" className="transition-colors duration-200 hover:text-accent">💎 Premium</Link>
              <Link to="/how-to-use" className="transition-colors duration-200 hover:text-accent">📖 Vodič</Link>
            </div>
          </div>

          {/* Column 3: Podrška */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Podrška</h3>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <Link to="/contact" className="transition-colors duration-200 hover:text-accent">✉️ Kontakt</Link>
              <Link to="/how-to-pay" className="transition-colors duration-200 hover:text-accent">Kako platiti</Link>
              <Link to="/terms" className="transition-colors duration-200 hover:text-accent">Uslovi korišćenja</Link>
              <Link to="/terms#privacy" className="transition-colors duration-200 hover:text-accent">Politika privatnosti</Link>
            </div>
          </div>

          {/* Column 4: Kontakt */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Kontakt</h3>
            <a href="mailto:support@betanalitika.rs" className="flex items-center gap-2 text-sm text-accent transition-colors duration-200 hover:text-accent-dim">
              <Mail className="h-4 w-4" />
              support@betanalitika.rs
            </a>
            <p className="mt-3 text-xs text-muted">Odgovaramo u roku od 24h</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 space-y-4 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-2 text-xs text-muted max-w-lg mx-auto">
            ⚠️ Klađenje nosi rizik. BetAnalitika pruža AI analizu i ne snosi odgovornost za finansijske gubitke. 18+
          </div>
          <p className="text-xs text-muted/60">
            © 2026 BetAnalitika. Sva prava zadržana. Klađenje je zabava, ne izvor prihoda. Igraj odgovorno.
          </p>
        </div>
      </div>
    </footer>
  )
}
