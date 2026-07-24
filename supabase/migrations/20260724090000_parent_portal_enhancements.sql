-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Parent Portal Enhancements
-- Creates payment_submissions table, adds subject_id to messages, configures storage.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend messages table with optional subject_id
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;

-- 2. Create payment_submissions table
CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id             UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id            UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount                NUMERIC     NOT NULL CHECK (amount > 0),
  bank_name             TEXT        NOT NULL,
  transaction_reference TEXT        NOT NULL,
  receipt_url           TEXT,
  status                TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_type          TEXT        DEFAULT 'tuition',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index for transaction reference
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_sub_tx_ref ON public.payment_submissions(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_payment_sub_parent ON public.payment_submissions(parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_sub_student ON public.payment_submissions(student_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access payment_submissions" ON public.payment_submissions;
DROP POLICY IF EXISTS "Parents manage own payment_submissions" ON public.payment_submissions;
DROP POLICY IF EXISTS "Students read own payment_submissions" ON public.payment_submissions;

CREATE POLICY "Admin full access payment_submissions"
  ON public.payment_submissions FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Parents manage own payment_submissions"
  ON public.payment_submissions FOR ALL
  USING (parent_id = auth.uid() OR student_id IN (SELECT student_id FROM public.parent_children WHERE parent_id = auth.uid()));

CREATE POLICY "Students read own payment_submissions"
  ON public.payment_submissions FOR SELECT
  USING (student_id = auth.uid());

-- 3. Create storage bucket for payment receipts if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment-receipts
DROP POLICY IF EXISTS "Public access payment-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload payment-receipts" ON storage.objects;

CREATE POLICY "Public access payment-receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-receipts');

CREATE POLICY "Authenticated upload payment-receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-receipts');
