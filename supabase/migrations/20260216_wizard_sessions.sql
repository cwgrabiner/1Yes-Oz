CREATE TABLE tool_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL,
  session_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active', -- active | completed | abandoned
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX tool_sessions_user_id_idx ON tool_sessions(user_id);
CREATE INDEX tool_sessions_status_idx ON tool_sessions(status);

ALTER TABLE tool_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions"
  ON tool_sessions FOR ALL
  USING (auth.uid() = user_id);
