-- ─────────────────────────────────────────────────────────────────────────────
-- Student Management Module – Supabase Migration
-- File: supabase/migrations/20250727_student_module_tables.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in your Supabase SQL Editor (or via supabase db push).
-- Assumes an existing `profiles` table from your auth setup.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. ACADEMIC YEARS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_years (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. GRADES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. SECTIONS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id        UUID REFERENCES grades(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,          -- 'A', 'B', etc.
  capacity        INT NOT NULL DEFAULT 40,
  class_teacher   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. EXTEND PROFILES TABLE (student-specific columns) ───────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id           TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admission_number     TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admission_date       DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth        DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender               TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religion             TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blood_group          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_certificate_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS previous_school      TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scholarship          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS house                TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enrollment_status    TEXT NOT NULL DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roll_number          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url            TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address              TEXT;
-- Guardian summary (denormalized for fast list queries)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_name        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_phone       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_email       TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_relationship TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_address     TEXT;
-- Finance summary
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fee_status           TEXT DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS outstanding_balance  NUMERIC(12, 2) DEFAULT 0;
-- Transport
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_transport        BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bus_id               UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pickup_point         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dropoff_point        TEXT;
-- Hostel
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_hostel           BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hostel_id            UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS room_number          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bed_number           TEXT;
-- Computed/cached fields for fast list rendering
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS attendance_percentage NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS average_grade        NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gpa                  NUMERIC(4, 2) DEFAULT 0;
-- Academic year & grade cache
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_year        TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade_id             UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade_name           TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS section_id           UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS section_name         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS class_teacher        TEXT;

-- ── 5. ENROLLMENTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  section_id       UUID REFERENCES sections(id),
  academic_year_id UUID REFERENCES academic_years(id),
  enrolled_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, academic_year_id)
);

-- ── 6. GUARDIANS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_guardians (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  relationship         TEXT NOT NULL,   -- 'Father', 'Mother', 'Guardian'
  phone                TEXT,
  email                TEXT,
  occupation           TEXT,
  address              TEXT,
  is_emergency_contact BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. MEDICAL RECORDS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_medical (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  blood_group       TEXT,
  conditions        TEXT[],
  allergies         TEXT[],
  medications       TEXT[],
  doctor_name       TEXT,
  doctor_phone      TEXT,
  hospital          TEXT,
  emergency_notes   TEXT,
  last_checkup      DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. VACCINATION RECORDS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vaccination_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_id  UUID REFERENCES student_medical(id) ON DELETE CASCADE,
  vaccine     TEXT NOT NULL,
  date        DATE,
  status      TEXT DEFAULT 'complete',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. DOCUMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,  -- 'birth_certificate', 'photo', 'report_card', etc.
  file_url      TEXT NOT NULL,
  size          TEXT,
  verified      BOOLEAN DEFAULT FALSE,
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. TRANSPORT ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buses (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number    TEXT UNIQUE NOT NULL,
  route     TEXT,
  driver    TEXT,
  capacity  INT DEFAULT 40,
  active    BOOLEAN DEFAULT TRUE
);

-- ── 11. HOSTELS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hostels (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building  TEXT NOT NULL,
  warden    TEXT,
  capacity  INT DEFAULT 80,
  active    BOOLEAN DEFAULT TRUE
);

-- ── 12. SUBJECTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  grade_id    UUID REFERENCES grades(id),
  code        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 13. EXAMS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  date             DATE,
  max_score        NUMERIC(5,2) DEFAULT 100,
  subject_id       UUID REFERENCES subjects(id),
  academic_year_id UUID REFERENCES academic_years(id),
  grade_id         UUID REFERENCES grades(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 14. EXAM RESULTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exam_id     UUID REFERENCES exams(id) ON DELETE CASCADE,
  score       NUMERIC(5, 2),
  rank        INT,
  class_avg   NUMERIC(5, 2),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

-- ── 15. ATTENDANCE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes       TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- ── 16. BEHAVIOR RECORDS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS behavior_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('reward', 'warning', 'discipline', 'achievement')),
  title        TEXT NOT NULL,
  description  TEXT,
  date         DATE,
  given_by     TEXT,
  category     TEXT,
  resolved     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 17. PAYMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount        NUMERIC(12, 2) NOT NULL,
  description   TEXT,
  date          DATE,
  method        TEXT,     -- 'cash', 'bank_transfer', 'mobile'
  reference     TEXT,
  invoice_id    UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 18. INVOICES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  amount        NUMERIC(12, 2) NOT NULL,
  due_date      DATE,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  paid_date     DATE,
  academic_year_id UUID REFERENCES academic_years(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 19. LIBRARY LOANS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  author      TEXT,
  isbn        TEXT,
  copies      INT DEFAULT 1,
  available   INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS library_loans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id       UUID REFERENCES books(id),
  borrowed_date DATE,
  due_date      DATE,
  returned_date DATE,
  status        TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue')),
  fine          NUMERIC(8, 2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 20. ACTIVITY LOG (Timeline) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,  -- 'admission', 'attendance', 'grade', 'behavior', 'payment', 'message'
  title       TEXT NOT NULL,
  description TEXT,
  date        TEXT,           -- formatted string for display
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES for performance ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_role              ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_enrollment_status ON profiles(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_grade_id          ON profiles(grade_id);
CREATE INDEX IF NOT EXISTS idx_profiles_section_id        ON profiles(section_id);
CREATE INDEX IF NOT EXISTS idx_profiles_fee_status        ON profiles(fee_status);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date    ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_exam_results_student       ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student           ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_library_loans_student      ON library_loans(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_student       ON activity_log(student_id, created_at DESC);

-- ── ROW-LEVEL SECURITY ────────────────────────────────────────────────────────
ALTER TABLE student_guardians    ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_medical      ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_records     ENABLE ROW LEVEL SECURITY;

-- Admins (role = 'admin') can read/write everything
CREATE POLICY admin_all_guardians ON student_guardians USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY admin_all_medical ON student_medical USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY admin_all_documents ON student_documents USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Students can read their own records
CREATE POLICY student_own_guardians ON student_guardians FOR SELECT USING (
  student_id = auth.uid()
);
CREATE POLICY student_own_medical ON student_medical FOR SELECT USING (
  student_id = auth.uid()
);
CREATE POLICY student_own_documents ON student_documents FOR SELECT USING (
  student_id = auth.uid()
);
