import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env', import.meta.url).pathname.slice(1) });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test connection first
async function testConnection() {
  // Try to query - if tables don't exist, we'll create them
  const { data, error } = await supabase.from('picks').select('id').limit(1);
  if (error && error.code === '42P01') {
    console.log('Tables do not exist yet — need to create them');
    return false;
  } else if (error && error.message.includes('relation')) {
    console.log('Tables do not exist yet — need to create them');
    return false;
  } else if (!error) {
    console.log('Tables already exist!');
    return true;
  }
  console.log('Connection test:', error ? error.message : 'OK');
  return false;
}

// Create tables by inserting/upserting test data to force schema creation
// Actually we need raw SQL. Let's try the SQL endpoint that Supabase exposes for service role
async function runSQL(sql) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });
  return { status: response.status, body: await response.text() };
}

// First, create an exec_sql function, then use it
async function setupAndMigrate() {
  console.log('Step 1: Creating exec_sql helper function...');
  
  // Use the Supabase SQL API (available at /sql for service role in newer versions)
  const createFnSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS void AS $$
    BEGIN
      EXECUTE query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  let res = await runSQL(createFnSQL);
  console.log('Create function result:', res.status);
  
  if (res.status !== 200) {
    console.log('Cannot create function via RPC. Trying direct table creation via Supabase client...');
    
    // Alternative: just test if we can read/write
    const exists = await testConnection();
    if (exists) {
      console.log('✅ Tables already exist. Migration not needed.');
      
      // Insert default admin user if not exists
      const { data: adminCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'admin@betanalitika.rs')
        .single();
      
      if (!adminCheck) {
        const { error: insertErr } = await supabase.from('profiles').insert([
          { email: 'admin@betanalitika.rs', name: 'Admin', role: 'admin', tier: 'premium' },
          { email: 'nikola@betanalitika.rs', name: 'Nikola', role: 'user', tier: 'premium' },
          { email: 'free@betanalitika.rs', name: 'Free User', role: 'user', tier: 'free' },
        ]);
        console.log('Default users:', insertErr ? insertErr.message : 'created ✅');
      } else {
        console.log('Default users already exist ✅');
      }
      return;
    }
    
    console.log('\n⚠️  Cannot run raw SQL through API.');
    console.log('Please run the migration manually:');
    console.log('1. Go to https://supabase.com/dashboard/project/mpihfwpavhmvsezwucsn/sql/new');
    console.log('2. Paste the contents of server/migration.sql');
    console.log('3. Click Run');
    console.log('4. Then run this script again to seed default users.');
    return;
  }
  
  // If we got here, exec_sql was created successfully
  console.log('Step 2: Running migration...');
  const migrationSQL = (await import('fs')).readFileSync(new URL('./migration.sql', import.meta.url), 'utf8');
  const res2 = await runSQL(migrationSQL);
  console.log('Migration result:', res2.status, res2.body.slice(0, 200));
}

setupAndMigrate().catch(e => console.error(e));
