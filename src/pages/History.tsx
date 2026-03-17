import { useEffect, useState } from 'react'
import PickCard from '../components/PickCard'
import StatsBar from '../components/StatsBar'
import { fetchHistory, fetchStats } from '../api'
import { Pick, PickStats } from '../types'
import { History as HistoryIcon, Loader2, ChevronDown, Inbox, Crown } from 'lucide-react'
import { useAuth } from '../auth'
import { Link } from 'react-router-dom'

export default function History() {
  const { isPremium } = useAuth()
  const [picks, setPicks] = useState<Pick[]>([])
  const [stats, setStats] = useState<PickStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all')

  useEffect(() => {
    loadData()
  }, [page, isPremium])

  async function loadData() {
    setLoading(true)
    try {
      const maxDays = isPremium ? undefined : 3
      const [histData, statsData] = await Promise.all([
        fetchHistory(page, 30, 'all', maxDays),
        fetchStats(),
      ])
      if (page === 1) {
        setPicks(histData.picks)
      } else {
        setPicks(prev => [...prev, ...histData.picks])
      }
      setTotalPages(histData.totalPages)
      setTotal(histData.total)
      setStats(statsData)
    } catch (e) {
      console.error('Failed to load history:', e)
    } finally {
      setLoading(false)
    }
  }

  const filteredPicks = filter === 'all' 
    ? picks 
    : picks.filter(p => p.result === filter)

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <HistoryIcon className="h-7 w-7 text-accent" />
          Track Record
        </h1>
        <p className="mt-1 text-muted">
          Transparentni rezultati svih naših pikova. Svaki pik se prati i verifikuje automatski.
        </p>
      </div>

      {!isPremium && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted">
            📊 Besplatni korisnici vide rezultate za poslednja 3 dana. Upgrade na Premium za kompletnu istoriju.
          </p>
          <Link to="/pricing" className="rounded-lg bg-gold/20 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/30 transition-colors whitespace-nowrap">
            <Crown className="inline h-3.5 w-3.5 mr-1" /> Upgrade
          </Link>
        </div>
      )}

      {stats && <StatsBar stats={stats} />}

      {/* Filters */}
      <div className="mt-6 flex gap-2">
        {(['all', 'won', 'lost'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? f === 'won' ? 'bg-accent/10 text-accent' 
                  : f === 'lost' ? 'bg-danger/10 text-danger'
                  : 'bg-card text-white'
                : 'text-muted hover:text-white'
            }`}
          >
            {f === 'all' ? `Svi (${total})` : f === 'won' ? `✅ Pogodci (${stats?.won || 0})` : `❌ Promašaji (${stats?.lost || 0})`}
          </button>
        ))}
      </div>

      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4">
            {filteredPicks.length === 0 && !loading ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Inbox className="mx-auto h-12 w-12 text-muted/40 mb-4" />
                <p className="text-lg font-semibold">Još nema završenih pikova</p>
                <p className="mt-2 text-sm text-muted">Rezultati se automatski ažuriraju nakon završetka utakmica.</p>
              </div>
            ) : (
              filteredPicks.map((pick) => (
                <PickCard key={pick.id} pick={pick} />
              ))
            )}
          </div>

          {page < totalPages && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted transition-colors hover:text-white hover:border-muted disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                Učitaj još
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
