/**
 * Value Detection Engine v2
 * Kombinuje Poisson model (60%) i ELO predikcije (40%)
 * Detektuje value betove, računa Kelly criterion, dodeljuje confidence
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ODDS_FILE = join(__dirname, '..', 'data', 'odds-data.json')
const NBA_FILE = join(__dirname, '..', 'data', 'nba-data.json')

// ── Poisson Helper (legacy fallback) ──
function poissonPMF(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0
  let result = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) { result *= lambda / i }
  return result
}

function poissonMatchProbs(homeXG, awayXG) {
  let home = 0, draw = 0, away = 0
  for (let h = 0; h <= 8; h++) {
    for (let a = 0; a <= 8; a++) {
      const prob = poissonPMF(h, homeXG) * poissonPMF(a, awayXG)
      if (h > a) home += prob
      else if (h === a) draw += prob
      else away += prob
    }
  }
  const total = home + draw + away
  return { home: home / total, draw: draw / total, away: away / total }
}

/**
 * Quarter Kelly Criterion
 */
function quarterKelly(prob, odds) {
  const b = odds - 1
  if (b <= 0) return 0
  const kelly = (b * prob - (1 - prob)) / b
  if (kelly <= 0) return 0
  return +(kelly * 25).toFixed(1) // quarter kelly as percentage
}

/**
 * Confidence score 1-5 na osnovu edge-a i model verovatnoće
 */
function calculateConfidence(edge, modelProb) {
  if (edge > 0.15 && modelProb > 0.70) return 5
  if (edge > 0.10 && modelProb > 0.60) return 4
  if (edge > 0.05 && modelProb > 0.50) return 3
  if (edge > 0.03) return 2
  if (edge > 0) return 1
  return 0
}

/**
 * Kombiniraj Poisson i ELO predikcije
 * @param {Object} poissonPreds - { homeWin, draw, awayWin, over25, bttsYes, ... }
 * @param {Object} eloPreds - { homeWin, draw, awayWin }
 * @returns {Object} combined probabilities
 */
function combinePredictions(poissonPreds, eloPreds) {
  const POISSON_WEIGHT = 0.60
  const ELO_WEIGHT = 0.40

  const combined = {
    homeWin: poissonPreds.homeWin * POISSON_WEIGHT + eloPreds.homeWin * ELO_WEIGHT,
    draw: poissonPreds.draw * POISSON_WEIGHT + eloPreds.draw * ELO_WEIGHT,
    awayWin: poissonPreds.awayWin * POISSON_WEIGHT + eloPreds.awayWin * ELO_WEIGHT,
    // Over/Under i BTTS dolaze samo iz Poissona
    over25: poissonPreds.over25 || 0.50,
    under25: poissonPreds.under25 || 0.50,
    over35: poissonPreds.over35 || 0.28,
    under35: poissonPreds.under35 || 0.72,
    over15: poissonPreds.over15 || 0.75,
    under15: poissonPreds.under15 || 0.25,
    bttsYes: poissonPreds.bttsYes || 0.48,
    bttsNo: poissonPreds.bttsNo || 0.52,
  }

  // Normalizuj 1X2
  const total = combined.homeWin + combined.draw + combined.awayWin
  combined.homeWin /= total
  combined.draw /= total
  combined.awayWin /= total

  return combined
}

/**
 * Detektuj value betove
 * @param {Object} predictions - combined predictions { homeWin, draw, awayWin, over25, bttsYes, ... }
 * @param {Object} odds - { home: number, draw: number, away: number, over25?: number, bttsYes?: number }
 * @param {Object} matchInfo - { homeTeam, awayTeam, league, ... }
 * @returns {Array} value bets
 */
