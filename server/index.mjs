import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())

const DATA_FILE = join(__dirname, 'picks-db.json')
const USERS_FILE = join(__dirname, 'users.json')

// ── DB Helpers ──
function loadDB() {
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify({ picks: [], lastGenerated: null }, null, 2))
  }
  return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
}

function saveDB(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function loadUsers() {
  if (!existsSync(USERS_FILE)) {
    // Default users: admin + test premium user
    const defaultUsers = {
      users: [
        {
          id: 'admin-1',
          email: 'admin@betanalitika.rs',
          password: hashPassword('admin123'),
          name: 'Admin',
          role: 'admin',
          tier: 'premium',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-nikola',
          email: 'nikola@betanalitika.rs',
          password: hashPassword('premium123'),
          name: 'Nikola',
          role: 'user',
          tier: 'premium',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-free',
          email: 'free@betanalitika.rs',
          password: hashPassword('free123'),
          name: 'Free User',
          role: 'user',
          tier: 'free',
          createdAt: new Date().toISOString(),
        },
      ],
      sessions: {},
    }
    writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2))
    return defaultUsers
  }
  return JSON.parse(readFileSync(USERS_FILE, 'utf-8'))
}

function saveUsers(data) {
  writeFileSync(USERS_FILE, JSON.stringify(data, null, 2))
}

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// ── Auth Middleware ──
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })
  
  const users = loadUsers()
  const userId = users.sessions?.[token]
  if (!userId) return res.status(401).json({ error: 'Invalid token' })
  
  const user = users.users.find(u => u.id === userId)
  if (!user) return res.status(401).json({ error: 'User not found' })
  
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

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const users = loadUsers()
  
  const user = users.users.find(u => u.email === email)
  if (!user || user.password !== hashPassword(password)) {
    return res.status(401).json({ error: 'Pogrešan email ili lozinka' })
  }
  
  const token = generateToken()
  users.sessions = users.sessions || {}
  users.sessions[token] = user.id
  saveUsers(users)
  
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier },
  })
})

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body
  const users = loadUsers()
  
  if (users.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email već postoji' })
  }
  
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password: hashPassword(password),
    name: name || email.split('@')[0],
    role: 'user',
    tier: 'free',
    createdAt: new Date().toISOString(),
  }
  
  users.users.push(newUser)
  const token = generateToken()
  users.sessions = users.sessions || {}
  users.sessions[token] = newUser.id
  saveUsers(users)
  
  res.json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, tier: newUser.tier },
  })
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const { password, ...user } = req.user
  res.json({ user })
})

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const users = loadUsers()
  delete users.sessions[token]
  saveUsers(users)
  res.json({ ok: true })
})

// ══════════════════════════════════════════
// PICKS ROUTES (Public + Auth)
// ══════════════════════════════════════════

app.get('/api/picks/today', (req, res) => {
  const db = loadDB()
  const today = todayStr()
  
  // Show today's or tomorrow's picks (for late evening generation)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  let todayPicks = db.picks.filter(p => p.matchDate === today || p.matchDate === tomorrow).filter(p => p.result === 'pending')
  
  if (todayPicks.length === 0) {
    // No picks generated yet — return empty with message
    return res.json({ picks: [], date: today, message: 'Pikovi za danas još nisu generisani. Pokrenite Python skriptu.' })
  }
  
  // Check auth for premium
  const token = req.headers.authorization?.replace('Bearer ', '')
  let isPremium = false
  if (token) {
    const users = loadUsers()
    const userId = users.sessions?.[token]
    const user = users.users?.find(u => u.id === userId)
    isPremium = user?.tier === 'premium'
  }
  
  // Sport filter
  const sport = req.query.sport
  if (sport && sport !== 'all') {
    todayPicks = todayPicks.filter(p => p.sport === sport)
  }
  
  const result = todayPicks.map(p => {
    if (!p.isFree && !isPremium) {
      return {
        ...p,
        reasoning: '🔒 Premium pikovi su dostupni samo za premium korisnike.',
        predictionValue: '🔒',
        odds: 0,
        locked: true,
      }
    }
    return { ...p, locked: false }
  })
  
  res.json({ picks: result, date: today })
})

app.get('/api/picks/history', (req, res) => {
  const db = loadDB()
  const today = todayStr()
  
  let history = db.picks
    .filter(p => p.result !== 'pending')
    .sort((a, b) => b.matchDate.localeCompare(a.matchDate))
  
  // Sport filter
  const sport = req.query.sport
  if (sport && sport !== 'all') {
    history = history.filter(p => p.sport === sport)
  }
  
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit
  
  res.json({
    picks: history.slice(offset, offset + limit),
    total: history.length,
    page,
    totalPages: Math.ceil(history.length / limit),
  })
})

