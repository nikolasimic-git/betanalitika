/**
 * Test Pipeline - Pokreće ceo AI prediction pipeline
 * 1. Football Stats (ESPN)
 * 2. Poisson Model
 * 3. ELO Ratings
 * 4. Value Detection
 * 5. Auto Pick Generation
 * 6. Supabase verification
 */
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env
const envPath = join(__dirname, '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^(\w+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim()
    }
  }
}

async function runPipeline() {
  console.log('═'.repeat(60))
  console.log('  🧪 BetAnalitika AI Pipeline Test')
  console.log('  📅 ' + new Date().toISOString())
  console.log('═'.repeat(60))

  // Step 1: Test Football Stats
  console.log('\n\n📊 STEP 1: Football Stats Scraper')
  console.log('─'.repeat(40))
  try {
    const { getTeamStats, getMatchStats, getTodayFixtures } = await import('./scrapers/football-stats.mjs')

    const stats = await getTeamStats('eng.1')
    const teamNames = Object.keys(stats.teams)
    console.log(`  ✅ Premier League: ${teamNames.length} timova, ${stats.results} mečeva`)

    if (teamNames.length > 0) {
      const sample = stats.teams[teamNames[0]]
      console.log(`  📋 Primer: ${sample.name}`)
      console.log(`     Golovi kod kuće: ${sample.avgHomeGoalsScored?.toFixed(2) || 'N/A'}`)
      console.log(`     Over 2.5%: ${((sample.over25Pct || 0) * 100).toFixed(0)}%`)
      console.log(`     BTTS%: ${((sample.bttsPct || 0) * 100).toFixed(0)}%`)
    }

    console.log(`  📈 Liga proseci: ${JSON.stringify(stats.leagueAvg || {})}`)

    // Today's fixtures
    const fixtures = await getTodayFixtures('eng.1')
    console.log(`  📅 Današnji mečevi (EPL): ${fixtures.length}`)
    for (const f of fixtures.slice(0, 3)) {
      console.log(`     ${f.homeTeam} vs ${f.awayTeam}`)
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`)
  }

  // Step 2: Test Poisson Model
  console.log('\n\n🎲 STEP 2: Poisson Prediction Model')
  console.log('─'.repeat(40))
  try {
    const { predictMatch } = await import('./engine/poisson-model.mjs')

    // Test sa mock stats
    const homeStats = { avgHomeGoalsScored: 2.1, avgHomeGoalsConceded: 0.8 }
    const awayStats = { avgAwayGoalsScored: 1.2, avgAwayGoalsConceded: 1.5 }
    const leagueAvg = { avgHomeGoals: 1.45, avgAwayGoals: 1.10, avgHomeGoalsConceded: 1.10, avgAwayGoalsConceded: 1.45 }

    const pred = predictMatch(homeStats, awayStats, leagueAvg)
    console.log(`  ✅ Predikcija (jak domaćin vs slab gost):`)
    console.log(`     1X2: ${(pred.homeWin * 100).toFixed(1)}% / ${(pred.draw * 100).toFixed(1)}% / ${(pred.awayWin * 100).toFixed(1)}%`)
    console.log(`     xG: ${pred.expectedHomeGoals} - ${pred.expectedAwayGoals}`)
    console.log(`     Over 2.5: ${(pred.over25 * 100).toFixed(1)}%`)
    console.log(`     BTTS: ${(pred.bttsYes * 100).toFixed(1)}%`)
    console.log(`     Top 3 rezultata:`)
    for (const s of pred.topScores.slice(0, 3)) {
      console.log(`       ${s.score} — ${s.pct}`)
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`)
  }

  // Step 3: Test ELO Ratings
  console.log('\n\n📈 STEP 3: ELO Rating System')
  console.log('─'.repeat(40))
  try {
    const { getEloRating, predictFromElo, updateElo } = await import('./engine/elo-ratings.mjs')

    console.log(`  Arsenal ELO: ${getEloRating('Arsenal')}`)
    console.log(`  Chelsea ELO: ${getEloRating('Chelsea')}`)
    console.log(`  Real Madrid ELO: ${getEloRating('Real Madrid')}`)

    const pred = predictFromElo('Arsenal', 'Chelsea')
    console.log(`  ✅ Arsenal vs Chelsea predikcija:`)
    console.log(`     ${(pred.homeWin * 100).toFixed(1)}% / ${(pred.draw * 100).toFixed(1)}% / ${(pred.awayWin * 100).toFixed(1)}%`)

    // Test update
    updateElo('Arsenal', 'Chelsea', 3, 1)
    console.log(`  📝 Posle Arsenal 3-1 Chelsea:`)
    console.log(`     Arsenal: ${getEloRating('Arsenal')}, Chelsea: ${getEloRating('Chelsea')}`)
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`)
  }

  // Step 4: Test Value Detector
  console.log('\n\n🔍 STEP 4: Value Detector')
  console.log('─'.repeat(40))
  try {
    const { detectValue, combinePredictions } = await import('./engine/value-detector.mjs')

    const poissonPreds = { homeWin: 0.55, draw: 0.25, awayWin: 0.20, over25: 0.60, under25: 0.40, bttsYes: 0.55, bttsNo: 0.45, over35: 0.30, under35: 0.70, over15: 0.80, under15: 0.20 }
    const eloPreds = { homeWin: 0.52, draw: 0.26, awayWin: 0.22 }
    const combined = combinePredictions(poissonPreds, eloPreds)
    console.log(`  ✅ Kombinovane predikcije: ${(combined.homeWin * 100).toFixed(1)}% / ${(combined.draw * 100).toFixed(1)}% / ${(combined.awayWin * 100).toFixed(1)}%`)

    const odds = { home: 1.80, draw: 3.50, away: 4.50, over25: 1.85, under25: 2.00 }
    const valueBets = detectValue(combined, odds, { homeTeam: 'Arsenal', awayTeam: 'Chelsea' })
    console.log(`  💰 Value betovi: ${valueBets.length}`)
    for (const vb of valueBets) {
      console.log(`     ${vb.predictionValue} @ ${vb.odds} — edge ${(vb.edge * 100).toFixed(1)}%, ★${vb.confidence}, Kelly ${vb.kellyStake}%`)
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`)
  }

  // Step 5: Full Pipeline - Generate Picks
  console.log('\n\n🎯 STEP 5: Auto Pick Generator (FULL PIPELINE)')
  console.log('─'.repeat(40))
  let picks = []
  try {
    const { generateDailyPicks } = await import('./engine/picks-generator.mjs')
    picks = await generateDailyPicks()
    console.log(`\n  ✅ Generisano ${picks.length} pikova`)
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`)
    console.log(`  Stack: ${err.stack}`)
  }

  // Step 6: Verify Supabase
  console.log('\n\n🗄️ STEP 6: Supabase Verification')
  console.log('─'.repeat(40))
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('picks')
      .select('*')
      .eq('match_date', today)
      .order('confidence', { ascending: false })

    if (error) {
      console.log(`  ❌ Supabase error: ${error.message}`)
    } else {
      console.log(`  ✅ ${data.length} pikova u Supabase za ${today}`)
      for (const pick of (data || []).slice(0, 5)) {
        console.log(`     ${pick.league_flag || '⚽'} ${pick.home_team} vs ${pick.away_team} — ${pick.prediction_value} @ ${pick.odds} (★${pick.confidence}) ${pick.is_free ? '🆓' : '💎'}`)
      }
    }
  } catch (err) {
    console.log(`  ❌ Supabase error: ${err.message}`)
  }

  console.log('\n' + '═'.repeat(60))
  console.log(`  ✅ Pipeline test završen — ${picks.length} pikova generisano`)
  console.log('═'.repeat(60))
}

runPipeline().catch(err => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})
