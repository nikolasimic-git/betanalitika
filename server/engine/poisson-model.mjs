/**
 * Dixon-Coles Inspired Poisson Prediction Model
 * Predviđa verovatnoće ishoda fudbalskih mečeva
 */

const MAX_GOALS = 8

/**
 * Poisson PMF: P(k) = (lambda^k * e^-lambda) / k!
 */
function poissonPMF(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0
  let logProb = -lambda + k * Math.log(lambda)
  for (let i = 2; i <= k; i++) {
    logProb -= Math.log(i)
  }
  return Math.exp(logProb)
}

/**
 * Dixon-Coles korekcija za niske golove (0-0, 1-0, 0-1, 1-1)
 * Poboljšava tačnost za low-scoring mečeve
 */
function dixonColesCorrection(homeGoals, awayGoals, homeLambda, awayLambda, rho = -0.13) {
  if (homeGoals === 0 && awayGoals === 0) {
    return 1 - homeLambda * awayLambda * rho
  } else if (homeGoals === 0 && awayGoals === 1) {
    return 1 + homeLambda * rho
  } else if (homeGoals === 1 && awayGoals === 0) {
    return 1 + awayLambda * rho
  } else if (homeGoals === 1 && awayGoals === 1) {
    return 1 - rho
  }
  return 1.0
}

/**
 * Izračunaj matricu verovatnoća za sve moguće rezultate
 */
function calculateScoreMatrix(homeLambda, awayLambda, useDixonColes = true) {
  const matrix = []

  for (let h = 0; h <= MAX_GOALS; h++) {
    matrix[h] = []
    for (let a = 0; a <= MAX_GOALS; a++) {
      let prob = poissonPMF(h, homeLambda) * poissonPMF(a, awayLambda)
      if (useDixonColes) {
        prob *= dixonColesCorrection(h, a, homeLambda, awayLambda)
      }
      matrix[h][a] = Math.max(0, prob)
    }
  }

  // Normalizuj
  let total = 0
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      total += matrix[h][a]
    }
  }
  if (total > 0) {
    for (let h = 0; h <= MAX_GOALS; h++) {
      for (let a = 0; a <= MAX_GOALS; a++) {
        matrix[h][a] /= total
      }
    }
  }

  return matrix
}

/**
 * Izračunaj expected goals za meč
 * @param {Object} homeStats - statistike domaćina
 * @param {Object} awayStats - statistike gosta
 * @param {Object} leagueAvg - proseci lige
 * @returns {{ homeLambda: number, awayLambda: number }}
 */
function calculateExpectedGoals(homeStats, awayStats, leagueAvg) {
  const avgHomeGoals = leagueAvg.avgHomeGoals || 1.45
  const avgAwayGoals = leagueAvg.avgAwayGoals || 1.10
  const avgHomeConc = leagueAvg.avgHomeGoalsConceded || 1.10
  const avgAwayConc = leagueAvg.avgAwayGoalsConceded || 1.45

  // Attack strength i defense weakness
  const homeAttack = (homeStats.avgHomeGoalsScored || 1.4) / avgHomeGoals
  const homeDefense = (homeStats.avgHomeGoalsConceded || 1.0) / avgHomeConc

  const awayAttack = (awayStats.avgAwayGoalsScored || 1.1) / avgAwayGoals
  const awayDefense = (awayStats.avgAwayGoalsConceded || 1.3) / avgAwayConc

  // Expected goals
  let homeLambda = homeAttack * awayDefense * avgHomeGoals
  let awayLambda = awayAttack * homeDefense * avgAwayGoals

  // Clamp da ne budu preterano ekstremni
  homeLambda = Math.max(0.3, Math.min(4.5, homeLambda))
  awayLambda = Math.max(0.2, Math.min(4.0, awayLambda))

  return { homeLambda, awayLambda }
}

/**
 * Glavni prediction function
 * @param {Object} homeStats - statistike domaćina iz football-stats.mjs
 * @param {Object} awayStats - statistike gosta iz football-stats.mjs
 * @param {Object} leagueStats - proseci lige
 * @returns {Object} sve verovatnoće
 */
export function predictMatch(homeStats, awayStats, leagueStats) {
  if (!homeStats || !awayStats) {
    return getDefaultPrediction()
  }

  const leagueAvg = leagueStats || { avgHomeGoals: 1.45, avgAwayGoals: 1.10, avgHomeGoalsConceded: 1.10, avgAwayGoalsConceded: 1.45 }

  const { homeLambda, awayLambda } = calculateExpectedGoals(homeStats, awayStats, leagueAvg)
  const matrix = calculateScoreMatrix(homeLambda, awayLambda, true)

  // 1X2 verovatnoće
  let homeWin = 0, draw = 0, awayWin = 0

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      if (h > a) homeWin += matrix[h][a]
      else if (h === a) draw += matrix[h][a]
      else awayWin += matrix[h][a]
    }
  }

  // Over/Under
  let over25 = 0, over35 = 0, over15 = 0
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const total = h + a
      if (total > 1.5) over15 += matrix[h][a]
      if (total > 2.5) over25 += matrix[h][a]
      if (total > 3.5) over35 += matrix[h][a]
    }
  }

  // BTTS
  let bttsYes = 0
  for (let h = 1; h <= MAX_GOALS; h++) {
    for (let a = 1; a <= MAX_GOALS; a++) {
      bttsYes += matrix[h][a]
    }
  }

  // Najvjerovatniji rezultati
  const scores = []
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      scores.push({ home: h, away: a, prob: matrix[h][a] })
    }
  }
  scores.sort((a, b) => b.prob - a.prob)
  const topScores = scores.slice(0, 10)

  return {
    homeWin: +homeWin.toFixed(4),
    draw: +draw.toFixed(4),
    awayWin: +awayWin.toFixed(4),

    over15: +over15.toFixed(4),
    under15: +(1 - over15).toFixed(4),
    over25: +over25.toFixed(4),
    under25: +(1 - over25).toFixed(4),
    over35: +over35.toFixed(4),
    under35: +(1 - over35).toFixed(4),

    bttsYes: +bttsYes.toFixed(4),
    bttsNo: +(1 - bttsYes).toFixed(4),

    expectedHomeGoals: +homeLambda.toFixed(2),
    expectedAwayGoals: +awayLambda.toFixed(2),
    expectedTotalGoals: +(homeLambda + awayLambda).toFixed(2),

    topScores: topScores.map(s => ({
      score: `${s.home}-${s.away}`,
      prob: +s.prob.toFixed(4),
      pct: `${(s.prob * 100).toFixed(1)}%`,
    })),

    // Raw za kombinovanje sa ELO
    raw: { homeLambda, awayLambda, matrix },
  }
}

function getDefaultPrediction() {
  return {
    homeWin: 0.40, draw: 0.28, awayWin: 0.32,
    over25: 0.52, under25: 0.48, over35: 0.28, under35: 0.72,
    over15: 0.75, under15: 0.25,
    bttsYes: 0.48, bttsNo: 0.52,
    expectedHomeGoals: 1.35, expectedAwayGoals: 1.10, expectedTotalGoals: 2.45,
    topScores: [
      { score: '1-1', prob: 0.12, pct: '12.0%' },
      { score: '1-0', prob: 0.11, pct: '11.0%' },
      { score: '2-1', prob: 0.10, pct: '10.0%' },
    ],
    raw: null,
    fallback: true,
  }
}

export { poissonPMF, calculateExpectedGoals, calculateScoreMatrix }
