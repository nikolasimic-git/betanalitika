/**
 * Value Detection Engine
 * Poisson model za fudbal, Net Rating model za NBA
 * Detektuje value betove gde model_prob * odds > 1.05
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const XG_FILE = join(__dirname, '..', 'data', 'xg-data.json')
const ODDS_FILE = join(__dirname, '..', 'data', 'odds-data.json')
const NBA_FILE = join(__dirname, '..', 'data', 'nba-data.json')

const VALUE_THRESHOLD = 1.05 // 5% edge minimum

// ── Poisson Helper ──
function poissonPMF(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0
  let result = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) {
    result *= lambda / i
  }
  return result
}

/**
 * Izračunaj verovatnoće home/draw/away koristeći Poisson distribuciju
 * @param {number} homeXG - očekivani golovi domaćina
 * @param {number} awayXG - očekivani golovi gosta
 * @returns {{ home: number, draw: number, away: number }}
 */
function poissonMatchProbs(homeXG, awayXG) {
  let home = 0, draw = 0, away = 0
  const maxGoals = 8

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const prob = poissonPMF(h, homeXG) * poissonPMF(a, awayXG)
      if (h > a) home += prob
      else if (h === a) draw += prob
      else away += prob
    }
  }

  // Normalizuj
  const total = home + draw + away
  return {
    home: +(home / total).toFixed(4),
    draw: +(draw / total).toFixed(4),
    away: +(away / total).toFixed(4),
  }
}

/**
 * Quarter Kelly Criterion za preporučeni ulog
 * @param {number} prob - model verovatnoća
 * @param {number} odds - decimalne kvote
 * @returns {number} procenat bankrolla (0-100)
 */
function quarterKelly(prob, odds) {
  const b = odds - 1
  const kelly = (b * prob - (1 - prob)) / b
  if (kelly <= 0) return 0
  return +(kelly * 25).toFixed(1) // quarter kelly, kao procenat
}

/**
 * Confidence score (1-5) na osnovu edge-a
 */
function edgeToConfidence(edge) {
  if (edge >= 0.20) return 5
  if (edge >= 0.15) return 4
  if (edge >= 0.10) return 3
  if (edge >= 0.07) return 2
  return 1
}

/**
 * Nađi xG podatke za tim (fuzzy match)
 */
function findTeamXG(teamName, xgTeams) {
  const lower = teamName.toLowerCase()
  return xgTeams.find(t => {
    const tl = t.team.toLowerCase()
    return tl === lower || lower.includes(tl) || tl.includes(lower)
  })
}

/**
 * Nađi NBA podatke za tim (fuzzy match)
 */
function findNBATeam(teamName, nbaTeams) {
  const lower = teamName.toLowerCase()
  return nbaTeams.find(t => {
    const tl = t.team.toLowerCase()
    return tl === lower || lower.includes(tl) || tl.includes(lower)
  })
}

/**
 * Detektuj fudbalske value betove
 */
