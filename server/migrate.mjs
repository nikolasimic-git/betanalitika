// Migration helper — reads SQL and provides instructions
// Run the SQL in server/migration.sql via Supabase Dashboard > SQL Editor
// URL: https://supabase.com/dashboard/project/<your-project-id>/sql

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

console.log('Migration SQL is in: server/migration.sql')
console.log('Run it in your Supabase Dashboard > SQL Editor')
console.log('')
console.log('After running the SQL, test the connection with:')
console.log('  node server/run-migration.mjs')
