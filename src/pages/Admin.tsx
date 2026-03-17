import { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import {
  adminDashboard, adminGetPicks, adminSetResult, adminDeletePick,
  adminAddPick, adminUpdatePick, adminGetUsers, adminUpdateUser,
  adminDeleteUser, adminBulkResult,
} from '../api'
import {
  Shield, Check, X, Trash2, Loader2, RefreshCw, Plus, Users,
  BarChart3, ClipboardList, Search, Crown, DollarSign, TrendingUp,
  Calendar, Edit2,
} from 'lucide-react'
import { Pick } from '../types'

/* ═══════════════════════════════════════════
   ADD / EDIT PICK MODAL
   ═══════════════════════════════════════════ */

function PickModal({ initial, onSave, onClose }: {
  initial?: any; onSave: (pick: any) => void; onClose: () => void
}) {
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
    ...(initial || {}),
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
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">{initial ? '✏️ Izmeni pik' : '➕ Dodaj pik'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Sport</label>
            <select value={form.sport} onChange={e => handleSportChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              <option value="football">⚽ Fudbal</option>
              <option value="nba">🏀 NBA</option>
              <option value="tennis">🎾 Tenis</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Liga / Turnir</label>
            <select value={form.league} onChange={e => setForm({...form, league: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              {(sportLeagues[form.sport] || []).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Datum</label>
            <input type="date" value={form.matchDate} onChange={e => setForm({...form, matchDate: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Vreme</label>
            <input type="time" value={form.kickOff} onChange={e => setForm({...form, kickOff: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{form.sport === 'tennis' ? 'Igrač 1' : 'Domaćin'}</label>
            <input required value={form.homeTeam} onChange={e => setForm({...form, homeTeam: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white"
              placeholder={form.sport === 'tennis' ? 'Đoković' : 'Arsenal'} />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">{form.sport === 'tennis' ? 'Igrač 2' : 'Gost'}</label>
            <input required value={form.awayTeam} onChange={e => setForm({...form, awayTeam: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white"
              placeholder={form.sport === 'tennis' ? 'Alcaraz' : 'Chelsea'} />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Tip predikcije</label>
            <select value={form.predictionType} onChange={e => setForm({...form, predictionType: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              <option value="">Izaberi...</option>
              {(predTypes[form.sport] || []).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Vrednost</label>
            <input required value={form.predictionValue} onChange={e => setForm({...form, predictionValue: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white"
              placeholder="1 (Arsenal), Over 2.5, DA..." />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Kvota</label>
            <input type="number" step="0.01" min="1" required value={form.odds}
              onChange={e => setForm({...form, odds: parseFloat(e.target.value)})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Confidence (1-5)</label>
            <select value={form.confidence} onChange={e => setForm({...form, confidence: parseInt(e.target.value)})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Kladionica</label>
            <select value={form.bookmaker} onChange={e => setForm({...form, bookmaker: e.target.value})}
              className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              {['Mozzart', 'Meridian', 'MaxBet', 'Soccer', 'Volcano'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isFree} onChange={e => setForm({...form, isFree: e.target.checked})}
              className="rounded border-border" />
            <label className="text-sm text-muted">Besplatan pik</label>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={form.isSigurica} onChange={e => setForm({...form, isSigurica: e.target.checked})}
              className="rounded border-border" />
            <label className="text-sm text-gold font-semibold">🎯 Super Pik (Sigurica)</label>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-muted mb-1">Obrazloženje (srpski)</label>
          <textarea required value={form.reasoning} onChange={e => setForm({...form, reasoning: e.target.value})}
            rows={3}
            className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white"
            placeholder="Obrazloži zašto je ovo dobar pik..." />
        </div>
        <div className="mt-4 flex gap-3 justify-end">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-white">Otkaži</button>
          <button type="submit"
            className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-darker hover:bg-accent-dim">
            {initial ? 'Sačuvaj' : 'Dodaj pik'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
function StatCard({ icon, label, value, color = 'text-white' }: {
  icon: React.ReactNode; label: string; value: string | number; color?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className="rounded-lg bg-darker p-2.5">{icon}</div>
      <div>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   TAB: DASHBOARD
   ═══════════════════════════════════════════ */
function DashboardTab({ dash }: { dash: any }) {
  if (!dash) return null
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard icon={<Users className="h-5 w-5 text-blue-400" />} label="Ukupno korisnika" value={dash.totalUsers} />
      <StatCard icon={<Crown className="h-5 w-5 text-yellow-400" />} label="Premium" value={dash.premiumUsers} color="text-yellow-400" />
      <StatCard icon={<Users className="h-5 w-5 text-gray-400" />} label="Free" value={dash.freeUsers} />
      <StatCard icon={<DollarSign className="h-5 w-5 text-green-400" />} label="Revenue (est.)" value={`$${dash.revenueEstimate}`} color="text-green-400" />
      <StatCard icon={<ClipboardList className="h-5 w-5 text-accent" />} label="Ukupno pikova" value={dash.totalPicks} />
      <StatCard icon={<Calendar className="h-5 w-5 text-accent" />} label="Danas" value={dash.todayPicks} />
      <StatCard icon={<Loader2 className="h-5 w-5 text-orange-400" />} label="Pending" value={dash.pendingPicks} />
      <StatCard icon={<TrendingUp className="h-5 w-5 text-green-400" />} label="Win Rate (30d)" value={`${dash.winRate}%`} color="text-green-400" />
    </div>
  )
}

/* ═══════════════════════════════════════════
   TAB: USERS
   ═══════════════════════════════════════════ */
interface UserRow { id: string; email: string; name: string; role: string; tier: string; created_at: string }

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const { users: u } = await adminGetUsers(token)
      setUsers(u || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function toggleTier(user: UserRow) {
    const newTier = user.tier === 'premium' ? 'free' : 'premium'
    await adminUpdateUser(token, user.id, { tier: newTier })
    load()
  }

  async function deleteUser(user: UserRow) {
    if (!confirm(`Obriši korisnika ${user.email}?`)) return
    await adminDeleteUser(token, user.id)
    load()
  }

  const filtered = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
  const premiumCount = users.filter(u => u.tier === 'premium').length
  const freeCount = users.length - premiumCount

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pretraži po email-u..."
            className="w-full rounded-lg border border-border bg-darker pl-9 pr-3 py-2 text-sm text-white" />
        </div>
        <div className="flex gap-3 text-sm text-muted">
          <span>Ukupno: <strong className="text-white">{users.length}</strong></span>
          <span>Premium: <strong className="text-yellow-400">{premiumCount}</strong></span>
          <span>Free: <strong className="text-gray-400">{freeCount}</strong></span>
        </div>
        <button onClick={load} className="rounded-lg border border-border p-2 text-muted hover:text-white">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Ime</th>
                <th className="px-3 py-2">Uloga</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Registrovan</th>
                <th className="px-3 py-2">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-card">
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">{user.name || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-card text-muted'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      user.tier === 'premium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-card text-muted'
                    }`}>{user.tier === 'premium' ? '👑 Premium' : 'Free'}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('sr-RS') : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => toggleTier(user)}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          user.tier === 'premium'
                            ? 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                        }`}>
                        {user.tier === 'premium' ? 'Ukloni Premium' : 'Dodeli Premium'}
                      </button>
                      {user.role !== 'admin' && (
                        <button onClick={() => deleteUser(user)}
                          className="rounded bg-danger/10 p-1 text-danger hover:bg-danger/20" title="Obriši">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-8 text-center text-muted">Nema korisnika.</p>}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   TAB: PICKS
   ═══════════════════════════════════════════ */
function PicksTab({ token }: { token: string }) {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [showModal, setShowModal] = useState(false)
  const [editPick, setEditPick] = useState<any>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function loadPicks() {
    setLoading(true)
    try {
      const { picks: p } = await adminGetPicks(token, dateFilter)
      setPicks(p || [])
      setSelected(new Set())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadPicks() }, [dateFilter])

  async function setResult(id: string, result: string) {
    await adminSetResult(token, id, result)
    loadPicks()
  }

  async function deletePick(id: string) {
    if (!confirm('Obriši ovaj pik?')) return
    await adminDeletePick(token, id)
    loadPicks()
  }

  async function handleSavePick(pick: any) {
    if (editPick?.id) {
      // Edit existing - map camelCase to snake_case for DB
      await adminUpdatePick(token, editPick.id, {
        sport: pick.sport,
        league: pick.league,
        league_flag: pick.leagueFlag,
        home_team: pick.homeTeam,
        away_team: pick.awayTeam,
        kick_off: pick.kickOff,
        match_date: pick.matchDate,
        prediction_type: pick.predictionType,
        prediction_value: pick.predictionValue,
        confidence: pick.confidence,
        reasoning: pick.reasoning,
        odds: pick.odds,
        bookmaker: pick.bookmaker,
        is_free: pick.isFree,
        is_sigurica: pick.isSigurica,
      })
    } else {
      await adminAddPick(token, pick)
    }
    setShowModal(false)
    setEditPick(null)
    loadPicks()
  }

  function openEdit(pick: Pick) {
    setEditPick({
      id: pick.id,
      sport: 'football',
      league: pick.league,
      leagueFlag: pick.leagueFlag,
      homeTeam: pick.homeTeam,
      awayTeam: pick.awayTeam,
      kickOff: pick.kickOff,
      matchDate: pick.matchDate,
      predictionType: pick.predictionType,
      predictionValue: pick.predictionValue,
      confidence: pick.confidence,
      reasoning: pick.reasoning,
      odds: pick.odds,
      bookmaker: pick.bookmaker,
      isFree: pick.isFree,
      isSigurica: pick.isSigurica ?? false,
    })
    setShowModal(true)
  }

  function toggleSelect(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    if (selected.size === picks.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(picks.map(p => p.id)))
    }
  }

  async function bulkSetResult(result: string) {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    await adminBulkResult(token, ids, result)
    loadPicks()
  }

  return (
    <div>
      {(showModal) && (
        <PickModal
          initial={editPick}
          onSave={handleSavePick}
          onClose={() => { setShowModal(false); setEditPick(null) }}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
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
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setEditPick(null); setShowModal(true) }}
            className="flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-darker hover:bg-accent-dim">
            <Plus className="h-4 w-4" /> Dodaj pik
          </button>
          <button onClick={loadPicks} className="rounded-lg border border-border p-2 text-muted hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2">
          <span className="text-sm text-accent font-medium">{selected.size} izabrano</span>
          <button onClick={() => bulkSetResult('won')}
            className="rounded bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20">
            ✅ Svi Won
          </button>
          <button onClick={() => bulkSetResult('lost')}
            className="rounded bg-danger/10 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/20">
            ❌ Svi Lost
          </button>
          <button onClick={() => bulkSetResult('void')}
            className="rounded bg-gray-500/10 px-3 py-1 text-xs font-medium text-gray-400 hover:bg-gray-500/20">
            ⊘ Svi Void
          </button>
          <button onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted hover:text-white">Poništi</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-2 py-2">
                  <input type="checkbox" checked={selected.size === picks.length && picks.length > 0}
                    onChange={toggleAll} className="rounded border-border" />
                </th>
                <th className="px-3 py-2">Sport</th>
                <th className="px-3 py-2">Liga</th>
                <th className="px-3 py-2">Meč</th>
                <th className="px-3 py-2">Tip</th>
                <th className="px-3 py-2">Kvota</th>
                <th className="px-3 py-2">Conf</th>
                <th className="px-3 py-2">Free</th>
                <th className="px-3 py-2">🎯</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {picks.map(pick => (
                <tr key={pick.id} className={`border-b border-border/50 hover:bg-card ${
                  pick.isSigurica ? 'bg-yellow-500/5' : ''
                }`}>
                  <td className="px-2 py-2">
                    <input type="checkbox" checked={selected.has(pick.id)}
                      onChange={() => toggleSelect(pick.id)} className="rounded border-border" />
                  </td>
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
                  <td className="px-3 py-2">{pick.isSigurica ? '🎯' : ''}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      pick.result === 'won' ? 'bg-accent/10 text-accent' :
                      pick.result === 'lost' ? 'bg-danger/10 text-danger' :
                      pick.result === 'void' ? 'bg-gray-500/10 text-gray-400' : 'bg-card text-muted'
                    }`}>
                      {pick.result === 'won' ? '✅ Won' : pick.result === 'lost' ? '❌ Lost' :
                       pick.result === 'void' ? '⊘ Void' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {pick.result === 'pending' && (
                        <>
                          <button onClick={() => setResult(pick.id, 'won')}
                            className="rounded bg-accent/10 p-1 text-accent hover:bg-accent/20" title="Won">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setResult(pick.id, 'lost')}
                            className="rounded bg-danger/10 p-1 text-danger hover:bg-danger/20" title="Lost">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => openEdit(pick)}
                        className="rounded bg-blue-500/10 p-1 text-blue-400 hover:bg-blue-500/20" title="Izmeni">
                        <Edit2 className="h-4 w-4" />
                      </button>
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

/* ═══════════════════════════════════════════
   MAIN ADMIN PAGE
   ═══════════════════════════════════════════ */

type TabKey = 'dashboard' | 'picks' | 'users'

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'picks', label: 'Pikovi', icon: <ClipboardList className="h-4 w-4" /> },
  { key: 'users', label: 'Korisnici', icon: <Users className="h-4 w-4" /> },
]

export default function Admin() {
  const { token, isAdmin } = useAuth()
  const [dash, setDash] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    adminDashboard(token).then(d => { setDash(d); setLoading(false) }).catch(() => setLoading(false))
  }, [token])

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
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-white'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading && activeTab === 'dashboard' ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : (
        <>
          {activeTab === 'dashboard' && <DashboardTab dash={dash} />}
          {activeTab === 'picks' && token && <PicksTab token={token} />}
          {activeTab === 'users' && token && <UsersTab token={token} />}
        </>
      )}
    </div>
  )
}
