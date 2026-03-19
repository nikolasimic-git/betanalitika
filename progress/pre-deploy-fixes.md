# Pre-Deploy Fixes Progress

| # | Issue | Status |
|---|-------|--------|
| 1 | CORS restrict origins | ✅ DONE |
| 2 | Sessions in Supabase | ✅ DONE |
| 3 | Remove hardcoded Cloudflare URL | ✅ DONE |
| 4 | bcrypt instead of SHA-256 | ✅ DONE |
| 5 | Safe dynamic imports | ✅ Verified (all already wrapped in try/catch) |
| 6 | Rate limiting | ✅ DONE |
| 7 | Code splitting | ✅ DONE |

## Build
- `vite build` ✅ passes
- Chunks: vendor (47KB), supabase (173KB), ui (13KB), index (340KB)

## Files Changed
- `server/index.mjs` — CORS, sessions, bcrypt, rate limiting
- `server/create-sessions-table.sql` — NEW (Nikola must run in Supabase Dashboard)
- `server/.env` — added FRONTEND_URL=
- `server/package.json` — bcryptjs + express-rate-limit deps
- `src/auth.tsx` — removed hardcoded Cloudflare URL
- `src/api.ts` — removed hardcoded Cloudflare URL
- `.env` — added VITE_API_URL=
- `vite.config.ts` — code splitting config

## Action Required
⚠️ Nikola must run `server/create-sessions-table.sql` in Supabase SQL Editor before deploying!
