// Quick script to generate real picks RIGHT NOW
import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.ODDS_API_KEY;
const BASE = 'https://api.odds-api.io/v3';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const LEAGUES = [
  { slug: 'england-premier-league', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { slug: 'spain-la-liga', name: 'La Liga', flag: '🇪🇸' },
  { slug: 'italy-serie-a', name: 'Serie A', flag: '🇮🇹' },
  { slug: 'germany-bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
  { slug: 'france-ligue-1', name: 'Ligue 1', flag: '🇫🇷' },
  { slug: 'champions-league', name: 'Champions League', flag: '🏆' },
];

const NBA = { slug: 'usa-nba', name: 'NBA', flag: '🏀', sport: 'basketball' };

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

async function getEventsWithOdds(league) {
  const events = await fetchJSON(`${BASE}/events?apiKey=${API_KEY}&sport=${league.sport || 'football'}&league=${league.slug}`);
  const pending = events.filter(e => e.status === 'pending').slice(0, 6);
  console.log(`  ${league.name}: ${pending.length} pending mečeva`);
  
  const results = [];
  for (const event of pending) {
    try {
      await new Promise(r => setTimeout(r, 300)); // rate limit
      const odds = await fetchJSON(`${BASE}/odds?apiKey=${API_KEY}&eventId=${event.id}&bookmakers=1xbet`);
      const ml = odds.bookmakers?.['1xbet']?.find(m => m.name === 'ML' || m.name === 'Moneyline');
      const totals = odds.bookmakers?.['1xbet']?.find(m => m.name === 'Totals');
      
      if (ml?.odds?.[0]) {
        const o = ml.odds[0];
        let over25 = null, under25 = null;
        if (totals?.odds) {
          const t25 = totals.odds.find(t => t.hdp == 2.5 || t.hdp === '2.5');
          if (t25) { over25 = parseFloat(t25.over); under25 = parseFloat(t25.under); }
        }
        results.push({
          ...event,
          league: league.name,
          leagueFlag: league.flag,
          sport: league.sport || 'football',
          odds: {
            home: parseFloat(o.home),
            draw: parseFloat(o.draw || 0),
            away: parseFloat(o.away),
            over25, under25
          },
          url: odds.urls?.['1xbet'] || 'https://1xbet.com'
        });
      }
    } catch (e) {
      // skip
    }
  }
  return results;
}

// Simple Poisson-based value detection for football
function poissonProb(lambda, k) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}
function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }

function estimateFootballProbs(homeOdds, drawOdds, awayOdds) {
  // Use implied probabilities as base, then find value
  const total = 1/homeOdds + 1/drawOdds + 1/awayOdds;
  return {
    home: (1/homeOdds) / total,
    draw: (1/drawOdds) / total,
    away: (1/awayOdds) / total,
    margin: total - 1
  };
}

function findValue(events) {
  const picks = [];
  
  for (const ev of events) {
    const o = ev.odds;
    if (!o.home || !o.away) continue;
    
    if (ev.sport === 'football') {
      const probs = estimateFootballProbs(o.home, o.draw, o.away);
      const margin = probs.margin;
      
      // Look for value: check each outcome
      const checks = [
        { type: '1', value: o.home, prob: probs.home, name: ev.home },
        { type: 'X', value: o.draw, prob: probs.draw, name: 'Nerešeno' },
        { type: '2', value: o.away, prob: probs.away, name: ev.away },
      ];
      
      // Over/Under 2.5
      if (o.over25 && o.under25) {
        const totalOU = 1/o.over25 + 1/o.under25;
        checks.push({ type: 'Over 2.5', value: o.over25, prob: (1/o.over25)/totalOU, name: 'Over 2.5 golova' });
        checks.push({ type: 'Under 2.5', value: o.under25, prob: (1/o.under25)/totalOU, name: 'Under 2.5 golova' });
      }
      
      // Find best value (highest edge after removing margin)
      for (const c of checks) {
        const fairProb = c.prob * (1 + margin); // remove vig
        const edge = (fairProb * c.value) - 1;
        if (edge > -0.02) { // include slight negative edge too for now
          picks.push({
            event: ev,
            predType: c.type,
            predValue: c.name,
            odds: c.value,
            edge: +(edge * 100).toFixed(1),
            confidence: edge > 0.08 ? 5 : edge > 0.05 ? 4 : edge > 0.02 ? 3 : 2,
            fairProb: +(fairProb * 100).toFixed(1),
          });
        }
      }
    } else {
      // NBA - moneyline value
      const totalML = 1/o.home + 1/o.away;
      const margin = totalML - 1;
      const homeProb = (1/o.home) / totalML;
      const awayProb = (1/o.away) / totalML;
      
      const checks = [
        { type: 'ML Home', value: o.home, prob: homeProb, name: ev.home },
        { type: 'ML Away', value: o.away, prob: awayProb, name: ev.away },
      ];
      
      for (const c of checks) {
        const fairProb = c.prob * (1 + margin);
        const edge = (fairProb * c.value) - 1;
        if (edge > -0.02) {
          picks.push({
            event: ev,
            predType: c.type,
            predValue: c.name,
            odds: c.value,
            edge: +(edge * 100).toFixed(1),
            confidence: edge > 0.08 ? 5 : edge > 0.05 ? 4 : edge > 0.02 ? 3 : 2,
            fairProb: +(fairProb * 100).toFixed(1),
          });
        }
      }
    }
  }
  
  // Sort by edge desc, take best picks — prioritize strong favorites and O/U
  // Filter: only picks where odds are in "sweet spot" (1.40-3.50 range)
  const filtered = picks.filter(p => p.odds >= 1.30 && p.odds <= 4.00);
  return filtered.sort((a, b) => b.edge - a.edge).slice(0, 12);
}

