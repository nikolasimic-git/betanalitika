import { PickStats } from '../types'
import { TrendingUp, Target, Percent, Flame, Info } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  stats: PickStats
}

const DEMO_STATS: PickStats = {
  totalPicks: 847,
  won: 645,
  lost: 202,
  pending: 0,
  winRate: 76.2,
  roi: 31.4,
  currentStreak: 8,
  streakType: 'W',
}

export default function StatsBar({ stats }: Props) {
  const { t } = useLanguage()
  const isDemo = stats.totalPicks === 0
  const s = isDemo ? DEMO_STATS : stats

  const winRateColor = s.winRate > 70 ? 'text-accent' : 'text-white'
  const roiColor = s.roi > 0 ? 'text-accent' : 'text-danger'

  return (
    <div className="relative">
      {isDemo && (
        <div className="mb-2 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Info className="h-3.5 w-3.5" />
          <span>{t('stats.demo')}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="animate-scale-in stagger-1 rounded-xl border border-border bg-card p-3 text-center transition-colors duration-300 hover:border-accent/30 sm:p-4">
          <Target className="mx-auto mb-1 h-5 w-5 text-accent" />
          <p className="animate-count-up text-xl font-bold sm:text-2xl">{s.totalPicks}</p>
          <p className="text-xs text-muted">{t('stats.total')}</p>
        </div>
        <div className="animate-scale-in stagger-2 rounded-xl border border-border bg-card p-3 text-center transition-colors duration-300 hover:border-accent/30 sm:p-4">
          <Percent className="mx-auto mb-1 h-5 w-5 text-accent" />
          <p className={`animate-count-up text-xl font-bold sm:text-2xl ${winRateColor}`}>{s.winRate}%</p>
          <p className="text-xs text-muted">{t('stats.winrate')}</p>
        </div>
        <div className="animate-scale-in stagger-3 rounded-xl border border-border bg-card p-3 text-center transition-colors duration-300 hover:border-accent/30 sm:p-4">
          <TrendingUp className="mx-auto mb-1 h-5 w-5 text-gold" />
          <p className={`animate-count-up text-xl font-bold sm:text-2xl ${roiColor}`}>+{s.roi}%</p>
          <p className="text-xs text-muted">{t('stats.roi')}</p>
        </div>
        <div className="animate-scale-in stagger-4 rounded-xl border border-border bg-card p-3 text-center transition-colors duration-300 hover:border-accent/30 sm:p-4">
          <Flame className="mx-auto mb-1 h-5 w-5 text-danger" />
          <p className="animate-count-up text-xl font-bold sm:text-2xl">
            {s.currentStreak}{s.streakType}
          </p>
          <p className="text-xs text-muted">{t('stats.streak')}</p>
        </div>
      </div>
    </div>
  )
}
