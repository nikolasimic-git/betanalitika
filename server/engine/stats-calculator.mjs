/**
 * Stats Calculator
 * Calculates detailed statistics from picks table
 */
import { supabase } from '../supabase-client.mjs'

export async function calculateDetailedStats() {
  const { data: allPicks, error } = await supabase
    .from('picks')
    .select('*')
    .order('match_date', { ascending: false })

  if (error) {
    console.error('Stats error:', error.message)
    return null
  }

  const resolved = allPicks.filter(p => p.result === 'won' || p.result === 'lost')
  const won = resolved.filter(p => p.result === 'won')
  const lost = resolved.filter(p => p.result === 'lost')

  // Basic stats
  const totalPicks = resolved.length
  const winRate = totalPicks > 0 ? +(won.length / totalPicks * 100).toFixed(1) : 0

  // ROI (flat 1 unit per bet)
  const totalReturn = won.reduce((sum, p) => sum + (parseFloat(p.odds) || 1.8), 0)
  const roi = totalPicks > 0 ? +((totalReturn - totalPicks) / totalPicks * 100).toFixed(1) : 0

  // Current streak
  let streak = 0
  let streakType = 'W'
  if (resolved.length > 0) {
    streakType = resolved[0].result === 'won' ? 'W' : 'L'
    for (const p of resolved) {
      if ((p.result === 'won' && streakType === 'W') || (p.result === 'lost' && streakType === 'L')) {
        streak++
      } else break
    }
  }

  // Win rate by sport
  const bySport = {}
  for (const p of resolved) {
    const sport = p.sport || 'unknown'
    if (!bySport[sport]) bySport[sport] = { won: 0, total: 0 }
    bySport[sport].total++
    if (p.result === 'won') bySport[sport].won++
  }
  const winRateBySport = {}
  for (const [sport, s] of Object.entries(bySport)) {
    winRateBySport[sport] = {
      total: s.total,
      won: s.won,
      winRate: +(s.won / s.total * 100).toFixed(1),
    }
  }

  // Win rate by confidence
  const byConfidence = {}
  for (const p of resolved) {
    const conf = p.confidence || 'unknown'
    if (!byConfidence[conf]) byConfidence[conf] = { won: 0, total: 0 }
    byConfidence[conf].total++
    if (p.result === 'won') byConfidence[conf].won++
  }
  const winRateByConfidence = {}
  for (const [conf, c] of Object.entries(byConfidence)) {
    winRateByConfidence[conf] = {
      total: c.total,
      won: c.won,
      winRate: +(c.won / c.total * 100).toFixed(1),
    }
  }

  // Monthly breakdown
  const byMonth = {}
  for (const p of resolved) {
    const month = (p.match_date || '').substring(0, 7) // YYYY-MM
    if (!month) continue
    if (!byMonth[month]) byMonth[month] = { won: 0, lost: 0, total: 0, profit: 0 }
    byMonth[month].total++
    if (p.result === 'won') {
      byMonth[month].won++
      byMonth[month].profit += (parseFloat(p.odds) || 1.8) - 1
    } else {
      byMonth[month].lost++
      byMonth[month].profit -= 1
    }
  }
  const monthly = Object.entries(byMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, m]) => ({
      month,
      ...m,
      winRate: +(m.won / m.total * 100).toFixed(1),
      profit: +m.profit.toFixed(2),
    }))

  return {
    totalPicks,
    won: won.length,
    lost: lost.length,
    pending: allPicks.filter(p => p.result === 'pending').length,
    winRate,
    roi,
    currentStreak: streak,
    streakType,
    winRateBySport,
    winRateByConfidence,
    monthly,
  }
}
