/**
 * Auto-Picks Generator v2
 * Koristi Poisson model + ELO + Value Detector za generisanje dnevnih pikova
 * Insertuje u Supabase picks tabelu
 */
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'
import axios from 'axios'
import { getTeamStats, getMatchStats, getTodayFixtures, LEAGUES } from '../scrapers/football-stats.mjs'
import { predictMatch } from './poisson-model.mjs'
import { predictFromElo, updateEloFromResults, getEloRating } from './elo-ratings.mjs'
import { detectValue, combinePredictions } from './value-detector.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env
const envPath = join(__dirname, '..', '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^(\w+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim()
    }
  }
}

const ODDS_API_KEY = process.env.ODDS_API_KEY
const ODDS_API_BASE = 'https://api.odds-api.io/v3'

// ESPN league → odds-api.io league mapping
const ODDS_API_LEAGUES = {
  'eng.1': { sport: 'football', league: 'england-premier-league' },
  'esp.1': { sport: 'football', league: 'spain-laliga' },
  'ger.1': { sport: 'football', league: 'germany-bundesliga' },
  'ita.1': { sport: 'football', league: 'italy-serie-a' },
  'fra.1': { sport: 'football', league: 'france-ligue-1' },
  'uefa.champions': { sport: 'football', league: 'international-clubs-uefa-champions-league' },
}

/**
 * Fetch events i odds sa odds-api.io
 */
async function fetchOddsForLeague(leagueSlug) {
  if (!ODDS_API_KEY) return []
  const mapping = ODDS_API_LEAGUES[leagueSlug]
  if (!mapping) return []

  try {
    // Fetch events
    const eventsResp = await axios.get(`${ODDS_API_BASE}/events`, {
      params: { apiKey: ODDS_API_KEY, sport: mapping.sport, league: mapping.league },
      timeout: 15000,
    })
    const events = (eventsResp.data || []).filter(e => e.status === 'pending')

    // Fetch odds for each event (max 5 to save rate limit)
    const results = []
    for (const event of events.slice(0, 5)) {
      try {
        const oddsResp = await axios.get(`${ODDS_API_BASE}/odds`, {
          params: { apiKey: ODDS_API_KEY, eventId: event.id },
          timeout: 15000,
        })
        const oddsData = oddsResp.data
        if (oddsData) {
          results.push({
            home_team: oddsData.home || event.home,
            away_team: oddsData.away || event.away,
            date: event.date,
            bookmakers: oddsData.bookmakers || {},
          })
        }
        await new Promise(r => setTimeout(r, 800))
      } catch { /* skip */ }
    }
    return results
  } catch (err) {
    console.log(`  ⚠️ Odds API error za ${leagueSlug}: ${err.message}`)
    return []
  }
}

/**
 * Parsiraj odds za specifičan meč iz odds-api.io formata
 */
function findOddsForMatch(oddsEvents, homeTeam, awayTeam) {
  const lower = (s) => (s || '').toLowerCase()

  for (const event of oddsEvents) {
    const h = lower(event.home_team)
    const a = lower(event.away_team)
    const hq = lower(homeTeam)
    const aq = lower(awayTeam)

    if ((h.includes(hq) || hq.includes(h)) && (a.includes(aq) || aq.includes(a))) {
      const odds = { home: 0, draw: 0, away: 0, over25: 0, under25: 0, bookmaker: '' }

      // odds-api.io format: bookmakers is object { "BookmakerName": [markets] }
      const bookmakers = event.bookmakers || {}
      for (const [bmName, markets] of Object.entries(bookmakers)) {
        if (!Array.isArray(markets)) continue
        const ml = markets.find(m => m.name === 'ML')
        if (ml?.odds?.[0]) {
          const o = ml.odds[0]
          const home = parseFloat(o.home) || 0
          const draw = parseFloat(o.draw) || 0
          const away = parseFloat(o.away) || 0
          if (home > odds.home) { odds.home = home; odds.bookmaker = bmName }
          if (draw > odds.draw) odds.draw = draw
          if (away > odds.away) odds.away = away
        }
        const totals = markets.find(m => m.name === 'Totals')
        if (totals?.odds) {
          const ou25 = totals.odds.find(o => parseFloat(o.hdp) === 2.5)
          if (ou25) {
            const over = parseFloat(ou25.over) || 0
            const under = parseFloat(ou25.under) || 0
            if (over > odds.over25) odds.over25 = over
            if (under > odds.under25) odds.under25 = under
          }
        }
      }

      if (odds.home > 0 || odds.away > 0) return odds
    }
  }
  return null
}

