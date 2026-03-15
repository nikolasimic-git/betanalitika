/**
 * Auto-Results Updater
 * Koristi ESPN API za rezultate završenih mečeva
 */
import axios from 'axios'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE = join(__dirname, '..', 'picks-db.json')

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

function loadDB() {
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
}
function saveDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

/**
 * Fetch ESPN fudbalske rezultate za ligu
 */
async function fetchESPNSoccerScores(leagueSlug) {
  try {
    const resp = await axios.get(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueSlug}/scoreboard`,
      { headers: HEADERS, timeout: 10000 }
    )
    return resp.data?.events?.map(ev => {
      const comp = ev.competitions?.[0]
      const home = comp?.competitors?.find(c => c.homeAway === 'home')
      const away = comp?.competitors?.find(c => c.homeAway === 'away')
      return {
        homeTeam: home?.team?.displayName || home?.team?.shortDisplayName,
        awayTeam: away?.team?.displayName || away?.team?.shortDisplayName,
        homeScore: parseInt(home?.score) || 0,
        awayScore: parseInt(away?.score) || 0,
        status: ev.status?.type?.name, // STATUS_FULL_TIME, STATUS_IN_PROGRESS, etc.
        completed: ev.status?.type?.completed,
        date: ev.date,
      }
    }) || []
  } catch (err) {
    console.log(`  ⚠️ ESPN soccer error (${leagueSlug}): ${err.message}`)
    return []
  }
}

/**
 * Fetch ESPN NBA rezultate
 */
async function fetchESPNNBAScores() {
  try {
    const resp = await axios.get(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      { headers: HEADERS, timeout: 10000 }
    )
    return resp.data?.events?.map(ev => {
      const comp = ev.competitions?.[0]
      const home = comp?.competitors?.find(c => c.homeAway === 'home')
      const away = comp?.competitors?.find(c => c.homeAway === 'away')
      return {
        homeTeam: home?.team?.displayName,
        awayTeam: away?.team?.displayName,
        homeScore: parseInt(home?.score) || 0,
        awayScore: parseInt(away?.score) || 0,
        completed: ev.status?.type?.completed,
      }
    }) || []
  } catch (err) {
    console.log(`  ⚠️ ESPN NBA error: ${err.message}`)
    return []
  }
}

/**
 * Fuzzy match tim
 */
function teamsMatch(pickTeam, scoreTeam) {
  if (!pickTeam || !scoreTeam) return false
  const a = pickTeam.toLowerCase().trim()
  const b = scoreTeam.toLowerCase().trim()
  return a === b || a.includes(b) || b.includes(a)
}

/**
 * Odredi rezultat pika na osnovu stvarnog rezultata
 */
function determineResult(pick, homeScore, awayScore) {
  const pred = pick.predictionValue.toLowerCase()

  if (pick.predictionType === 'Pobednik') {
    if (pred.includes('domaćin') || pred.includes('1 (')) {
      return homeScore > awayScore ? 'won' : 'lost'
    } else if (pred.includes('gost') || pred.includes('2 (')) {
      return awayScore > homeScore ? 'won' : 'lost'
    } else if (pred.includes('nerešeno') || pred.includes('x')) {
      return homeScore === awayScore ? 'won' : 'lost'
    }
    // NBA moneyline — proveri koji tim je u predikciji
    if (teamsMatch(pick.homeTeam, extractTeamFromPred(pred))) {
      return homeScore > awayScore ? 'won' : 'lost'
    }
    if (teamsMatch(pick.awayTeam, extractTeamFromPred(pred))) {
      return awayScore > homeScore ? 'won' : 'lost'
    }
  }

  if (pick.predictionType === 'Spread') {
    // Spread je komplikovaniji — za sad skip
    return null
  }

  return null
}

function extractTeamFromPred(pred) {
  const match = pred.match(/\(([^)]+)\)/)
  return match ? match[1] : pred
}

const SOCCER_LEAGUES = {
  'Premier League': 'eng.1',
  'La Liga': 'esp.1',
  'Serie A': 'ita.1',
  'Bundesliga': 'ger.1',
  'Ligue 1': 'fra.1',
}

/**
 * Glavni update flow
 */
export async function updateResults() {
  console.log('📊 Pokrećem Results Updater...')

  const db = loadDB()
  const pendingPicks = db.picks.filter(p => p.result === 'pending')
  
  if (pendingPicks.length === 0) {
    console.log('✅ Nema pending pikova za update')
    return { updated: 0 }
  }

  console.log(`  📋 ${pendingPicks.length} pending pikova`)

  // Fetch sve rezultate
  const allScores = []

  // Fudbal
  for (const [league, slug] of Object.entries(SOCCER_LEAGUES)) {
    const scores = await fetchESPNSoccerScores(slug)
    allScores.push(...scores.map(s => ({ ...s, league, sport: 'football' })))
  }

  // NBA
  const nbaScores = await fetchESPNNBAScores()
  allScores.push(...nbaScores.map(s => ({ ...s, league: 'NBA', sport: 'nba' })))

  console.log(`  📡 Ukupno ${allScores.length} rezultata sa ESPN-a`)

  let updated = 0

  for (const pick of pendingPicks) {
    // Nađi odgovarajući rezultat
    const score = allScores.find(s => {
      if (!s.completed) return false
      return teamsMatch(pick.homeTeam, s.homeTeam) && teamsMatch(pick.awayTeam, s.awayTeam)
    })

    if (!score) continue

    const result = determineResult(pick, score.homeScore, score.awayScore)
    if (result) {
      const idx = db.picks.findIndex(p => p.id === pick.id)
      if (idx !== -1) {
        db.picks[idx].result = result
        db.picks[idx].finalScore = `${score.homeScore}:${score.awayScore}`
        updated++
        console.log(`  ${result === 'won' ? '✅' : '❌'} ${pick.homeTeam} vs ${pick.awayTeam} — ${score.homeScore}:${score.awayScore} → ${result}`)
      }
    }
  }

  if (updated > 0) {
    saveDB(db)
  }

  console.log(`✅ Ažurirano ${updated} pikova`)
  return { updated, total: pendingPicks.length }
}

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('results-updater')) {
  updateResults().catch(console.error)
}
