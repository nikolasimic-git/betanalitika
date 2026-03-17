import { supabase } from './supabase-client.mjs'

// Updated odds based on latest bookmaker lines
const updates = [
  // Arsenal pobeda - was 1.55, now ~1.45 (heavy favorite)
  { id: 'pick-2026-03-17-001', odds: 1.45 },
  // Arsenal -1.5 - was 2.20, now ~2.10
  { id: 'pick-2026-03-17-002', odds: 2.10 },
  // City vs Real BTTS - was 1.45, now ~1.50
  { id: 'pick-2026-03-17-004', odds: 1.50 },
  // Sporting Over 2.5 - was 1.55, now ~1.50
  { id: 'pick-2026-03-17-005', odds: 1.50 },
  // Sporting pobeda - was 1.35, now ~1.30
  { id: 'pick-2026-03-17-006', odds: 1.30 },
  // Chelsea vs PSG Over 2.5 - was 1.60, now ~1.55
  { id: 'pick-2026-03-17-008', odds: 1.55 },
  // Arsenal Under 3.5 - was 1.50, now ~1.45
  { id: 'pick-2026-03-17-009', odds: 1.45 },
  // Olympiacos 3★ BTTS 75+ - stays 1.65
  { id: 'pick-2026-03-17-011', odds: 1.65 },
  // Olympiacos pobeda - was 1.50, stays 1.50
  { id: 'pick-2026-03-17-012', odds: 1.50 },
  // Chelsea vs PSG BTTS - was 1.50, now ~1.55
  { id: 'pick-2026-03-17-013', odds: 1.55 },
]

for (const u of updates) {
  const { error } = await supabase.from('picks').update({ odds: u.odds }).eq('id', u.id)
  if (error) console.log(`ERROR ${u.id}: ${error.message}`)
}

console.log('All odds updated!')

// Print final state
const { data } = await supabase
  .from('picks')
  .select('id, home_team, away_team, confidence, is_free, prediction_value, odds')
  .eq('match_date', '2026-03-17')
  .order('is_free', { ascending: false })
  .order('confidence', { ascending: false })

console.log('\n=== FINAL PICKS WITH UPDATED ODDS ===')
data.forEach(p => {
  const tag = p.is_free ? '🆓' : '💎'
  console.log(`${tag} ${'⭐'.repeat(p.confidence)} | ${p.home_team} vs ${p.away_team} | ${p.prediction_value} | ${p.odds}`)
})

process.exit()
