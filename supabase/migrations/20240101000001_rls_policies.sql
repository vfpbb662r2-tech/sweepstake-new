-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sweepstakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sweepstake_results ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Tournaments policies (public read access)
CREATE POLICY "Anyone can view tournaments" ON public.tournaments
  FOR SELECT USING (true);

-- Teams policies (public read access)
CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT USING (true);

-- Sweepstakes policies
CREATE POLICY "Anyone can view public sweepstakes" ON public.sweepstakes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Participants can view their sweepstakes" ON public.sweepstakes
  FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT user_id FROM public.participants 
      WHERE sweepstake_id = id AND status = 'confirmed'
    )
  );

CREATE POLICY "Users can create sweepstakes" ON public.sweepstakes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their sweepstakes" ON public.sweepstakes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their sweepstakes" ON public.sweepstakes
  FOR DELETE USING (auth.uid() = created_by);

-- Participants policies
CREATE POLICY "Users can view participants of their sweepstakes" ON public.participants
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT created_by FROM public.sweepstakes WHERE id = sweepstake_id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM public.participants p2 
      WHERE p2.sweepstake_id = sweepstake_id AND p2.status = 'confirmed'
    )
  );

CREATE POLICY "Sweepstake creators can invite participants" ON public.participants
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM public.sweepstakes WHERE id = sweepstake_id
    )
  );

CREATE POLICY "Users can join sweepstakes" ON public.participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation status" ON public.participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Creators can update participation status" ON public.participants
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT created_by FROM public.sweepstakes WHERE id = sweepstake_id
    )
  );

-- Team assignments policies
CREATE POLICY "Users can view team assignments in their sweepstakes" ON public.team_assignments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.user_id FROM public.participants p
      JOIN public.sweepstakes s ON p.sweepstake_id = s.id
      WHERE p.id = participant_id OR s.created_by = auth.uid()
    ) OR
    auth.uid() IN (
      SELECT p2.user_id FROM public.participants p2
      WHERE p2.sweepstake_id = (
        SELECT p.sweepstake_id FROM public.participants p WHERE p.id = participant_id
      ) AND p2.status = 'confirmed'
    )
  );

CREATE POLICY "Sweepstake creators can create team assignments" ON public.team_assignments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT s.created_by FROM public.sweepstakes s
      JOIN public.participants p ON s.id = p.sweepstake_id
      WHERE p.id = participant_id
    )
  );

CREATE POLICY "Sweepstake creators can update team assignments" ON public.team_assignments
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT s.created_by FROM public.sweepstakes s
      JOIN public.participants p ON s.id = p.sweepstake_id
      WHERE p.id = participant_id
    )
  );

-- Tournament results policies (public read, admin write)
CREATE POLICY "Anyone can view tournament results" ON public.tournament_results
  FOR SELECT USING (true);

-- Sweepstake results policies
CREATE POLICY "Users can view results of their sweepstakes" ON public.sweepstake_results
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.user_id FROM public.participants p
      WHERE p.id = participant_id
    ) OR
    auth.uid() IN (
      SELECT p2.user_id FROM public.participants p2
      WHERE p2.sweepstake_id = (
        SELECT p.sweepstake_id FROM public.participants p WHERE p.id = participant_id
      ) AND p2.status = 'confirmed'
    ) OR
    auth.uid() IN (
      SELECT s.created_by FROM public.sweepstakes s
      JOIN public.participants p ON s.id = p.sweepstake_id
      WHERE p.id = participant_id
    )
  );

-- Function to check if user is participant in sweepstake
CREATE OR REPLACE FUNCTION is_sweepstake_participant(sweepstake_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.participants
    WHERE sweepstake_id = sweepstake_uuid
    AND user_id = user_uuid
    AND status = 'confirmed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is sweepstake creator
CREATE OR REPLACE FUNCTION is_sweepstake_creator(sweepstake_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.sweepstakes
    WHERE id = sweepstake_uuid
    AND created_by = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;