export function detectValue(predictions, odds, matchInfo = {}) {
  const valueBets = []

  const markets = [
    { key: 'homeWin', oddsKey: 'home', label: '1 (Domaćin)', type: 'Pobednik' },
    { key: 'draw', oddsKey: 'draw', label: 'X (Nerešeno)', type: 'Pobednik' },
    { key: 'awayWin', oddsKey: 'away', label: '2 (Gost)', type: 'Pobednik' },
    { key: 'over25', oddsKey: 'over25', label: 'Over 2.5', type: 'Golovi' },
    { key: 'under25', oddsKey: 'under25', label: 'Under 2.5', type: 'Golovi' },
    { key: 'over35', oddsKey: 'over35', label: 'Over 3.5', type: 'Golovi' },
    { key: 'bttsYes', oddsKey: 'bttsYes', label: 'GG (Da)', type: 'BTTS' },
    { key: 'bttsNo', oddsKey: 'bttsNo', label: 'GG (Ne)', type: 'BTTS' },
  ]

  for (const market of markets) {
    const modelProb = predictions[market.key]
    const marketOdds = odds[market.oddsKey]

    if (!modelProb || !marketOdds || marketOdds <= 1) continue

    const impliedProb = 1 / marketOdds
    const edge = modelProb - impliedProb

    if (edge <= 0) continue

    const confidence = calculateConfidence(edge, modelProb)
    if (confidence === 0) continue

    valueBets.push({
      predictionType: market.type,
      predictionValue: market.label,
      modelProb: +modelProb.toFixed(4),
      impliedProb: +impliedProb.toFixed(4),
      odds: marketOdds,
      edge: +edge.toFixed(4),
      ev: +(modelProb * marketOdds).toFixed(4),
      confidence,
      kellyStake: quarterKelly(modelProb, marketOdds),
      ...matchInfo,
    })
  }

  return valueBets.sort((a, b) => b.edge - a.edge)
}

/**
 * Legacy: detectValueBets() za kompatibilnost sa starim kodom
 * Koristi xg-data.json i odds-data.json fajlove
 */
export async function detectValueBets() {
  console.log('🔍 Pokrećem Value Detection Engine v2...')

  if (!existsSync(ODDS_FILE)) {
    console.log('❌ Nedostaje odds-data.json — pokrenite odds scraper!')
    return { soccer: [], nba: [], all: [], total: 0 }
  }

  const oddsData = JSON.parse(readFileSync(ODDS_FILE, 'utf-8'))
  const soccerBets = []

  for (const event of oddsData.events) {
    if (event.sportType !== 'soccer') continue

    // Koristi outcomes format
    const homeOdds = event.outcomes?.[event.homeTeam]?.bestOdds
    const drawOdds = event.outcomes?.['Draw']?.bestOdds
    const awayOdds = event.outcomes?.[event.awayTeam]?.bestOdds

    if (!homeOdds && !drawOdds && !awayOdds) continue

    // Default Poisson predikcija (bez stats, koristimo odds-implied + reversion)
    const impliedHome = homeOdds ? 1 / homeOdds : 0.33
    const impliedDraw = drawOdds ? 1 / drawOdds : 0.28
    const impliedAway = awayOdds ? 1 / awayOdds : 0.33

    // Naš model: slight reversion to mean (market je skoro uvek u pravu)
    const preds = {
      homeWin: impliedHome * 0.9 + 0.37 * 0.1,
      draw: impliedDraw * 0.9 + 0.28 * 0.1,
      awayWin: impliedAway * 0.9 + 0.35 * 0.1,
      over25: 0.52, under25: 0.48,
      over35: 0.28, under35: 0.72,
      bttsYes: 0.48, bttsNo: 0.52,
    }

    const bets = detectValue(preds, {
      home: homeOdds, draw: drawOdds, away: awayOdds,
    }, {
      type: 'soccer',
      league: event.league,
      leagueFlag: event.leagueFlag,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      commenceTime: event.commenceTime,
      bookmaker: event.outcomes?.[event.homeTeam]?.bestBookmaker || '1xbet',
    })

    soccerBets.push(...bets)
  }

  // NBA (legacy)
  const nbaBets = []

  return {
    soccer: soccerBets.sort((a, b) => b.edge - a.edge),
    nba: nbaBets,
    all: [...soccerBets, ...nbaBets].sort((a, b) => b.edge - a.edge),
    total: soccerBets.length + nbaBets.length,
    generatedAt: new Date().toISOString(),
  }
}

export { combinePredictions, calculateConfidence, quarterKelly, poissonPMF }

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('value-detector')) {
  detectValueBets().then(result => {
    console.log(`\n📋 Value betovi: ${result.total}`)
    for (const bet of result.all.slice(0, 10)) {
      console.log(`  ${bet.leagueFlag || '⚽'} ${bet.homeTeam} vs ${bet.awayTeam} — ${bet.predictionValue} @ ${bet.odds} (edge: ${(bet.edge * 100).toFixed(1)}%, ★${bet.confidence})`)
    }
  }).catch(console.error)
}
