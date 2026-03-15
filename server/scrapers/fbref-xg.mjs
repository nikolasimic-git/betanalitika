/**
 * FBref xG Scraper
 * Scrape Expected Goals podatke za Top 5 liga
 * FALLBACK: Mock podaci ako FBref blokira (Cloudflare)
 */
import axios from 'axios'
import * as cheerio from 'cheerio'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, '..', 'data', 'xg-data.json')

// FBref league URLs za tekuću sezonu
const LEAGUES = {
  'Premier League': { url: 'https://fbref.com/en/comps/9/Premier-League-Stats', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'La Liga': { url: 'https://fbref.com/en/comps/12/La-Liga-Stats', flag: '🇪🇸' },
  'Serie A': { url: 'https://fbref.com/en/comps/11/Serie-A-Stats', flag: '🇮🇹' },
  'Bundesliga': { url: 'https://fbref.com/en/comps/20/Bundesliga-Stats', flag: '🇩🇪' },
  'Ligue 1': { url: 'https://fbref.com/en/comps/13/Ligue-1-Stats', flag: '🇫🇷' },
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Pokušaj scrape FBref stranicu za ligu
 */
async function scrapeFBrefLeague(leagueName, leagueInfo) {
  try {
    console.log(`  📥 Scraping ${leagueName}...`)
    const resp = await axios.get(leagueInfo.url, {
      headers: HEADERS,
      timeout: 15000,
    })

    const $ = cheerio.load(resp.data)
    const teams = []

    // FBref ima tabelu sa id="stats_squads_standard" ili slično
    // Tražimo tabelu sa xG podacima
    const table = $('table#stats_squads_standard_for, table[id*="stats_squads"]').first()
    
    if (table.length === 0) {
      console.log(`  ⚠️ Tabela nije pronađena za ${leagueName}, koristim fallback`)
      return null
    }

    table.find('tbody tr:not(.thead)').each((_, row) => {
      const $row = $(row)
      const teamName = $row.find('td[data-stat="team"], th[data-stat="team"]').text().trim()
      if (!teamName) return

      const xg = parseFloat($row.find('td[data-stat="xg"]').text()) || 0
      const xga = parseFloat($row.find('td[data-stat="xg_against"], td[data-stat="xga"]').text()) || 0
      const npxg = parseFloat($row.find('td[data-stat="npxg"]').text()) || 0
      const shots = parseFloat($row.find('td[data-stat="shots"]').text()) || 0
      const shotsOnTarget = parseFloat($row.find('td[data-stat="shots_on_target"]').text()) || 0
      const gamesPlayed = parseFloat($row.find('td[data-stat="games"], td[data-stat="mp"]').text()) || 1

      teams.push({
        team: teamName,
        league: leagueName,
        leagueFlag: leagueInfo.flag,
        xg: +(xg / gamesPlayed).toFixed(3),
        xga: +(xga / gamesPlayed).toFixed(3),
        npxg: +(npxg / gamesPlayed).toFixed(3),
        shotsPerGame: +(shots / gamesPlayed).toFixed(1),
        shotsOnTargetPerGame: +(shotsOnTarget / gamesPlayed).toFixed(1),
        gamesPlayed,
        // Rolling average se računa iz poslednjih 6 mečeva kad imamo match-by-match
        // Za sad koristimo sezonski prosek kao aproksimaciju
        xgRolling6: +(xg / gamesPlayed).toFixed(3),
        xgaRolling6: +(xga / gamesPlayed).toFixed(3),
      })
    })

    if (teams.length > 0) {
      console.log(`  ✅ ${leagueName}: ${teams.length} timova`)
      return teams
    }
    return null
  } catch (err) {
    console.log(`  ❌ FBref blocked/error za ${leagueName}: ${err.message}`)
    return null
  }
}

/**
 * Mock xG podaci za fallback
 */
function getMockXGData() {
  const mockTeams = {
    'Premier League': [
      { team: 'Arsenal', xg: 2.1, xga: 0.8, npxg: 1.9 },
      { team: 'Manchester City', xg: 2.3, xga: 0.9, npxg: 2.0 },
      { team: 'Liverpool', xg: 2.2, xga: 0.7, npxg: 1.8 },
      { team: 'Chelsea', xg: 1.7, xga: 1.1, npxg: 1.5 },
      { team: 'Aston Villa', xg: 1.6, xga: 1.2, npxg: 1.4 },
      { team: 'Newcastle', xg: 1.8, xga: 1.0, npxg: 1.5 },
      { team: 'Manchester United', xg: 1.4, xga: 1.3, npxg: 1.2 },
      { team: 'Tottenham', xg: 1.9, xga: 1.4, npxg: 1.6 },
      { team: 'Brighton', xg: 1.5, xga: 1.1, npxg: 1.3 },
      { team: 'West Ham', xg: 1.2, xga: 1.5, npxg: 1.0 },
      { team: 'Bournemouth', xg: 1.3, xga: 1.4, npxg: 1.1 },
      { team: 'Crystal Palace', xg: 1.1, xga: 1.3, npxg: 0.9 },
      { team: 'Fulham', xg: 1.2, xga: 1.2, npxg: 1.0 },
      { team: 'Wolves', xg: 1.0, xga: 1.6, npxg: 0.8 },
      { team: 'Everton', xg: 0.9, xga: 1.5, npxg: 0.7 },
      { team: 'Brentford', xg: 1.4, xga: 1.3, npxg: 1.1 },
      { team: 'Nottingham Forest', xg: 1.1, xga: 1.0, npxg: 0.9 },
      { team: 'Luton Town', xg: 0.8, xga: 1.8, npxg: 0.7 },
      { team: 'Burnley', xg: 0.7, xga: 1.9, npxg: 0.6 },
      { team: 'Sheffield United', xg: 0.6, xga: 2.0, npxg: 0.5 },
    ],
    'La Liga': [
      { team: 'Real Madrid', xg: 2.2, xga: 0.8, npxg: 1.8 },
      { team: 'Barcelona', xg: 2.4, xga: 0.9, npxg: 2.1 },
      { team: 'Atletico Madrid', xg: 1.6, xga: 0.7, npxg: 1.3 },
      { team: 'Athletic Club', xg: 1.5, xga: 1.0, npxg: 1.3 },
      { team: 'Real Sociedad', xg: 1.4, xga: 1.1, npxg: 1.2 },
      { team: 'Real Betis', xg: 1.3, xga: 1.2, npxg: 1.1 },
      { team: 'Villarreal', xg: 1.5, xga: 1.1, npxg: 1.2 },
      { team: 'Girona', xg: 1.8, xga: 1.2, npxg: 1.5 },
      { team: 'Sevilla', xg: 1.1, xga: 1.3, npxg: 0.9 },
      { team: 'Valencia', xg: 1.0, xga: 1.4, npxg: 0.8 },
    ],
    'Serie A': [
      { team: 'Inter', xg: 2.1, xga: 0.7, npxg: 1.8 },
      { team: 'Juventus', xg: 1.5, xga: 0.8, npxg: 1.3 },
      { team: 'Milan', xg: 1.7, xga: 1.0, npxg: 1.4 },
      { team: 'Napoli', xg: 1.8, xga: 0.9, npxg: 1.5 },
      { team: 'Atalanta', xg: 2.0, xga: 1.0, npxg: 1.7 },
      { team: 'Roma', xg: 1.4, xga: 1.2, npxg: 1.1 },
      { team: 'Lazio', xg: 1.6, xga: 1.1, npxg: 1.3 },
      { team: 'Fiorentina', xg: 1.5, xga: 1.1, npxg: 1.2 },
      { team: 'Bologna', xg: 1.4, xga: 1.0, npxg: 1.2 },
      { team: 'Torino', xg: 1.1, xga: 1.3, npxg: 0.9 },
    ],
    'Bundesliga': [
      { team: 'Bayern Munich', xg: 2.5, xga: 0.9, npxg: 2.1 },
      { team: 'Bayer Leverkusen', xg: 2.2, xga: 0.8, npxg: 1.9 },
      { team: 'Borussia Dortmund', xg: 2.0, xga: 1.2, npxg: 1.7 },
      { team: 'RB Leipzig', xg: 1.8, xga: 1.0, npxg: 1.5 },
      { team: 'Stuttgart', xg: 1.9, xga: 1.1, npxg: 1.6 },
      { team: 'Eintracht Frankfurt', xg: 1.5, xga: 1.2, npxg: 1.3 },
      { team: 'Freiburg', xg: 1.3, xga: 1.0, npxg: 1.1 },
      { team: 'Hoffenheim', xg: 1.4, xga: 1.4, npxg: 1.2 },
      { team: 'Union Berlin', xg: 1.0, xga: 1.3, npxg: 0.8 },
      { team: 'Wolfsburg', xg: 1.2, xga: 1.2, npxg: 1.0 },
    ],
    'Ligue 1': [
      { team: 'PSG', xg: 2.6, xga: 0.7, npxg: 2.2 },
      { team: 'Monaco', xg: 1.8, xga: 1.0, npxg: 1.5 },
      { team: 'Marseille', xg: 1.6, xga: 1.1, npxg: 1.3 },
      { team: 'Lille', xg: 1.4, xga: 0.9, npxg: 1.2 },
      { team: 'Lyon', xg: 1.5, xga: 1.2, npxg: 1.3 },
      { team: 'Nice', xg: 1.3, xga: 1.0, npxg: 1.1 },
      { team: 'Lens', xg: 1.2, xga: 1.0, npxg: 1.0 },
      { team: 'Rennes', xg: 1.3, xga: 1.3, npxg: 1.1 },
      { team: 'Strasbourg', xg: 1.1, xga: 1.4, npxg: 0.9 },
      { team: 'Toulouse', xg: 1.0, xga: 1.3, npxg: 0.8 },
    ],
  }

  const result = []
  for (const [league, teams] of Object.entries(mockTeams)) {
    const flag = LEAGUES[league].flag
    for (const t of teams) {
      result.push({
        team: t.team,
        league,
        leagueFlag: flag,
        xg: t.xg,
        xga: t.xga,
        npxg: t.npxg,
        shotsPerGame: +(t.xg * 7).toFixed(1),
        shotsOnTargetPerGame: +(t.xg * 3.5).toFixed(1),
        gamesPlayed: 25,
        xgRolling6: t.xg,
        xgaRolling6: t.xga,
      })
    }
  }
  return result
}

/**
 * Glavni scrape flow
 */
export async function scrapeXG() {
  console.log('⚽ Pokrećem FBref xG scraper...')
  const allTeams = []
  let usedMock = false

  for (const [name, info] of Object.entries(LEAGUES)) {
    const teams = await scrapeFBrefLeague(name, info)
    if (teams) {
      allTeams.push(...teams)
    }
    // Pauza između requestova da ne trigerujemo Cloudflare
    await sleep(3000)
  }

  // Ako nismo dobili ništa, koristi mock
  if (allTeams.length === 0) {
    console.log('⚠️ FBref nedostupan — koristim mock xG podatke')
    allTeams.push(...getMockXGData())
    usedMock = true
  }

  const data = {
    teams: allTeams,
    scrapedAt: new Date().toISOString(),
    source: usedMock ? 'mock' : 'fbref',
    totalTeams: allTeams.length,
  }

  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  console.log(`✅ xG podaci sačuvani: ${allTeams.length} timova (${data.source})`)
  return data
}

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('fbref-xg')) {
  scrapeXG().catch(console.error)
}
