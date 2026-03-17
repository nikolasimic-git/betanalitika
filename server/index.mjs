import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { supabase } from './supabase-client.mjs'

const app = express()
app.use(cors())
app.use(express.json())

// ── Helpers ──
function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// In-memory session store (for backward compat — could move to Supabase later)
const sessions = {}

// ── Auth Middleware ──
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })

  const userId = sessions[token]
  if (!userId) return res.status(401).json({ error: 'Invalid token' })

  req.userId = userId
  req.token = token
  next()
}

async function loadUser(req, res, next) {
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.userId)
    .single()

  if (error || !user) return res.status(401).json({ error: 'User not found' })
  req.user = user
  next()
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' })
  }
  next()
}

// ══════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return res.status(401).json({ error: 'Pogrešan email ili lozinka' })
  }

  // Check password (stored as hash in a password_hash field, or use Supabase Auth)
  // For backward compat, we check the hashed password
  if (user.password_hash && user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Pogrešan email ili lozinka' })
  }

  const token = generateToken()
  sessions[token] = user.id

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier },
  })
})

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body

  // Check if user exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return res.status(400).json({ error: 'Email već postoji' })
  }

  const { data: newUser, error } = await supabase
    .from('profiles')
    .insert({
      email,
      name: name || email.split('@')[0],
      role: 'user',
      tier: 'free',
      password_hash: hashPassword(password),
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  const token = generateToken()
  sessions[token] = newUser.id

  res.json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, tier: newUser.tier },
  })
})

app.get('/api/auth/me', authMiddleware, loadUser, (req, res) => {
  const { password_hash, ...user } = req.user
  res.json({ user })
})

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  delete sessions[req.token]
  res.json({ ok: true })
})

// ══════════════════════════════════════════
// PICKS ROUTES (Public + Auth)
// ══════════════════════════════════════════

app.get('/api/picks/today', async (req, res) => {
  const today = todayStr()
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  let query = supabase
    .from('picks')
    .select('*')
    .in('match_date', [today, tomorrow])
    .eq('result', 'pending')

  const sport = req.query.sport
  if (sport && sport !== 'all') {
    query = query.eq('sport', sport)
  }

  const { data: todayPicks, error } = await query.order('match_date')

  if (error) return res.status(500).json({ error: error.message })

  if (!todayPicks || todayPicks.length === 0) {
    return res.json({ picks: [], date: today, message: 'Pikovi za danas još nisu generisani.' })
  }

  // Check auth for premium
  const token = req.headers.authorization?.replace('Bearer ', '')
  let isPremium = false
  if (token && sessions[token]) {
    const { data: user } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', sessions[token])
      .single()
    isPremium = user?.tier === 'premium'
  }

  const result = todayPicks.map(p => {
    if (!p.is_free && !isPremium) {
      return {
        ...p,
        reasoning: '🔒 Premium pikovi su dostupni samo za premium korisnike.',
        prediction_value: '🔒',
        odds: 0,
        locked: true,
      }
    }
    return { ...p, locked: false }
  })

  res.json({ picks: result, date: today })
})

app.get('/api/picks/history', async (req, res) => {
  const sport = req.query.sport
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('picks')
    .select('*', { count: 'exact' })
    .neq('result', 'pending')
    .order('match_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (sport && sport !== 'all') {
    query = query.eq('sport', sport)
  }

  const { data: picks, count, error } = await query

  if (error) return res.status(500).json({ error: error.message })

  res.json({
    picks: picks || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
})

app.get('/api/stats', async (req, res) => {
  const sport = req.query.sport

  let query = supabase.from('picks').select('result, odds, sport')

  if (sport && sport !== 'all') {
    query = query.eq('sport', sport)
  }

  const { data: allPicks, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  const resolved = (allPicks || []).filter(p => p.result !== 'pending')
  const won = resolved.filter(p => p.result === 'won')
  const lost = resolved.filter(p => p.result === 'lost')
  const pending = (allPicks || []).filter(p => p.result === 'pending')

  const totalStake = resolved.length
  const totalReturn = won.reduce((sum, p) => sum + (parseFloat(p.odds) || 1.8), 0)
  const roi = totalStake > 0 ? ((totalReturn - totalStake) / totalStake * 100) : 0

  // Streak calculation
  let streak = 0
  let streakType = 'W'
  // Need ordered data for streak
  const { data: orderedPicks } = await supabase
    .from('picks')
    .select('result')
    .neq('result', 'pending')
    .order('match_date', { ascending: false })
    .limit(50)

  if (orderedPicks && orderedPicks.length > 0) {
    streakType = orderedPicks[0].result === 'won' ? 'W' : 'L'
    for (const p of orderedPicks) {
      if ((p.result === 'won' && streakType === 'W') || (p.result === 'lost' && streakType === 'L')) {
        streak++
      } else break
    }
  }

  res.json({
    totalPicks: resolved.length,
    won: won.length,
    lost: lost.length,
    pending: pending.length,
    winRate: resolved.length > 0 ? +(won.length / resolved.length * 100).toFixed(1) : 0,
    roi: +roi.toFixed(1),
    currentStreak: streak,
    streakType,
  })
})

// ══════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════

app.get('/api/admin/picks', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  let query = supabase.from('picks').select('*').order('match_date', { ascending: false })

  const dateFilter = req.query.date
  if (dateFilter) {
    query = query.eq('match_date', dateFilter)
  }

  const { data: picks, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  res.json({ picks: picks || [], total: (picks || []).length })
})

app.put('/api/admin/picks/:id', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { data: pick, error } = await supabase
    .from('picks')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(404).json({ error: error.message })
  res.json({ ok: true, pick })
})

app.delete('/api/admin/picks/:id', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { error } = await supabase.from('picks').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

app.post('/api/admin/picks', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const pick = {
    id: `pick-manual-${Date.now()}`,
    match_date: todayStr(),
    result: 'pending',
    is_free: false,
    ...req.body,
  }

  const { data, error } = await supabase.from('picks').insert(pick).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true, pick: data })
})

