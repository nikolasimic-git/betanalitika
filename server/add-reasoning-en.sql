-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/mpihfwpavhmvsezwucsn/sql/new

ALTER TABLE picks ADD COLUMN IF NOT EXISTS reasoning_en text;

-- Populate reasoning_en for today's picks (2026-03-18)
UPDATE picks SET reasoning_en = 'Tottenham Hotspur are playing at home with a strong record. Home advantage is crucial in this match. Atlético Madrid have a weaker away record.' WHERE id = 'pick-20260318-5';
UPDATE picks SET reasoning_en = 'Both teams are offensively minded. Liverpool and Galatasaray regularly find the net. We expect an open, high-scoring match.' WHERE id = 'pick-20260318-4';
UPDATE picks SET reasoning_en = 'Barcelona are playing at home with an impressive record. Home advantage is key in this match. Newcastle United have a weaker away record.' WHERE id = 'pick-20260318-2';
UPDATE picks SET reasoning_en = 'Both teams are offensively minded. Bayern Munich and Atalanta regularly score goals. We expect an open, attacking match.' WHERE id = 'pick-20260318-3';
UPDATE picks SET reasoning_en = 'Toronto Raptors have a better record (38-29) and are in stronger form. Their opponent at 28-40 will struggle to compete on the road.' WHERE id = 'pick-20260318-7';
UPDATE picks SET reasoning_en = 'Both teams play at a high pace. Memphis Grizzlies (23-44) and Denver Nuggets (42-27) love transition basketball. We expect a high-scoring affair.' WHERE id = 'pick-20260318-11';
UPDATE picks SET reasoning_en = 'Both teams play at a high pace. Brooklyn Nets (17-51) and Oklahoma City Thunder (54-15) thrive in transition. We expect a high-scoring game.' WHERE id = 'pick-20260318-1';
UPDATE picks SET reasoning_en = 'Both teams play at a high pace. New Orleans Pelicans (23-46) and LA Clippers (34-34) love transition basketball. We expect a high total.' WHERE id = 'pick-20260318-9';
UPDATE picks SET reasoning_en = 'Both teams play at a high pace. Minnesota Timberwolves (42-27) and Utah Jazz (20-48) thrive in transition. We expect a high-scoring game.' WHERE id = 'pick-20260318-8';
UPDATE picks SET reasoning_en = 'Both teams play at a high pace. Dallas Mavericks (23-46) and Atlanta Hawks (37-31) love transition basketball. We expect a high total.' WHERE id = 'pick-20260318-10';
UPDATE picks SET reasoning_en = 'Boston and Golden State are offensive powerhouses. Celtics average 115+ at home, Warriors play at a fast pace. We expect a high-scoring showdown.' WHERE id = 'pick-20260318-0';
UPDATE picks SET reasoning_en = 'Indiana and Portland rank among the weakest defenses in the league. Both teams prefer a fast pace and transition game. A total over 233.5 is realistic.' WHERE id = 'pick-20260318-6';
UPDATE picks SET reasoning_en = 'Lakers are in excellent form and fighting for a playoff spot. LeBron and AD are healthy. Houston has home court advantage, but Lakers are more motivated with a stronger roster.' WHERE id = 'pick-20260318-12';
