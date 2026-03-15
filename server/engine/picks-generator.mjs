/**
 * Auto-Picks Generator
 * Koristi value detector da generiše dnevne pikove u formatu Pick interfejsa
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { detectValueBets } from './value-detector.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE = join(__dirname, '..', 'picks-db.json')

function loadDB() {
  if (!existsSync(DB_FILE)) {
    writeFileSync(DB_FILE, JSON.stringify({ picks: [], lastGenerated: null }, null, 2))
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
}

function saveDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function tomorrowStr() {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0]
}

/**
 * Generiši reasoning na srpskom
 */
// Affiliate URL mapiranje
const AFFILIATE_URLS = {
  '1xbet': 'https://1xbet.com/sr/',
  'Mozzart Bet': 'https://www.mozzartbet.com/sr#/betting',
  'maxbet': 'https://www.maxbet.rs/betting/',
  'Bet365': 'https://www.bet365.com/',
  'Pinnacle': 'https://www.pinnacle.com/',
  'Unibet': 'https://www.unibet.com/',
  'Betway': 'https://www.betway.com/',
}

function getAffiliateUrl(bookmaker) {
  return AFFILIATE_URLS[bookmaker] || AFFILIATE_URLS['1xbet']
}

function generateReasoning(bet) {
  const bookmakerInfo = bet.bookmaker ? ` Kvota ${bet.odds} (${bet.bookmaker})` : ''
  const oddsCompStr = bet.oddsComparison
    ? ' Poređenje: ' + Object.entries(bet.oddsComparison).map(([bm, o]) => `${bm}: ${o}`).join(', ') + '.'
    : ''

  if (bet.type === 'soccer') {
    const r = bet.reasoning
    const edgePct = (bet.edge * 100).toFixed(1)
    if (bet.predictionValue.includes('Domaćin')) {
      return `Model predviđa ${bet.homeTeam} kao favorita sa xG od ${r.homeXG} naspram ${r.awayXG} za gosta.${bookmakerInfo} — value ${edgePct}% u odnosu na model.${oddsCompStr}`
    } else if (bet.predictionValue.includes('Gost')) {
      return `${bet.awayTeam} ima bolje šanse nego što kvote sugerišu. xG analiza (${r.awayXG} vs ${r.homeXG}).${bookmakerInfo} — value ${edgePct}%.${oddsCompStr}`
    } else {
      return `Poisson model predviđa nerešen ishod sa većom verovatnoćom nego tržište. xG razlika minimalna (${r.homeXG} vs ${r.awayXG}).${bookmakerInfo} — value ${edgePct}%.${oddsCompStr}`
    }
  } else {
    const r = bet.reasoning
    const edgePct = (bet.edge * 100).toFixed(1)
    if (bet.predictionType === 'Spread') {
      return `Net Rating razlika (${r.netRatingDiff}) ukazuje da je ${bet.predictionValue} bolja opcija od tržišnog spreada. Model spread: ${r.modelSpread}, tržišni: ${r.marketSpread}.${bookmakerInfo}`
    }
    return `Na osnovu Net Ratinga i Four Factors analize, ${bet.predictionValue.replace(/[12] \(/, '').replace(')', '')} ima ${edgePct}% edge. Win%: dom ${r.homeWinPct}%, gost ${r.awayWinPct}%.${bookmakerInfo}${oddsCompStr}`
  }
}

/**
 * Generiši kickOff vreme iz commenceTime
 */
function getKickOff(commenceTime) {
  if (!commenceTime) return '20:00'
  const d = new Date(commenceTime)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * Generiši matchDate iz commenceTime
 */
function getMatchDate(commenceTime) {
  if (!commenceTime) return todayStr()
  return new Date(commenceTime).toISOString().split('T')[0]
}

/**
 * Glavni generator
 */
export async function generatePicks() {
  console.log('🎯 Pokrećem Picks Generator...')

  const valueBets = await detectValueBets()
  if (valueBets.total === 0) {
    console.log('⚠️ Nema value betova za generisanje')
    return []
  }

  const db = loadDB()
  const today = todayStr()
  const tomorrow = tomorrowStr()

  // Filtriraj betove za danas/sutra
  const relevantBets = valueBets.all.filter(b => {
    const matchDate = getMatchDate(b.commenceTime)
    return matchDate === today || matchDate === tomorrow
  })

  if (relevantBets.length === 0) {
    console.log('⚠️ Nema relevantnih value betova za danas/sutra')
    // Koristi sve betove kao fallback
    // (mock podaci imaju sutrašnji datum)
  }

  const betsToUse = relevantBets.length > 0 ? relevantBets : valueBets.all

  // Top 3 po edge-u budu free
  const picks = betsToUse.map((bet, idx) => ({
    id: `pick-${today}-auto-${idx}`,
    matchDate: getMatchDate(bet.commenceTime),
    league: bet.league,
    leagueFlag: bet.leagueFlag,
    homeTeam: bet.homeTeam,
    awayTeam: bet.awayTeam,
    kickOff: getKickOff(bet.commenceTime),
    predictionType: bet.predictionType,
    predictionValue: bet.predictionValue,
    confidence: bet.confidence,
    reasoning: generateReasoning(bet),
    odds: bet.odds,
    bookmaker: bet.bookmaker || '1xbet',
    affiliateUrl: getAffiliateUrl(bet.bookmaker),
    result: 'pending',
    isFree: idx < 3,
    sport: bet.type === 'nba' ? 'nba' : 'football',
    // Meta podaci za tracking
    edge: bet.edge,
    modelProb: bet.modelProb,
    kellyStake: bet.kellyStake,
    generatedBy: 'value-engine',
  }))

  // Obriši stare auto-pikove za isti datum
  db.picks = db.picks.filter(p => {
    if (p.generatedBy !== 'value-engine') return true
    return p.matchDate !== today && p.matchDate !== tomorrow
  })

  // Dodaj nove
  db.picks.push(...picks)
  db.lastGenerated = new Date().toISOString()
  saveDB(db)

  console.log(`✅ Generisano ${picks.length} pikova (${picks.filter(p => p.isFree).length} free, ${picks.filter(p => !p.isFree).length} premium)`)
  for (const p of picks) {
    console.log(`  ${p.leagueFlag} ${p.homeTeam} vs ${p.awayTeam} — ${p.predictionValue} @ ${p.odds} (edge: ${(p.edge * 100).toFixed(1)}%) ${p.isFree ? '🆓' : '💎'}`)
  }

  return picks
}

// Direktno pokretanje
if (process.argv[1] && process.argv[1].includes('picks-generator')) {
  generatePicks().catch(console.error)
}
