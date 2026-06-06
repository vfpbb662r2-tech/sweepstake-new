-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tournaments table
CREATE TABLE public.tournaments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Teams table
CREATE TABLE public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  group_name TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tournament_id, code)
);

-- Sweepstakes table
CREATE TABLE public.sweepstakes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE RESTRICT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE,
  max_participants INTEGER DEFAULT 32,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_pool DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_public BOOLEAN DEFAULT false,
  auto_assign BOOLEAN DEFAULT true,
  draw_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Participants table
CREATE TABLE public.participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sweepstake_id UUID REFERENCES public.sweepstakes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  UNIQUE(sweepstake_id, user_id)
);

-- Team assignments table
CREATE TABLE public.team_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(participant_id, team_id),
  UNIQUE(participant_id) -- Each participant can only have one team
);

-- Tournament results table
CREATE TABLE public.tournament_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  eliminated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tournament_id, team_id)
);

-- Sweepstake results table
CREATE TABLE public.sweepstake_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  final_position INTEGER,
  points_earned INTEGER DEFAULT 0,
  prize_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(participant_id)
);

-- Create indexes for better performance
CREATE INDEX idx_teams_tournament_id ON public.teams(tournament_id);
CREATE INDEX idx_teams_code ON public.teams(code);
CREATE INDEX idx_sweepstakes_tournament_id ON public.sweepstakes(tournament_id);
CREATE INDEX idx_sweepstakes_created_by ON public.sweepstakes(created_by);
CREATE INDEX idx_sweepstakes_invite_code ON public.sweepstakes(invite_code);
CREATE INDEX idx_sweepstakes_status ON public.sweepstakes(status);
CREATE INDEX idx_participants_sweepstake_id ON public.participants(sweepstake_id);
CREATE INDEX idx_participants_user_id ON public.participants(user_id);
CREATE INDEX idx_participants_status ON public.participants(status);
CREATE INDEX idx_team_assignments_participant_id ON public.team_assignments(participant_id);
CREATE INDEX idx_team_assignments_team_id ON public.team_assignments(team_id);
CREATE INDEX idx_tournament_results_tournament_id ON public.tournament_results(tournament_id);
CREATE INDEX idx_tournament_results_team_id ON public.tournament_results(team_id);
CREATE INDEX idx_sweepstake_results_participant_id ON public.sweepstake_results(participant_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sweepstakes_updated_at BEFORE UPDATE ON public.sweepstakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournament_results_updated_at BEFORE UPDATE ON public.tournament_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sweepstake_results_updated_at BEFORE UPDATE ON public.sweepstake_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();