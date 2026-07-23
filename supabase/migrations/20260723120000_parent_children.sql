-- Parent-Children linking table
-- Links parent profiles to student profiles
CREATE TABLE IF NOT EXISTS public.parent_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent', -- e.g., 'mother', 'father', 'guardian'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Enable RLS
ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

-- Parents can read their own children links
CREATE POLICY "Parents can view their children"
  ON public.parent_children FOR SELECT
  USING (auth.uid() = parent_id);
