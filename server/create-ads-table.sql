CREATE TABLE IF NOT EXISTS ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  title text NOT NULL,
  description_sr text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  emoji text DEFAULT '🎯',
  image_url text,
  link_url text,
  placement text NOT NULL DEFAULT 'banner', -- 'banner' | 'sidebar'
  is_active boolean DEFAULT true,
  priority int DEFAULT 0, -- higher = shown more
  created_at timestamptz DEFAULT now()
);

-- Allow public read (anon key)
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read ads" ON ads FOR SELECT USING (true);
CREATE POLICY "Admin manage ads" ON ads FOR ALL USING (true); -- service key bypasses anyway

-- Insert placeholder ads
INSERT INTO ads (name, title, description_sr, description_en, emoji, placement, is_active, priority) VALUES
('placeholder-1', 'Kladi se odgovorno', 'Klađenje može biti zabavno ali igraj odgovorno. 18+', 'Betting can be fun but play responsibly. 18+', '🎯', 'banner', true, 1),
('placeholder-2', 'BetAnalitika Premium', 'Otključaj sve AI pikove sa Premium planom', 'Unlock all AI picks with Premium plan', '💎', 'banner', true, 1),
('placeholder-3', 'Igraj pametno', 'AI analizira, ti odlučuješ. Nikad ne stavljaj više nego što možeš priuštiti.', 'AI analyzes, you decide. Never stake more than you can afford.', '🧠', 'sidebar', true, 1);
