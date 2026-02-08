-- Conversations soft delete + messages FK update
-- - Add deleted_at to conversations (soft delete only; client filters WHERE deleted_at IS NULL)
-- - Make messages.conversation_id nullable, FK ON DELETE SET NULL (no cascade; we soft delete)
-- - Indexes and RLS already support user_id / updated_at; no backfill of conversation_id

-- ============================================================================
-- CONVERSATIONS: add soft delete column
-- ============================================================================

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;

COMMENT ON COLUMN public.conversations.deleted_at IS 'Soft delete; client must filter WHERE deleted_at IS NULL. Never hard delete.';

-- ============================================================================
-- MESSAGES: nullable conversation_id + ON DELETE SET NULL
-- ============================================================================

-- Drop existing FK (default name in phase2: messages_conversation_id_fkey)
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

ALTER TABLE public.messages
  ALTER COLUMN conversation_id DROP NOT NULL;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_conversation_id_fkey
  FOREIGN KEY (conversation_id)
  REFERENCES public.conversations(id)
  ON DELETE SET NULL;

COMMENT ON COLUMN public.messages.conversation_id IS 'Nullable for legacy rows. New messages must set conversation_id.';

-- Index on conversation_id (phase2 already has idx_messages_conversation_created on (conversation_id, created_at); add standalone for conversation_id-only lookups if desired)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON public.messages(conversation_id)
  WHERE conversation_id IS NOT NULL;

-- ============================================================================
-- RLS: conversations — users see only their own (client filters deleted_at)
-- ============================================================================

-- Policy already exists as "Users can CRUD own conversations" with USING (auth.uid() = user_id).
-- No change; client is responsible for WHERE deleted_at IS NULL and ORDER BY updated_at DESC.
