-- Insert World Cup 2024 teams
INSERT INTO public.teams (name, country_code, flag_url, group_letter, fifa_ranking) VALUES
-- Group A
('Germany', 'DE', 'https://flagcdn.com/w320/de.png', 'A', 11),
('Scotland', 'GB-SCT', 'https://flagcdn.com/w320/gb-sct.png', 'A', 39),
('Hungary', 'HU', 'https://flagcdn.com/w320/hu.png', 'A', 26),
('Switzerland', 'CH', 'https://flagcdn.com/w320/ch.png', 'A', 19),

-- Group B
('Spain', 'ES', 'https://flagcdn.com/w320/es.png', 'B', 8),
('Croatia', 'HR', 'https://flagcdn.com/w320/hr.png', 'B', 10),
('Italy', 'IT', 'https://flagcdn.com/w320/it.png', 'B', 9),
('Albania', 'AL', 'https://flagcdn.com/w320/al.png', 'B', 66),

-- Group C
('Slovenia', 'SI', 'https://flagcdn.com/w320/si.png', 'C', 57),
('Denmark', 'DK', 'https://flagcdn.com/w320/dk.png', 'C', 21),
('Serbia', 'RS', 'https://flagcdn.com/w320/rs.png', 'C', 33),
('England', 'GB-ENG', 'https://flagcdn.com/w320/gb-eng.png', 'C', 5),

-- Group D
('Poland', 'PL', 'https://flagcdn.com/w320/pl.png', 'D', 28),
('Netherlands', 'NL', 'https://flagcdn.com/w320/nl.png', 'D', 7),
('Austria', 'AT', 'https://flagcdn.com/w320/at.png', 'D', 25),
('France', 'FR', 'https://flagcdn.com/w320/fr.png', 'D', 2),

-- Group E
('Belgium', 'BE', 'https://flagcdn.com/w320/be.png', 'E', 3),
('Slovakia', 'SK', 'https://flagcdn.com/w320/sk.png', 'E', 48),
('Romania', 'RO', 'https://flagcdn.com/w320/ro.png', 'E', 47),
('Ukraine', 'UA', 'https://flagcdn.com/w320/ua.png', 'E', 22),

-- Group F
('Turkey', 'TR', 'https://flagcdn.com/w320/tr.png', 'F', 40),
('Georgia', 'GE', 'https://flagcdn.com/w320/ge.png', 'F', 75),
('Portugal', 'PT', 'https://flagcdn.com/w320/pt.png', 'F', 6),
('Czech Republic', 'CZ', 'https://flagcdn.com/w320/cz.png', 'F', 36);

-- Insert sample group stage matches for Group A (first few days)
WITH germany_id AS (SELECT id FROM public.teams WHERE country_code = 'DE'),
     scotland_id AS (SELECT id FROM public.teams WHERE country_code = 'GB-SCT'),
     hungary_id AS (SELECT id FROM public.teams WHERE country_code = 'HU'),
     switzerland_id AS (SELECT id FROM public.teams WHERE country_code = 'CH')
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, round, group_letter, status) VALUES
-- Group A matches
((SELECT id FROM germany_id), (SELECT id FROM scotland_id), '2024-06-14 20:00:00+00', 'Munich Arena', 'group_stage', 'A', 'completed'),
((SELECT id FROM hungary_id), (SELECT id FROM switzerland_id), '2024-06-15 14:00:00+00', 'Cologne Stadium', 'group_stage', 'A', 'completed'),
((SELECT id FROM germany_id), (SELECT id FROM hungary_id), '2024-06-19 17:00:00+00', 'Stuttgart Arena', 'group_stage', 'A', 'completed'),
((SELECT id FROM scotland_id), (SELECT id FROM switzerland_id), '2024-06-19 20:00:00+00', 'Cologne Stadium', 'group_stage', 'A', 'completed'),
((SELECT id FROM switzerland_id), (SELECT id FROM germany_id), '2024-06-23 20:00:00+00', 'Frankfurt Arena', 'group_stage', 'A', 'completed'),
((SELECT id FROM scotland_id), (SELECT id FROM hungary_id), '2024-06-23 20:00:00+00', 'Stuttgart Arena', 'group_stage', 'A', 'completed');

