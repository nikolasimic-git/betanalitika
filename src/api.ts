import { supabase } from './lib/supabase'
import type { Pick } from './types'

function mapPick(p: any): Pick {
  return {
    id: p.id,
    matchDate: p.match_date ?? p.matchDate,
    league: p.league,
    leagueFlag: p.league_flag ?? p.leagueFlag,
    homeTeam: p.home_team ?? p.homeTeam,
    awayTeam: p.away_team ?? p.awayTeam,
    kickOff: p.kick_off ?? p.kickOff,
    predictionType: p.prediction_type ?? p.predictionType,
    predictionValue: p.prediction_value ?? p.predictionValue,
    confidence: p.confidence,
    reasoning: p.reasoning,
    odds: typeof p.odds === 'string' ? parseFloat(p.odds) || 0 : (p.odds ?? 0),
    bookmaker: p.bookmaker,
    affiliateUrl: p.affiliate_url ?? p.affiliateUrl,
    result: p.result,
    isFree: p.is_free ?? p.isFree,
    locked: p.locked,
    isSigurica: p.isSigurica,
  }
}

// ── Fallback API base for admin/auth operations that still use Express ──
export const API_BASE = import.meta.env.DEV 
  ? (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '')
  : ''

function headers(token?: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

// ══════════════════════════════════════════
// PUBLIC READS — Direct from Supabase
// ══════════════════════════════════════════

export async function fetchTodayPicks(token?: string | null, sport = 'all') {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  let query = supabase
    .from('picks')
    .select('*')
    .in('match_date', [today, tomorrow])
    .eq('result', 'pending')
    .order('match_date')

  if (sport && sport !== 'all') {
    query = query.eq('sport', sport)
  }

  const { data: picks, error } = await query

  if (error) return { picks: [], date: today, message: error.message }
  if (!picks || picks.length === 0) {
    return { picks: [], date: today, message: 'Pikovi za danas još nisu generisani.' }
  }

  // Check premium status via token (if using Express auth)
  // For Supabase Auth, check session
  const { data: { session } } = await supabase.auth.getSession()
  let isPremium = false
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', session.user.id)
      .single()
    isPremium = profile?.tier === 'premium'
  }

  // Also check via legacy token
  if (!isPremium && token) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { headers: headers(token) })
      if (res.ok) {
        const { user } = await res.json()
        isPremium = user?.tier === 'premium'
      }
    } catch (_) {}
  }

  if (isPremium) {
    // Premium: all picks visible, mark highest confidence as sigurica
    const sorted = [...picks].sort((a: any, b: any) => (b.confidence ?? 0) - (a.confidence ?? 0))
    const result = sorted.map((p: any, i: number) => ({
      ...p,
      locked: false,
      isSigurica: i === 0,
      is_free: p.is_free,
    }))
    return { picks: result.map(mapPick), date: today }
  }

  // Free: 3 free picks (1x5★, 1x4★, 1x3★), rest locked
  const freePicks = picks.filter((p: any) => p.is_free)
  const premiumOnlyPicks = picks.filter((p: any) => !p.is_free)

  // Sort by confidence descending and pick top 3
  const sortedFree = [...freePicks].sort((a: any, b: any) => (b.confidence ?? 0) - (a.confidence ?? 0))
  const selected = sortedFree.slice(0, 3)
  const selectedIds = new Set(selected.map((p: any) => p.id))

  const result = [
    ...selected.map((p: any) => ({ ...p, locked: false, isFree: true, is_free: true })),
    ...freePicks.filter((p: any) => !selectedIds.has(p.id)).map((p: any) => ({
      ...p,
      reasoning: '🔒 Premium pikovi su dostupni samo za premium korisnike.',
      prediction_value: '🔒',
      locked: true,
    })),
    ...premiumOnlyPicks.map((p: any) => ({
      ...p,
      reasoning: '🔒 Premium pikovi su dostupni samo za premium korisnike.',
      prediction_value: '🔒',
      locked: true,
    })),
  ]

  return { picks: result.map(mapPick), date: today }
}

export async function fetchHistory(page = 1, limit = 20, sport = 'all', maxDays?: number) {
  const offset = (page - 1) * limit

  let query = supabase
    .from('picks')
    .select('*', { count: 'exact' })
    .neq('result', 'pending')
    .order('match_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (maxDays) {
    const cutoff = new Date(Date.now() - maxDays * 86400000).toISOString().split('T')[0]
    query = query.gte('match_date', cutoff)
  }

  if (sport && sport !== 'all') {
    query = query.eq('sport', sport)
  }

  const { data: picks, count, error } = await query

  if (error) return { picks: [], total: 0, page, totalPages: 0 }

  return {
    picks: (picks || []).map(mapPick),
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function fetchStats(sport = 'all') {
  let query = supabase.from('picks').select('result, odds, sport')

  if (sport && sport !== 'all') {
    query = query.eq('sport', sport)
  }

  const { data: allPicks, error } = await query
  if (error) return { totalPicks: 0, won: 0, lost: 0, pending: 0, winRate: 0, roi: 0, currentStreak: 0, streakType: 'W' as const }

  const resolved = (allPicks || []).filter((p: any) => p.result !== 'pending')
  const won = resolved.filter((p: any) => p.result === 'won')
  const lost = resolved.filter((p: any) => p.result === 'lost')
  const pending = (allPicks || []).filter((p: any) => p.result === 'pending')

  const totalStake = resolved.length
  const totalReturn = won.reduce((sum: number, p: any) => sum + (parseFloat(p.odds) || 1.8), 0)
  const roi = totalStake > 0 ? ((totalReturn - totalStake) / totalStake * 100) : 0

  return {
    totalPicks: resolved.length,
    won: won.length,
    lost: lost.length,
    pending: pending.length,
    winRate: resolved.length > 0 ? +(won.length / resolved.length * 100).toFixed(1) : 0,
    roi: +roi.toFixed(1),
    currentStreak: 0,
    streakType: 'W' as const,
  }
}

// ══════════════════════════════════════════
// ADMIN — Still through Express API (needs auth middleware)
// ══════════════════════════════════════════

export async function adminDashboard(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/dashboard`, { headers: headers(token) })
  return res.json()
}

export async function adminGetPicks(token: string, date?: string) {
  const q = date ? `?date=${date}` : ''
  const res = await fetch(`${API_BASE}/api/admin/picks${q}`, { headers: headers(token) })
  return res.json()
}

export async function adminUpdatePick(token: string, id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/picks/${id}`, {
    method: 'PUT', headers: headers(token), body: JSON.stringify(data),
  })
  return res.json()
}

export async function adminSetResult(token: string, id: string, result: string) {
  const res = await fetch(`${API_BASE}/api/admin/picks/${id}/result`, {
    method: 'POST', headers: headers(token), body: JSON.stringify({ result }),
  })
  return res.json()
}

export async function adminDeletePick(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/admin/picks/${id}`, {
    method: 'DELETE', headers: headers(token),
  })
  return res.json()
}

export async function adminAddPick(token: string, pick: any) {
  const res = await fetch(`${API_BASE}/api/admin/picks`, {
    method: 'POST', headers: headers(token), body: JSON.stringify(pick),
  })
  return res.json()
}