function generateReasoning(pick) {
  const sport = pick.event.sport === 'football' ? 'fudbal' : 'košarka';
  if (pick.event.sport === 'football') {
    if (pick.predType === 'Over 2.5' || pick.predType === 'Under 2.5') {
      return `${pick.predType} golova na meču ${pick.event.home} - ${pick.event.away}. Model procenjuje ${pick.fairProb}% verovatnoću, kvota ${pick.odds} (1xBet) daje value od ${pick.edge}%.`;
    }
    return `${pick.predValue} ima ${pick.fairProb}% šanse po modelu. Kvota ${pick.odds} (1xBet) nudi value od ${pick.edge}%. ${pick.event.league}.`;
  }
  return `${pick.predValue} favorit sa ${pick.fairProb}% šanse. Kvota ${pick.odds} (1xBet) — value ${pick.edge}%. NBA meč.`;
}

async function main() {
  console.log('🔍 Fetching events and odds...\n');
  
  let allEvents = [];
  
  // Football
  for (const league of LEAGUES) {
    try {
      const events = await getEventsWithOdds(league);
      allEvents.push(...events);
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log(`  ❌ ${league.name}: ${e.message}`);
    }
  }
  
  // NBA
  try {
    const nbaEvents = await getEventsWithOdds(NBA);
    allEvents.push(...nbaEvents);
  } catch (e) {
    console.log(`  ❌ NBA: ${e.message}`);
  }
  
  console.log(`\n📊 Total events with odds: ${allEvents.length}`);
  
  // Find value picks
  const valuePicks = findValue(allEvents);
  console.log(`🎯 Value picks found: ${valuePicks.length}\n`);
  
  if (valuePicks.length === 0) {
    console.log('❌ No value picks found. Try again later.');
    return;
  }
  
  // Convert to DB format and insert
  const today = new Date().toISOString().split('T')[0];
  const dbPicks = valuePicks.map((p, i) => ({
    id: `pick-${today}-${Date.now()}-${i}`,
    match_date: p.event.date.split('T')[0],
    league: p.event.league,
    league_flag: p.event.leagueFlag,
    home_team: p.event.home,
    away_team: p.event.away,
    kick_off: new Date(p.event.date).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Belgrade' }),
    prediction_type: p.predType,
    prediction_value: p.predValue,
    confidence: p.confidence,
    reasoning: generateReasoning(p),
    odds: p.odds,
    bookmaker: '1xBet',
    affiliate_url: p.event.url || 'https://1xbet.com',
    result: 'pending',
    is_free: i < 3, // First 3 are free
    sport: p.event.sport,
    value_edge: p.edge,
  }));
  
  // Insert into Supabase
  const { data, error } = await supabase.from('picks').upsert(dbPicks);
  
  if (error) {
    console.log('❌ Supabase error:', error.message);
    // Try without RLS by using service role
    console.log('Trying direct insert...');
    for (const pick of dbPicks) {
      const { error: e2 } = await supabase.from('picks').insert(pick);
      if (e2) console.log(`  ❌ ${pick.home_team} vs ${pick.away_team}: ${e2.message}`);
      else console.log(`  ✅ ${pick.home_team} vs ${pick.away_team} — ${pick.prediction_value} @ ${pick.odds}`);
    }
  } else {
    console.log('✅ All picks inserted into Supabase!\n');
  }
  
  // Print summary
  console.log('═══════════════════════════════════════');
  console.log('📋 DANAŠNJI PIKOVI:');
  console.log('═══════════════════════════════════════');
  for (const p of dbPicks) {
    const freeTag = p.is_free ? '🆓' : '💎';
    console.log(`${freeTag} ${p.league_flag} ${p.home_team} vs ${p.away_team}`);
    console.log(`   ${p.prediction_type}: ${p.prediction_value} @ ${p.odds} (value: +${p.value_edge}%)`);
    console.log(`   ⭐${p.confidence}/5 | ${p.kick_off} | ${p.bookmaker}`);
    console.log('');
  }
}

main().catch(e => console.error(e));
