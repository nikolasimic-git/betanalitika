-- BetAnalitika Database Schema

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Picks
CREATE TABLE IF NOT EXISTS picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_date DATE NOT NULL,
  sport TEXT NOT NULL CHECK (sport IN ('football', 'nba', 'tennis')),
  league TEXT NOT NULL,
  league_flag TEXT DEFAULT '',
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  kick_off TEXT NOT NULL DEFAULT 'TBD',
  prediction_type TEXT NOT NULL,
  prediction_value TEXT NOT NULL,
  confidence INT NOT NULL CHECK (confidence BETWEEN 1 AND 5),
  reasoning TEXT NOT NULL,
  odds DECIMAL(5,2) NOT NULL DEFAULT 1.80,
  bookmaker TEXT NOT NULL DEFAULT 'Mozzart',
  affiliate_url TEXT NOT NULL DEFAULT 'https://www.mozzartbet.com',
  result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('pending', 'won', 'lost')),
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_picks_match_date ON picks(match_date);
CREATE INDEX idx_picks_sport ON picks(sport);
CREATE INDEX idx_picks_result ON picks(result);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

-- Everyone can read picks
CREATE POLICY "Picks are viewable by everyone" ON picks
  FOR SELECT USING (true);

-- Only admins can insert/update/delete picks
CREATE POLICY "Admins can manage picks" ON picks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Admins can manage all profiles
CREATE POLICY "Admins can manage profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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
