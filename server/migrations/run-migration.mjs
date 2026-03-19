import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
const { Client } = pg;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mpihfwpavhmvsezwucsn.supabase.co';
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error('Set DB_PASSWORD env var to run migrations');
  process.exit(1);
}

const client = new Client({
  connectionString: `postgresql://postgres.mpihfwpavhmvsezwucsn:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  await client.query('ALTER TABLE picks ADD COLUMN IF NOT EXISTS final_score text');
  console.log('✅ Added final_score column');

  try {
    await client.query('ALTER TABLE picks DROP CONSTRAINT IF EXISTS picks_result_check');
    await client.query("ALTER TABLE picks ADD CONSTRAINT picks_result_check CHECK (result IN ('pending', 'won', 'lost', 'void'))");
    console.log('✅ Updated picks_result_check constraint');
  } catch (e) {
    console.log('⚠️ Constraint:', e.message);
  }

  await client.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_since timestamptz');
  console.log('✅ Added premium_since column');

  const res = await client.query("UPDATE profiles SET premium_since = created_at WHERE role = 'premium' AND premium_since IS NULL");
  console.log(`✅ Backfilled ${res.rowCount} premium users`);

  await client.end();
  console.log('Done!');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
