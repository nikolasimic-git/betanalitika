/**
 * NBA Four Factors Scraper
 * Net Rating, eFG%, TOV%, ORB%, FT Rate, rest days, home/away record
 */
import axios from 'axios'
import * as cheerio from 'cheerio'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, '..', 'data', 'nba-data.json')

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

/**
 * Pokušaj scrape Basketball-Reference za Four Factors
 */
async function scrapeBBRef() {
  try {
    console.log('  📥 Scraping Basketball-Reference...')
    const resp = await axios.get('https://www.basketball-reference.com/leagues/NBA_2026.html', {
      headers: HEADERS,
      timeout: 15000,
    })
    const $ = cheerio.load(resp.data)
    const teams = []

    // Miscellaneous stats tabela
    const table = $('table#misc_stats, table#advanced-team').first()
    if (table.length > 0) {
      table.find('tbody tr:not(.thead)').each((_, row) => {
        const $r = $(row)
        const team = $r.find('td[data-stat="team_name"], a').first().text().trim().replace('*', '')
        if (!team) return

        teams.push({
          team,
          netRating: parseFloat($r.find('td[data-stat="net_rtg"]').text()) || 0,
          offRating: parseFloat($r.find('td[data-stat="off_rtg"]').text()) || 0,
          defRating: parseFloat($r.find('td[data-stat="def_rtg"]').text()) || 0,
          efgPct: parseFloat($r.find('td[data-stat="efg_pct"]').text()) || 0,
          tovPct: parseFloat($r.find('td[data-stat="tov_pct"]').text()) || 0,
          orbPct: parseFloat($r.find('td[data-stat="orb_pct"]').text()) || 0,
          ftRate: parseFloat($r.find('td[data-stat="ft_rate"]').text()) || 0,
          wins: parseInt($r.find('td[data-stat="wins"]').text()) || 0,
          losses: parseInt($r.find('td[data-stat="losses"]').text()) || 0,
        })
      })
    }

    return teams.length > 0 ? teams : null
  } catch (err) {
    console.log(`  ❌ BBRef error: ${err.message}`)
    return null
  }
}

/**
 * Pokušaj NBA stats API za schedule (za back-to-back detekciju)
 */