-- Update match results for Group A
UPDATE public.matches SET 
    home_score = 5, 
    away_score = 1,
    status = 'completed'
WHERE home_team_id = (SELECT id FROM public.teams WHERE country_code = 'DE') 
    AND away_team_id = (SELECT id FROM public.teams WHERE country_code = 'GB-SCT');

UPDATE public.matches SET 
    home_score = 1, 
    away_score = 3,
    status = 'completed'
WHERE home_team_id = (SELECT id FROM public.teams WHERE country_code = 'HU') 
    AND away_team_id = (SELECT id FROM public.teams WHERE country_code = 'CH');

UPDATE public.matches SET 
    home_score = 2, 
    away_score = 0,
    status = 'completed'
WHERE home_team_id = (SELECT id FROM public.teams WHERE country_code = 'DE') 
    AND away_team_id = (SELECT id FROM public.teams WHERE country_code = 'HU');

UPDATE public.matches SET 
    home_score = 1, 
    away_score = 1,
    status = 'completed'
WHERE home_team_id = (SELECT id FROM public.teams WHERE country_code = 'GB-SCT') 
    AND away_team_id = (SELECT id FROM public.teams WHERE country_code = 'CH');

UPDATE public.matches SET 
    home_score = 1, 
    away_score = 1,
    status = 'completed'
WHERE home_team_id = (SELECT id FROM public.teams WHERE country_code = 'CH') 
    AND away_team_id = (SELECT id FROM public.teams WHERE country_code = 'DE');

UPDATE public.matches SET 
    home_score = 0, 
    away_score = 1,
    status = 'completed'
WHERE home_team_id = (SELECT id FROM public.teams WHERE country_code = 'GB-SCT') 
    AND away_team_id = (SELECT id FROM public.teams WHERE country_code = 'HU');

-- Insert sample Group B matches
WITH spain_id AS (SELECT id FROM public.teams WHERE country_code = 'ES'),
     croatia_id AS (SELECT id FROM public.teams WHERE country_code = 'HR'),
     italy_id AS (SELECT id FROM public.teams WHERE country_code = 'IT'),
     albania_id AS (SELECT id FROM public.teams WHERE country_code = 'AL')
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, round, group_letter, status, home_score, away_score) VALUES
-- Group B matches  
((SELECT id FROM spain_id), (SELECT id FROM croatia_id), '2024-06-15 17:00:00+00', 'Berlin Olympiastadion', 'group_stage', 'B', 'completed', 3, 0),
((SELECT id FROM italy_id), (SELECT id FROM albania_id), '2024-06-15 20:00:00+00', 'Dortmund Stadium', 'group_stage', 'B', 'completed', 2, 1),
((SELECT id FROM croatia_id), (SELECT id FROM albania_id), '2024-06-19 14:00:00+00', 'Hamburg Arena', 'group_stage', 'B', 'completed', 2, 2),
((SELECT id FROM spain_id), (SELECT id FROM italy_id), '2024-06-20 20:00:00+00', 'Gelsenkirchen Arena', 'group_stage', 'B', 'completed', 1, 0),
((SELECT id FROM albania_id), (SELECT id FROM spain_id), '2024-06-24 20:00:00+00', 'Dusseldorf Arena', 'group_stage', 'B', 'completed', 0, 1),
((SELECT id FROM croatia_id), (SELECT id FROM italy_id), '2024-06-24 20:00:00+00', 'Leipzig Stadium', 'group_stage', 'B', 'completed', 1, 1);

