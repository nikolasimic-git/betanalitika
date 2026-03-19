/**
 * Auto-Results Updater v2
 * Uses ESPN API + Supabase for match results
 */
import axios from 'axios'
import { supabase } from '../supabase-client.mjs'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

const SOCCER_LEAGUES = {
  'Premier League': 'eng.1',
  'La Liga': 'esp.1',
  'Serie A': 'ita.1',
  'Bundesliga': 'ger.1',
  'Ligue 1': 'fra.1',
  'Champions League': 'uefa.champions',
}

function formatDate(d) {
  return d.toISOString().split('T')[0].replace(/-/g, '')
}

function getDateStrings() {
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)
  return [formatDate(today), formatDate(yesterday)]
}

async function fetchESPNSoccerScores(leagueSlug, dateStr) {
  try {
    const resp = await axios.get(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueSlug}/scoreboard?dates=${dateStr}`,
      { headers: HEADERS, timeout: 10000 }
    )
    return (resp.data?.events || []).map(ev => {
      const comp = ev.competitions?.[0]
      const home = comp?.competitors?.find(c => c.homeAway === 'home')
      const away = comp?.competitors?.find(c => c.homeAway === 'away')
      return {
        homeTeam: home?.team?.displayName || home?.team?.shortDisplayName || '',
        awayTeam: away?.team?.displayName || away?.team?.shortDisplayName || '',
        homeScore: parseInt(home?.score) || 0,
        awayScore: parseInt(away?.score) || 0,
        completed: ev.status?.type?.completed || false,
        sport: 'football',
      }
    })
  } catch (err) {
    console.log(`  ⚠️ ESPN soccer error (${leagueSlug}, ${dateStr}): ${err.message}`)
    return []
  }
}

async function fetchESPNBasketballScores(dateStr) {
  const endpoints = [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', name: 'NBA' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-euroleague/scoreboard', name: 'Euroleague' },
  ]
  const results = []
  for (const ep of endpoints) {
    try {
      const resp = await axios.get(`${ep.url}?dates=${dateStr}`, { headers: HEADERS, timeout: 10000 })
      for (const ev of resp.data?.events || []) {
        const comp = ev.competitions?.[0]
        const home = comp?.competitors?.find(c => c.homeAway === 'home')
        const away = comp?.competitors?.find(c => c.homeAway === 'away')
        results.push({
          homeTeam: home?.team?.displayName || '',
          awayTeam: away?.team?.displayName || '',
          homeScore: parseInt(home?.score) || 0,
          awayScore: parseInt(away?.score) || 0,
          completed: ev.status?.type?.completed || false,
          sport: 'basketball',
        })
      }
    } catch (err) {
      console.log(`  ⚠️ ESPN ${ep.name} error: ${err.message}`)
    }
  }
  return results
}

function teamsMatch(pickTeam, scoreTeam) {
  if (!pickTeam || !scoreTeam) return false
  const a = pickTeam.toLowerCase().trim()
  const b = scoreTeam.toLowerCase().trim()
  return a === b || a.includes(b) || b.includes(a)
}

/**
 * Determine if a pick won or lost based on actual scores
 */
function determineResult(pick, homeScore, awayScore) {
  const predType = (pick.prediction_type || '').trim()
  const predValue = (pick.prediction_value || '').trim()
  const total = homeScore + awayScore

  // 1X2 / Pobednik
  if (predType === 'Pobednik' || predType === '1X2' || predType === '1' || predType === '2' || predType === 'X') {
    // Parse "1 (Team Name)" or "2 (Team Name)" or just "1"/"2"/"X"
    const val = predValue.trim()
    if (val.startsWith('1') || predType === '1') {
      return homeScore > awayScore ? 'won' : 'lost'
    }
    if (val.startsWith('2') || predType === '2') {
      return awayScore > homeScore ? 'won' : 'lost'
    }
    if (val.toLowerCase().startsWith('x') || predType === 'X') {
      return homeScore === awayScore ? 'won' : 'lost'
    }
    // Fallback: match team name in value
    if (teamsMatch(pick.home_team, val)) {
      return homeScore > awayScore ? 'won' : 'lost'
    }
    if (teamsMatch(pick.away_team, val)) {
      return awayScore > homeScore ? 'won' : 'lost'
    }
  }

  // Over/Under (including Serbian: Ukupno poena, Ukupno golova)
  const isOverUnderType = ['Over', 'Under', 'Ukupno poena', 'Ukupno golova'].includes(predType)
  if (isOverUnderType || predValue.toLowerCase().startsWith('over') || predValue.toLowerCase().startsWith('under')) {
    const isOver = predValue.toLowerCase().startsWith('over') || predValue.toLowerCase().includes('over')
    const isUnder = predValue.toLowerCase().startsWith('under') || predValue.toLowerCase().includes('under')
    const match = predValue.match(/([\d.]+)/)
    const line = match ? parseFloat(match[1]) : 2.5
    if (isOver) return total > line ? 'won' : 'lost'
    if (isUnder) return total < line ? 'won' : 'lost'
    // If just a number without over/under, can't determine
    return null
  }

  // BTTS (Both Teams To Score / Oba tima daju gol)
  if (predType === 'BTTS' || predType === 'Oba tima daju gol' || predValue.toLowerCase().includes('btts')) {
    if (predValue.toLowerCase().includes('75+')) {
      // Basketball: both teams 75+
      return (homeScore >= 75 && awayScore >= 75) ? 'won' : 'lost'
    }
    const yes = predValue.toUpperCase() === 'DA' || predValue.toLowerCase() === 'yes' || predValue.toLowerCase() === 'da'
    const no = predValue.toUpperCase() === 'NE' || predValue.toLowerCase() === 'no' || predValue.toLowerCase() === 'ne'
    const bothScored = homeScore >= 1 && awayScore >= 1
    if (no) return bothScored ? 'lost' : 'won'
    return bothScored ? 'won' : 'lost'
  }

  // BTTS 75+ (basketball)
  if (predType === 'BTTS 75+') {
    return (homeScore >= 75 && awayScore >= 75) ? 'won' : 'lost'
  }

  // Handicap / Hendikep
  if (predType === 'Hendikep' || predType === 'Handicap' || predType === 'Spread') {
    // Parse e.g. "Arsenal -1.5" or "-1.5" or "+2.5"
    const hMatch = predValue.match(/([+-]?\d+\.?\d*)/)
    if (hMatch) {
      const line = parseFloat(hMatch[1])
      // If prediction mentions away team, apply to away
      const awayTeam = (pick.away_team || '').toLowerCase()
      if (awayTeam && predValue.toLowerCase().includes(awayTeam.substring(0, 4))) {
        return (awayScore + line > homeScore) ? 'won' : 'lost'
      }
      // Default: handicap applies to home team
      return (homeScore + line > awayScore) ? 'won' : 'lost'
    }
  }

  // Pobednik meča (tennis)
  if (predType === 'Pobednik meča') {
    if (teamsMatch(pick.home_team, predValue)) {
      return homeScore > awayScore ? 'won' : 'lost'
    }
    if (teamsMatch(pick.away_team, predValue)) {
      return awayScore > homeScore ? 'won' : 'lost'
    }
  }

  console.log(`  ⚠️ Could not determine result for prediction: ${predType} / ${predValue}`)
  return null
}

/**
 * Main update flow
 */
export async function updateResults() {
  console.log('📊 Starting Results Updater...')

  // Get pending picks from Supabase
  const { data: pendingPicks, error } = await supabase
    .from('picks')
    .select('*')
    .eq('result', 'pending')

  if (error) {
    console.error('❌ Supabase error:', error.message)
    return { updated: 0, error: error.message }
  }

  if (!pendingPicks || pendingPicks.length === 0) {
    console.log('✅ No pending picks to update')
    return { updated: 0, total: 0 }
  }

  console.log(`  📋 ${pendingPicks.length} pending picks`)

  // Fetch scores for today and yesterday
  const dates = getDateStrings()
  const allScores = []

  for (const dateStr of dates) {
    for (const [, slug] of Object.entries(SOCCER_LEAGUES)) {
      const scores = await fetchESPNSoccerScores(slug, dateStr)
      allScores.push(...scores)
    }
    const bbScores = await fetchESPNBasketballScores(dateStr)
    allScores.push(...bbScores)
  }

  const completedScores = allScores.filter(s => s.completed)
  console.log(`  📡 ${completedScores.length} completed matches from ESPN`)

  let updated = 0

  for (const pick of pendingPicks) {
    const score = completedScores.find(s =>
      teamsMatch(pick.home_team, s.homeTeam) && teamsMatch(pick.away_team, s.awayTeam)
    )

    if (!score) continue

    const result = determineResult(pick, score.homeScore, score.awayScore)
    if (!result) continue

    const finalScore = `${score.homeScore}:${score.awayScore}`
    // Try with final_score, fallback without it if column doesn't exist
    let updateErr
    const { error: err1 } = await supabase
      .from('picks')
      .update({ result, final_score: finalScore })
      .eq('id', pick.id)
    
    if (err1 && err1.message?.includes('final_score')) {
      const { error: err2 } = await supabase
        .from('picks')
        .update({ result })
        .eq('id', pick.id)
      updateErr = err2
    } else {
      updateErr = err1
    }

    if (updateErr) {
      console.log(`  ❌ Update error for ${pick.id}: ${updateErr.message}`)
      continue
    }

    updated++
    console.log(`  ${result === 'won' ? '✅' : '❌'} ${pick.home_team} vs ${pick.away_team} — ${finalScore} → ${result}`)
  }

  console.log(`✅ Updated ${updated}/${pendingPicks.length} picks`)
  return { updated, total: pendingPicks.length }
}

// Direct execution
if (process.argv[1] && process.argv[1].includes('results-updater')) {
  updateResults().catch(console.error)
}
