import { Pick } from '../types'
import { Lock, Star, Check, X, Clock } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Translation maps for prediction_type and prediction_value (Serbian → English)
const predictionTypeMap: Record<string, string> = {
  'Pobednik': 'Winner',
  'Ukupno poena': 'Total points',
  'Oba tima daju gol': 'Both teams to score',
}

const predictionValueMap: Record<string, string> = {
  'DA': 'Yes',
  'NE': 'No',
}

function translatePrediction(type: string, value: string, lang: string): { type: string; value: string } {
  if (lang !== 'en') return { type, value }
  return {
    type: predictionTypeMap[type] || type,
    value: predictionValueMap[value] || value,
  }
}

interface Props {
  pick: Pick
  locked?: boolean
  index?: number
}

export default function PickCard({ pick, locked = false, index = 0 }: Props) {
  const { t, lang } = useLanguage()
  const reasoning = lang === 'en' && pick.reasoningEn ? pick.reasoningEn : pick.reasoning
  const { type: pType, value: pValue } = translatePrediction(pick.predictionType, pick.predictionValue, lang)
  const staggerClass = index < 10 ? `stagger-${index + 1}` : ''

  const resultIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4 text-muted" />,
    won: <Check className="h-4 w-4 text-accent" />,
    lost: <X className="h-4 w-4 text-danger" />,
    void: <Clock className="h-4 w-4 text-gray-400" />,
  }

  const resultBorder: Record<string, string> = {
    pending: 'border-border',
    won: 'border-accent/30',
    lost: 'border-danger/30',
    void: 'border-gray-500/30',
  }

  if (locked) {
    return (
      <div className={`animate-fade-in-up ${staggerClass} group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-accent/5 sm:p-5`}>
        <div className="animate-shimmer absolute inset-0 flex flex-col items-center justify-center bg-card/95 backdrop-blur-sm z-10">
          <Lock className="h-8 w-8 text-gold mb-2" />
          <p className="text-sm font-medium text-muted">{t('pick.premium')}</p>
          <a
            href="/pricing"
            className="mt-2 rounded-lg bg-gold/20 px-4 py-1.5 text-xs font-semibold text-gold hover:bg-gold/30 transition-colors"
          >
            {t('pick.unlock')}
          </a>
        </div>
        <div className="blur-sm select-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">{pick.leagueFlag} {pick.league}</span>
            <span className="text-xs text-muted">{pick.kickOff}</span>
          </div>
          <p className="text-base font-bold sm:text-lg">████ vs ████</p>
          <p className="mt-2 text-sm text-muted">██████████████</p>
        </div>
      </div>
    )
  }

  if (pick.isSigurica) {
    return (
      <div className={`animate-fade-in-up ${staggerClass} animate-pulse-glow-gold group rounded-xl border-2 border-gold bg-gradient-to-br from-gold/10 via-card to-card p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-gold/5 relative overflow-hidden sm:p-5`}>
        <div className="mb-4 rounded-lg bg-gold/15 px-3 py-2 border border-gold/30 sm:px-4 sm:py-2.5">
          <p className="text-sm font-bold text-gold">{t('pick.sigurica')}</p>
          <p className="text-xs text-muted mt-0.5">{t('pick.sigurica.sub')}</p>
        </div>

        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{pick.leagueFlag}</span>
            <span className="text-xs font-medium text-muted">{pick.league}</span>
          </div>
          <div className="flex items-center gap-2">
            {resultIcon[pick.result]}
            <span className="text-xs text-muted">{pick.kickOff}</span>
          </div>
        </div>

        <p className="text-base font-bold sm:text-lg">
          {pick.homeTeam} <span className="text-muted font-normal">vs</span> {pick.awayTeam}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">
            {pType}: {pValue}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold transition-colors duration-200" />
            ))}
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{reasoning}</p>

        <div className="mt-4 flex items-center gap-2">
          {pick.odds > 0 && <span className="text-xl font-bold text-white sm:text-2xl">{pick.odds.toFixed(2)}</span>}
          <span className="text-xs text-muted">@ BetAnalitika</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`animate-fade-in-up ${staggerClass} group rounded-xl border ${resultBorder[pick.result]} bg-card p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-accent/5 hover:bg-card-hover sm:p-5`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{pick.leagueFlag}</span>
          <span className="text-xs font-medium text-muted">{pick.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {resultIcon[pick.result]}
          <span className="text-xs text-muted">{pick.kickOff}</span>
        </div>
      </div>

      <p className="text-base font-bold sm:text-lg">
        {pick.homeTeam} <span className="text-muted font-normal">vs</span> {pick.awayTeam}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="rounded-lg bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
          {pType}: {pValue}
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

      <p className="mt-3 text-sm leading-relaxed text-muted">{reasoning}</p>

      <div className="mt-4 flex items-center gap-2">
        {pick.odds > 0 && <span className="text-xl font-bold text-white sm:text-2xl">{pick.odds.toFixed(2)}</span>}
        <span className="text-xs text-muted">@ BetAnalitika</span>
      </div>
    </div>
  )
}
