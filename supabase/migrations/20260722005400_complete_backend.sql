
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- 1. Create Missing Tables

CREATE TYPE payment_type AS ENUM ('tuition', 'registration', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_type payment_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  receipt_number TEXT
);

CREATE TYPE notification_type AS ENUM ('general', 'attendance', 'grade', 'payment');

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  type notification_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE promotion_status AS ENUM ('promoted', 'retained', 'withdrawn');

CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_grade_id UUID REFERENCES public.grades(id),
  to_grade_id UUID REFERENCES public.grades(id),
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  promoted_at TIMESTAMPTZ DEFAULT NOW(),
  promoted_by UUID REFERENCES public.profiles(id),
  status promotion_status NOT NULL
);

-- NOTE: parent_student_links was replaced by parent_children (created in
-- 20260723120000_parent_children.sql) which has an identical schema plus a
-- `relationship` column. All RLS policies below reference parent_children.
-- A stub table is kept here only so that the ALTER TABLE ... ENABLE ROW LEVEL
-- SECURITY line below does not fail; it will be dropped by the later migration.
CREATE TABLE IF NOT EXISTS public.parent_children (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- 2. Enable RLS
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- profiles
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Teachers read students in their sections" ON public.profiles FOR SELECT USING (
  public.get_my_role() = 'teacher' AND 
  id IN (SELECT student_id FROM enrollments e JOIN teacher_assignments ta ON e.section_id = ta.section_id WHERE ta.teacher_id = auth.uid())
);
CREATE POLICY "Parents read their children" ON public.profiles FOR SELECT USING (
  public.get_my_role() = 'parent' AND
  id IN (SELECT student_id FROM parent_children WHERE parent_id = auth.uid())
);

-- academic_years
CREATE POLICY "Admin full access academic_years" ON public.academic_years FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "All users read academic_years" ON public.academic_years FOR SELECT USING (true);

-- grades
CREATE POLICY "Admin full access grades" ON public.grades FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "All users read grades" ON public.grades FOR SELECT USING (true);

-- sections
CREATE POLICY "Admin full access sections" ON public.sections FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "All users read sections" ON public.sections FOR SELECT USING (true);

-- subjects
CREATE POLICY "Admin full access subjects" ON public.subjects FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "All users read subjects" ON public.subjects FOR SELECT USING (true);

-- enrollments
CREATE POLICY "Admin full access enrollments" ON public.enrollments FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Teachers read enrollments" ON public.enrollments FOR SELECT USING (
  public.get_my_role() = 'teacher' AND 
  section_id IN (SELECT section_id FROM teacher_assignments WHERE teacher_id = auth.uid())
);
CREATE POLICY "Students read own enrollments" ON public.enrollments FOR SELECT USING (
  student_id = auth.uid()
);
CREATE POLICY "Parents read children enrollments" ON public.enrollments FOR SELECT USING (
  student_id IN (SELECT student_id FROM parent_children WHERE parent_id = auth.uid())
);

-- teacher_assignments
CREATE POLICY "Admin full access teacher_assignments" ON public.teacher_assignments FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "All users read teacher_assignments" ON public.teacher_assignments FOR SELECT USING (true);

-- attendance
CREATE POLICY "Admin full access attendance" ON public.attendance FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Teachers manage attendance for their sections" ON public.attendance FOR ALL USING (
  public.get_my_role() = 'teacher' AND 
  section_id IN (SELECT section_id FROM teacher_assignments WHERE teacher_id = auth.uid())
);
CREATE POLICY "Students read own attendance" ON public.attendance FOR SELECT USING (
  student_id = auth.uid()
);
CREATE POLICY "Parents read children attendance" ON public.attendance FOR SELECT USING (
  student_id IN (SELECT student_id FROM parent_children WHERE parent_id = auth.uid())
);

-- exams
CREATE POLICY "Admin full access exams" ON public.exams FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Teachers manage exams for their sections" ON public.exams FOR ALL USING (
  public.get_my_role() = 'teacher' AND 
  section_id IN (SELECT section_id FROM teacher_assignments WHERE teacher_id = auth.uid())
);
CREATE POLICY "Students read own exams" ON public.exams FOR SELECT USING (
  section_id IN (SELECT section_id FROM enrollments WHERE student_id = auth.uid())
);
CREATE POLICY "Parents read children exams" ON public.exams FOR SELECT USING (
  section_id IN (
    SELECT e.section_id FROM enrollments e
    JOIN parent_children pc ON e.student_id = pc.student_id
    WHERE pc.parent_id = auth.uid()
  )
);

-- exam_results
CREATE POLICY "Admin full access exam_results" ON public.exam_results FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Teachers manage exam_results for their sections" ON public.exam_results FOR ALL USING (
  public.get_my_role() = 'teacher' AND 
  exam_id IN (
    SELECT ex.id FROM exams ex 
    JOIN teacher_assignments ta ON ex.section_id = ta.section_id AND ex.subject_id = ta.subject_id 
    WHERE ta.teacher_id = auth.uid()
  )
);
CREATE POLICY "Students read own exam_results" ON public.exam_results FOR SELECT USING (
  student_id = auth.uid()
);
CREATE POLICY "Parents read children exam_results" ON public.exam_results FOR SELECT USING (
  student_id IN (SELECT student_id FROM parent_children WHERE parent_id = auth.uid())
);

-- payments
CREATE POLICY "Admin full access payments" ON public.payments FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Students read own payments" ON public.payments FOR SELECT USING (
  student_id = auth.uid()
);
CREATE POLICY "Parents read children payments" ON public.payments FOR SELECT USING (
  student_id IN (SELECT student_id FROM parent_children WHERE parent_id = auth.uid())
);

-- notifications
CREATE POLICY "Admin full access notifications" ON public.notifications FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Users access own notifications" ON public.notifications FOR ALL USING (
  recipient_id = auth.uid()
);

-- promotions
CREATE POLICY "Admin full access promotions" ON public.promotions FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Students read own promotions" ON public.promotions FOR SELECT USING (
  student_id = auth.uid()
);
CREATE POLICY "Parents read children promotions" ON public.promotions FOR SELECT USING (
  student_id IN (SELECT student_id FROM parent_children WHERE parent_id = auth.uid())
);

-- parent_children
CREATE POLICY "Admin full access parent_children" ON public.parent_children FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "Parents read own links" ON public.parent_children FOR SELECT USING (
  parent_id = auth.uid()
);

-- 4. Helper Function
CREATE OR REPLACE FUNCTION public.get_current_academic_year()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1;
$$;

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Indexes
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_enrollments_section ON public.enrollments(section_id);
CREATE INDEX idx_exam_results_exam ON public.exam_results(exam_id);


