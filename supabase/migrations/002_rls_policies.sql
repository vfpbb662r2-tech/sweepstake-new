-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sweepstakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sweepstake_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sweepstake_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Sweepstakes policies
CREATE POLICY "Users can view sweepstakes they created or joined" ON sweepstakes
  FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT sweepstake_id 
      FROM sweepstake_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sweepstakes" ON sweepstakes
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Only creators can update their sweepstakes" ON sweepstakes
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Only creators can delete their sweepstakes" ON sweepstakes
  FOR DELETE USING (created_by = auth.uid());

-- Sweepstake participants policies
CREATE POLICY "Users can view participants in sweepstakes they're part of" ON sweepstake_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    sweepstake_id IN (
      SELECT id FROM sweepstakes WHERE created_by = auth.uid()
    ) OR
    sweepstake_id IN (
      SELECT sweepstake_id 
      FROM sweepstake_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public sweepstakes or private ones they're invited to" ON sweepstake_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM sweepstakes 
        WHERE id = sweepstake_id 
        AND (is_public = true OR created_by = auth.uid())
      )
    )
  );

CREATE POLICY "Users can leave sweepstakes they joined" ON sweepstake_participants
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Sweepstake creators can remove participants" ON sweepstake_participants
  FOR DELETE USING (
    sweepstake_id IN (
      SELECT id FROM sweepstakes WHERE created_by = auth.uid()
    )
  );

-- Sweepstake entries policies
CREATE POLICY "Users can view entries in sweepstakes they're part of" ON sweepstake_entries
  FOR SELECT USING (
    user_id = auth.uid() OR
    sweepstake_id IN (
      SELECT id FROM sweepstakes WHERE created_by = auth.uid()
    ) OR
    sweepstake_id IN (
      SELECT sweepstake_id 
      FROM sweepstake_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create entries in sweepstakes they're part of" ON sweepstake_entries
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    sweepstake_id IN (
      SELECT sweepstake_id 
      FROM sweepstake_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own entries before deadline" ON sweepstake_entries
  FOR UPDATE USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sweepstakes s
      WHERE s.id = sweepstake_id 
      AND s.entry_deadline > NOW()
    )
  );

CREATE POLICY "Users can delete their own entries before deadline" ON sweepstake_entries
  FOR DELETE USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sweepstakes s
      WHERE s.id = sweepstake_id 
      AND s.entry_deadline > NOW()
    )
  );

-- Teams policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view teams" ON teams
  FOR SELECT USING (auth.role() = 'authenticated');

-- Matches policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view matches" ON matches
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_sweepstake_participants_user_id ON sweepstake_participants(user_id);
CREATE INDEX idx_sweepstake_participants_sweepstake_id ON sweepstake_participants(sweepstake_id);
CREATE INDEX idx_sweepstake_entries_user_id ON sweepstake_entries(user_id);
CREATE INDEX idx_sweepstake_entries_sweepstake_id ON sweepstake_entries(sweepstake_id);
CREATE INDEX idx_sweepstakes_created_by ON sweepstakes(created_by);
CREATE INDEX idx_sweepstakes_is_public ON sweepstakes(is_public) WHERE is_public = true;

-- Function to check if user can access sweepstake
CREATE OR REPLACE FUNCTION can_access_sweepstake(sweepstake_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sweepstakes s
    WHERE s.id = sweepstake_id
    AND (
      s.created_by = user_id OR
      EXISTS (
        SELECT 1 FROM sweepstake_participants sp
        WHERE sp.sweepstake_id = sweepstake_id
        AND sp.user_id = user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION can_access_sweepstake TO authenticated;