import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../auth'
import {
  adminDashboard, adminGetPicks, adminSetResult, adminDeletePick,
  adminAddPick, adminUpdatePick, adminGetUsers, adminUpdateUser,
  adminUpdateUserRole, adminDeleteUser, adminBulkResult,
  adminGetAds, adminAddAd, adminUpdateAd, adminDeleteAd,
  SUPER_ADMIN_ID, isSuperAdmin,
} from '../api'
import {
  Shield, Check, X, Trash2, Loader2, RefreshCw, Plus, Users,
  BarChart3, ClipboardList, Search, Crown, DollarSign, TrendingUp,
  Calendar, Edit2, AlertTriangle, ChevronUp, ChevronDown, Megaphone,
} from 'lucide-react'
import { Pick } from '../types'

/* ═══════════════════════════════════════════
   CONFIRMATION MODAL
   ═══════════════════════════════════════════ */

function ConfirmModal({ title, message, onConfirm, onCancel, danger = false }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`rounded-lg p-2 ${danger ? 'bg-danger/10' : 'bg-accent/10'}`}>
            <AlertTriangle className={`h-5 w-5 ${danger ? 'text-danger' : 'text-accent'}`} />
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-sm text-muted mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-white">
            Otkaži
          </button>
          <button onClick={onConfirm}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${
              danger
                ? 'bg-danger text-white hover:bg-danger/80'
                : 'bg-accent text-darker hover:bg-accent-dim'
            }`}>
            Potvrdi
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   FEEDBACK BANNER
   ═══════════════════════════════════════════ */

function FeedbackBanner({ message, type, onDismiss }: {
  message: string; type: 'success' | 'error'; onDismiss: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium ${
      type === 'success' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-danger/10 text-danger border border-danger/20'
    }`}>
      <span>{type === 'success' ? '✅' : '❌'} {message}</span>
      <button onClick={onDismiss} className="ml-3 text-xs opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

