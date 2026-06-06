-- Create rate limits table for API rate limiting
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_expires_at ON rate_limits(expires_at);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow system access to rate limits table
CREATE POLICY "System only access" ON rate_limits
FOR ALL USING (false);

-- Create function to clean up expired rate limit records
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically clean up expired records periodically
-- This would be better handled by a scheduled job in production
CREATE OR REPLACE FUNCTION auto_cleanup_rate_limits()
RETURNS trigger AS $$
BEGIN
  -- Clean up expired records every 100 insertions
  IF (random() * 100) < 1 THEN
    PERFORM cleanup_expired_rate_limits();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_cleanup_rate_limits
  AFTER INSERT ON rate_limits
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_cleanup_rate_limits();