app.post('/api/admin/picks/:id/result', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { data: pick, error } = await supabase
    .from('picks')
    .update({ result: req.body.result })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(404).json({ error: error.message })
  res.json({ ok: true, pick })
})

app.get('/api/admin/users', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, name, role, tier, created_at')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ users: users || [] })
})

app.put('/api/admin/users/:id/tier', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { error } = await supabase
    .from('profiles')
    .update({ tier: req.body.tier })
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

app.get('/api/admin/dashboard', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const today = todayStr()

  const [
    { count: totalPicks },
    { count: todayPicksCount },
    { count: pendingPicks },
    { count: totalUsers },
    { count: premiumUsers },
  ] = await Promise.all([
    supabase.from('picks').select('*', { count: 'exact', head: true }),
    supabase.from('picks').select('*', { count: 'exact', head: true }).eq('match_date', today),
    supabase.from('picks').select('*', { count: 'exact', head: true }).eq('result', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tier', 'premium'),
  ])

  res.json({
    totalPicks: totalPicks || 0,
    todayPicks: todayPicksCount || 0,
    pendingPicks: pendingPicks || 0,
    totalUsers: totalUsers || 0,
    premiumUsers: premiumUsers || 0,
  })
})

// ══════════════════════════════════════════
// VALUE BETTING ROUTES
// ══════════════════════════════════════════

app.post('/api/admin/scrape', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  try {
    const { scrapeXG } = await import('./scrapers/fbref-xg.mjs')
    const { scrapeOdds } = await import('./scrapers/odds-api.mjs')
    const { scrapeNBA } = await import('./scrapers/nba-stats.mjs')
    const { scrapeMaxBetAll } = await import('./scrapers/maxbet-scraper.mjs')
    const { scrapeCryptoAll } = await import('./scrapers/crypto-scrapers.mjs')
    // Playwright browser scrapers
    let browserResult = { skipped: 'import failed' }
    try {
      const { scrapeAll } = await import('./scrapers/browser-scrapers.mjs')
      browserResult = await scrapeAll().catch(e => ({ error: e.message }))
    } catch (_) {}

    const [xg, odds, nba, maxbet, crypto] = await Promise.all([
      scrapeXG().catch(e => ({ error: e.message })),
      scrapeOdds().catch(e => ({ error: e.message })),
      scrapeNBA().catch(e => ({ error: e.message })),
      scrapeMaxBetAll().catch(e => ({ error: e.message })),
      scrapeCryptoAll().catch(e => ({ error: e.message })),
    ])

    res.json({ ok: true, xg, odds, nba, maxbet, crypto, browser: browserResult })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/generate-picks', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  try {
    const { generatePicks } = await import('./engine/picks-generator.mjs')
    const picks = await generatePicks()
    res.json({ ok: true, count: picks.length, picks })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/update-results', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  try {
    const { updateResults } = await import('./engine/results-updater.mjs')
    const result = await updateResults()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/value-bets', authMiddleware, loadUser, async (req, res) => {
  if (req.user.tier !== 'premium' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Premium only' })
  }
  try {
    const { detectValueBets } = await import('./engine/value-detector.mjs')
    const bets = await detectValueBets()
    res.json(bets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ══════════════════════════════════════════
// ODDS COMPARISON & STATS ROUTES
// ══════════════════════════════════════════

app.get('/api/odds-comparison/:matchId', async (req, res) => {
  try {
    const { getOddsForMatch } = await import('./engine/odds-comparator.mjs')
    const data = await getOddsForMatch(req.params.matchId)
    if (!data) return res.status(404).json({ error: 'No odds found for this match' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/stats/detailed', async (req, res) => {
  try {
    const { calculateDetailedStats } = await import('./engine/stats-calculator.mjs')
    const stats = await calculateDetailedStats()
    if (!stats) return res.status(500).json({ error: 'Could not calculate stats' })
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ══════════════════════════════════════════
// START
// ══════════════════════════════════════════

const PORT = process.env.PORT || 3001
process.on('uncaughtException', (err) => { console.error('UNCAUGHT:', err) })
process.on('unhandledRejection', (err) => { console.error('UNHANDLED:', err) })

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BetAnalitika API running on http://0.0.0.0:${PORT}`)
  console.log('📦 Using Supabase backend')

  // Test Supabase connection (non-blocking)
  supabase.from('profiles').select('id').limit(1).then(({ error }) => {
    if (error) {
      console.log(`⚠️ Supabase connection issue: ${error.message}`)
      console.log('   Tables may need to be created. Run: server/migration.sql in Supabase Dashboard')
    } else {
      console.log('✅ Supabase connected successfully')
    }
  }).catch(err => {
    console.log(`⚠️ Supabase test failed: ${err.message}`)
  })
})
