/**
 * Cron Runner — schedules daily jobs
 * 09:00 — odds scraping + pick generation
 * 23:30 — results update
 * 00:30 — results update (late matches)
 */
import cron from 'node-cron'

async function runOddsAndPicks() {
  const start = new Date().toISOString()
  console.log(`\n🕘 [${start}] Starting odds scraping + pick generation...`)
  try {
    const { scrapeOdds } = await import('./scrapers/odds-api.mjs')
    await scrapeOdds()
    console.log('  ✅ Odds scraping done')
  } catch (e) {
    console.error('  ❌ Odds scraping error:', e.message)
  }
  try {
    const { generatePicks } = await import('./engine/picks-generator.mjs')
    await generatePicks()
    console.log('  ✅ Pick generation done')
  } catch (e) {
    console.error('  ❌ Pick generation error:', e.message)
  }
  console.log(`  🏁 Finished at ${new Date().toISOString()}`)
}

async function runResultsUpdate() {
  const start = new Date().toISOString()
  console.log(`\n🕛 [${start}] Starting results update...`)
  try {
    const { updateResults } = await import('./engine/results-updater.mjs')
    const result = await updateResults()
    console.log(`  ✅ Results update done: ${result.updated} updated`)
  } catch (e) {
    console.error('  ❌ Results update error:', e.message)
  }
  console.log(`  🏁 Finished at ${new Date().toISOString()}`)
}

// Schedule jobs
cron.schedule('0 9 * * *', runOddsAndPicks, { timezone: 'Europe/Belgrade' })
cron.schedule('30 23 * * *', runResultsUpdate, { timezone: 'Europe/Belgrade' })
cron.schedule('30 0 * * *', runResultsUpdate, { timezone: 'Europe/Belgrade' })

console.log('⏰ Cron runner started')
console.log('  📅 09:00 — Odds scraping + Pick generation')
console.log('  📅 23:30 — Results update')
console.log('  📅 00:30 — Results update (late matches)')
