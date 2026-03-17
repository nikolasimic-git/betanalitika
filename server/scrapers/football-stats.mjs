/**
 * Football Stats Scraper - ESPN API
 * Zamena za FBref/Understat koji blokiraju scraping
 * Koristi besplatni ESPN API za statistiku timova
 */
import axios from 'axios'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'

const LEAGUES = {
  'eng.1': { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'esp.1': { name: 'La Liga', flag: '🇪🇸' },
  'ger.1': { name: 'Bundesliga', flag: '🇩🇪' },
  'ita.1': { name: 'Serie A', flag: '🇮🇹' },
  'fra.1': { name: 'Ligue 1', flag: '🇫🇷' },
  'uefa.champions': { name: 'Champions League', flag: '🏆' },
}

// Cache za stats - traje 2h
const statsCache = new Map()
const CACHE_TTL = 2 * 60 * 60 * 1000

/**
 * Fetch rezultate za ligu u poslednjih N dana
 */
async function fetchRecentResults(league, days = 30) {
  const results = []
  const now = new Date()

  // ESPN scoreboard API - fetch po datumu
  for (let d = 0; d < days; d += 7) {
    const date = new Date(now.getTime() - d * 86400000)
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')

    try {
      const resp = await axios.get(`${ESPN_BASE}/${league}/scoreboard`, {
        params: { dates: dateStr, limit: 100 },
        timeout: 10000,
      })

      const events = resp.data?.events || []
      for (const event of events) {
        const competition = event.competitions?.[0]
        if (!competition) continue

        const status = competition.status?.type?.completed
        if (!status) continue

        const competitors = competition.competitors || []
        if (competitors.length !== 2) continue

        const home = competitors.find(c => c.homeAway === 'home')
        const away = competitors.find(c => c.homeAway === 'away')
        if (!home || !away) continue

        results.push({
          date: event.date,
          homeTeam: home.team?.displayName || home.team?.name,
          awayTeam: away.team?.displayName || away.team?.name,
          homeGoals: parseInt(home.score) || 0,
          awayGoals: parseInt(away.score) || 0,
          homeId: home.team?.id,
          awayId: away.team?.id,
        })
      }
    } catch (err) {
      // Tiho preskačemo greške za pojedinačne datume
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 300))
  }

  return results
}

/**
 * Fetch sve timove za ligu
 */
async function fetchTeams(league) {
  try {
    const resp = await axios.get(`${ESPN_BASE}/${league}/teams`, { timeout: 10000 })
    const teams = resp.data?.sports?.[0]?.leagues?.[0]?.teams || []
    return teams.map(t => ({
      id: t.team.id,
      name: t.team.displayName || t.team.name,
      shortName: t.team.shortDisplayName || t.team.abbreviation,
    }))
  } catch (err) {
    console.log(`  ⚠️ Greška pri fetch timova za ${league}: ${err.message}`)
    return []
  }
}

/**
 * Izračunaj statistiku za sve timove na osnovu rezultata
 */
