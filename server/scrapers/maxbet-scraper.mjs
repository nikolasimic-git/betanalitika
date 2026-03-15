/**
 * MaxBet.rs Scraper
 * 
 * MaxBet koristi SPA (Angular/React) sa internim API-jem.
 * Sajt blokira direktne API pozive (403 za neautorizovane).
 * 
 * Poznati API pattermi:
 * - https://www.maxbet.rs/ibet/offer/prematch/{sportId}
 * - https://www.maxbet.rs/ibet/offer/special
 * 
 * STATUS: Placeholder — sajt zahteva browser session/cookies.
 * TODO: Implementirati headless browser scraping sa Puppeteer/Playwright
 *       ili reverse-engineer-ovati auth flow (session cookies).
 */
import axios from 'axios'

const BASE_URL = 'https://www.maxbet.rs'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'sr-RS,sr;q=0.9,en;q=0.8',
  'Referer': 'https://www.maxbet.rs/',
  'Origin': 'https://www.maxbet.rs',
}

// Liga mapiranje za MaxBet
const LEAGUE_MAP = {
  'Premier League': { sportId: 2, leagueId: null }, // Fudbal
  'La Liga': { sportId: 2, leagueId: null },
  'Serie A': { sportId: 2, leagueId: null },
  'Bundesliga': { sportId: 2, leagueId: null },
  'Ligue 1': { sportId: 2, leagueId: null },
  'Champions League': { sportId: 2, leagueId: null },
  'NBA': { sportId: 4, leagueId: null }, // Košarka
}

/**
 * Pokušaj dohvatiti kvote sa MaxBet-a
 * Trenutno: vraća mock/null jer sajt blokira direktne pozive
 */
export async function scrapeMaxBet(league) {
  const leagueInfo = LEAGUE_MAP[league]
  if (!leagueInfo) {
    console.log(`  ⚠️ MaxBet: Liga "${league}" nije mapirana`)
    return []
  }

  // Pokušaj dohvatiti podatke
  const endpoints = [
    `${BASE_URL}/ibet/offer/prematch/${leagueInfo.sportId}`,
    `${BASE_URL}/restapi/offer/sr/sport/${leagueInfo.sportId}/league-group/all`,
    `${BASE_URL}/restapi/offer/sr/sport/${leagueInfo.sportId}/league/all/mob`,
  ]

  for (const url of endpoints) {
    try {
      const resp = await axios.get(url, {
        headers: HEADERS,
        timeout: 10000,
        validateStatus: s => s < 500,
      })

      if (resp.status === 200 && resp.data) {
        console.log(`  ✅ MaxBet: Pronađen endpoint ${url}`)
        return parseMaxBetResponse(resp.data, league)
      }
    } catch (err) {
      // Tiho nastavi — očekivano da većina endpointa ne radi
    }
  }

  // TODO: Implementirati sa headless browser-om
  console.log(`  ⚠️ MaxBet: Sajt blokira direktne API pozive za ${league}. Potreban headless browser.`)
  return []
}

/**
 * Parsiraj MaxBet response (ako ikad uspemo dobiti podatke)
 */
function parseMaxBetResponse(data, league) {
  // TODO: Implementirati kad se pronađe radni endpoint
  // Očekivani format: niz mečeva sa kvotama
  try {
    if (Array.isArray(data)) {
      return data.map(event => ({
        homeTeam: event.home || event.homeTeam || '',
        awayTeam: event.away || event.awayTeam || '',
        date: event.date || event.startTime || '',
        odds: {
          home: parseFloat(event.odds?.['1'] || event.home_odds) || null,
          draw: parseFloat(event.odds?.['X'] || event.draw_odds) || null,
          away: parseFloat(event.odds?.['2'] || event.away_odds) || null,
        },
      })).filter(e => e.homeTeam && e.odds.home)
    }
  } catch (err) {
    console.log(`  ❌ MaxBet parse error: ${err.message}`)
  }
  return []
}

/**
 * Scrape sve lige
 */
export async function scrapeMaxBetAll() {
  console.log('🏦 Pokrećem MaxBet scraper...')
  const results = {}

  for (const league of Object.keys(LEAGUE_MAP)) {
    const odds = await scrapeMaxBet(league)
    if (odds.length > 0) {
      results[league] = odds
    }
  }

  const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
  console.log(`  MaxBet: ${total} mečeva ukupno (${Object.keys(results).length} liga)`)
  return results
}

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('maxbet')) {
  scrapeMaxBetAll().catch(console.error)
}
