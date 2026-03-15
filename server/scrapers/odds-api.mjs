/**
 * odds-api.io Integracija
 * Povlači kvote od više kladionica za fudbal i košarku
 * API: https://api.odds-api.io/v3
 */
import axios from 'axios'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, '..', 'data', 'odds-data.json')

// Učitaj .env ako postoji
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

const API_KEY = process.env.ODDS_API_KEY || 'bd408313cbe09165611b17745550ac3dfac20fb80938a8e672fd7a0b3f061e17'
const BASE_URL = 'https://api.odds-api.io/v3'

// Kladionice koje pratimo — prioritet
const TARGET_BOOKMAKERS = ['1xbet', 'Mozzart Bet', 'Bet365', 'Pinnacle', 'Unibet', 'Betway', 'Bwin ES']

const LEAGUES = [
  // Fudbal
  { sport: 'football', slug: 'england-premier-league', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', type: 'soccer' },
  { sport: 'football', slug: 'spain-laliga', name: 'La Liga', flag: '🇪🇸', type: 'soccer' },
  { sport: 'football', slug: 'italy-serie-a', name: 'Serie A', flag: '🇮🇹', type: 'soccer' },
  { sport: 'football', slug: 'germany-bundesliga', name: 'Bundesliga', flag: '🇩🇪', type: 'soccer' },
  { sport: 'football', slug: 'france-ligue-1', name: 'Ligue 1', flag: '🇫🇷', type: 'soccer' },
  { sport: 'football', slug: 'international-clubs-uefa-champions-league', name: 'Champions League', flag: '🏆', type: 'soccer' },
  // Košarka
  { sport: 'basketball', slug: 'usa-nba', name: 'NBA', flag: '🏀', type: 'basketball' },
]

/**
 * Dohvati sve pending events za ligu
 */
async function fetchEvents(league) {
  try {
    const resp = await rateLimitedRequest(`${BASE_URL}/events`, {
      apiKey: API_KEY, sport: league.sport, league: league.slug,
    })
    if (!resp) return []
    return resp.data.filter(e => e.status === 'pending')
  } catch (err) {
    if (err.response?.status === 429) {
      requestCount = REQUEST_LIMIT
      return []
    }
    console.log(`  ❌ Events error za ${league.name}: ${err.message}`)
    return []
  }
}

// Rate limit tracker
let requestCount = 0
const REQUEST_LIMIT = 90 // Ostavi malo headroom-a od 100

async function rateLimitedRequest(url, params) {
  if (requestCount >= REQUEST_LIMIT) {
    console.log(`  ⚠️ Rate limit dostignut (${requestCount}/${REQUEST_LIMIT}). Zaustavljam.`)
    return null
  }
  requestCount++
  const resp = await axios.get(url, { params, timeout: 15000 })
  // Pauza između zahteva (100/h = 1 zahtev svakih 36s, ali burstujemo)
  await new Promise(r => setTimeout(r, 800))
  return resp
}

/**
 * Dohvati kvote za jedan event
 */
async function fetchEventOdds(eventId) {
  try {
    const resp = await rateLimitedRequest(`${BASE_URL}/odds`, {
      apiKey: API_KEY,
      eventId,
    })
    return resp?.data || null
  } catch (err) {
    if (err.response?.status === 429) {
      console.log(`  ⚠️ Rate limit hit — zaustavljam odds fetching`)
      requestCount = REQUEST_LIMIT // Stop dalje zahteve
      return null
    }
    console.log(`  ❌ Odds error za event ${eventId}: ${err.message}`)
    return null
  }
}

/**
 * Parsiraj kvote iz odds-api.io formata u naš format
 */
function parseOdds(oddsData, league) {
  if (!oddsData || !oddsData.bookmakers) return null

  const bookmakers = oddsData.bookmakers
  const odds = {}

  for (const [bmName, markets] of Object.entries(bookmakers)) {
    const bmKey = bmName.toLowerCase().replace(/\s+/g, '')
    const mlMarket = markets.find(m => m.name === 'ML')
    const totalsMarket = markets.find(m => m.name === 'Totals')

    if (mlMarket && mlMarket.odds && mlMarket.odds[0]) {
      const ml = mlMarket.odds[0]
      const bmOdds = {
        home: parseFloat(ml.home) || null,
        draw: parseFloat(ml.draw) || null,
        away: parseFloat(ml.away) || null,
      }

      // Over/Under 2.5 za fudbal
      if (totalsMarket && totalsMarket.odds) {
        const ou25 = totalsMarket.odds.find(o => parseFloat(o.hdp) === 2.5)
        if (ou25) {
          bmOdds.over25 = parseFloat(ou25.over) || null
          bmOdds.under25 = parseFloat(ou25.under) || null
        }
      }

      odds[bmName] = bmOdds
    }
  }

  if (Object.keys(odds).length === 0) return null

  return {
    id: `oapi-${oddsData.id}`,
    homeTeam: oddsData.home,
    awayTeam: oddsData.away,
    league: league.name,
    leagueFlag: league.flag,
    sport: league.type,
    sportType: league.type,
    date: oddsData.date,
    commenceTime: oddsData.date,
    odds,
    urls: oddsData.urls || {},
  }
}

/**
 * Konvertuj multi-bookmaker odds u stari format za kompatibilnost sa value-detectorom
 */
function toOutcomesFormat(match) {
  const outcomes = {}
  const { homeTeam, awayTeam, odds } = match

  // Skupi sve kvote za home, draw, away
  const homeOdds = [], drawOdds = [], awayOdds = []
  const bestHome = { odds: 0, bm: '' }
  const bestDraw = { odds: 0, bm: '' }
  const bestAway = { odds: 0, bm: '' }

  for (const [bm, o] of Object.entries(odds)) {
    if (!o) continue
    if (o.home) {
      homeOdds.push(o.home)
      if (o.home > bestHome.odds) { bestHome.odds = o.home; bestHome.bm = bm }
    }
    if (o.draw) {
      drawOdds.push(o.draw)
      if (o.draw > bestDraw.odds) { bestDraw.odds = o.draw; bestDraw.bm = bm }
    }
    if (o.away) {
      awayOdds.push(o.away)
      if (o.away > bestAway.odds) { bestAway.odds = o.away; bestAway.bm = bm }
    }
  }

  const avg = arr => arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3) : 0

  if (homeOdds.length > 0) {
    outcomes[homeTeam] = { avgOdds: avg(homeOdds), bestOdds: bestHome.odds, bestBookmaker: bestHome.bm, numBookmakers: homeOdds.length }
  }
  if (drawOdds.length > 0) {
    outcomes['Draw'] = { avgOdds: avg(drawOdds), bestOdds: bestDraw.odds, bestBookmaker: bestDraw.bm, numBookmakers: drawOdds.length }
  }
  if (awayOdds.length > 0) {
    outcomes[awayTeam] = { avgOdds: avg(awayOdds), bestOdds: bestAway.odds, bestBookmaker: bestAway.bm, numBookmakers: awayOdds.length }
  }

  return outcomes
}