/**
 * Generiši reasoning tekst na srpskom
 */
function generateReasoning(matchInfo) {
  const { homeTeam, awayTeam, homeStats, awayStats, predictions, eloPred, odds, valueBet } = matchInfo
  const parts = []

  // Forma timova
  if (homeStats?.last5) {
    parts.push(`${homeTeam} forma (zadnjih 5): ${homeStats.last5.form || 'N/A'} (${homeStats.last5.wins}W-${homeStats.last5.draws}D-${homeStats.last5.losses}L)`)
  }
  if (awayStats?.last5) {
    parts.push(`${awayTeam} forma: ${awayStats.last5.form || 'N/A'} (${awayStats.last5.wins}W-${awayStats.last5.draws}D-${awayStats.last5.losses}L)`)
  }

  // Golovi
  if (homeStats?.avgHomeGoalsScored) {
    parts.push(`${homeTeam} daje ${homeStats.avgHomeGoalsScored.toFixed(1)} golova kod kuće, prima ${(homeStats.avgHomeGoalsConceded || 0).toFixed(1)}`)
  }
  if (awayStats?.avgAwayGoalsScored) {
    parts.push(`${awayTeam} u gostima daje ${awayStats.avgAwayGoalsScored.toFixed(1)}, prima ${(awayStats.avgAwayGoalsConceded || 0).toFixed(1)}`)
  }

  // Ključne statistike
  if (homeStats?.bttsPct !== undefined) {
    parts.push(`BTTS: ${homeTeam} ${(homeStats.bttsPct * 100).toFixed(0)}%, ${awayTeam} ${((awayStats?.bttsPct || 0) * 100).toFixed(0)}%`)
  }
  if (homeStats?.over25Pct !== undefined) {
    parts.push(`Over 2.5: ${homeTeam} ${(homeStats.over25Pct * 100).toFixed(0)}%, ${awayTeam} ${((awayStats?.over25Pct || 0) * 100).toFixed(0)}%`)
  }

  // Model predviđanje
  if (predictions) {
    parts.push(`Poisson model: ${homeTeam} ${(predictions.homeWin * 100).toFixed(0)}%, remi ${(predictions.draw * 100).toFixed(0)}%, ${awayTeam} ${(predictions.awayWin * 100).toFixed(0)}%`)
  }

  // ELO
  if (eloPred) {
    parts.push(`ELO rejting: ${homeTeam} ${eloPred.homeRating}, ${awayTeam} ${eloPred.awayRating}`)
  }

  // Value edge
  if (valueBet) {
    const edgePct = (valueBet.edge * 100).toFixed(1)
    parts.push(`Naš model daje ${(valueBet.modelProb * 100).toFixed(0)}% šanse, a kvota ${valueBet.odds} implicira samo ${(valueBet.impliedProb * 100).toFixed(0)}% — value ${edgePct}%`)
  }

  return parts.join('. ') + '.'
}

/**
 * Glavni generator dnevnih pikova
 */