-- Insert some knockout stage matches (Round of 16)
INSERT INTO public.matches (home_team_id, away_team_id, match_date, venue, round, status) VALUES
-- Round of 16 (placeholder teams - would be determined by group results)
((SELECT id FROM public.teams WHERE country_code = 'DE'), (SELECT id FROM public.teams WHERE country_code = 'DK'), '2024-06-29 17:00:00+00', 'Dortmund Stadium', 'round_of_16', 'scheduled'),
((SELECT id FROM public.teams WHERE country_code = 'ES'), (SELECT id FROM public.teams WHERE country_code = 'GE'), '2024-06-30 20:00:00+00', 'Cologne Stadium', 'round_of_16', 'scheduled'),
((SELECT id FROM public.teams WHERE country_code = 'FR'), (SELECT id FROM public.teams WHERE country_code = 'BE'), '2024-07-01 17:00:00+00', 'Dusseldorf Arena', 'round_of_16', 'scheduled'),
((SELECT id FROM public.teams WHERE country_code = 'PT'), (SELECT id FROM public.teams WHERE country_code = 'SI'), '2024-07-01 20:00:00+00', 'Frankfurt Arena', 'round_of_16', 'scheduled');

-- Create a demo admin user (this would normally be done via auth signup)
-- Note: In production, users would sign up through the auth system
-- This is just for seeding demo data

-- Create a demo sweepstake for testing
INSERT INTO public.sweepstakes (
    title, 
    description, 
    entry_fee, 
    max_participants, 
    status,
    admin_id,
    draw_date,
    start_date,
    end_date,
    prize_pool
) VALUES (
    'Euro 2024 Office League',
    'Office sweepstake for Euro 2024. Winner takes all!',
    10.00,
    24,
    'open',
    -- This would reference a real user ID in production
    '00000000-0000-0000-0000-000000000000',
    '2024-06-10 12:00:00+00',
    '2024-06-14 20:00:00+00', 
    '2024-07-14 20:00:00+00',
    240.00
);

-- Insert sample scoring rules documentation
COMMENT ON FUNCTION public.calculate_team_points IS 
'Calculates points for a team based on match results:
- Group stage win: 3 points
- Group stage draw: 1 point  
- Knockout stage win: 5 points + stage bonus
- Stage bonuses: R16: +2, QF: +5, SF: +8, Final: +15';

-- Insert helpful views for common queries
CREATE OR REPLACE VIEW public.sweepstake_standings AS
SELECT 
    s.title as sweepstake_title,
    u.full_name,
    u.email,
    t.name as team_name,
    t.country_code,
    l.total_points,
    l.position,
    l.last_updated
FROM public.leaderboards l
JOIN public.participants p ON l.participant_id = p.id
JOIN public.users u ON p.user_id = u.id
JOIN public.sweepstakes s ON p.sweepstake_id = s.id
LEFT JOIN public.teams t ON p.team_id = t.id
ORDER BY l.sweepstake_id, l.position;

CREATE OR REPLACE VIEW public.team_performance AS
SELECT 
    t.name,
    t.country_code,
    t.group_letter,
    COUNT(m.id) as matches_played,
    SUM(CASE 
        WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) 
          OR (m.away_team_id = t.id AND m.away_score > m.home_score) 
        THEN 1 ELSE 0 END) as wins,
    SUM(CASE 
        WHEN m.home_score = m.away_score AND m.status = 'completed'
        THEN 1 ELSE 0 END) as draws,
    SUM(CASE 
        WHEN (m.home_team_id = t.id AND m.home_score < m.away_score) 
          OR (m.away_team_id = t.id AND m.away_score < m.home_score) 
        THEN 1 ELSE 0 END) as losses,
    SUM(CASE 
        WHEN m.home_team_id = t.id THEN COALESCE(m.home_score, 0)
        WHEN m.away_team_id = t.id THEN COALESCE(m.away_score, 0)
        ELSE 0 END) as goals_for,
    SUM(CASE 
        WHEN m.home_team_id = t.id THEN COALESCE(m.away_score, 0)
        WHEN m.away_team_id = t.id THEN COALESCE(m.home_score, 0)
        ELSE 0 END) as goals_against
FROM public.teams t
LEFT JOIN public.matches m ON (t.id = m.home_team_id OR t.id = m.away_team_id) 
    AND m.status = 'completed'
GROUP BY t.id, t.name, t.country_code, t.group_letter
ORDER BY t.group_letter, wins DESC, goals_for DESC;

-- Grant necessary permissions for the views
ALTER TABLE public.sweepstake_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view standings for their sweepstakes" ON public.sweepstake_standings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view team performance" ON public.team_performance
    FOR SELECT USING (auth.role() = 'authenticated');