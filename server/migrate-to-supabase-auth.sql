-- ============================================================
-- Migration: Express Auth → Supabase Auth
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================

-- NOTE: Existing users (e.g. becomingrich123@gmail.com) will need to
-- re-register through the new Supabase Auth flow, since their passwords
-- are stored as custom hashes, not in auth.users.

-- ── 1a. RLS on picks ──
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read picks" ON picks;
CREATE POLICY "Public read picks" ON picks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage picks" ON picks;
CREATE POLICY "Admin manage picks" ON picks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ── 1b. RLS on profiles ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin read all profiles" ON profiles;
CREATE POLICY "Admin read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Admin update profiles" ON profiles;
CREATE POLICY "Admin update profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Admin delete profiles" ON profiles;
CREATE POLICY "Admin delete profiles" ON profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 1c. RLS on ads ──
DROP POLICY IF EXISTS "Service role manage ads" ON ads;
DROP POLICY IF EXISTS "Admin manage ads" ON ads;
CREATE POLICY "Admin manage ads" ON ads FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ── 1d. Drop sessions table ──
DROP TABLE IF EXISTS sessions;

-- ── 1e. Auto-create profile on signup ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, tier)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user',
    'free'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
