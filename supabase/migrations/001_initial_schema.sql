-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'participant');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'completed', 'postponed');
CREATE TYPE sweepstake_status AS ENUM ('draft', 'open', 'closed', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'participant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    country_code TEXT UNIQUE NOT NULL,
    flag_url TEXT,
    group_letter TEXT,
    fifa_ranking INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Teams policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view teams" ON public.teams
    FOR SELECT USING (auth.role() = 'authenticated');

-- Sweepstakes table
CREATE TABLE public.sweepstakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER,
    status sweepstake_status DEFAULT 'draft',
    admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    draw_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    prize_pool DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_dates CHECK (
        (draw_date IS NULL OR draw_date >= created_at) AND
        (start_date IS NULL OR start_date >= created_at) AND
        (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
    )
);

-- Enable RLS
ALTER TABLE public.sweepstakes ENABLE ROW LEVEL SECURITY;

-- Sweepstakes policies
CREATE POLICY "Users can view active sweepstakes" ON public.sweepstakes
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        status IN ('open', 'closed', 'completed')
    );

CREATE POLICY "Admins can manage their sweepstakes" ON public.sweepstakes
    FOR ALL USING (auth.uid() = admin_id);

CREATE POLICY "Admins can view all sweepstakes" ON public.sweepstakes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Participants table (many-to-many between users and sweepstakes)
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sweepstake_id UUID NOT NULL REFERENCES public.sweepstakes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    draw_position INTEGER,
    
    UNIQUE(sweepstake_id, user_id),
    UNIQUE(sweepstake_id, team_id) -- Each team can only be assigned once per sweepstake
);

-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Participants policies
CREATE POLICY "Users can view participants in their sweepstakes" ON public.participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.participants p2 
            WHERE p2.sweepstake_id = participants.sweepstake_id 
            AND p2.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.sweepstakes s 
            WHERE s.id = participants.sweepstake_id 
            AND s.admin_id = auth.uid()
        )
    );

CREATE POLICY "Users can join sweepstakes" ON public.participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage participants in their sweepstakes" ON public.participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sweepstakes s 
            WHERE s.id = participants.sweepstake_id 
            AND s.admin_id = auth.uid()
        )
    );

-- Matches table
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    home_team_id UUID NOT NULL REFERENCES public.teams(id),
    away_team_id UUID NOT NULL REFERENCES public.teams(id),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    status match_status DEFAULT 'scheduled',
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue TEXT,
    round TEXT NOT NULL, -- e.g., 'group_stage', 'round_of_16', 'quarter_final', etc.
    group_letter TEXT, -- Only for group stage matches
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id),
    CONSTRAINT valid_scores CHECK (
        (status = 'completed' AND home_score IS NOT NULL AND away_score IS NOT NULL) OR
        (status != 'completed')
    )
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Matches policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view matches" ON public.matches
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage matches" ON public.matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Leaderboards table (calculated scores for each sweepstake)
CREATE TABLE public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sweepstake_id UUID NOT NULL REFERENCES public.sweepstakes(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    group_stage_points INTEGER DEFAULT 0,
    knockout_points INTEGER DEFAULT 0,
    position INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(sweepstake_id, participant_id)
);

-- Enable RLS
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Leaderboards policies
CREATE POLICY "Users can view leaderboards for their sweepstakes" ON public.leaderboards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.participants p 
            WHERE p.id = leaderboards.participant_id
            AND EXISTS (
                SELECT 1 FROM public.participants p2 
                WHERE p2.sweepstake_id = p.sweepstake_id 
                AND p2.user_id = auth.uid()
            )
        ) OR
        EXISTS (
            SELECT 1 FROM public.participants p 
            JOIN public.sweepstakes s ON p.sweepstake_id = s.id
            WHERE p.id = leaderboards.participant_id
            AND s.admin_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

CREATE INDEX idx_teams_country_code ON public.teams(country_code);
CREATE INDEX idx_teams_group_letter ON public.teams(group_letter);

CREATE INDEX idx_sweepstakes_status ON public.sweepstakes(status);
CREATE INDEX idx_sweepstakes_admin_id ON public.sweepstakes(admin_id);
CREATE INDEX idx_sweepstakes_dates ON public.sweepstakes(start_date, end_date);

CREATE INDEX idx_participants_sweepstake_id ON public.participants(sweepstake_id);
CREATE INDEX idx_participants_user_id ON public.participants(user_id);
CREATE INDEX idx_participants_team_id ON public.participants(team_id);

CREATE INDEX idx_matches_teams ON public.matches(home_team_id, away_team_id);
CREATE INDEX idx_matches_date ON public.matches(match_date);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_round ON public.matches(round);

CREATE INDEX idx_leaderboards_sweepstake_id ON public.leaderboards(sweepstake_id);
CREATE INDEX idx_leaderboards_position ON public.leaderboards(sweepstake_id, position);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.sweepstakes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to update leaderboard positions
CREATE OR REPLACE FUNCTION public.update_leaderboard_positions(sweepstake_uuid UUID)
RETURNS VOID AS $$
BEGIN
    WITH ranked_participants AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY total_points DESC, last_updated ASC) as new_position
        FROM public.leaderboards 
        WHERE sweepstake_id = sweepstake_uuid
    )
    UPDATE public.leaderboards 
    SET position = rp.new_position
    FROM ranked_participants rp
    WHERE public.leaderboards.id = rp.id
    AND public.leaderboards.sweepstake_id = sweepstake_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate points for a team's performance
