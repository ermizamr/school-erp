-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'student',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic Years
CREATE TABLE public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g., "2018 E.C." or "2025-2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false
);

-- Grades/Levels
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g., "Grade 9"
  level INTEGER NOT NULL -- e.g., 9
);

-- Sections (e.g., Grade 9A)
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "A", "B"
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  UNIQUE(grade_id, name, academic_year_id)
);

-- Subjects
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE -- e.g., "Mathematics", "Amharic"
);

-- Enrollments (Students to Sections)
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, section_id)
);

-- Teacher Assignments (Teachers to Sections & Subjects)
CREATE TABLE public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, section_id, subject_id)
);

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL,
  recorded_by UUID REFERENCES public.profiles(id), -- Teacher ID
  UNIQUE(student_id, section_id, date)
);

-- Exams
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g., "Mid-term 1"
  date DATE NOT NULL,
  max_score NUMERIC DEFAULT 100 
);

-- Exam Results
CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100), -- 0-100 Grading Scale as requested
  graded_by UUID REFERENCES public.profiles(id), -- Teacher ID
  UNIQUE(exam_id, student_id)
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
