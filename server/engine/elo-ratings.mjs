/**
 * ELO Rating System za fudbalske timove
 * Koristi se za dopunsku predikciju uz Poisson model
 */

// ELO ratings storage
const eloRatings = new Map()
const DEFAULT_RATING = 1500
const HOME_ADVANTAGE = 65

// Predefinisani ELO za poznate timove (približno tačni)
const INITIAL_RATINGS = {
  // Premier League
  'Manchester City': 1850, 'Arsenal': 1820, 'Liverpool': 1810,
  'Chelsea': 1720, 'Manchester United': 1700, 'Tottenham Hotspur': 1690,
  'Newcastle United': 1710, 'Aston Villa': 1680, 'Brighton': 1660,
  'West Ham United': 1640, 'Crystal Palace': 1600, 'Fulham': 1610,
  'Wolverhampton Wanderers': 1590, 'Bournemouth': 1580, 'Brentford': 1600,
  'Everton': 1570, 'Nottingham Forest': 1590, 'Burnley': 1530,
  'Sheffield United': 1500, 'Luton Town': 1490,
  // La Liga
  'Real Madrid': 1870, 'Barcelona': 1850, 'Atletico Madrid': 1760,
  'Real Sociedad': 1690, 'Athletic Club': 1670, 'Real Betis': 1650,
  'Villarreal': 1660, 'Sevilla': 1640, 'Valencia': 1610, 'Girona': 1680,
  // Bundesliga
  'Bayern Munich': 1860, 'Borussia Dortmund': 1770, 'Bayer Leverkusen': 1800,
  'RB Leipzig': 1730, 'VfB Stuttgart': 1690, 'Eintracht Frankfurt': 1660,
  'Wolfsburg': 1620, 'Freiburg': 1640, 'Union Berlin': 1610, 'Hoffenheim': 1600,
  // Serie A
  'Inter Milan': 1810, 'AC Milan': 1730, 'Juventus': 1750, 'Napoli': 1770,
  'AS Roma': 1690, 'Lazio': 1680, 'Atalanta': 1720, 'Fiorentina': 1650,
  'Bologna': 1640, 'Torino': 1600,
  // Ligue 1
  'Paris Saint-Germain': 1830, 'Marseille': 1680, 'Monaco': 1690, 'Lille': 1670,
  'Lyon': 1660, 'Lens': 1650, 'Nice': 1640, 'Rennes': 1630,
}

// Inicijalizuj poznate timove
for (const [team, rating] of Object.entries(INITIAL_RATINGS)) {
  eloRatings.set(team, rating)
}

/**
 * Dohvati ELO rating za tim
 */
export function getEloRating(team) {
  // Fuzzy match
  if (eloRatings.has(team)) return eloRatings.get(team)

  const lower = team.toLowerCase()
  for (const [key, rating] of eloRatings) {
    if (key.toLowerCase() === lower || key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return rating
    }
  }

  // Novi tim - postavi default
  eloRatings.set(team, DEFAULT_RATING)
  return DEFAULT_RATING
}

/**
 * Izračunaj očekivani rezultat na osnovu ELO razlike
 */
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/**
 * Ažuriraj ELO posle meča
 * @param {string} homeTeam
 * @param {string} awayTeam
 * @param {number} homeGoals
 * @param {number} awayGoals
 * @param {boolean} isCup - K-factor 30 za cup, 20 za ligu
 */
export function updateElo(homeTeam, awayTeam, homeGoals, awayGoals, isCup = false) {
  const K = isCup ? 30 : 20
  const homeRating = getEloRating(homeTeam)
  const awayRating = getEloRating(awayTeam)

  // Home advantage ugrađen u kalkulaciju
  const homeExpected = expectedScore(homeRating + HOME_ADVANTAGE, awayRating)
  const awayExpected = 1 - homeExpected

  // Stvarni rezultat (1 = win, 0.5 = draw, 0 = loss)
  let homeActual, awayActual
  if (homeGoals > awayGoals) { homeActual = 1; awayActual = 0 }
  else if (homeGoals === awayGoals) { homeActual = 0.5; awayActual = 0.5 }
  else { homeActual = 0; awayActual = 1 }

  // Goal difference multiplier (veće pobede = veći uticaj)
  const goalDiff = Math.abs(homeGoals - awayGoals)
  const gdMultiplier = goalDiff <= 1 ? 1 : goalDiff === 2 ? 1.5 : (1.75 + (goalDiff - 3) * 0.5)

  const newHomeRating = Math.round(homeRating + K * gdMultiplier * (homeActual - homeExpected))
  const newAwayRating = Math.round(awayRating + K * gdMultiplier * (awayActual - awayExpected))

  eloRatings.set(homeTeam, newHomeRating)
  eloRatings.set(awayTeam, newAwayRating)

  return { homeRating: newHomeRating, awayRating: newAwayRating }
}

/**
 * Ažuriraj ELO iz niza rezultata
 */
export function updateEloFromResults(results, isCup = false) {
  for (const match of results) {
    updateElo(match.homeTeam, match.awayTeam, match.homeGoals, match.awayGoals, isCup)
  }
}

/**
 * Predvidi ishod meča na osnovu ELO
 * @returns {{ homeWin: number, draw: number, awayWin: number, homeRating: number, awayRating: number }}
 */
export function predictFromElo(homeTeam, awayTeam) {
  const homeRating = getEloRating(homeTeam)
  const awayRating = getEloRating(awayTeam)

  // Expected score sa home advantage
  const homeExp = expectedScore(homeRating + HOME_ADVANTAGE, awayRating)

  // Konverzija expected score u 1X2 verovatnoće
  // Empirijski model: draw verovatnoća je viša kad su timovi bliski
  const ratingDiff = Math.abs(homeRating + HOME_ADVANTAGE - awayRating)
  const drawBase = 0.28 - ratingDiff * 0.0004 // Manji draw % kad je veća razlika
  const drawProb = Math.max(0.10, Math.min(0.35, drawBase))

  // Podeli preostalu verovatnoću proporcijalno expected scoreu
  const remaining = 1 - drawProb
  const homeWin = remaining * homeExp
  const awayWin = remaining * (1 - homeExp)

  return {
    homeWin: +homeWin.toFixed(4),
    draw: +drawProb.toFixed(4),
    awayWin: +awayWin.toFixed(4),
    homeRating,
    awayRating,
    ratingDiff: homeRating - awayRating,
  }
}

/**
 * Dohvati sve ELO rejtinge
 */
export function getAllRatings() {
  return Object.fromEntries(eloRatings)
}