export async function generateDailyPicks() {
  console.log('🎯 Pokrećem AI Picks Generator v2...\n')

  const allPicks = []
  const today = new Date().toISOString().split('T')[0]

  // 1. Za svaku ligu, dohvati fixture i statistike
  for (const [leagueSlug, leagueInfo] of Object.entries(LEAGUES)) {
    console.log(`\n📊 ${leagueInfo.flag} ${leagueInfo.name}...`)

    // Dohvati statistike i fixture paralelno
    const [statsData, fixtures] = await Promise.all([
      getTeamStats(leagueSlug).catch(() => null),
      getTodayFixtures(leagueSlug).catch(() => []),
    ])

    if (fixtures.length === 0) {
      console.log(`  ⚠️ Nema današnjih mečeva`)
      continue
    }

    console.log(`  📅 ${fixtures.length} mečeva danas`)

    // Dohvati odds
    let oddsEvents = []
    oddsEvents = await fetchOddsForLeague(leagueSlug)
    console.log(`  💰 ${oddsEvents.length} events sa kvotama`)

    // Update ELO iz rezultata
    if (statsData?.teams) {
      const results = []
      for (const team of Object.values(statsData.teams)) {
        // ELO se inicijalizuje iz predefinisanih vrednosti, nema potrebe za update ovde
      }
    }

    // 2. Za svaki meč
    for (const fixture of fixtures) {
      const homeTeam = fixture.homeTeam
      const awayTeam = fixture.awayTeam

      // a. Team stats
      const homeStats = statsData?.teams?.[homeTeam] || findFuzzyTeam(statsData?.teams, homeTeam)
      const awayStats = statsData?.teams?.[awayTeam] || findFuzzyTeam(statsData?.teams, awayTeam)

      // b. Poisson predikcija
      const poissonPreds = predictMatch(homeStats, awayStats, statsData?.leagueAvg)

      // c. ELO predikcija
      const eloPreds = predictFromElo(homeTeam, awayTeam)

      // d. Kombinovana predikcija
      const combined = combinePredictions(poissonPreds, eloPreds)

      // e. Dohvati odds
      const odds = findOddsForMatch(oddsEvents, homeTeam, awayTeam)

      if (!odds || (!odds.home && !odds.away)) {
        console.log(`  ⏭️ ${homeTeam} vs ${awayTeam} — nema kvota`)
        continue
      }

      // f. Value detection
      const valueBets = detectValue(combined, odds, {
        homeTeam,
        awayTeam,
        league: leagueInfo.name,
        leagueFlag: leagueInfo.flag,
        commenceTime: fixture.date,
        bookmaker: odds.bookmaker || '1xbet',
      })

      if (valueBets.length === 0) {
        console.log(`  ⏭️ ${homeTeam} vs ${awayTeam} — nema value`)
        continue
      }

      // Uzmi najbolji value bet za ovaj meč
      const bestBet = valueBets[0]

      // Generiši reasoning
      const reasoning = generateReasoning({
        homeTeam, awayTeam, homeStats, awayStats,
        predictions: poissonPreds, eloPred: eloPreds,
        odds, valueBet: bestBet,
      })

      const kickOff = fixture.date ? new Date(fixture.date).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit', hour12: false }) : '20:00'

      allPicks.push({
        ...bestBet,
        reasoning,
        kickOff,
        matchDate: today,
        sport: 'football',
        poissonPreds,
        eloPreds,
      })

      console.log(`  ✅ ${homeTeam} vs ${awayTeam} — ${bestBet.predictionValue} @ ${bestBet.odds} (edge: ${(bestBet.edge * 100).toFixed(1)}%, ★${bestBet.confidence})`)
    }

    // Rate limit between leagues
    await new Promise(r => setTimeout(r, 1000))
  }

  // 3. Sortiraj po edge-u i selektuj top 10 sa min 3★
  allPicks.sort((a, b) => b.edge - a.edge)
  const qualifiedPicks = allPicks.filter(p => p.confidence >= 3)
  const topPicks = qualifiedPicks.slice(0, 10)

  // Ako nema dovoljno 3★+, dodaj i slabije
  if (topPicks.length < 5) {
    const remaining = allPicks.filter(p => p.confidence < 3 && !topPicks.includes(p))
    topPicks.push(...remaining.slice(0, 5 - topPicks.length))
  }

  if (topPicks.length === 0) {
    console.log('\n⚠️ Nema pikova za danas')
    return []
  }

  // 4. Označi sigurica i free pikove
  topPicks[0].isSigurica = true

  // Free: 1x highest confidence, 1x mid, 1x low
  const freeIndices = new Set()
  const by5 = topPicks.findIndex(p => p.confidence === 5)
  const by4 = topPicks.findIndex(p => p.confidence === 4 && !freeIndices.has(topPicks.indexOf(p)))
  const by3 = topPicks.findIndex(p => p.confidence === 3 && !freeIndices.has(topPicks.indexOf(p)))

  if (by5 >= 0) freeIndices.add(by5)
  if (by4 >= 0) freeIndices.add(by4)
  else if (topPicks.length > 1) freeIndices.add(1)
  if (by3 >= 0) freeIndices.add(by3)
  else if (topPicks.length > 2) freeIndices.add(2)

  // Ensure at least 3 free
  for (let i = 0; i < topPicks.length && freeIndices.size < 3; i++) {
    freeIndices.add(i)
  }

  topPicks.forEach((pick, idx) => {
    pick.isFree = freeIndices.has(idx)
  })

  // 5. Insert u Supabase
  console.log(`\n📤 Insertujem ${topPicks.length} pikova u Supabase...`)

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    // Obriši stare auto-pikove za danas
    await supabase.from('picks').delete().eq('match_date', today).like('id', `pick-${today}-ai-%`)

    const rows = topPicks.map((pick, idx) => ({
      id: `pick-${today}-ai-${idx}`,
      match_date: today,
      league: pick.league || 'Unknown',
      league_flag: pick.leagueFlag || '⚽',
      home_team: pick.homeTeam,
      away_team: pick.awayTeam,
      kick_off: pick.kickOff,
      prediction_type: pick.predictionType,
      prediction_value: pick.predictionValue,
      confidence: pick.confidence,
      reasoning: pick.reasoning,
      odds: pick.odds,
      bookmaker: pick.bookmaker || '1xbet',
      affiliate_url: `https://1xbet.com/sr/`,
      result: 'pending',
      is_free: pick.isFree,
      sport: 'football',
      value_edge: +(pick.edge * 100).toFixed(2),
    }))

    const { data, error } = await supabase.from('picks').upsert(rows)
    if (error) {
      console.log(`  ❌ Supabase error: ${error.message}`)
    } else {
      console.log(`  ✅ ${rows.length} pikova upisano u Supabase`)
    }
  } catch (err) {
    console.log(`  ❌ Supabase insert failed: ${err.message}`)
  }

  // Summary
  console.log(`\n🎯 DNEVNI PIKOVI (${today}):`)
  console.log('─'.repeat(60))
  for (const pick of topPicks) {
    const stars = '★'.repeat(pick.confidence) + '☆'.repeat(5 - pick.confidence)
    const tags = [
      pick.isSigurica ? '🔒 SIGURICA' : '',
      pick.isFree ? '🆓' : '💎',
    ].filter(Boolean).join(' ')
    console.log(`  ${pick.leagueFlag || '⚽'} ${pick.homeTeam} vs ${pick.awayTeam}`)
    console.log(`     ${pick.predictionValue} @ ${pick.odds} | ${stars} | edge ${(pick.edge * 100).toFixed(1)}% | ${tags}`)
  }

  return topPicks
}

function findFuzzyTeam(teams, name) {
  if (!teams || !name) return null
  const lower = name.toLowerCase()
  for (const [key, team] of Object.entries(teams)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) return team
  }
  return null
}

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('picks-generator')) {
  generateDailyPicks().catch(console.error)
}
