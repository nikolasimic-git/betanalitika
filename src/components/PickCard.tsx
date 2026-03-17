import { Pick } from '../types'
import { Lock, Star, ExternalLink, Check, X, Clock } from 'lucide-react'

interface Props {
  pick: Pick
  locked?: boolean
  index?: number
}

export default function PickCard({ pick, locked = false, index = 0 }: Props) {
  const staggerClass = index < 10 ? `stagger-${index + 1}` : ''

  const resultIcon = {
    pending: <Clock className="h-4 w-4 text-muted" />,
    won: <Check className="h-4 w-4 text-accent" />,
    lost: <X className="h-4 w-4 text-danger" />,
  }

  const resultBorder = {
    pending: 'border-border',
    won: 'border-accent/30',
    lost: 'border-danger/30',
  }

  if (locked) {
    return (
      <div className={`animate-fade-in-up ${staggerClass} group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-accent/5`}>
        <div className="animate-shimmer absolute inset-0 flex flex-col items-center justify-center bg-card/95 backdrop-blur-sm z-10">
          <Lock className="h-8 w-8 text-gold mb-2" />
          <p className="text-sm font-medium text-muted">Premium pik</p>
          <a
            href="/pricing"
            className="mt-2 rounded-lg bg-gold/20 px-4 py-1.5 text-xs font-semibold text-gold hover:bg-gold/30 transition-colors"
          >
            Otključaj →
          </a>
        </div>
        {/* Blurred content */}
        <div className="blur-sm select-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">{pick.leagueFlag} {pick.league}</span>
            <span className="text-xs text-muted">{pick.kickOff}</span>
          </div>
          <p className="text-lg font-bold">████ vs ████</p>
          <p className="mt-2 text-sm text-muted">██████████████</p>
        </div>
      </div>
    )
  }

  if (pick.isSigurica) {
    return (
      <div className={`animate-fade-in-up ${staggerClass} animate-pulse-glow-gold group rounded-xl border-2 border-gold bg-gradient-to-br from-gold/10 via-card to-card p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-gold/5 relative overflow-hidden`}>
        {/* Sigurica Badge */}
        <div className="mb-4 rounded-lg bg-gold/15 px-4 py-2.5 border border-gold/30">
          <p className="text-sm font-bold text-gold">🎯 SIGURICA — 90%+ prolaznost</p>
          <p className="text-xs text-muted mt-0.5">Naš AI model procenjuje prolaznost od 90%+ za ovaj pik</p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">{pick.leagueFlag}</span>
            <span className="text-xs font-medium text-muted">{pick.league}</span>
          </div>
          <div className="flex items-center gap-2">
            {resultIcon[pick.result]}
            <span className="text-xs text-muted">{pick.kickOff}</span>
          </div>
        </div>

        {/* Teams */}
        <p className="text-lg font-bold">
          {pick.homeTeam} <span className="text-muted font-normal">vs</span> {pick.awayTeam}
        </p>

        {/* Prediction */}
        <div className="mt-3 flex items-center gap-3">
          <span className="rounded-lg bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">
            {pick.predictionType}: {pick.predictionValue}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold transition-colors duration-200" />
            ))}
          </div>
        </div>

        {/* Reasoning */}
        <p className="mt-3 text-sm leading-relaxed text-muted">{pick.reasoning}</p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pick.odds > 0 && <span className="text-2xl font-bold text-white">{pick.odds.toFixed(2)}</span>}
            <span className="text-xs text-muted">@ {pick.bookmaker}</span>
          </div>
          <a
            href={pick.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-darker transition-transform duration-200 hover:scale-105 hover:bg-gold/90"
          >
            Odigraj <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`animate-fade-in-up ${staggerClass} group rounded-xl border ${resultBorder[pick.result]} bg-card p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-accent/5 hover:bg-card-hover`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{pick.leagueFlag}</span>
          <span className="text-xs font-medium text-muted">{pick.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {resultIcon[pick.result]}
          <span className="text-xs text-muted">{pick.kickOff}</span>
        </div>
      </div>

      {/* Teams */}
      <p className="text-lg font-bold">
        {pick.homeTeam} <span className="text-muted font-normal">vs</span> {pick.awayTeam}
      </p>

      {/* Prediction */}
      <div className="mt-3 flex items-center gap-3">
        <span className="rounded-lg bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
          {pick.predictionType}: {pick.predictionValue}
        </span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 transition-colors duration-200 ${
                i < pick.confidence ? 'fill-gold text-gold' : 'text-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <p className="mt-3 text-sm leading-relaxed text-muted">{pick.reasoning}</p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {pick.odds > 0 && <span className="text-2xl font-bold text-white">{pick.odds.toFixed(2)}</span>}
          <span className="text-xs text-muted">@ {pick.bookmaker}</span>
        </div>
        <a
          href={pick.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-darker transition-transform duration-200 hover:scale-105 hover:bg-accent-dim"
        >
          Odigraj <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
