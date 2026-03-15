import { createClient } from '@supabase/supabase-js'

import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

// Service role client — bypasses RLS, use for server-side operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export default supabase
