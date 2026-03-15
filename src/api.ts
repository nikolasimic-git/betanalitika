export const API_BASE = import.meta.env.DEV 
  ? (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://uncle-double-mechanical-ski.trycloudflare.com')
  : ''

function headers(token?: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

export async function fetchTodayPicks(token?: string | null, sport = 'all') {
  const res = await fetch(`${API_BASE}/api/picks/today?sport=${sport}`, { headers: headers(token) })
  return res.json()
}

export async function fetchHistory(page = 1, limit = 20, sport = 'all') {
  const res = await fetch(`${API_BASE}/api/picks/history?page=${page}&limit=${limit}&sport=${sport}`)
  return res.json()
}

export async function fetchStats(sport = 'all') {
  const res = await fetch(`${API_BASE}/api/stats?sport=${sport}`)
  return res.json()
}

// Admin
export async function adminDashboard(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/dashboard`, { headers: headers(token) })
  return res.json()
}

export async function adminGetPicks(token: string, date?: string) {
  const q = date ? `?date=${date}` : ''
  const res = await fetch(`${API_BASE}/api/admin/picks${q}`, { headers: headers(token) })
  return res.json()
}

export async function adminUpdatePick(token: string, id: string, data: any) {
  const res = await fetch(`${API_BASE}/api/admin/picks/${id}`, {
    method: 'PUT', headers: headers(token), body: JSON.stringify(data),
  })
  return res.json()
}

export async function adminSetResult(token: string, id: string, result: string) {
  const res = await fetch(`${API_BASE}/api/admin/picks/${id}/result`, {
    method: 'POST', headers: headers(token), body: JSON.stringify({ result }),
  })
  return res.json()
}

export async function adminDeletePick(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/admin/picks/${id}`, {
    method: 'DELETE', headers: headers(token),
  })
  return res.json()
}

export async function adminAddPick(token: string, pick: any) {
  const res = await fetch(`${API_BASE}/api/admin/picks`, {
    method: 'POST', headers: headers(token), body: JSON.stringify(pick),
  })
  return res.json()
}