function calculateTeamStats(results, teams) {
  const stats = {}

  // Inicijalizuj sve timove
  for (const team of teams) {
    stats[team.name] = {
      name: team.name,
      id: team.id,
      matches: [],
      homeMatches: [],
      awayMatches: [],
      homeGoalsScored: 0,
      homeGoalsConceded: 0,
      awayGoalsScored: 0,
      awayGoalsConceded: 0,
      homeWins: 0, homeDraws: 0, homeLosses: 0,
      awayWins: 0, awayDraws: 0, awayLosses: 0,
      cleanSheets: 0,
      bttsCount: 0,
      over25Count: 0,
      totalMatches: 0,
      homeMatchCount: 0,
      awayMatchCount: 0,
    }
  }

  // Popuni iz rezultata
  for (const match of results) {
    const homeStats = stats[match.homeTeam]
    const awayStats = stats[match.awayTeam]

    if (homeStats) {
      homeStats.homeGoalsScored += match.homeGoals
      homeStats.homeGoalsConceded += match.awayGoals
      homeStats.homeMatchCount++
      homeStats.totalMatches++
      homeStats.homeMatches.push(match)
      homeStats.matches.push({ ...match, venue: 'home' })

      if (match.homeGoals > match.awayGoals) homeStats.homeWins++
      else if (match.homeGoals === match.awayGoals) homeStats.homeDraws++
      else homeStats.homeLosses++

      if (match.awayGoals === 0) homeStats.cleanSheets++
      if (match.homeGoals > 0 && match.awayGoals > 0) homeStats.bttsCount++
      if (match.homeGoals + match.awayGoals > 2.5) homeStats.over25Count++
    }

    if (awayStats) {
      awayStats.awayGoalsScored += match.awayGoals
      awayStats.awayGoalsConceded += match.homeGoals
      awayStats.awayMatchCount++
      awayStats.totalMatches++
      awayStats.awayMatches.push(match)
      awayStats.matches.push({ ...match, venue: 'away' })

      if (match.awayGoals > match.homeGoals) awayStats.awayWins++
      else if (match.homeGoals === match.awayGoals) awayStats.awayDraws++
      else awayStats.awayLosses++

      if (match.homeGoals === 0) awayStats.cleanSheets++
      if (match.homeGoals > 0 && match.awayGoals > 0) awayStats.bttsCount++
      if (match.homeGoals + match.awayGoals > 2.5) awayStats.over25Count++
    }
  }

  // Izračunaj proseke i forme
  for (const team of Object.values(stats)) {
    if (team.totalMatches === 0) continue

    team.avgGoalsScored = (team.homeGoalsScored + team.awayGoalsScored) / team.totalMatches
    team.avgGoalsConceded = (team.homeGoalsConceded + team.awayGoalsConceded) / team.totalMatches
    team.avgGoalsPerMatch = (team.homeGoalsScored + team.awayGoalsScored + team.homeGoalsConceded + team.awayGoalsConceded) / team.totalMatches
    team.cleanSheetPct = team.cleanSheets / team.totalMatches
    team.bttsPct = team.bttsCount / team.totalMatches
    team.over25Pct = team.over25Count / team.totalMatches

    // Home/away proseci
    team.avgHomeGoalsScored = team.homeMatchCount > 0 ? team.homeGoalsScored / team.homeMatchCount : 0
    team.avgHomeGoalsConceded = team.homeMatchCount > 0 ? team.homeGoalsConceded / team.homeMatchCount : 0
    team.avgAwayGoalsScored = team.awayMatchCount > 0 ? team.awayGoalsScored / team.awayMatchCount : 0
    team.avgAwayGoalsConceded = team.awayMatchCount > 0 ? team.awayGoalsConceded / team.awayMatchCount : 0

    // Forma (poslednji 5 i 10 mečeva)
    const sorted = team.matches.sort((a, b) => new Date(b.date) - new Date(a.date))
    team.last5 = calculateForm(sorted.slice(0, 5), team.name)
    team.last10 = calculateForm(sorted.slice(0, 10), team.name)

    // Total wins/draws/losses
    team.wins = team.homeWins + team.awayWins
    team.draws = team.homeDraws + team.awayDraws
    team.losses = team.homeLosses + team.awayLosses

    // Cleanup - ne treba matches u outputu
    delete team.matches
    delete team.homeMatches
    delete team.awayMatches
  }

  return stats
}

function calculateForm(matches, teamName) {
  let w = 0, d = 0, l = 0, gf = 0, ga = 0
  for (const m of matches) {
    const isHome = m.homeTeam === teamName || m.venue === 'home'
    const scored = isHome ? m.homeGoals : m.awayGoals
    const conceded = isHome ? m.awayGoals : m.homeGoals
    gf += scored
    ga += conceded
    if (scored > conceded) w++
    else if (scored === conceded) d++
    else l++
  }
  return {
    played: matches.length,
    wins: w, draws: d, losses: l,
    goalsFor: gf, goalsAgainst: ga,
    points: w * 3 + d,
    form: matches.map(m => {
      const isHome = m.homeTeam === teamName || m.venue === 'home'
      const scored = isHome ? m.homeGoals : m.awayGoals
      const conceded = isHome ? m.awayGoals : m.homeGoals
      if (scored > conceded) return 'W'
      if (scored === conceded) return 'D'
      return 'L'
    }).join(''),
  }
}

