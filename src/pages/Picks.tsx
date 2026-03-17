import { useEffect, useState } from 'react'
import PickCard from '../components/PickCard'
import StatsBar from '../components/StatsBar'
import SportFilter from '../components/SportFilter'
import { fetchTodayPicks, fetchStats } from '../api'
import { useAuth } from '../auth'
import { Pick, PickStats } from '../types'
import { CalendarDays, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import AdBanner from '../components/AdBanner'
import AdSidebar from '../components/AdSidebar'
import PickCardSkeleton from '../components/PickCardSkeleton'

export default function Picks() {
  const { token, isPremium } = useAuth()
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

  const freePicks = picks.filter((p) => p.isFree && !p.isSigurica)
  const siguricaPick = picks.filter((p) => p.isSigurica)
  const premiumPicks = picks.filter((p) => !p.isFree && !p.isSigurica)

  if (loading) {
    return (
      <div className="animate-fade-in mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <div className="h-4 w-40 rounded bg-card animate-shimmer mb-2" />
          <div className="h-8 w-60 rounded bg-card animate-shimmer" />
        </div>
        <div className="grid gap-4">
          <PickCardSkeleton />
          <PickCardSkeleton />
          <PickCardSkeleton />
          <PickCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted mb-1">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm capitalize">{today}</span>
          </div>
          <h1 className="text-3xl font-bold">Današnji pikovi</h1>
        </div>
        <button onClick={loadData} className="mt-2 rounded-lg border border-border p-2 text-muted hover:text-white" title="Osveži pikove">
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

      <div className={`mt-6 ${!isPremium ? 'lg:flex lg:gap-6' : ''}`}>
        <div className={!isPremium ? 'lg:flex-1 min-w-0' : ''}>
          {/* Free picks */}
          {freePicks.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                🆓 Besplatni pikovi
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {freePicks.length}
                </span>
              </h2>
              <div className="grid gap-4">
                {freePicks.map((pick, i) => (
                  <div key={pick.id}>
                    <PickCard pick={pick} index={i} />
                    {!isPremium && (i + 1) % 2 === 0 && i < freePicks.length - 1 && (
                      <div className="mt-4"><AdBanner /></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Premium pikovi (Super Pik + ostali premium) */}
          {(siguricaPick.length > 0 || premiumPicks.length > 0) && (
            <div className="mt-10">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                💎 Premium pikovi
                <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                  {siguricaPick.length + premiumPicks.length}
                </span>
              </h2>

              {/* Super Pik na vrhu premium sekcije */}
              {siguricaPick.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                    🎯 Super Pik — Naš najsigurniji izbor
                    <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                      90%+ prolaznost
                    </span>
                  </h3>
                  <div className="grid gap-4">
                    {siguricaPick.map((pick, i) => (
                      <PickCard key={pick.id} pick={pick} locked={pick.locked} index={i} />
                    ))}
                  </div>
                  {!isPremium && siguricaPick[0]?.locked && (
                    <div className="mt-4 rounded-xl border-2 border-gold/30 bg-gold/5 p-6 text-center">
                      <p className="text-gold font-semibold">🔒 Otključaj Super Pik sa Premium planom</p>
                      <p className="text-sm text-muted mt-1">Naš najsigurniji dnevni pik sa 90%+ prolaznosti</p>
                      <a href="/pricing" className="mt-3 inline-block rounded-lg bg-gold px-6 py-2 text-sm font-bold text-darker hover:bg-gold/90">
                        Upgrade na Premium →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Ostali premium pikovi */}
              {premiumPicks.length > 0 && (
                <div className="grid gap-4">
                  {premiumPicks.map((pick, i) => (
                    <div key={pick.id}>
                      <PickCard pick={pick} locked={pick.locked} index={i} />
                      {!isPremium && (i + 1) % 2 === 0 && i < premiumPicks.length - 1 && (
                        <div className="mt-4"><AdBanner /></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ad Sidebar - free users only, desktop */}
        {!isPremium && <div className="lg:w-[280px] lg:shrink-0 mt-6 lg:mt-0"><AdSidebar /></div>}
      </div>
    </div>
  )
}
