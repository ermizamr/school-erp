-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Real-time messaging between parents and teachers
-- Ensures the `messages` table has student_id, RLS policies, and Realtime enabled.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  content      TEXT        NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  is_read      BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- In case table was already created without student_id
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Index for fast conversation queries (both directions between two users)
CREATE INDEX IF NOT EXISTS idx_messages_sender    ON public.messages(sender_id,   created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver  ON public.messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_student   ON public.messages(student_id,  created_at DESC);

-- 2. Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read their own conversations" ON public.messages;
DROP POLICY IF EXISTS "Recipients can mark messages read" ON public.messages;
DROP POLICY IF EXISTS "Users access own messages" ON public.messages;

-- Admins have full access
CREATE POLICY "Admin full access messages"
  ON public.messages FOR ALL
  USING (public.get_my_role() = 'admin');

-- A user can send a message (INSERT) only if they are the sender
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- A user can read messages in which they are either the sender or the receiver
CREATE POLICY "Users can read their own conversations"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- A recipient can mark a message as read (UPDATE is_read only)
CREATE POLICY "Recipients can mark messages read"
  ON public.messages FOR UPDATE
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- 3. Enable Supabase Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
