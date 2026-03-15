import { chromium } from 'playwright'
import { supabase } from '../supabase-client.mjs'

const TIMEOUT = 30000

/**
 * Scrape Mozzart fudbal kvote
 * mozzartbet.com/sr/kladjenje/fudbal
 */
export async function scrapeMozzart() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const results = []

  try {
    await page.goto('https://www.mozzartbet.com/sr/kladjenje/fudbal', {
      waitUntil: 'networkidle',
      timeout: TIMEOUT
    })

    // Wait for odds to load
    await page.waitForSelector('.event, .match, [class*="event"]', { timeout: 15000 }).catch(() => {})

    // Try to extract match data from the page
    const matches = await page.evaluate(() => {
      const events = []
      // Mozzart uses dynamic rendering — try multiple selectors
      const rows = document.querySelectorAll(
        '.event-row, .match-row, [class*="event"], [class*="match"], tr[data-event-id]'
      )

      rows.forEach(row => {
        try {
          const teams = row.querySelectorAll('[class*="team"], [class*="participant"], td.team')
          const odds = row.querySelectorAll('[class*="odd"], [class*="quota"], td.odd')

          if (teams.length >= 2 && odds.length >= 3) {
            events.push({
              home_team: teams[0]?.textContent?.trim() || '',
              away_team: teams[1]?.textContent?.trim() || '',
              odds_home: parseFloat(odds[0]?.textContent?.trim()) || null,
              odds_draw: parseFloat(odds[1]?.textContent?.trim()) || null,
              odds_away: parseFloat(odds[2]?.textContent?.trim()) || null,
            })
          }
        } catch (_) {}
      })

      return events
    })

    for (const m of matches) {
      if (m.home_team && m.away_team) {
        results.push({
          home_team: m.home_team,
          away_team: m.away_team,
          league: 'Mozzart Football',
          bookmaker: 'Mozzart',
          odds_home: m.odds_home,
          odds_draw: m.odds_draw,
          odds_away: m.odds_away,
          sport: 'football',
          updated_at: new Date().toISOString(),
        })
      }
    }

    console.log(`Mozzart: scraped ${results.length} matches`)
  } catch (e) {
    console.error('Mozzart scraper error:', e.message)
  } finally {
    await browser.close()
  }

  return results
}

/**
 * Scrape MaxBet fudbal kvote
 * maxbet.rs
 */
export async function scrapeMaxBet() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const results = []

  try {
    await page.goto('https://www.maxbet.rs/betting#/football', {
      waitUntil: 'networkidle',
      timeout: TIMEOUT
    })

    await page.waitForSelector('.event, .match, [class*="event"]', { timeout: 15000 }).catch(() => {})

    const matches = await page.evaluate(() => {
      const events = []
      const rows = document.querySelectorAll(
        '.event-row, .match-row, [class*="event"], [class*="match"], .offer-row'
      )

      rows.forEach(row => {
        try {
          const teams = row.querySelectorAll('[class*="team"], [class*="participant"]')
          const odds = row.querySelectorAll('[class*="odd"], [class*="quota"], .odd-value')

          if (teams.length >= 2 && odds.length >= 3) {
            events.push({
              home_team: teams[0]?.textContent?.trim() || '',
              away_team: teams[1]?.textContent?.trim() || '',
              odds_home: parseFloat(odds[0]?.textContent?.trim()) || null,
              odds_draw: parseFloat(odds[1]?.textContent?.trim()) || null,
              odds_away: parseFloat(odds[2]?.textContent?.trim()) || null,
            })
          }
        } catch (_) {}
      })

      return events
    })

    for (const m of matches) {
      if (m.home_team && m.away_team) {
        results.push({
          home_team: m.home_team,
          away_team: m.away_team,
          league: 'MaxBet Football',
          bookmaker: 'MaxBet',
          odds_home: m.odds_home,
          odds_draw: m.odds_draw,
          odds_away: m.odds_away,
          sport: 'football',
          updated_at: new Date().toISOString(),
        })
      }
    }

    console.log(`MaxBet: scraped ${results.length} matches`)
  } catch (e) {
    console.error('MaxBet scraper error:', e.message)
  } finally {
    await browser.close()
  }

  return results
}

/**
 * Placeholder: Vavada scraper
 * TODO: Implement when site structure is analyzed
 */
export async function scrapeVavada() {
  console.log('Vavada: placeholder — not implemented yet')
  // TODO: vavada.com does not offer sports betting in traditional format
  // This is primarily a casino site. Implement if sports section is found.
  return []
}

/**
 * Placeholder: Thrill scraper
 * TODO: Implement when site structure is analyzed
 */
export async function scrapeThrill() {
  console.log('Thrill: placeholder — not implemented yet')
  // TODO: Identify the correct Thrill betting URL and implement scraper
  return []
}

/**
 * Save scraped odds to Supabase odds_cache table
 */
async function saveToSupabase(odds) {
  if (!odds || odds.length === 0) return { saved: 0 }

  const { data, error } = await supabase
    .from('odds_cache')
    .upsert(odds, { onConflict: 'home_team,away_team,bookmaker' })
    .select()

  if (error) {
    console.error('Supabase save error:', error.message)
    return { error: error.message }
  }

  return { saved: (data || []).length }
}

/**
 * Run all scrapers and save to Supabase
 */
export async function scrapeAll() {
  const results = {}

  const [mozzart, maxbet, vavada, thrill] = await Promise.allSettled([
    scrapeMozzart(),
    scrapeMaxBet(),
    scrapeVavada(),
    scrapeThrill(),
  ])

  const allOdds = []

  if (mozzart.status === 'fulfilled') {
    results.mozzart = { count: mozzart.value.length }
    allOdds.push(...mozzart.value)
  } else {
    results.mozzart = { error: mozzart.reason?.message }
  }

  if (maxbet.status === 'fulfilled') {
    results.maxbet = { count: maxbet.value.length }
    allOdds.push(...maxbet.value)
  } else {
    results.maxbet = { error: maxbet.reason?.message }
  }

  results.vavada = { status: 'placeholder' }
  results.thrill = { status: 'placeholder' }

  // Save all odds to Supabase
  if (allOdds.length > 0) {
    const saveResult = await saveToSupabase(allOdds)
    results.saved = saveResult
  }

  return results
}

// Allow running directly: node server/scrapers/browser-scrapers.mjs
if (process.argv[1] && process.argv[1].includes('browser-scrapers')) {
  scrapeAll()
    .then(r => console.log('Results:', JSON.stringify(r, null, 2)))
    .catch(e => console.error('Error:', e.message))
}
