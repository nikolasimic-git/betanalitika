import { TrendingUp } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-darker mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-accent" />
            Bet<span className="text-accent">Analitika</span>
          </div>
          <p className="max-w-md text-sm text-muted">
            AI analizira statistiku, ti donosiš odluke. Klađenje nosi rizik — igraj odgovorno.
          </p>
          <div className="flex gap-6 text-xs text-muted">
            <span>18+</span>
            <span>·</span>
            <a href="#" className="hover:text-white">Uslovi korišćenja</a>
            <span>·</span>
            <a href="#" className="hover:text-white">Politika privatnosti</a>
          </div>
          <p className="text-xs text-muted/60">
            © 2026 BetAnalitika. Sva prava zadržana. Klađenje je zabava, ne izvor prihoda. Igraj odgovorno.
          </p>
        </div>
      </div>
    </footer>
  )
}