function detectSoccerValue(xgData, oddsData) {
  const valueBets = []
  const soccerEvents = oddsData.events.filter(e => e.sportType === 'soccer')

  for (const event of soccerEvents) {
    const homeXG = findTeamXG(event.homeTeam, xgData.teams)
    const awayXG = findTeamXG(event.awayTeam, xgData.teams)

    if (!homeXG || !awayXG) continue

    // Home advantage boost: +0.15 xG za domaćina
    const homeExpGoals = homeXG.xgRolling6 + 0.15
    const awayExpGoals = awayXG.xgRolling6 - 0.05

    // Koristi xGA protivnika za korekciju
    const adjHomeXG = (homeExpGoals + awayXG.xgaRolling6) / 2
    const adjAwayXG = (awayExpGoals + homeXG.xgaRolling6) / 2

    const probs = poissonMatchProbs(adjHomeXG, adjAwayXG)

    // Proveri value za svaki ishod
    const outcomes = [
      { type: '1 (Domaćin)', prob: probs.home, outcomeKey: event.homeTeam },
      { type: 'X (Nerešeno)', prob: probs.draw, outcomeKey: 'Draw' },
      { type: '2 (Gost)', prob: probs.away, outcomeKey: event.awayTeam },
    ]

    for (const outcome of outcomes) {
      const oddsInfo = event.outcomes[outcome.outcomeKey]
      if (!oddsInfo) continue

      const bestOdds = oddsInfo.bestOdds
      const ev = outcome.prob * bestOdds

      if (ev >= VALUE_THRESHOLD) {
        const edge = ev - 1

        // Poređenje kvota između kladionica
        const oddsComparison = {}
        if (event.odds) {
          for (const [bm, bmOdds] of Object.entries(event.odds)) {
            if (!bmOdds) continue
            const key = outcome.outcomeKey === 'Draw' ? 'draw' : (outcome.outcomeKey === event.homeTeam ? 'home' : 'away')
            if (bmOdds[key]) oddsComparison[bm] = bmOdds[key]
          }
        }

        valueBets.push({
          type: 'soccer',
          league: event.league,
          leagueFlag: event.leagueFlag,
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          commenceTime: event.commenceTime,
          predictionType: 'Pobednik',
          predictionValue: outcome.type,
          modelProb: outcome.prob,
          impliedProb: +(1 / bestOdds).toFixed(4),
          odds: bestOdds,
          bookmaker: oddsInfo.bestBookmaker,
          edge: +edge.toFixed(4),
          ev: +ev.toFixed(4),
          confidence: edgeToConfidence(edge),
          kellyStake: quarterKelly(outcome.prob, bestOdds),
          oddsComparison,
          reasoning: {
            homeXG: adjHomeXG.toFixed(2),
            awayXG: adjAwayXG.toFixed(2),
            probs,
          },
        })
      }
    }
  }

  return valueBets.sort((a, b) => b.edge - a.edge)
}

/**
 * Detektuj NBA value betove
 */
function detectNBAValue(nbaData, oddsData) {
  const valueBets = []
  const nbaEvents = oddsData.events.filter(e => e.sportType === 'basketball')

  for (const event of nbaEvents) {
    const homeTeam = findNBATeam(event.homeTeam, nbaData.teams)
    const awayTeam = findNBATeam(event.awayTeam, nbaData.teams)

    if (!homeTeam || !awayTeam) continue

    // Net Rating bazirana procena poena
    const netRatingDiff = homeTeam.netRating - awayTeam.netRating
    // Home court advantage ≈ 3 poena
    const expectedSpread = -(netRatingDiff / 2 + 3)

    // Back-to-back penalizacija
    // TODO: Implementirati pravu back-to-back detekciju iz schedula
    let b2bAdjustment = 0

    // Four Factors composite score
    const homeFF = homeTeam.efgPct * 0.4 - homeTeam.tovPct * 0.25 + homeTeam.orbPct * 0.2 + homeTeam.ftRate * 0.15
    const awayFF = awayTeam.efgPct * 0.4 - awayTeam.tovPct * 0.25 + awayTeam.orbPct * 0.2 + awayTeam.ftRate * 0.15
    const ffEdge = (homeFF - awayFF) * 100

    // Moneyline procena
    const totalWins = homeTeam.wins + homeTeam.losses + awayTeam.wins + awayTeam.losses
    if (totalWins === 0) continue
    
    const homeWinPct = homeTeam.wins / (homeTeam.wins + homeTeam.losses)
    const awayWinPct = awayTeam.wins / (awayTeam.wins + awayTeam.losses)
    
    // Log5 formula za head-to-head procenu
    const homeProb = (homeWinPct - homeWinPct * awayWinPct) / 
                     (homeWinPct + awayWinPct - 2 * homeWinPct * awayWinPct)
    const awayProb = 1 - homeProb

    // Home court boost
    const adjHomeProb = Math.min(0.95, homeProb * 1.06)
    const adjAwayProb = 1 - adjHomeProb

    // Proveri moneyline value
    const mlOutcomes = [
      { team: event.homeTeam, prob: adjHomeProb, type: `1 (${event.homeTeam})` },
      { team: event.awayTeam, prob: adjAwayProb, type: `2 (${event.awayTeam})` },
    ]

    for (const ml of mlOutcomes) {
      const oddsInfo = event.outcomes[ml.team]
      if (!oddsInfo) continue

      const bestOdds = oddsInfo.bestOdds
      const ev = ml.prob * bestOdds

      if (ev >= VALUE_THRESHOLD) {
        const edge = ev - 1
        valueBets.push({
          type: 'nba',
          league: 'NBA',
          leagueFlag: '🏀',
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          commenceTime: event.commenceTime,
          predictionType: 'Pobednik',
          predictionValue: ml.type,
          modelProb: +ml.prob.toFixed(4),
          impliedProb: +(1 / bestOdds).toFixed(4),
          odds: bestOdds,
          bookmaker: oddsInfo.bestBookmaker,
          edge: +edge.toFixed(4),
          ev: +ev.toFixed(4),
          confidence: edgeToConfidence(edge),
          kellyStake: quarterKelly(ml.prob, bestOdds),
          reasoning: {
            netRatingDiff: +netRatingDiff.toFixed(1),
            expectedSpread: +expectedSpread.toFixed(1),
            homeWinPct: +(homeWinPct * 100).toFixed(1),
            awayWinPct: +(awayWinPct * 100).toFixed(1),
            fourFactorsEdge: +ffEdge.toFixed(2),
          },
        })
      }
    }

    // Proveri spread value ako postoji
    if (event.spreads) {
      for (const [teamName, spreadInfo] of Object.entries(event.spreads)) {
        const teamData = teamName === event.homeTeam ? homeTeam : awayTeam
        const isHome = teamName === event.homeTeam

        // Naš model spread vs. tržišni spread
        const modelSpread = isHome ? expectedSpread : -expectedSpread
        const marketSpread = spreadInfo.avgSpread

        // Ako naš model kaže da je tim bolji nego što tržište misli
        if (Math.abs(modelSpread - marketSpread) > 2) {
          const edge = Math.abs(modelSpread - marketSpread) / 100
          if (edge > 0.02) {
            valueBets.push({
              type: 'nba',
              league: 'NBA',
              leagueFlag: '🏀',
              homeTeam: event.homeTeam,
              awayTeam: event.awayTeam,
              commenceTime: event.commenceTime,
              predictionType: 'Spread',
              predictionValue: `${teamName} ${marketSpread > 0 ? '+' : ''}${marketSpread}`,
              modelProb: 0.55, // Approximate
              impliedProb: 0.50,
              odds: spreadInfo.avgPrice,
              bookmaker: 'Avg',
              edge: +edge.toFixed(4),
              ev: +(0.55 * spreadInfo.avgPrice).toFixed(4),
              confidence: edgeToConfidence(edge),
              kellyStake: quarterKelly(0.55, spreadInfo.avgPrice),
              reasoning: {
                modelSpread: +modelSpread.toFixed(1),
                marketSpread,
                diff: +(modelSpread - marketSpread).toFixed(1),
              },
            })
          }
        }
      }
    }
  }

  return valueBets.sort((a, b) => b.edge - a.edge)
}

