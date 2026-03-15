-- BetAnalitika Full Database Schema

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Picks
CREATE TABLE IF NOT EXISTS picks (
  id TEXT PRIMARY KEY,
  match_date DATE NOT NULL,
  league TEXT NOT NULL,
  league_flag TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  kick_off TEXT,
  prediction_type TEXT NOT NULL,
  prediction_value TEXT NOT NULL,
  confidence INT CHECK (confidence BETWEEN 1 AND 5),
  reasoning TEXT,
  odds DECIMAL(5,2),
  bookmaker TEXT,
  affiliate_url TEXT,
  result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'won', 'lost')),
  is_free BOOLEAN DEFAULT false,
  sport TEXT DEFAULT 'football',
  value_edge DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Odds cache
CREATE TABLE IF NOT EXISTS odds_cache (
  id SERIAL PRIMARY KEY,
  event_id TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  league TEXT NOT NULL,
  sport TEXT DEFAULT 'football',
  match_date TIMESTAMPTZ,
  bookmaker TEXT NOT NULL,
  odds_home DECIMAL(5,2),
  odds_draw DECIMAL(5,2),
  odds_away DECIMAL(5,2),
  odds_over25 DECIMAL(5,2),
  odds_under25 DECIMAL(5,2),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- XG data cache
CREATE TABLE IF NOT EXISTS xg_data (
  id SERIAL PRIMARY KEY,
  team TEXT NOT NULL,
  league TEXT NOT NULL,
  xg DECIMAL(4,2),
  xga DECIMAL(4,2),
  npxg DECIMAL(4,2),
  games_played INT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team, league)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_picks_match_date ON picks(match_date);
CREATE INDEX IF NOT EXISTS idx_picks_sport ON picks(sport);
CREATE INDEX IF NOT EXISTS idx_picks_result ON picks(result);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

-- RLS policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public picks read" ON picks;
  DROP POLICY IF EXISTS "Admin picks write" ON picks;
  DROP POLICY IF EXISTS "Public profiles read" ON profiles;
END $$;

CREATE POLICY "Public picks read" ON picks FOR SELECT USING (true);
CREATE POLICY "Admin picks write" ON picks FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);

-- Stats view
CREATE OR REPLACE VIEW pick_stats AS
SELECT
  COUNT(*) FILTER (WHERE result != 'pending') AS total_picks,
  COUNT(*) FILTER (WHERE result = 'won') AS won,
  COUNT(*) FILTER (WHERE result = 'lost') AS lost,
  COUNT(*) FILTER (WHERE result = 'pending') AS pending,
  CASE 
    WHEN COUNT(*) FILTER (WHERE result != 'pending') > 0 
    THEN ROUND(COUNT(*) FILTER (WHERE result = 'won')::NUMERIC / COUNT(*) FILTER (WHERE result != 'pending') * 100, 1)
    ELSE 0 
  END AS win_rate,
  CASE
    WHEN COUNT(*) FILTER (WHERE result != 'pending') > 0
    THEN ROUND(
      (SUM(odds) FILTER (WHERE result = 'won') - COUNT(*) FILTER (WHERE result != 'pending'))::NUMERIC 
      / COUNT(*) FILTER (WHERE result != 'pending') * 100, 1)
    ELSE 0
  END AS roi
FROM picks;
