import { PickStats } from '../types'
import { TrendingUp, Target, Percent, Flame } from 'lucide-react'

interface Props {
  stats: PickStats
}

export default function StatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <Target className="mx-auto mb-1 h-5 w-5 text-accent" />
        <p className="text-2xl font-bold">{stats.totalPicks}</p>
        <p className="text-xs text-muted">Ukupno pikova</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <Percent className="mx-auto mb-1 h-5 w-5 text-accent" />
        <p className="text-2xl font-bold text-accent">{stats.winRate}%</p>
        <p className="text-xs text-muted">Win Rate</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <TrendingUp className="mx-auto mb-1 h-5 w-5 text-gold" />
        <p className="text-2xl font-bold text-gold">+{stats.roi}%</p>
        <p className="text-xs text-muted">ROI</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <Flame className="mx-auto mb-1 h-5 w-5 text-danger" />
        <p className="text-2xl font-bold">
          {stats.currentStreak}{stats.streakType}
        </p>
        <p className="text-xs text-muted">Streak</p>
      </div>
    </div>
  )
}
