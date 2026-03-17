import { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { adminDashboard, adminGetPicks, adminSetResult, adminDeletePick, adminAddPick } from '../api'
import { Shield, Check, X, Trash2, Loader2, RefreshCw, Plus } from 'lucide-react'
import { Pick } from '../types'

function AddPickModal({ onAdd, onClose }: { onAdd: (pick: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    sport: 'football',
    league: '',
    leagueFlag: '⚽',
    homeTeam: '',
    awayTeam: '',
    kickOff: '',
    predictionType: '',
    predictionValue: '',
    confidence: 4,
    reasoning: '',
    odds: 1.80,
    bookmaker: 'Mozzart',
    isFree: false,
    isSigurica: false,
    matchDate: new Date().toISOString().split('T')[0],
  })

  const sportEmojis: Record<string, string> = { football: '⚽', nba: '🏀', tennis: '🎾' }
  const sportLeagues: Record<string, string[]> = {
    football: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Europa League', 'Superliga Srbije'],
    nba: ['NBA'],
    tennis: ['ATP — Indian Wells', 'ATP — Miami Open', 'WTA — Indian Wells', 'WTA — Miami Open', 'ATP — Roland Garros', 'ATP — Wimbledon'],
  }
  const predTypes: Record<string, string[]> = {
    football: ['Pobednik', 'Oba tima daju gol', 'Ukupno golova', 'Dupla šansa', 'Pobednik + BTTS'],
    nba: ['Pobednik', 'Ukupno poena', 'Hendikep'],
    tennis: ['Pobednik meča', 'Ukupno setova', 'Ukupno gemova'],
  }

  function handleSportChange(sport: string) {
    setForm({ ...form, sport, leagueFlag: sportEmojis[sport] || '⚽', league: sportLeagues[sport]?.[0] || '' })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">➕ Dodaj pik</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Sport */}
          <div>
            <label className="block text-xs text-muted mb-1">Sport</label>
            <select value={form.sport} onChange={e => handleSportChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              <option value="football">⚽ Fudbal</option>
              <option value="nba">🏀 NBA</option>
              <option value="tennis">🎾 Tenis</option>
            </select>
          </div>

          {/* Liga */}
          <div>
            <label className="block text-xs text-muted mb-1">Liga / Turnir</label>
            <select value={form.league} onChange={e => setForm({...form, league: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              {(sportLeagues[form.sport] || []).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs text-muted mb-1">Datum</label>
            <input type="date" value={form.matchDate} onChange={e => setForm({...form, matchDate: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" />
          </div>

          {/* Kick off */}
          <div>
            <label className="block text-xs text-muted mb-1">Vreme</label>
            <input type="time" value={form.kickOff} onChange={e => setForm({...form, kickOff: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" />
          </div>

          {/* Home */}
          <div>
            <label className="block text-xs text-muted mb-1">{form.sport === 'tennis' ? 'Igrač 1' : 'Domaćin'}</label>
            <input required value={form.homeTeam} onChange={e => setForm({...form, homeTeam: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white"
              placeholder={form.sport === 'tennis' ? 'Đoković' : 'Arsenal'} />
          </div>

          {/* Away */}
          <div>
            <label className="block text-xs text-muted mb-1">{form.sport === 'tennis' ? 'Igrač 2' : 'Gost'}</label>
            <input required value={form.awayTeam} onChange={e => setForm({...form, awayTeam: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white"
              placeholder={form.sport === 'tennis' ? 'Alcaraz' : 'Chelsea'} />
          </div>

          {/* Prediction Type */}
          <div>
            <label className="block text-xs text-muted mb-1">Tip predikcije</label>
            <select value={form.predictionType} onChange={e => setForm({...form, predictionType: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              <option value="">Izaberi...</option>
              {(predTypes[form.sport] || []).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Prediction Value */}
          <div>
            <label className="block text-xs text-muted mb-1">Vrednost</label>
            <input required value={form.predictionValue} onChange={e => setForm({...form, predictionValue: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white"
              placeholder="1 (Arsenal), Over 2.5, DA..." />
          </div>

          {/* Odds */}
          <div>
            <label className="block text-xs text-muted mb-1">Kvota</label>
            <input type="number" step="0.01" min="1" required value={form.odds}
              onChange={e => setForm({...form, odds: parseFloat(e.target.value)})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" />
          </div>

          {/* Confidence */}
          <div>
            <label className="block text-xs text-muted mb-1">Confidence (1-5)</label>
            <select value={form.confidence} onChange={e => setForm({...form, confidence: parseInt(e.target.value)})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
            </select>
          </div>

          {/* Bookmaker */}
          <div>
            <label className="block text-xs text-muted mb-1">Kladionica</label>
            <select value={form.bookmaker} onChange={e => setForm({...form, bookmaker: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              {['Mozzart', 'Meridian', 'MaxBet', 'Soccer', 'Volcano'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Free */}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isFree} onChange={e => setForm({...form, isFree: e.target.checked})}
              className="rounded border-border" />
            <label className="text-sm text-muted">Besplatan pik</label>
          </div>

          {/* Sigurica */}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isSigurica} onChange={e => setForm({...form, isSigurica: e.target.checked})}
              className="rounded border-border" />
            <label className="text-sm text-gold">🎯 Super Pik</label>
          </div>
        </div>

        {/* Reasoning */}
        <div className="mt-3">
          <label className="block text-xs text-muted mb-1">Obrazloženje (srpski)</label>
          <textarea required value={form.reasoning} onChange={e => setForm({...form, reasoning: e.target.value})}
            rows={3}
            className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white"
            placeholder="Obrazloži zašto je ovo dobar pik..." />
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-white">
            Otkaži
          </button>
          <button type="submit"
            className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-darker hover:bg-accent-dim">
            Dodaj pik
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Admin() {
  const { token, isAdmin } = useAuth()
  const [dash, setDash] = useState<any>(null)
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { loadData() }, [dateFilter])

  async function loadData() {
    if (!token) return
    setLoading(true)
    try {
      const [d, p] = await Promise.all([
        adminDashboard(token),
        adminGetPicks(token, dateFilter),
      ])
      setDash(d)
      setPicks(p.picks)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function setResult(id: string, result: string) {
    if (!token) return
    await adminSetResult(token, id, result)
    loadData()
  }

  async function deletePick(id: string) {
    if (!token || !confirm('Obriši ovaj pik?')) return
    await adminDeletePick(token, id)
    loadData()
  }

  async function handleAddPick(pick: any) {
    if (!token) return
    await adminAddPick(token, pick)
    setShowAdd(false)
    loadData()
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-danger mb-4" />
        <h1 className="text-2xl font-bold">Pristup odbijen</h1>
        <p className="text-muted mt-2">Samo administratori mogu pristupiti ovoj stranici.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Shield className="h-6 w-6 text-accent" /> Admin Panel
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-darker hover:bg-accent-dim">
            <Plus className="h-4 w-4" /> Dodaj pik
          </button>
          <button onClick={loadData} className="rounded-lg border border-border p-2 text-muted hover:text-white">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showAdd && <AddPickModal onAdd={handleAddPick} onClose={() => setShowAdd(false)} />}

      {/* Dashboard Stats */}
      {dash && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Ukupno pikova', value: dash.totalPicks },
            { label: 'Danas', value: dash.todayPicks },
            { label: 'Pending', value: dash.pendingPicks },
            { label: 'Korisnici', value: dash.totalUsers },
            { label: 'Premium', value: dash.premiumUsers },
            { label: 'Generisano', value: dash.lastGenerated || 'Nikad' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Date Filter */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-muted">Datum:</label>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" />
        <button onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
          className="text-xs text-accent hover:underline">Danas</button>
        <button onClick={() => {
          const t = new Date(); t.setDate(t.getDate()+1);
          setDateFilter(t.toISOString().split('T')[0])
        }} className="text-xs text-accent hover:underline">Sutra</button>
      </div>

      {/* Picks Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-3 py-2">Sport</th>
                <th className="px-3 py-2">Liga</th>
                <th className="px-3 py-2">Meč</th>
                <th className="px-3 py-2">Tip</th>
                <th className="px-3 py-2">Kvota</th>
                <th className="px-3 py-2">Conf</th>
                <th className="px-3 py-2">Free</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {picks.map(pick => (
                <tr key={pick.id} className="border-b border-border/50 hover:bg-card">
                  <td className="px-3 py-2">{pick.leagueFlag}</td>
                  <td className="px-3 py-2 text-xs max-w-[120px] truncate">{pick.league}</td>
                  <td className="px-3 py-2">
                    <span className="font-medium">{pick.homeTeam}</span>
                    <span className="text-muted"> vs </span>
                    <span className="font-medium">{pick.awayTeam}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-accent text-xs">{pick.predictionType}: {pick.predictionValue}</span>
                  </td>
                  <td className="px-3 py-2 font-bold">{pick.odds}</td>
                  <td className="px-3 py-2">{'⭐'.repeat(pick.confidence)}</td>
                  <td className="px-3 py-2">{pick.isFree ? '🆓' : '💎'}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      pick.result === 'won' ? 'bg-accent/10 text-accent' :
                      pick.result === 'lost' ? 'bg-danger/10 text-danger' : 'bg-card text-muted'
                    }`}>
                      {pick.result === 'won' ? '✅' : pick.result === 'lost' ? '❌' : '⏳'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {pick.result === 'pending' && (
                        <>
                          <button onClick={() => setResult(pick.id, 'won')}
                            className="rounded bg-accent/10 p-1 text-accent hover:bg-accent/20" title="Pogodak">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setResult(pick.id, 'lost')}
                            className="rounded bg-danger/10 p-1 text-danger hover:bg-danger/20" title="Promašaj">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => deletePick(pick.id)}
                        className="rounded bg-card p-1 text-muted hover:text-danger" title="Obriši">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {picks.length === 0 && <p className="py-8 text-center text-muted">Nema pikova za ovaj datum.</p>}
        </div>
      )}
    </div>
  )
}