CREATE OR REPLACE FUNCTION public.calculate_team_points(
    team_uuid UUID,
    sweepstake_uuid UUID
)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER := 0;
    match_record RECORD;
BEGIN
    -- Points system:
    -- Group stage win: 3 points
    -- Group stage draw: 1 point
    -- Knockout stage win: 5 points
    -- Reaching different stages: bonus points
    
    FOR match_record IN
        SELECT m.*, 
               CASE 
                   WHEN m.home_team_id = team_uuid THEN 'home'
                   WHEN m.away_team_id = team_uuid THEN 'away'
                   ELSE NULL
               END as team_position
        FROM public.matches m
        WHERE (m.home_team_id = team_uuid OR m.away_team_id = team_uuid)
        AND m.status = 'completed'
        ORDER BY m.match_date
    LOOP
        IF match_record.round = 'group_stage' THEN
            -- Group stage points
            IF (match_record.team_position = 'home' AND match_record.home_score > match_record.away_score) OR
               (match_record.team_position = 'away' AND match_record.away_score > match_record.home_score) THEN
                total_points := total_points + 3; -- Win
            ELSIF match_record.home_score = match_record.away_score THEN
                total_points := total_points + 1; -- Draw
            END IF;
        ELSE
            -- Knockout stage points
            IF (match_record.team_position = 'home' AND match_record.home_score > match_record.away_score) OR
               (match_record.team_position = 'away' AND match_record.away_score > match_record.home_score) THEN
                total_points := total_points + 5; -- Knockout win
                
                -- Bonus points for reaching different stages
                CASE match_record.round
                    WHEN 'round_of_16' THEN total_points := total_points + 2;
                    WHEN 'quarter_final' THEN total_points := total_points + 5;
                    WHEN 'semi_final' THEN total_points := total_points + 8;
                    WHEN 'final' THEN total_points := total_points + 15;
                    ELSE NULL;
                END CASE;
            END IF;
        END IF;
    END LOOP;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh all leaderboards for a sweepstake
CREATE OR REPLACE FUNCTION public.refresh_sweepstake_leaderboard(sweepstake_uuid UUID)
RETURNS VOID AS $$
DECLARE
    participant_record RECORD;
    calculated_points INTEGER;
BEGIN
    FOR participant_record IN
        SELECT p.id, p.team_id
        FROM public.participants p
        WHERE p.sweepstake_id = sweepstake_uuid
        AND p.team_id IS NOT NULL
    LOOP
        -- Calculate points for this participant's team
        calculated_points := public.calculate_team_points(
            participant_record.team_id, 
            sweepstake_uuid
        );
        
        -- Update or insert leaderboard entry
        INSERT INTO public.leaderboards (
            sweepstake_id, 
            participant_id, 
            total_points, 
            last_updated
        )
        VALUES (
            sweepstake_uuid,
            participant_record.id,
            calculated_points,
            NOW()
        )
        ON CONFLICT (sweepstake_id, participant_id)
        DO UPDATE SET
            total_points = calculated_points,
            last_updated = NOW();
    END LOOP;
    
    -- Update positions
    PERFORM public.update_leaderboard_positions(sweepstake_uuid);
END;
$$ LANGUAGE plpgsql;