app.get('/api/stats', (req, res) => {
  const db = loadDB()
  
  let resolved = db.picks.filter(p => p.result !== 'pending')
  
  // Sport filter
  const sport = req.query.sport
  if (sport && sport !== 'all') {
    resolved = resolved.filter(p => p.sport === sport)
  }
  
  const won = resolved.filter(p => p.result === 'won')
  const lost = resolved.filter(p => p.result === 'lost')
  
  let streak = 0
  let streakType = 'W'
  const sorted = [...resolved].sort((a, b) => b.matchDate.localeCompare(a.matchDate))
  if (sorted.length > 0) {
    streakType = sorted[0].result === 'won' ? 'W' : 'L'
    for (const p of sorted) {
      if ((p.result === 'won' && streakType === 'W') || (p.result === 'lost' && streakType === 'L')) {
        streak++
      } else break
    }
  }
  
  const totalStake = resolved.length
  const totalReturn = won.reduce((sum, p) => sum + (p.odds || 1.8), 0)
  const roi = totalStake > 0 ? ((totalReturn - totalStake) / totalStake * 100) : 0
  
  res.json({
    totalPicks: resolved.length,
    won: won.length,
    lost: lost.length,
    pending: db.picks.filter(p => p.result === 'pending').length,
    winRate: resolved.length > 0 ? +(won.length / resolved.length * 100).toFixed(1) : 0,
    roi: +roi.toFixed(1),
    currentStreak: streak,
    streakType,
  })
})

// ══════════════════════════════════════════
// ADMIN ROUTES
// ══════════════════════════════════════════

app.get('/api/admin/picks', authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB()
  const today = todayStr()
  
  let picks = db.picks.sort((a, b) => b.matchDate.localeCompare(a.matchDate))
  
  const dateFilter = req.query.date
  if (dateFilter) {
    picks = picks.filter(p => p.matchDate === dateFilter)
  }
  
  res.json({ picks, total: picks.length })
})

app.put('/api/admin/picks/:id', authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB()
  const idx = db.picks.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Pick not found' })
  
  db.picks[idx] = { ...db.picks[idx], ...req.body }
  saveDB(db)
  res.json({ ok: true, pick: db.picks[idx] })
})

app.delete('/api/admin/picks/:id', authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB()
  db.picks = db.picks.filter(p => p.id !== req.params.id)
  saveDB(db)
  res.json({ ok: true })
})

app.post('/api/admin/picks', authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB()
  const pick = {
    id: `pick-manual-${Date.now()}`,
    matchDate: todayStr(),
    result: 'pending',
    isFree: false,
    ...req.body,
  }
  db.picks.push(pick)
  saveDB(db)
  res.json({ ok: true, pick })
})

// Update pick result (won/lost)
app.post('/api/admin/picks/:id/result', authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB()
  const idx = db.picks.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Pick not found' })
  
  db.picks[idx].result = req.body.result // 'won' | 'lost'
  saveDB(db)
  res.json({ ok: true, pick: db.picks[idx] })
})

// Admin: List users
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = loadUsers()
  res.json({ users: users.users.map(({ password, ...u }) => u) })
})

// Admin: Update user tier
app.put('/api/admin/users/:id/tier', authMiddleware, adminMiddleware, (req, res) => {
  const users = loadUsers()
  const idx = users.users.findIndex(u => u.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })
  
  users.users[idx].tier = req.body.tier
  saveUsers(users)
  res.json({ ok: true })
})

// Admin: Dashboard stats
app.get('/api/admin/dashboard', authMiddleware, adminMiddleware, (req, res) => {
  const db = loadDB()
  const users = loadUsers()
  const today = todayStr()
  
  res.json({
    totalPicks: db.picks.length,
    todayPicks: db.picks.filter(p => p.matchDate === today).length,
    pendingPicks: db.picks.filter(p => p.result === 'pending').length,
    totalUsers: users.users.length,
    premiumUsers: users.users.filter(u => u.tier === 'premium').length,
    lastGenerated: db.lastGenerated,
  })
})

// ══════════════════════════════════════════
// VALUE BETTING ROUTES
// ══════════════════════════════════════════

// Admin: Pokreni sve scrapere
app.post('/api/admin/scrape', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { scrapeXG } = await import('./scrapers/fbref-xg.mjs')
    const { scrapeOdds } = await import('./scrapers/odds-api.mjs')
    const { scrapeNBA } = await import('./scrapers/nba-stats.mjs')
    const { scrapeMaxBetAll } = await import('./scrapers/maxbet-scraper.mjs')
    const { scrapeCryptoAll } = await import('./scrapers/crypto-scrapers.mjs')
    
    const [xg, odds, nba, maxbet, crypto] = await Promise.all([
      scrapeXG().catch(e => ({ error: e.message })),
      scrapeOdds().catch(e => ({ error: e.message })),
      scrapeNBA().catch(e => ({ error: e.message })),
      scrapeMaxBetAll().catch(e => ({ error: e.message })),
      scrapeCryptoAll().catch(e => ({ error: e.message })),
    ])
    
    res.json({ ok: true, xg, odds, nba, maxbet, crypto })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: Generiši pikove za danas/sutra
app.post('/api/admin/generate-picks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { generatePicks } = await import('./engine/picks-generator.mjs')
    const picks = await generatePicks()
    res.json({ ok: true, count: picks.length, picks })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: Ažuriraj rezultate
app.post('/api/admin/update-results', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { updateResults } = await import('./engine/results-updater.mjs')
    const result = await updateResults()
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Public: Trenutni value betovi (premium only)
app.get('/api/value-bets', authMiddleware, async (req, res) => {
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
// START
// ══════════════════════════════════════════

const PORT = 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BetAnalitika API running on http://0.0.0.0:${PORT}`)
  
  // Init users
  loadUsers()
  console.log('👤 Users initialized')
  
  const db = loadDB()
  console.log(`📊 Database: ${db.picks.length} picks total`)
})