/**
 * Glavni value detection flow
 */
export async function detectValueBets() {
  console.log('🔍 Pokrećem Value Detection Engine...')

  // Učitaj podatke
  if (!existsSync(XG_FILE) || !existsSync(ODDS_FILE) || !existsSync(NBA_FILE)) {
    console.log('❌ Nedostaju podaci — pokrenite scrapere prvo!')
    return { soccer: [], nba: [], total: 0 }
  }

  const xgData = JSON.parse(readFileSync(XG_FILE, 'utf-8'))
  const oddsData = JSON.parse(readFileSync(ODDS_FILE, 'utf-8'))
  const nbaData = JSON.parse(readFileSync(NBA_FILE, 'utf-8'))

  const soccerBets = detectSoccerValue(xgData, oddsData)
  const nbaBets = detectNBAValue(nbaData, oddsData)

  console.log(`  ⚽ Fudbal value betovi: ${soccerBets.length}`)
  console.log(`  🏀 NBA value betovi: ${nbaBets.length}`)

  return {
    soccer: soccerBets,
    nba: nbaBets,
    all: [...soccerBets, ...nbaBets].sort((a, b) => b.edge - a.edge),
    total: soccerBets.length + nbaBets.length,
    generatedAt: new Date().toISOString(),
  }
}

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('value-detector')) {
  detectValueBets().then(result => {
    console.log('\n📋 Value betovi:')
    for (const bet of result.all) {
      console.log(`  ${bet.leagueFlag} ${bet.homeTeam} vs ${bet.awayTeam} — ${bet.predictionValue} @ ${bet.odds} (edge: ${(bet.edge * 100).toFixed(1)}%)`)
    }
  }).catch(console.error)
}
