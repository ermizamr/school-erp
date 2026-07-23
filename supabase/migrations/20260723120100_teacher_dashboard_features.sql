-- Teacher Dashboard Features Migration

-- 1. Class Schedules (Timetable)
CREATE TABLE public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access class_schedules" ON public.class_schedules FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "All users read class_schedules" ON public.class_schedules FOR SELECT USING (true);

-- 2. Assignments
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'grading', 'completed');

CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  status assignment_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access assignments" ON public.assignments FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Teachers manage assignments" ON public.assignments FOR ALL USING (
  public.get_my_role() = 'teacher' AND 
  teacher_id = auth.uid()
);
CREATE POLICY "Students read assignments" ON public.assignments FOR SELECT USING (
  section_id IN (SELECT section_id FROM enrollments WHERE student_id = auth.uid())
);
CREATE POLICY "Parents read assignments" ON public.assignments FOR SELECT USING (
  section_id IN (
    SELECT e.section_id FROM enrollments e 
    JOIN parent_student_links psl ON e.student_id = psl.student_id 
    WHERE psl.parent_id = auth.uid()
  )
);

-- Assignment Submissions
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, submitted, graded
  grade NUMERIC,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access assignment_submissions" ON public.assignment_submissions FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Teachers manage assignment_submissions" ON public.assignment_submissions FOR ALL USING (
  public.get_my_role() = 'teacher' AND 
  assignment_id IN (SELECT id FROM assignments WHERE teacher_id = auth.uid())
);
CREATE POLICY "Students manage own submissions" ON public.assignment_submissions FOR ALL USING (
  student_id = auth.uid()
);

-- 3. Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own messages" ON public.messages FOR ALL USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- 4. Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  type TEXT NOT NULL, -- academic, holiday, meeting
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access events" ON public.events FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "All users read events" ON public.events FOR SELECT USING (true);

-- 5. Activity Logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own activity" ON public.activity_logs FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Users insert own activity" ON public.activity_logs FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