/**
 * Izračunaj proseke za celu ligu
 */
function calculateLeagueAverages(teamStats) {
  const teams = Object.values(teamStats).filter(t => t.totalMatches > 0)
  if (teams.length === 0) return null

  const totalHomeGoals = teams.reduce((s, t) => s + t.homeGoalsScored, 0)
  const totalAwayGoals = teams.reduce((s, t) => s + t.awayGoalsScored, 0)
  const totalHomeMatches = teams.reduce((s, t) => s + t.homeMatchCount, 0)
  const totalAwayMatches = teams.reduce((s, t) => s + t.awayMatchCount, 0)

  return {
    avgHomeGoals: totalHomeMatches > 0 ? totalHomeGoals / totalHomeMatches : 1.4,
    avgAwayGoals: totalAwayMatches > 0 ? totalAwayGoals / totalAwayMatches : 1.1,
    avgHomeGoalsConceded: totalAwayMatches > 0 ? totalAwayGoals / totalAwayMatches : 1.1,
    avgAwayGoalsConceded: totalHomeMatches > 0 ? totalHomeGoals / totalHomeMatches : 1.4,
    avgTotalGoals: (totalHomeGoals + totalAwayGoals) / Math.max(totalHomeMatches, 1),
    totalTeams: teams.length,
    totalMatches: totalHomeMatches,
  }
}

/**
 * Dohvati sve statistike za ligu
 * @param {string} league - ESPN league slug (eng.1, esp.1, etc.)
 * @returns {Promise<{ teams: Object, leagueAvg: Object }>}
 */
export async function getTeamStats(league) {
  const cacheKey = `stats_${league}`
  const cached = statsCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  console.log(`  📊 Fetching stats za ${LEAGUES[league]?.name || league}...`)

  const [teams, results] = await Promise.all([
    fetchTeams(league),
    fetchRecentResults(league, 30),
  ])

  if (results.length === 0 && teams.length === 0) {
    console.log(`  ⚠️ Nema podataka za ${league}, koristim fallback`)
    return getFallbackStats(league)
  }

  const teamStats = calculateTeamStats(results, teams)
  const leagueAvg = calculateLeagueAverages(teamStats)

  const data = { teams: teamStats, leagueAvg, league, results: results.length }
  statsCache.set(cacheKey, { data, timestamp: Date.now() })

  console.log(`  ✅ ${league}: ${Object.keys(teamStats).length} timova, ${results.length} mečeva`)
  return data
}

/**
 * Dohvati statistike za konkretan meč
 */
export async function getMatchStats(homeTeam, awayTeam, league) {
  const data = await getTeamStats(league)
  if (!data) return null

  // Fuzzy match za imena timova
  const findTeam = (name) => {
    const lower = name.toLowerCase()
    const exact = data.teams[name]
    if (exact) return exact

    for (const [key, team] of Object.entries(data.teams)) {
      const keyLower = key.toLowerCase()
      if (keyLower === lower || keyLower.includes(lower) || lower.includes(keyLower)) {
        return team
      }
    }
    return null
  }

  const home = findTeam(homeTeam)
  const away = findTeam(awayTeam)

  return {
    home,
    away,
    leagueAvg: data.leagueAvg,
    league,
    found: !!(home && away),
  }
}

/**
 * Fetch današnje fixture za ligu
 */