async function fetchNBASchedule() {
  try {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const resp = await axios.get(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`,
      { headers: HEADERS, timeout: 10000 }
    )
    
    const games = resp.data?.events?.map(ev => ({
      id: ev.id,
      date: ev.date,
      homeTeam: ev.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName,
      awayTeam: ev.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName,
      status: ev.status?.type?.name,
    })) || []

    return games
  } catch (err) {
    console.log(`  ⚠️ ESPN schedule error: ${err.message}`)
    return []
  }
}

/**
 * Mock NBA podaci
 */
function getMockNBAData() {
  return [
    { team: 'Boston Celtics', netRating: 11.2, offRating: 122.1, defRating: 110.9, efgPct: 0.582, tovPct: 0.127, orbPct: 0.248, ftRate: 0.242, wins: 52, losses: 14, homeRecord: '30-4', awayRecord: '22-10' },
    { team: 'Oklahoma City Thunder', netRating: 10.5, offRating: 120.8, defRating: 110.3, efgPct: 0.568, tovPct: 0.131, orbPct: 0.260, ftRate: 0.258, wins: 50, losses: 16, homeRecord: '28-5', awayRecord: '22-11' },
    { team: 'Cleveland Cavaliers', netRating: 9.8, offRating: 119.5, defRating: 109.7, efgPct: 0.571, tovPct: 0.129, orbPct: 0.245, ftRate: 0.238, wins: 49, losses: 17, homeRecord: '29-4', awayRecord: '20-13' },
    { team: 'Denver Nuggets', netRating: 5.2, offRating: 117.2, defRating: 112.0, efgPct: 0.555, tovPct: 0.133, orbPct: 0.252, ftRate: 0.248, wins: 44, losses: 22, homeRecord: '26-7', awayRecord: '18-15' },
    { team: 'Milwaukee Bucks', netRating: 4.1, offRating: 116.8, defRating: 112.7, efgPct: 0.548, tovPct: 0.136, orbPct: 0.241, ftRate: 0.251, wins: 42, losses: 24, homeRecord: '24-9', awayRecord: '18-15' },
    { team: 'Minnesota Timberwolves', netRating: 6.3, offRating: 115.2, defRating: 108.9, efgPct: 0.541, tovPct: 0.134, orbPct: 0.255, ftRate: 0.245, wins: 46, losses: 20, homeRecord: '27-6', awayRecord: '19-14' },
    { team: 'New York Knicks', netRating: 5.8, offRating: 118.1, defRating: 112.3, efgPct: 0.552, tovPct: 0.130, orbPct: 0.265, ftRate: 0.265, wins: 45, losses: 21, homeRecord: '26-7', awayRecord: '19-14' },
    { team: 'Dallas Mavericks', netRating: 4.5, offRating: 118.5, defRating: 114.0, efgPct: 0.558, tovPct: 0.128, orbPct: 0.238, ftRate: 0.235, wins: 42, losses: 24, homeRecord: '25-8', awayRecord: '17-16' },
    { team: 'Phoenix Suns', netRating: 3.2, offRating: 116.5, defRating: 113.3, efgPct: 0.545, tovPct: 0.132, orbPct: 0.240, ftRate: 0.240, wins: 40, losses: 26, homeRecord: '23-10', awayRecord: '17-16' },
    { team: 'Los Angeles Lakers', netRating: 2.1, offRating: 115.0, defRating: 112.9, efgPct: 0.538, tovPct: 0.135, orbPct: 0.243, ftRate: 0.248, wins: 38, losses: 28, homeRecord: '22-11', awayRecord: '16-17' },
    { team: 'Miami Heat', netRating: 1.8, offRating: 113.5, defRating: 111.7, efgPct: 0.532, tovPct: 0.138, orbPct: 0.238, ftRate: 0.232, wins: 37, losses: 29, homeRecord: '22-11', awayRecord: '15-18' },
    { team: 'Golden State Warriors', netRating: 1.5, offRating: 115.8, defRating: 114.3, efgPct: 0.547, tovPct: 0.140, orbPct: 0.235, ftRate: 0.228, wins: 36, losses: 30, homeRecord: '21-12', awayRecord: '15-18' },
    { team: 'Indiana Pacers', netRating: 2.5, offRating: 121.0, defRating: 118.5, efgPct: 0.565, tovPct: 0.142, orbPct: 0.250, ftRate: 0.255, wins: 39, losses: 27, homeRecord: '23-10', awayRecord: '16-17' },
    { team: 'Sacramento Kings', netRating: 0.8, offRating: 116.2, defRating: 115.4, efgPct: 0.542, tovPct: 0.137, orbPct: 0.237, ftRate: 0.230, wins: 35, losses: 31, homeRecord: '20-13', awayRecord: '15-18' },
    { team: 'Philadelphia 76ers', netRating: -0.5, offRating: 113.0, defRating: 113.5, efgPct: 0.525, tovPct: 0.141, orbPct: 0.240, ftRate: 0.260, wins: 33, losses: 33, homeRecord: '19-14', awayRecord: '14-19' },
    { team: 'LA Clippers', netRating: 0.2, offRating: 114.5, defRating: 114.3, efgPct: 0.535, tovPct: 0.133, orbPct: 0.238, ftRate: 0.238, wins: 34, losses: 32, homeRecord: '20-13', awayRecord: '14-19' },
    { team: 'New Orleans Pelicans', netRating: -1.2, offRating: 112.8, defRating: 114.0, efgPct: 0.528, tovPct: 0.139, orbPct: 0.248, ftRate: 0.245, wins: 31, losses: 35, homeRecord: '18-15', awayRecord: '13-20' },
    { team: 'Chicago Bulls', netRating: -2.5, offRating: 111.5, defRating: 114.0, efgPct: 0.520, tovPct: 0.143, orbPct: 0.235, ftRate: 0.225, wins: 28, losses: 38, homeRecord: '17-16', awayRecord: '11-22' },
    { team: 'Atlanta Hawks', netRating: -1.8, offRating: 115.5, defRating: 117.3, efgPct: 0.535, tovPct: 0.144, orbPct: 0.230, ftRate: 0.228, wins: 30, losses: 36, homeRecord: '18-15', awayRecord: '12-21' },
    { team: 'Toronto Raptors', netRating: -3.5, offRating: 110.0, defRating: 113.5, efgPct: 0.510, tovPct: 0.148, orbPct: 0.232, ftRate: 0.220, wins: 25, losses: 41, homeRecord: '15-18', awayRecord: '10-23' },
    { team: 'Houston Rockets', netRating: -1.0, offRating: 112.5, defRating: 113.5, efgPct: 0.530, tovPct: 0.140, orbPct: 0.255, ftRate: 0.235, wins: 32, losses: 34, homeRecord: '19-14', awayRecord: '13-20' },
    { team: 'Brooklyn Nets', netRating: -4.0, offRating: 109.5, defRating: 113.5, efgPct: 0.508, tovPct: 0.150, orbPct: 0.228, ftRate: 0.218, wins: 23, losses: 43, homeRecord: '14-19', awayRecord: '9-24' },
    { team: 'Orlando Magic', netRating: 3.5, offRating: 112.0, defRating: 108.5, efgPct: 0.530, tovPct: 0.130, orbPct: 0.260, ftRate: 0.248, wins: 41, losses: 25, homeRecord: '24-9', awayRecord: '17-16' },
    { team: 'Memphis Grizzlies', netRating: -2.0, offRating: 111.0, defRating: 113.0, efgPct: 0.518, tovPct: 0.145, orbPct: 0.242, ftRate: 0.235, wins: 27, losses: 39, homeRecord: '16-17', awayRecord: '11-22' },
    { team: 'Utah Jazz', netRating: -5.5, offRating: 108.0, defRating: 113.5, efgPct: 0.505, tovPct: 0.152, orbPct: 0.225, ftRate: 0.215, wins: 20, losses: 46, homeRecord: '12-21', awayRecord: '8-25' },
    { team: 'Portland Trail Blazers', netRating: -6.0, offRating: 107.5, defRating: 113.5, efgPct: 0.502, tovPct: 0.155, orbPct: 0.222, ftRate: 0.210, wins: 18, losses: 48, homeRecord: '11-22', awayRecord: '7-26' },
    { team: 'Charlotte Hornets', netRating: -5.0, offRating: 108.5, defRating: 113.5, efgPct: 0.508, tovPct: 0.148, orbPct: 0.228, ftRate: 0.218, wins: 21, losses: 45, homeRecord: '13-20', awayRecord: '8-25' },
    { team: 'San Antonio Spurs', netRating: -3.8, offRating: 110.5, defRating: 114.3, efgPct: 0.515, tovPct: 0.146, orbPct: 0.235, ftRate: 0.228, wins: 24, losses: 42, homeRecord: '14-19', awayRecord: '10-23' },
    { team: 'Washington Wizards', netRating: -8.0, offRating: 105.0, defRating: 113.0, efgPct: 0.495, tovPct: 0.158, orbPct: 0.220, ftRate: 0.205, wins: 15, losses: 51, homeRecord: '9-24', awayRecord: '6-27' },
    { team: 'Detroit Pistons', netRating: -4.5, offRating: 109.0, defRating: 113.5, efgPct: 0.512, tovPct: 0.150, orbPct: 0.230, ftRate: 0.220, wins: 22, losses: 44, homeRecord: '13-20', awayRecord: '9-24' },
  ]
}

/**
 * Glavni scrape flow
 */
export async function scrapeNBA() {
  console.log('🏀 Pokrećem NBA stats scraper...')
  let teams = await scrapeBBRef()
  let usedMock = false

  if (!teams || teams.length === 0) {
    console.log('⚠️ BBRef nedostupan — koristim mock NBA podatke')
    teams = getMockNBAData()
    usedMock = true
  }

  // Fetch schedule za back-to-back detekciju
  const todayGames = await fetchNBASchedule()

  const data = {
    teams,
    todayGames,
    scrapedAt: new Date().toISOString(),
    source: usedMock ? 'mock' : 'basketball-reference',
    totalTeams: teams.length,
  }

  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  console.log(`✅ NBA podaci sačuvani: ${teams.length} timova (${data.source})`)
  return data
}

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('nba-stats')) {
  scrapeNBA().catch(console.error)
}
