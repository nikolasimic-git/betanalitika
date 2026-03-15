// Test Supabase connection after running migration SQL manually
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function test() {
  const tables = ['profiles', 'picks', 'odds_cache', 'xg_data']
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: accessible`)
    }
  }
}

test().catch(e => console.error(e.message))