function useFeedback() {
  const [fb, setFb] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setFb({ message, type })
  }, [])
  const clear = useCallback(() => setFb(null), [])
  return { fb, show, clear }
}

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

  // When isSigurica is toggled on, force isFree=false (Super Pik is always premium)
  function handleSiguricaChange(checked: boolean) {
    setForm({ ...form, isSigurica: checked, ...(checked ? { isFree: false } : {}) })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Enforce: if isSigurica, isFree must be false
    const pick = { ...form }
    if (pick.isSigurica) pick.isFree = false
    onSave(pick)
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
            <input type="checkbox" checked={form.isFree} disabled={form.isSigurica}
              onChange={e => setForm({...form, isFree: e.target.checked})}
              className="rounded border-border" />
            <label className={`text-sm ${form.isSigurica ? 'text-muted/50' : 'text-muted'}`}>
              Besplatan pik {form.isSigurica && <span className="text-xs">(Super Pik = premium)</span>}
            </label>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={form.isSigurica} onChange={e => handleSiguricaChange(e.target.checked)}
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
type UserSortKey = 'created_at' | 'tier' | 'email'
type SortDir = 'asc' | 'desc'

function UsersTab({ currentUserId }: { currentUserId?: string }) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<UserSortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; action: () => void; danger?: boolean } | null>(null)
  const { fb, show, clear } = useFeedback()

  async function load() {
    setLoading(true)
    try {
      const { users: u } = await adminGetUsers()
      setUsers(u || [])
    } catch (e) { console.error(e); show('Greška pri učitavanju korisnika', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function toggleTier(user: UserRow) {
    if (isSuperAdmin(user.id)) { show('Super Admin — ne može se menjati', 'error'); return }
    const newTier = user.tier === 'premium' ? 'free' : 'premium'
    const label = newTier === 'premium' ? 'Dodeli Premium' : 'Ukloni Premium'
    setConfirmAction({
      title: label,
      message: `${label} za ${user.email}?`,
      action: async () => {
        try {
          await adminUpdateUser(user.id, { tier: newTier })
          show(`${user.email} → ${newTier}`, 'success')
          load()
        } catch { show('Greška pri ažuriranju tiera', 'error') }
      },
    })
  }

  async function toggleRole(user: UserRow) {
    if (isSuperAdmin(user.id)) { show('Super Admin — ne može se menjati', 'error'); return }
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const isSelf = user.id === currentUserId
    if (isSelf && newRole === 'user') {
      show('Ne možeš sam sebi ukloniti admin ulogu', 'error')
      return
    }
    const label = newRole === 'admin' ? 'Dodeli Admin' : 'Ukloni Admin'
    setConfirmAction({
      title: label,
      message: `${label} za ${user.email}?`,
      danger: newRole === 'user',
      action: async () => {
        try {
          await adminUpdateUserRole(user.id, newRole)
          show(`${user.email} → ${newRole}`, 'success')
          load()
        } catch { show('Greška pri promeni uloge', 'error') }
      },
    })
  }

  async function deleteUser(user: UserRow) {
    setConfirmAction({
      title: 'Obriši korisnika',
      message: `Da li si siguran da želiš da obrišeš ${user.email}? Ova akcija je nepovratna.`,
      danger: true,
      action: async () => {
        try {
          await adminDeleteUser(user.id)
          show(`${user.email} obrisan`, 'success')
          load()
        } catch { show('Greška pri brisanju korisnika', 'error') }
      },
    })
  }

  function handleSort(key: UserSortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: UserSortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  }

  const filtered = users
    .filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'created_at') {
        return dir * ((a.created_at || '').localeCompare(b.created_at || ''))
      }
      if (sortKey === 'tier') {
        return dir * ((a.tier || '').localeCompare(b.tier || ''))
      }
      return dir * ((a.email || '').localeCompare(b.email || ''))
    })

  const premiumCount = users.filter(u => u.tier === 'premium').length
  const freeCount = users.length - premiumCount

  return (
    <div>
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          danger={confirmAction.danger}
          onConfirm={async () => { try { await confirmAction.action(); } catch (e) { console.error('CONFIRM ERROR:', e); } setConfirmAction(null) }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {fb && <FeedbackBanner message={fb.message} type={fb.type} onDismiss={clear} />}

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
                <th className="px-3 py-2 cursor-pointer select-none" onClick={() => handleSort('email')}>
                  <span className="flex items-center gap-1">Email <SortIcon col="email" /></span>
                </th>
                <th className="px-3 py-2">Ime</th>
                <th className="px-3 py-2">Uloga</th>
                <th className="px-3 py-2 cursor-pointer select-none" onClick={() => handleSort('tier')}>
                  <span className="flex items-center gap-1">Tier <SortIcon col="tier" /></span>
                </th>
                <th className="px-3 py-2 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                  <span className="flex items-center gap-1">Registrovan <SortIcon col="created_at" /></span>
                </th>
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
                    {isSuperAdmin(user.id) ? (
                      <span className="rounded bg-accent/10 px-2 py-1 text-xs font-semibold text-accent" title="Super Admin — ne može se menjati">
                        🛡️ Super Admin
                      </span>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => toggleRole(user)}
                          disabled={user.id === currentUserId && user.role === 'admin'}
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            user.id === currentUserId && user.role === 'admin'
                              ? 'bg-gray-500/5 text-gray-600 cursor-not-allowed'
                              : user.role === 'admin'
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                          }`}>
                          {user.role === 'admin' ? 'Ukloni Admin' : 'Dodeli Admin'}
                        </button>
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
                    )}
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
function PicksTab() {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [showModal, setShowModal] = useState(false)
  const [editPick, setEditPick] = useState<any>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; action: () => void; danger?: boolean } | null>(null)
  const { fb, show, clear } = useFeedback()

  async function loadPicks() {
    setLoading(true)
    try {
      const { picks: p } = await adminGetPicks(dateFilter)
      setPicks(p || [])
      setSelected(new Set())
    } catch (e) { console.error(e); show('Greška pri učitavanju pikova', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadPicks() }, [dateFilter])

  async function setResult(id: string, result: string) {
    try {
      await adminSetResult(id, result)
      show(`Rezultat postavljen: ${result}`, 'success')
      loadPicks()
    } catch { show('Greška pri postavljanju rezultata', 'error') }
  }

  async function deletePick(id: string) {
    setConfirmAction({
      title: 'Obriši pik',
      message: 'Da li si siguran da želiš da obrišeš ovaj pik? Ova akcija je nepovratna.',
      danger: true,
      action: async () => {
        try {
          await adminDeletePick(id)
          show('Pik obrisan', 'success')
          loadPicks()
        } catch { show('Greška pri brisanju pika', 'error') }
      },
    })
  }

  async function handleSavePick(pick: any) {
    try {
      if (editPick?.id) {
        await adminUpdatePick(editPick.id, {
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
        show('Pik ažuriran', 'success')
      } else {
        await adminAddPick(pick)
        show('Pik dodat', 'success')
      }
      setShowModal(false)
      setEditPick(null)
      loadPicks()
    } catch { show('Greška pri čuvanju pika', 'error') }
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
    try {
      const ids = Array.from(selected)
      await adminBulkResult(ids, result)
      show(`${ids.length} pikova → ${result}`, 'success')
      loadPicks()
    } catch { show('Greška pri bulk ažuriranju', 'error') }
  }

  return (
    <div>
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          danger={confirmAction.danger}
          onConfirm={async () => { try { await confirmAction.action(); } catch(e) { console.error('CONFIRM ERROR:', e); } setConfirmAction(null) }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {fb && <FeedbackBanner message={fb.message} type={fb.type} onDismiss={clear} />}

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
                      <button onClick={() => { console.log('EDIT clicked', pick.id); openEdit(pick) }}
                        className="rounded bg-blue-500/10 p-1 text-blue-400 hover:bg-blue-500/20" title="Izmeni">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => { console.log('DELETE clicked', pick.id); deletePick(pick.id) }}
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
   TAB: ADS (REKLAME)
   ═══════════════════════════════════════════ */
interface AdRow { id: string; name: string; title: string; description_sr: string; description_en: string; emoji: string; image_url: string | null; link_url: string | null; placement: string; is_active: boolean; priority: number; created_at: string }

const emptyAd = { name: '', title: '', description_sr: '', description_en: '', emoji: '🎯', image_url: '', link_url: '', placement: 'banner', is_active: true, priority: 0 }

function AdFormModal({ initial, onSave, onClose }: { initial?: any; onSave: (ad: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...emptyAd, ...(initial || {}) })
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); onSave(form) }
  const f = (key: string, val: any) => setForm({ ...form, [key]: val })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">{initial ? '✏️ Izmeni reklamu' : '➕ Dodaj reklamu'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-muted mb-1">Ime (interno)</label><input required value={form.name} onChange={e => f('name', e.target.value)} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" /></div>
          <div><label className="block text-xs text-muted mb-1">Naslov</label><input required value={form.title} onChange={e => f('title', e.target.value)} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" /></div>
          <div className="col-span-2"><label className="block text-xs text-muted mb-1">Opis (SR)</label><textarea value={form.description_sr} onChange={e => f('description_sr', e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" /></div>
          <div className="col-span-2"><label className="block text-xs text-muted mb-1">Opis (EN)</label><textarea value={form.description_en} onChange={e => f('description_en', e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" /></div>
          <div><label className="block text-xs text-muted mb-1">Emoji</label><input value={form.emoji} onChange={e => f('emoji', e.target.value)} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" /></div>
          <div><label className="block text-xs text-muted mb-1">Placement</label>
            <select value={form.placement} onChange={e => f('placement', e.target.value)} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white">
              <option value="banner">Banner</option><option value="sidebar">Sidebar</option>
            </select>
          </div>
          <div><label className="block text-xs text-muted mb-1">Image URL</label><input value={form.image_url || ''} onChange={e => f('image_url', e.target.value || null)} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" placeholder="https://..." /></div>
          <div><label className="block text-xs text-muted mb-1">Link URL</label><input value={form.link_url || ''} onChange={e => f('link_url', e.target.value || null)} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" placeholder="https://..." /></div>
          <div><label className="block text-xs text-muted mb-1">Prioritet</label><input type="number" value={form.priority} onChange={e => f('priority', parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-border bg-darker px-3 py-2 text-sm text-white" /></div>
          <div className="flex items-center gap-2 pt-5"><input type="checkbox" checked={form.is_active} onChange={e => f('is_active', e.target.checked)} className="rounded border-border" /><label className="text-sm text-muted">Aktivna</label></div>
        </div>
        <div className="mt-4 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-white">Otkaži</button>
          <button type="submit" className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-darker hover:bg-accent-dim">{initial ? 'Sačuvaj' : 'Dodaj'}</button>
        </div>
      </form>
    </div>
  )
}

function AdsTab() {
  const [ads, setAds] = useState<AdRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editAd, setEditAd] = useState<any>(null)
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; action: () => void; danger?: boolean } | null>(null)
  const { fb, show, clear } = useFeedback()

  async function load() {
    setLoading(true)
    try { const { ads: a } = await adminGetAds(); setAds(a || []) }
    catch { show('Greška pri učitavanju reklama', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleSave(ad: any) {
    try {
      const payload = { ...ad, image_url: ad.image_url || null, link_url: ad.link_url || null }
      if (editAd?.id) { await adminUpdateAd(editAd.id, payload); show('Reklama ažurirana') }
      else { await adminAddAd(payload); show('Reklama dodata') }
      setShowModal(false); setEditAd(null); load()
    } catch { show('Greška pri čuvanju reklame', 'error') }
  }

  async function toggleActive(ad: AdRow) {
    try { await adminUpdateAd(ad.id, { is_active: !ad.is_active }); show(`${ad.name} → ${!ad.is_active ? 'aktivna' : 'neaktivna'}`); load() }
    catch { show('Greška', 'error') }
  }

  async function deleteAd(ad: AdRow) {
    setConfirmAction({ title: 'Obriši reklamu', message: `Obriši "${ad.name}"?`, danger: true, action: async () => {
      try { await adminDeleteAd(ad.id); show('Reklama obrisana'); load() }
      catch { show('Greška pri brisanju', 'error') }
    }})
  }

  return (
    <div>
      {confirmAction && <ConfirmModal title={confirmAction.title} message={confirmAction.message} danger={confirmAction.danger} onConfirm={async () => { try { await confirmAction.action(); } catch (e) { console.error('CONFIRM ERROR:', e); } setConfirmAction(null) }} onCancel={() => setConfirmAction(null)} />}
      {fb && <FeedbackBanner message={fb.message} type={fb.type} onDismiss={clear} />}
      {showModal && <AdFormModal initial={editAd} onSave={handleSave} onClose={() => { setShowModal(false); setEditAd(null) }} />}

      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => { setEditAd(null); setShowModal(true) }} className="flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-darker hover:bg-accent-dim"><Plus className="h-4 w-4" /> Dodaj reklamu</button>
        <button onClick={load} className="rounded-lg border border-border p-2 text-muted hover:text-white ml-auto"><RefreshCw className="h-4 w-4" /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead><tr className="border-b border-border text-left text-muted">
              <th className="px-3 py-2">Emoji</th><th className="px-3 py-2">Ime</th><th className="px-3 py-2">Naslov</th><th className="px-3 py-2">Placement</th><th className="px-3 py-2">Prioritet</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Akcije</th>
            </tr></thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id} className="border-b border-border/50 hover:bg-card">
                  <td className="px-3 py-2 text-xl">{ad.emoji || '—'}</td>
                  <td className="px-3 py-2 font-medium">{ad.name}</td>
                  <td className="px-3 py-2">{ad.title}</td>
                  <td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-xs font-medium ${ad.placement === 'banner' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{ad.placement}</span></td>
                  <td className="px-3 py-2">{ad.priority}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => toggleActive(ad)} className={`rounded px-2 py-0.5 text-xs font-medium ${ad.is_active ? 'bg-accent/10 text-accent' : 'bg-gray-500/10 text-gray-400'}`}>{ad.is_active ? '✅ Aktivna' : '⏸ Neaktivna'}</button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditAd(ad); setShowModal(true) }} className="rounded bg-blue-500/10 p-1 text-blue-400 hover:bg-blue-500/20" title="Izmeni"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => deleteAd(ad)} className="rounded bg-card p-1 text-muted hover:text-danger" title="Obriši"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ads.length === 0 && <p className="py-8 text-center text-muted">Nema reklama. Dodaj prvu!</p>}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN ADMIN PAGE
   ═══════════════════════════════════════════ */

type TabKey = 'dashboard' | 'picks' | 'users' | 'ads'

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'picks', label: 'Pikovi', icon: <ClipboardList className="h-4 w-4" /> },
  { key: 'users', label: 'Korisnici', icon: <Users className="h-4 w-4" /> },
  { key: 'ads', label: 'Reklame', icon: <Megaphone className="h-4 w-4" /> },
]

export default function Admin() {
  const { isAdmin, user } = useAuth()
  const [dash, setDash] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    adminDashboard().then(d => { setDash(d); setLoading(false) }).catch(() => setLoading(false))
  }, [isAdmin])

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
          {activeTab === 'picks' && <PicksTab />}
          {activeTab === 'users' && <UsersTab currentUserId={user?.id} />}
          {activeTab === 'ads' && <AdsTab />}
        </>
      )}
    </div>
  )
}