/**
 * Mock odds za fallback
 */
function getMockOdds() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString()
  return [
    {
      id: 'mock-epl-1', sport: 'soccer_epl', sportType: 'soccer',
      league: 'Premier League', leagueFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      homeTeam: 'Arsenal', awayTeam: 'Chelsea', commenceTime: tomorrow,
      outcomes: {
        'Arsenal': { avgOdds: 1.65, bestOdds: 1.70, bestBookmaker: '1xbet', numBookmakers: 3 },
        'Draw': { avgOdds: 3.80, bestOdds: 4.00, bestBookmaker: 'Pinnacle', numBookmakers: 3 },
        'Chelsea': { avgOdds: 5.20, bestOdds: 5.50, bestBookmaker: 'Bet365', numBookmakers: 3 },
      },
      odds: {
        '1xbet': { home: 1.70, draw: 3.80, away: 5.00 },
        'Pinnacle': { home: 1.65, draw: 4.00, away: 5.20 },
        'Bet365': { home: 1.60, draw: 3.60, away: 5.50 },
      },
      spreads: null, bookmakerCount: 3,
    },
    {
      id: 'mock-nba-1', sport: 'basketball_nba', sportType: 'basketball',
      league: 'NBA', leagueFlag: '🏀',
      homeTeam: 'Boston Celtics', awayTeam: 'Milwaukee Bucks', commenceTime: tomorrow,
      outcomes: {
        'Boston Celtics': { avgOdds: 1.55, bestOdds: 1.60, bestBookmaker: '1xbet', numBookmakers: 3 },
        'Milwaukee Bucks': { avgOdds: 2.50, bestOdds: 2.60, bestBookmaker: 'Bet365', numBookmakers: 3 },
      },
      odds: {
        '1xbet': { home: 1.60, draw: null, away: 2.50 },
        'Bet365': { home: 1.55, draw: null, away: 2.60 },
      },
      spreads: null, bookmakerCount: 3,
    },
  ]
}

/**
 * Glavni scrape flow
 */
export async function scrapeOdds() {
  console.log('📊 Pokrećem odds-api.io scraper...')
  requestCount = 0
  const allEvents = []
  let usedMock = false

  try {
    for (const league of LEAGUES) {
      console.log(`  📥 Fetching ${league.name} events...`)
      const events = await fetchEvents(league)
      const pendingEvents = events.slice(0, 8) // Max 8 eventa po ligi — čuvamo rate limit (100/h)

      if (pendingEvents.length === 0) {
        console.log(`  ⚠️ ${league.name}: nema pending mečeva`)
        continue
      }

      console.log(`  📊 ${league.name}: ${pendingEvents.length} pending mečeva, fetching odds...`)

      for (const event of pendingEvents) {
        const oddsData = await fetchEventOdds(event.id)
        if (!oddsData) continue

        const match = parseOdds(oddsData, league)
        if (!match) continue

        // Dodaj outcomes format za kompatibilnost
        match.outcomes = toOutcomesFormat(match)
        match.bookmakerCount = Object.keys(match.odds).length
        allEvents.push(match)

        if (requestCount >= REQUEST_LIMIT) break
      }

      console.log(`  ✅ ${league.name}: ${pendingEvents.length} mečeva obrađeno`)
    }
  } catch (err) {
    console.log(`❌ Scraping error: ${err.message}`)
  }

  if (allEvents.length === 0) {
    console.log('⚠️ API nije vratio podatke — koristim mock')
    allEvents.push(...getMockOdds())
    usedMock = true
  }

  const data = {
    events: allEvents,
    scrapedAt: new Date().toISOString(),
    source: usedMock ? 'mock' : 'odds-api.io',
    totalEvents: allEvents.length,
  }

  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  console.log(`✅ Odds podaci sačuvani: ${allEvents.length} mečeva (${data.source})`)
  return data
}

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('odds-api')) {
  scrapeOdds().catch(console.error)
}
