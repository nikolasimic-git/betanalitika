/**
 * Odds Comparator
 * Reads odds_cache from Supabase, finds best odds across bookmakers
 */
import { supabase } from '../supabase-client.mjs'

/**
 * Get best odds for a match across all bookmakers
 */
export async function getBestOdds(homeTeam, awayTeam) {
  const { data: rows, error } = await supabase
    .from('odds_cache')
    .select('*')
    .ilike('home_team', `%${homeTeam}%`)
    .ilike('away_team', `%${awayTeam}%`)

  if (error || !rows || rows.length === 0) {
    return null
  }

  const markets = {} // { '1X2_home': [{bookmaker, odds}], 'over_2.5': [...], ... }

  for (const row of rows) {
    const bm = row.bookmaker
    const odds = typeof row.odds === 'string' ? JSON.parse(row.odds) : row.odds

    if (odds.home) addToMarket(markets, '1X2_home', bm, odds.home)
    if (odds.draw) addToMarket(markets, '1X2_draw', bm, odds.draw)
    if (odds.away) addToMarket(markets, '1X2_away', bm, odds.away)
    if (odds.over25) addToMarket(markets, 'over_2.5', bm, odds.over25)
    if (odds.under25) addToMarket(markets, 'under_2.5', bm, odds.under25)
    if (odds.btts_yes) addToMarket(markets, 'btts_yes', bm, odds.btts_yes)
    if (odds.btts_no) addToMarket(markets, 'btts_no', bm, odds.btts_no)
  }

  const result = {}
  for (const [market, entries] of Object.entries(markets)) {
    entries.sort((a, b) => b.odds - a.odds)
    result[market] = {
      bestOdds: entries[0].odds,
      bestBookmaker: entries[0].bookmaker,
      allOdds: entries,
    }
  }

  return result
}

function addToMarket(markets, key, bookmaker, odds) {
  if (!markets[key]) markets[key] = []
  markets[key].push({ bookmaker, odds: parseFloat(odds) })
}

/**
 * Get odds comparison for a specific match by ID
 */
export async function getOddsForMatch(matchId) {
  const { data: rows, error } = await supabase
    .from('odds_cache')
    .select('*')
    .eq('match_id', matchId)

  if (error || !rows || rows.length === 0) return null

  const home = rows[0]?.home_team
  const away = rows[0]?.away_team
  const bookmakers = {}

  for (const row of rows) {
    bookmakers[row.bookmaker] = typeof row.odds === 'string' ? JSON.parse(row.odds) : row.odds
  }

  return {
    matchId,
    homeTeam: home,
    awayTeam: away,
    bookmakers,
    bestOdds: await getBestOdds(home, away),
  }
}

/**
 * Find best odds for a pick
 */
export async function findBestOddsForPick(pick) {
  const comparison = await getBestOdds(pick.home_team, pick.away_team)
  if (!comparison) return null

  // Map prediction type to market
  const predType = (pick.prediction_type || '').trim()
  let marketKey = null

  if (predType === '1' || predType === 'Pobednik') marketKey = '1X2_home'
  else if (predType === '2') marketKey = '1X2_away'
  else if (predType === 'X') marketKey = '1X2_draw'
  else if (predType === 'Over') marketKey = 'over_2.5'
  else if (predType === 'Under') marketKey = 'under_2.5'
  else if (predType === 'BTTS') marketKey = 'btts_yes'

  if (marketKey && comparison[marketKey]) {
    return comparison[marketKey]
  }

  return { allMarkets: comparison }
}
