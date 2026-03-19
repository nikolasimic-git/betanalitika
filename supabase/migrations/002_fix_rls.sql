-- Fix infinite recursion in profiles RLS policies
-- The "Admins can manage profiles" policy queries profiles from within profiles RLS = infinite recursion

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Admin picks write" ON picks;
DROP POLICY IF EXISTS "Public profiles read" ON profiles;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (name only, not role/tier)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin picks write: use auth.jwt() to avoid querying profiles
CREATE POLICY "Admin picks write" ON picks
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'service_role'
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Note: Admin profile management should be done via service_role key (supabaseAdmin)
-- which bypasses RLS entirely. No need for an admin policy on profiles.