export async function getTodayFixtures(league) {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const resp = await axios.get(`${ESPN_BASE}/${league}/scoreboard`, {
      params: { dates: today },
      timeout: 10000,
    })

    const events = resp.data?.events || []
    return events.map(event => {
      const comp = event.competitions?.[0]
      if (!comp) return null

      const home = comp.competitors?.find(c => c.homeAway === 'home')
      const away = comp.competitors?.find(c => c.homeAway === 'away')
      if (!home || !away) return null

      const isCompleted = comp.status?.type?.completed
      if (isCompleted) return null // Skip completed matches

      return {
        id: event.id,
        date: event.date,
        homeTeam: home.team?.displayName || home.team?.name,
        awayTeam: away.team?.displayName || away.team?.name,
        homeId: home.team?.id,
        awayId: away.team?.id,
        league,
        leagueName: LEAGUES[league]?.name,
        leagueFlag: LEAGUES[league]?.flag,
      }
    }).filter(Boolean)
  } catch (err) {
    return []
  }
}

/**
 * Fallback stats za kad ESPN ne radi
 */
function getFallbackStats(league) {
  const fallbackTeams = {
    'eng.1': ['Arsenal', 'Manchester City', 'Liverpool', 'Chelsea', 'Manchester United', 'Tottenham Hotspur', 'Newcastle United', 'Aston Villa', 'Brighton', 'West Ham United'],
    'esp.1': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Real Sociedad', 'Athletic Club', 'Real Betis', 'Villarreal', 'Sevilla', 'Valencia', 'Girona'],
    'ger.1': ['Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig', 'VfB Stuttgart', 'Eintracht Frankfurt', 'Wolfsburg', 'Freiburg', 'Union Berlin', 'Hoffenheim'],
    'ita.1': ['Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'AS Roma', 'Lazio', 'Atalanta', 'Fiorentina', 'Bologna', 'Torino'],
    'fra.1': ['Paris Saint-Germain', 'Marseille', 'Monaco', 'Lille', 'Lyon', 'Lens', 'Nice', 'Rennes', 'Strasbourg', 'Toulouse'],
    'uefa.champions': ['Real Madrid', 'Manchester City', 'Bayern Munich', 'Barcelona', 'Paris Saint-Germain', 'Inter Milan', 'Arsenal', 'Borussia Dortmund'],
  }

  const names = fallbackTeams[league] || ['Team A', 'Team B']
  const teams = {}

  for (const name of names) {
    teams[name] = {
      name,
      totalMatches: 10,
      homeGoalsScored: Math.floor(Math.random() * 8) + 8,
      homeGoalsConceded: Math.floor(Math.random() * 5) + 3,
      awayGoalsScored: Math.floor(Math.random() * 6) + 4,
      awayGoalsConceded: Math.floor(Math.random() * 6) + 4,
      homeMatchCount: 5,
      awayMatchCount: 5,
      avgHomeGoalsScored: 1.4 + Math.random() * 0.8,
      avgHomeGoalsConceded: 0.8 + Math.random() * 0.6,
      avgAwayGoalsScored: 1.0 + Math.random() * 0.6,
      avgAwayGoalsConceded: 1.0 + Math.random() * 0.6,
      avgGoalsScored: 1.2 + Math.random() * 0.6,
      avgGoalsConceded: 0.9 + Math.random() * 0.5,
      cleanSheetPct: 0.2 + Math.random() * 0.3,
      bttsPct: 0.4 + Math.random() * 0.3,
      over25Pct: 0.5 + Math.random() * 0.3,
      wins: 4 + Math.floor(Math.random() * 4),
      draws: 1 + Math.floor(Math.random() * 3),
      losses: 1 + Math.floor(Math.random() * 3),
      last5: { played: 5, wins: 2 + Math.floor(Math.random() * 3), draws: Math.floor(Math.random() * 2), losses: Math.floor(Math.random() * 2), form: 'WWDLW' },
      last10: { played: 10, wins: 5, draws: 2, losses: 3, form: 'WWDLWWLDWW' },
    }
  }

  return {
    teams,
    leagueAvg: { avgHomeGoals: 1.45, avgAwayGoals: 1.10, avgHomeGoalsConceded: 1.10, avgAwayGoalsConceded: 1.45, avgTotalGoals: 2.55 },
    league,
    results: 0,
    fallback: true,
  }
}

export { LEAGUES }
