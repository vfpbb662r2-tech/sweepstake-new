-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sweepstakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Sweepstakes policies
CREATE POLICY "Users can view public sweepstakes"
  ON sweepstakes FOR SELECT
  USING (
    status = 'active' 
    OR status = 'completed' 
    OR creator_id = auth.uid()
  );

CREATE POLICY "Users can create sweepstakes"
  ON sweepstakes FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own sweepstakes"
  ON sweepstakes FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete their own sweepstakes"
  ON sweepstakes FOR DELETE
  USING (creator_id = auth.uid());

-- Entries policies
CREATE POLICY "Users can view their own entries"
  ON entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Sweepstake creators can view entries for their sweepstakes"
  ON entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = entries.sweepstake_id 
      AND sweepstakes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can create entries"
  ON entries FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.status = 'active'
      AND sweepstakes.end_date > NOW()
    )
  );

CREATE POLICY "Users can update their own entries"
  ON entries FOR UPDATE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.status = 'active'
      AND sweepstakes.end_date > NOW()
    )
  );

CREATE POLICY "Users can delete their own entries"
  ON entries FOR DELETE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.status = 'active'
      AND sweepstakes.end_date > NOW()
    )
  );

-- Winners policies
CREATE POLICY "Users can view winners of public sweepstakes"
  ON winners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = winners.sweepstake_id 
      AND (sweepstakes.status = 'completed' OR sweepstakes.creator_id = auth.uid())
    )
  );

CREATE POLICY "Only sweepstake creators can create winners"
  ON winners FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Only sweepstake creators can update winners"
  ON winners FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Only sweepstake creators can delete winners"
  ON winners FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.creator_id = auth.uid()
    )
  );

-- Prizes policies
CREATE POLICY "Users can view prizes for public sweepstakes"
  ON prizes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = prizes.sweepstake_id 
      AND (
        sweepstakes.status IN ('active', 'completed') 
        OR sweepstakes.creator_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create prizes for their sweepstakes"
  ON prizes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update prizes for their sweepstakes"
  ON prizes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete prizes for their sweepstakes"
  ON prizes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sweepstakes 
      WHERE sweepstakes.id = sweepstake_id 
      AND sweepstakes.creator_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Additional security functions
CREATE OR REPLACE FUNCTION check_sweepstake_entry_eligibility(
  sweepstake_id_param UUID,
  user_id_param UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if sweepstake is active and not ended
  IF NOT EXISTS (
    SELECT 1 FROM sweepstakes 
    WHERE id = sweepstake_id_param 
    AND status = 'active'
    AND end_date > NOW()
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check if user hasn't already entered (for single-entry sweepstakes)
  IF EXISTS (
    SELECT 1 FROM sweepstakes 
    WHERE id = sweepstake_id_param 
    AND max_entries_per_user = 1
  ) AND EXISTS (
    SELECT 1 FROM entries 
    WHERE sweepstake_id = sweepstake_id_param 
    AND user_id = user_id_param
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check if user hasn't exceeded max entries
  IF EXISTS (
    SELECT 1 FROM sweepstakes s
    WHERE s.id = sweepstake_id_param
    AND s.max_entries_per_user > 1
    AND (
      SELECT COUNT(*) FROM entries 
      WHERE sweepstake_id = sweepstake_id_param 
      AND user_id = user_id_param
    ) >= s.max_entries_per_user
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check if sweepstake hasn't reached max total entries
  IF EXISTS (
    SELECT 1 FROM sweepstakes s
    WHERE s.id = sweepstake_id_param
    AND s.max_total_entries IS NOT NULL
    AND (
      SELECT COUNT(*) FROM entries 
      WHERE sweepstake_id = sweepstake_id_param
    ) >= s.max_total_entries
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate sweepstake ownership
CREATE OR REPLACE FUNCTION user_owns_sweepstake(
  sweepstake_id_param UUID,
  user_id_param UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sweepstakes 
    WHERE id = sweepstake_id_param 
    AND creator_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view sweepstake
CREATE OR REPLACE FUNCTION user_can_view_sweepstake(
  sweepstake_id_param UUID,
  user_id_param UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sweepstakes 
    WHERE id = sweepstake_id_param 
    AND (
      status IN ('active', 'completed')
      OR creator_id = user_id_param
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update entry validation trigger
CREATE OR REPLACE FUNCTION validate_entry_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_sweepstake_entry_eligibility(NEW.sweepstake_id, NEW.user_id) THEN
    RAISE EXCEPTION 'User is not eligible to enter this sweepstake';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_entry_trigger ON entries;
CREATE TRIGGER validate_entry_trigger
  BEFORE INSERT ON entries
  FOR EACH ROW
  EXECUTE FUNCTION validate_entry_before_insert();

-- Create storage policies for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sweepstake-images', 'sweepstake-images', true),
       ('profile-avatars', 'profile-avatars', true),
       ('prize-images', 'prize-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for sweepstake images
CREATE POLICY "Anyone can view sweepstake images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sweepstake-images');

CREATE POLICY "Users can upload sweepstake images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sweepstake-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own sweepstake images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'sweepstake-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own sweepstake images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sweepstake-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for profile avatars
CREATE POLICY "Anyone can view profile avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for prize images
CREATE POLICY "Anyone can view prize images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'prize-images');

CREATE POLICY "Users can upload prize images for their sweepstakes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prize-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update prize images for their sweepstakes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'prize-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete prize images for their sweepstakes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'prize-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );