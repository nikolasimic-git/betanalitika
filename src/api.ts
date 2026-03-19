import { supabase, supabaseAdmin } from './lib/supabase'
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
    reasoningEn: p.reasoning_en ?? p.reasoningEn,
    odds: typeof p.odds === 'string' ? parseFloat(p.odds) || 0 : (p.odds ?? 0),
    bookmaker: p.bookmaker,
    affiliateUrl: p.affiliate_url ?? p.affiliateUrl,
    result: p.result,
    isFree: p.is_free ?? p.isFree,
    locked: p.locked,
    isSigurica: p.isSigurica,
  }
}

// ══════════════════════════════════════════
// PUBLIC READS — Direct from Supabase
// ══════════════════════════════════════════

export async function fetchTodayPicks(_unused?: any, sport = 'all') {
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

  // Check premium status via Supabase session
  const { data: { session } } = await supabase.auth.getSession()
  let isPremium = false
  if (session?.user) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', session.user.id)
        .single()
      if (profile && !profileError) {
        isPremium = profile.tier === 'premium'
      } else {
        // Fallback: check user metadata if RLS blocks profile query
        isPremium = session.user.user_metadata?.tier === 'premium'
      }
    } catch {
      isPremium = session.user.user_metadata?.tier === 'premium'
    }
  }

  if (isPremium) {
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
// ADMIN — Direct Supabase queries
// ══════════════════════════════════════════

export async function adminDashboard() {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  const [
    { count: totalPicks },
    { count: todayPicks },
    { count: pendingPicks },
    { count: totalUsers },
    { count: premiumUsers },
  ] = await Promise.all([
    supabaseAdmin.from('picks').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('picks').select('*', { count: 'exact', head: true }).eq('match_date', today),
    supabaseAdmin.from('picks').select('*', { count: 'exact', head: true }).eq('result', 'pending'),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
  ])

  const { data: recentPicks } = await supabaseAdmin
    .from('picks')
    .select('result')
    .gte('match_date', thirtyDaysAgo)
    .neq('result', 'pending')

  const resolved = recentPicks || []
  const won = resolved.filter(p => p.result === 'won').length
  const winRate = resolved.length > 0 ? +(won / resolved.length * 100).toFixed(1) : 0

  return {
    totalPicks: totalPicks || 0,
    todayPicks: todayPicks || 0,
    pendingPicks: pendingPicks || 0,
    totalUsers: totalUsers || 0,
    premiumUsers: premiumUsers || 0,
    freeUsers: (totalUsers || 0) - (premiumUsers || 0),
    winRate,
    revenueEstimate: (premiumUsers || 0) * 20,
  }
}

export async function adminGetPicks(date?: string) {
  let query = supabaseAdmin.from('picks').select('*').order('match_date', { ascending: false })
  if (date) query = query.eq('match_date', date)
  const { data, error } = await query
  if (error) throw error
  return { picks: (data || []).map(mapPick), total: (data || []).length }
}

export async function adminUpdatePick(id: string, updates: any) {
  const { data, error } = await supabaseAdmin.from('picks').update(updates).eq('id', id).select()
  if (error) throw error
  if (!data || data.length === 0) throw new Error('Update failed: pick not found')
}

export async function adminSetResult(id: string, result: string) {
  const { data, error } = await supabaseAdmin.from('picks').update({ result }).eq('id', id).select()
  if (error) throw error
  if (!data || data.length === 0) throw new Error('Update failed: pick not found')
}

export async function adminDeletePick(id: string) {
  const { data, error } = await supabaseAdmin.from('picks').delete().eq('id', id).select()
  if (error) throw error
  if (!data || data.length === 0) throw new Error('Delete failed: pick not found')
}

export async function adminAddPick(pick: any) {
  const dbPick = {
    id: `pick-manual-${Date.now()}`,
    match_date: pick.matchDate || new Date().toISOString().split('T')[0],
    home_team: pick.homeTeam,
    away_team: pick.awayTeam,
    kick_off: pick.kickOff,
    prediction_type: pick.predictionType,
    prediction_value: pick.predictionValue,
    league_flag: pick.leagueFlag,
    league: pick.league,
    sport: pick.sport,
    confidence: pick.confidence,
    reasoning: pick.reasoning,
    odds: pick.odds,
    bookmaker: pick.bookmaker,
    result: 'pending',
    is_free: pick.isFree ?? false,
    is_sigurica: pick.isSigurica ?? false,
  }
  const { error } = await supabaseAdmin.from('picks').insert(dbPick)
  if (error) throw error
}

export async function adminGetUsers() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, role, tier, created_at')
  if (error) throw error
  return { users: data || [] }
}

export async function adminUpdateUser(id: string, updates: { tier?: string; role?: string }) {
  const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', id)
  if (error) throw error
}

export async function adminUpdateUserRole(id: string, role: string) {
  const { error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
  return { ok: true }
}

export async function adminDeleteUser(id: string) {
  const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id)
  if (error) throw error
}

export async function adminBulkResult(ids: string[], result: string) {
  const { error } = await supabaseAdmin.from('picks').update({ result }).in('id', ids)
  if (error) throw error
}

// ── Ads ──

export async function adminGetAds() {
  const { data, error } = await supabaseAdmin.from('ads').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return { ads: data || [] }
}

export async function adminAddAd(ad: any) {
  const { error } = await supabaseAdmin.from('ads').insert(ad)
  if (error) throw error
}

export async function adminUpdateAd(id: string, updates: any) {
  const { error } = await supabaseAdmin.from('ads').update(updates).eq('id', id)
  if (error) throw error
}

export async function adminDeleteAd(id: string) {
  const { error } = await supabaseAdmin.from('ads').delete().eq('id', id)
  if (error) throw error
}
