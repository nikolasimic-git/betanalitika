import { supabase } from './supabase-client.mjs'

// Delete old picks with 3 stars (Chelsea win, City win, City over 3.5)
const deleteIds = ['pick-2026-03-17-007', 'pick-2026-03-17-010', 'pick-2026-03-17-003']

const { error: delError } = await supabase.from('picks').delete().in('id', deleteIds)
if (delError) console.log('DELETE ERROR:', delError.message)
else console.log('Deleted 3 old picks')

// Update free status on remaining picks - first reset all to not free
await supabase.from('picks').update({ is_free: false }).like('id', 'pick-2026-03-17%')

// Set 3 free picks: 1x5★, 1x4★, 1x3★
// 5★ free: Arsenal pobeda (pick-001, confidence 5)
await supabase.from('picks').update({ is_free: true }).eq('id', 'pick-2026-03-17-001')
// 4★ free: Sporting Over 2.5 (pick-005, confidence 4)  
await supabase.from('picks').update({ is_free: true }).eq('id', 'pick-2026-03-17-005')

console.log('Set 2 existing picks as free (5★ and 4★)')

// Now add 3 new picks to replace deleted ones + 1 free 3★
const today = '2026-03-17'
const newPicks = [
  // FREE 3★ pick - Olympiacos vs Fenerbahce BTTS (Euroleague)
  {
    id: 'pick-2026-03-17-011',
    match_date: today,
    league: 'EuroLeague',
    league_flag: '🏀',
    home_team: 'Olympiacos',
    away_team: 'Fenerbahce',
    kick_off: '19:15',
    prediction_type: 'BTTS 75+',
    prediction_value: 'Oba tima 75+ poena',
    confidence: 3,
    reasoning: 'Olympiacos prosecno daje 84 poena kod kuce. Fenerbahce je prvi na tabeli sa prosekom od 86 poena. Oba tima igraju ofanzivno — Horton-Tucker (28 poena prosle nedelje) i Fenerbahce sa najjacim napadom u ligi. Ocekujemo visok rezultat sa obe strane.',
    odds: 1.65,
    bookmaker: '1xBet',
    affiliate_url: 'https://1xbet.com',
    result: 'pending',
    is_free: true,
    sport: 'basketball',
    value_edge: 4.5
  },
  // PREMIUM 4★ - Olympiacos pobeda (Euroleague)
  {
    id: 'pick-2026-03-17-012',
    match_date: today,
    league: 'EuroLeague',
    league_flag: '🏀',
    home_team: 'Olympiacos',
    away_team: 'Fenerbahce',
    kick_off: '19:15',
    prediction_type: '1',
    prediction_value: 'Olympiacos pobeda',
    confidence: 4,
    reasoning: 'Olympiacos ima 13 pobeda zaredom kod kuce u Evroligi! Piraeus je tvrdjava — poslednji poraz kod kuce bio pre 5 meseci. Vezenkov se vratio i pojacava napad. Fenerbahce jeste prvi na tabeli ali u gostima su ranjivi — prosle nedelje jedva pobedili u Beogradu. Kvota 1.50 je realna.',
    odds: 1.50,
    bookmaker: '1xBet',
    affiliate_url: 'https://1xbet.com',
    result: 'pending',
    is_free: false,
    sport: 'basketball',
    value_edge: 6.2
  },
  // PREMIUM 4★ - Chelsea vs PSG Over 2.5 (replacing old Chelsea win 3★)
  {
    id: 'pick-2026-03-17-013',
    match_date: today,
    league: 'Champions League',
    league_flag: '🏆',
    home_team: 'Chelsea',
    away_team: 'PSG',
    kick_off: '21:00',
    prediction_type: 'BTTS',
    prediction_value: 'Oba tima daju gol',
    confidence: 4,
    reasoning: 'Chelsea mora da napadne — gube 2-5 iz prvog meca. PSG ima Kvaratskheliju i Vitinhu u kontri. Prvi mec imao 7 golova (5-2). Enzo Fernandez u formi, dao gol u prvom mecu. Chelsea napada, PSG kontrira — oba tima ce sigurno postici gol. BTTS je prakticno garantovan.',
    odds: 1.50,
    bookmaker: '1xBet',
    affiliate_url: 'https://1xbet.com',
    result: 'pending',
    is_free: false,
    sport: 'football',
    value_edge: 7.8
  }
]

const { error: insError } = await supabase.from('picks').upsert(newPicks)
if (insError) console.log('INSERT ERROR:', insError.message)
else console.log('Inserted 3 new picks (1 free 3★, 2 premium 4★)')

// Verify final state
const { data: allPicks } = await supabase
  .from('picks')
  .select('id, home_team, away_team, confidence, is_free, prediction_value')
  .eq('match_date', today)
  .order('confidence', { ascending: false })

console.log('\n=== FINAL PICKS ===')
allPicks.forEach(p => {
  const tag = p.is_free ? '🆓 FREE' : '💎 PREM'
  console.log(`${tag} | ${'⭐'.repeat(p.confidence)} | ${p.home_team} vs ${p.away_team} | ${p.prediction_value}`)
})
console.log(`\nTotal: ${allPicks.length} picks (${allPicks.filter(p=>p.is_free).length} free)`)

process.exit()
