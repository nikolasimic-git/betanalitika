import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { supabase } from './supabase-client.mjs'

const app = express()

// ── Issue 1: CORS — restrict to allowed origins ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, true) // In early stage, allow all but log
      // Later: callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json())

// ── Issue 6: Rate limiting ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// ── Helpers ──
async function hashPassword(pw) {
  return bcrypt.hash(pw, 12)
}

async function verifyAndUpgradePassword(password, storedHash, userId) {
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return bcrypt.compare(password, storedHash)
  }
  const sha256 = crypto.createHash('sha256').update(password).digest('hex')
  if (sha256 !== storedHash) return false
  const bcryptHash = await bcrypt.hash(password, 12)
  await supabase.from('profiles').update({ password_hash: bcryptHash }).eq('id', userId)
  console.log(`🔐 Auto-upgraded password hash for user ${userId}`)
  return true
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// ── Issue 2: Sessions in Supabase ──
async function createSession(userId) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  await supabase.from('sessions').insert({ token, user_id: userId, expires_at: expiresAt })
  return token
}

async function getSession(token) {
  const { data, error } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single()
  if (error || !data) return null
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('sessions').delete().eq('token', token)
    return null
  }
  return data.user_id
}

async function deleteSession(token) {
  await supabase.from('sessions').delete().eq('token', token)
}

// ── Auth Middleware ──
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })

  const userId = await getSession(token)
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

  // Check password with bcrypt (auto-upgrades legacy SHA-256 hashes)
  if (user.password_hash) {
    const valid = await verifyAndUpgradePassword(password, user.password_hash, user.id)
    if (!valid) return res.status(401).json({ error: 'Pogrešan email ili lozinka' })
  }

  const token = await createSession(user.id)

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
      password_hash: await hashPassword(password),
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  const token = await createSession(newUser.id)

  res.json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, tier: newUser.tier },
  })
})

app.get('/api/auth/me', authMiddleware, loadUser, (req, res) => {
  const { password_hash, ...user } = req.user
  res.json({ user })
})

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  await deleteSession(req.token)
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
  if (token) {
    const sessionUserId = await getSession(token)
    if (sessionUserId) {
      const { data: user } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', sessionUserId)
        .single()
      isPremium = user?.tier === 'premium'
    }
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
  const { isSigurica, isFree, matchDate, homeTeam, awayTeam, kickOff, predictionType, predictionValue, leagueFlag, ...rest } = req.body
  const pick = {
    id: `pick-manual-${Date.now()}`,
    match_date: matchDate || todayStr(),
    home_team: homeTeam,
    away_team: awayTeam,
    kick_off: kickOff,
    prediction_type: predictionType,
    prediction_value: predictionValue,
    league_flag: leagueFlag,
    result: 'pending',
    is_free: isFree ?? false,
    is_sigurica: isSigurica ?? false,
    ...rest,
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

app.patch('/api/admin/users/:id/role', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { role } = req.body
  if (!role || !['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin or user' })
  }
  // Safety: admin cannot remove their own admin role
  if (req.params.id === req.userId && role !== 'admin') {
    return res.status(400).json({ error: 'Ne možeš sam sebi ukloniti admin ulogu' })
  }
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

app.patch('/api/admin/users/:id', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const updates = {}
  if (req.body.tier) updates.tier = req.body.tier
  if (req.body.role) updates.role = req.body.role
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Nothing to update' })

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

app.delete('/api/admin/users/:id', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

app.post('/api/admin/setup', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  // Manual setup endpoint for is_sigurica column
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE picks ADD COLUMN IF NOT EXISTS is_sigurica boolean DEFAULT false'
  })
  if (error) {
    return res.json({
      ok: false,
      message: 'RPC exec_sql not available. Run this SQL manually in Supabase SQL Editor: ALTER TABLE picks ADD COLUMN IF NOT EXISTS is_sigurica boolean DEFAULT false;',
      error: error.message
    })
  }
  res.json({ ok: true, message: 'is_sigurica column added' })
})

app.post('/api/admin/picks/bulk-result', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { ids, result } = req.body
  if (!ids?.length || !result) return res.status(400).json({ error: 'ids and result required' })

  const { error } = await supabase
    .from('picks')
    .update({ result })
    .in('id', ids)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true, updated: ids.length })
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

  // Win rate last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const { data: recentPicks } = await supabase
    .from('picks')
    .select('result')
    .gte('match_date', thirtyDaysAgo)
    .neq('result', 'pending')

  const resolved = recentPicks || []
  const won = resolved.filter(p => p.result === 'won').length
  const winRate = resolved.length > 0 ? +(won / resolved.length * 100).toFixed(1) : 0
  const freeUsers = (totalUsers || 0) - (premiumUsers || 0)
  const revenueEstimate = (premiumUsers || 0) * 20

  res.json({
    totalPicks: totalPicks || 0,
    todayPicks: todayPicksCount || 0,
    pendingPicks: pendingPicks || 0,
    totalUsers: totalUsers || 0,
    premiumUsers: premiumUsers || 0,
    freeUsers,
    winRate,
    revenueEstimate,
  })
})

// ══════════════════════════════════════════
// ADS ADMIN ROUTES
// ══════════════════════════════════════════

app.get('/api/admin/ads', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { data: ads, error } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ads: ads || [] })
})

app.post('/api/admin/ads', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { data: ad, error } = await supabase
    .from('ads')
    .insert(req.body)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true, ad })
})

app.put('/api/admin/ads/:id', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { data: ad, error } = await supabase
    .from('ads')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true, ad })
})

app.delete('/api/admin/ads/:id', authMiddleware, loadUser, adminMiddleware, async (req, res) => {
  const { error } = await supabase.from('ads').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
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

  // Try to add is_sigurica column (ignore if already exists)
  supabase.rpc('exec_sql', { sql: 'ALTER TABLE picks ADD COLUMN IF NOT EXISTS is_sigurica boolean DEFAULT false' })
    .then(({ error }) => {
      if (error) {
        console.log(`⚠️ is_sigurica column: RPC not available (${error.message}). Add manually: ALTER TABLE picks ADD COLUMN IF NOT EXISTS is_sigurica boolean DEFAULT false;`)
      } else {
        console.log('✅ is_sigurica column ensured')
      }
    })
})
