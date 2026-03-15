import { useEffect, useState } from 'react'
import PickCard from '../components/PickCard'
import StatsBar from '../components/StatsBar'
import SportFilter from '../components/SportFilter'
import { fetchTodayPicks, fetchStats } from '../api'
import { useAuth } from '../auth'
import { Pick, PickStats } from '../types'
import { CalendarDays, RefreshCw, Loader2, AlertCircle } from 'lucide-react'

export default function Picks() {
  const { token } = useAuth()
  const [picks, setPicks] = useState<(Pick & { locked?: boolean })[]>([])
  const [stats, setStats] = useState<PickStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('all')
  const [message, setMessage] = useState('')

  const today = new Date().toLocaleDateString('sr-Latn-RS', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => { loadData() }, [token, sport])

  async function loadData() {
    setLoading(true)
    try {
      const [picksData, statsData] = await Promise.all([
        fetchTodayPicks(token, sport),
        fetchStats(sport),
      ])
      setPicks(picksData.picks || [])
      setMessage(picksData.message || '')
      setStats(statsData)
    } catch (e) {
      console.error('Failed to load picks:', e)
    } finally {
      setLoading(false)
    }
  }

  const freePicks = picks.filter((p) => p.isFree)
  const premiumPicks = picks.filter((p) => !p.isFree)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-3 text-muted">Učitavam pikove...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted mb-1">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm capitalize">{today}</span>
          </div>
          <h1 className="text-3xl font-bold">Današnji pikovi</h1>
        </div>
        <button onClick={loadData} className="mt-2 rounded-lg border border-border p-2 text-muted hover:text-white">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Sport Filter */}
      <SportFilter value={sport} onChange={setSport} />

      {/* Stats */}
      {stats && <div className="mt-4"><StatsBar stats={stats} /></div>}

      {/* No picks message */}
      {picks.length === 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted mb-3" />
          <p className="text-lg font-medium">
            {message || 'Nema pikova za danas'}
          </p>
          <p className="mt-1 text-sm text-muted">
            Pikovi se generišu svakog dana ujutru. Vrati se kasnije!
          </p>
        </div>
      )}

      {/* Free picks */}
      {freePicks.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            🆓 Besplatni pikovi
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {freePicks.length}
            </span>
          </h2>
          <div className="grid gap-4">
            {freePicks.map((pick) => (
              <PickCard key={pick.id} pick={pick} />
            ))}
          </div>
        </div>
      )}

      {/* Premium picks */}
      {premiumPicks.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            💎 Premium pikovi
            <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
              {premiumPicks.length}
            </span>
          </h2>
          <div className="grid gap-4">
            {premiumPicks.map((pick) => (
              <PickCard key={pick.id} pick={pick} locked={pick.locked} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
