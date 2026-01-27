-- Phase 2: Memory Shell Database Schema
-- Creates tables, indexes, triggers, and RLS policies for persistent chat and memory

-- ============================================================================
-- TABLES
-- ============================================================================

-- A) users (profile mirror of auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- B) career_files (1 per user)
CREATE TABLE IF NOT EXISTS public.career_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name text,
  user_current_role text,
  target_role text,
  goals text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- C) conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text,
  title_locked boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- D) messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  client_msg_id text
);

-- E) memory_items (consent-based, user-visible)
CREATE TABLE IF NOT EXISTS public.memory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  source text DEFAULT 'explicit_confirmed' NOT NULL,
  confidence int DEFAULT 100 NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Messages: conversation_id + created_at for chat reload
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
  ON public.messages(conversation_id, created_at);

-- Conversations: user_id + updated_at desc for conversation list
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated 
  ON public.conversations(user_id, updated_at DESC);

-- Memory items: user_id + updated_at desc for memory panel
CREATE INDEX IF NOT EXISTS idx_memory_items_user_updated 
  ON public.memory_items(user_id, updated_at DESC);

-- Career files: unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_career_files_user_unique 
  ON public.career_files(user_id);

-- Messages: unique client_msg_id per conversation (for deduplication)
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_client_msg_id_unique 
  ON public.messages(conversation_id, client_msg_id) 
  WHERE client_msg_id IS NOT NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for career_files
DROP TRIGGER IF EXISTS update_career_files_updated_at ON public.career_files;
CREATE TRIGGER update_career_files_updated_at
  BEFORE UPDATE ON public.career_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for memory_items
DROP TRIGGER IF EXISTS update_memory_items_updated_at ON public.memory_items;
CREATE TRIGGER update_memory_items_updated_at
  BEFORE UPDATE ON public.memory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create public.users row when auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Career files policies
DROP POLICY IF EXISTS "Users can CRUD own career file" ON public.career_files;
CREATE POLICY "Users can CRUD own career file"
  ON public.career_files FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Conversations policies
DROP POLICY IF EXISTS "Users can CRUD own conversations" ON public.conversations;
CREATE POLICY "Users can CRUD own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id);

-- Messages policies (hardened - checks conversation ownership)
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
CREATE POLICY "Users can insert own messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Memory items policies
DROP POLICY IF EXISTS "Users can CRUD own memory" ON public.memory_items;
CREATE POLICY "Users can CRUD own memory"
  ON public.memory_items FOR ALL
  USING (auth.uid() = user_id);
