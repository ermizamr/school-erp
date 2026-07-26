-- Idempotent & Bulletproof Seed Script for EthioSchool ERP
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$ 
BEGIN

  -- 1. Auth Users
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
  ('aa000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'science@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arts@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student2@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student3@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student4@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student5@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student6@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student7@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student8@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student9@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('d0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student10@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'parent@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'parent2@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Profiles
  INSERT INTO public.profiles (id, role, first_name, last_name, phone_number)
  VALUES
  ('aa000000-0000-0000-0000-000000000000', 'admin', 'System', 'Admin', '+251911000001'),
  ('b0000000-0000-0000-0000-000000000001', 'teacher', 'Abebe', 'Kebede', '+251911000002'),
  ('b0000000-0000-0000-0000-000000000002', 'teacher', 'Hanna', 'Tadesse', '+251911000003'),
  ('b0000000-0000-0000-0000-000000000003', 'teacher', 'Solomon', 'Girma', '+251911000004'),
  ('d0000000-0000-0000-0000-000000000001', 'student', 'Dawit', 'Alemu', '+251911000011'),
  ('d0000000-0000-0000-0000-000000000002', 'student', 'Sara', 'Alemu', '+251911000012'),
  ('d0000000-0000-0000-0000-000000000003', 'student', 'Yonas', 'Bekele', '+251911000013'),
  ('d0000000-0000-0000-0000-000000000004', 'student', 'Betelhem', 'Assefa', '+251911000014'),
  ('d0000000-0000-0000-0000-000000000005', 'student', 'Robel', 'Tsegaye', '+251911000015'),
  ('d0000000-0000-0000-0000-000000000006', 'student', 'Mahlet', 'Desta', '+251911000016'),
  ('d0000000-0000-0000-0000-000000000007', 'student', 'Nahom', 'Getachew', '+251911000017'),
  ('d0000000-0000-0000-0000-000000000008', 'student', 'Kalkidan', 'Haile', '+251911000018'),
  ('d0000000-0000-0000-0000-000000000009', 'student', 'Elias', 'Tesfaye', '+251911000019'),
  ('d0000000-0000-0000-0000-000000000010', 'student', 'Selam', 'Mamo', '+251911000020'),
  ('c0000000-0000-0000-0000-000000000001', 'parent', 'Alemu', 'Tefera', '+251911000031'),
  ('c0000000-0000-0000-0000-000000000002', 'parent', 'Assefa', 'Worku', '+251911000032')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

  -- 3. Academic Years
  INSERT INTO public.academic_years (id, name, start_date, end_date, is_active)
  VALUES ('70000000-0000-0000-0000-000000000000', '2016 E.C. (2023/24)', '2023-09-01', '2024-06-30', true)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Grades & Sections
  INSERT INTO public.grades (id, name, level) VALUES
  ('60000000-0000-0000-0000-000000000009', 'Grade 9', 9),
  ('60000000-0000-0000-0000-000000000010', 'Grade 10', 10),
  ('60000000-0000-0000-0000-000000000011', 'Grade 11', 11)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.sections (id, name, grade_id, academic_year_id) VALUES
  ('c0000000-0000-0000-0000-00000000000a', 'A', '60000000-0000-0000-0000-000000000009', '70000000-0000-0000-0000-000000000000'),
  ('c0000000-0000-0000-0000-00000000000b', 'B', '60000000-0000-0000-0000-000000000009', '70000000-0000-0000-0000-000000000000'),
  ('c0000000-0000-0000-0000-00000000000c', 'A', '60000000-0000-0000-0000-000000000010', '70000000-0000-0000-0000-000000000000')
  ON CONFLICT (id) DO NOTHING;

  -- 5. Subjects
  INSERT INTO public.subjects (id, name) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Mathematics'),
  ('f0000000-0000-0000-0000-000000000002', 'Physics'),
  ('f0000000-0000-0000-0000-000000000003', 'Chemistry'),
  ('f0000000-0000-0000-0000-000000000004', 'Biology'),
  ('f0000000-0000-0000-0000-000000000005', 'English'),
  ('f0000000-0000-0000-0000-000000000006', 'Amharic')
  ON CONFLICT (id) DO NOTHING;

  -- 6. Enrollments (WHERE NOT EXISTS prevents duplicate student_id/section_id errors)
  INSERT INTO public.enrollments (id, student_id, section_id)
  SELECT gen_random_uuid(), s.sid, s.secid
  FROM (VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000a'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a'),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-00000000000a'),
    ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-00000000000a'),
    ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-00000000000b'),
    ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-00000000000b'),
    ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-00000000000b'),
    ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-00000000000c'),
    ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-00000000000c'),
    ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-00000000000c')
  ) AS s(sid, secid)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.enrollments e WHERE e.student_id = s.sid AND e.section_id = s.secid
  );

  -- 7a. Parent Student Links
  INSERT INTO public.parent_student_links (id, parent_id, student_id)
  SELECT gen_random_uuid(), p.pid, p.sid
  FROM (VALUES
    ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
    ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004')
  ) AS p(pid, sid)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.parent_student_links l WHERE l.parent_id = p.pid AND l.student_id = p.sid
  );

  -- 7b. Parent Children Link (standardized)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parent_children') THEN
    INSERT INTO public.parent_children (id, parent_id, student_id, relationship)
    SELECT gen_random_uuid(), p.pid, p.sid, p.rel
    FROM (VALUES
      ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'father'),
      ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'father'),
      ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'father')
    ) AS p(pid, sid, rel)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.parent_children pc WHERE pc.parent_id = p.pid AND pc.student_id = p.sid
    );
  END IF;

  -- 8. Teacher Assignments
  INSERT INTO public.teacher_assignments (id, teacher_id, section_id, subject_id) VALUES
  ('8aa00000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000001'),
  ('8aa00000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000b', 'f0000000-0000-0000-0000-000000000001'),
  ('8aa00000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000002'),
  ('8aa00000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000003'),
  ('8aa00000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000005')
  ON CONFLICT (id) DO NOTHING;

  -- 9. Exams
  INSERT INTO public.exams (id, section_id, subject_id, title, date, max_score) VALUES
  ('12000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000001', 'Math Mid-term 1', CURRENT_DATE - INTERVAL '40 days', 100),
  ('12000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000001', 'Math Mid-term 2', CURRENT_DATE - INTERVAL '20 days', 100),
  ('12000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000002', 'Physics Quiz 1',  CURRENT_DATE - INTERVAL '30 days', 50),
  ('12000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000003', 'Chem Practical',  CURRENT_DATE - INTERVAL '15 days', 100),
  ('12000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000005', 'English Essay',   CURRENT_DATE - INTERVAL '5 days', 100),
  ('12000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000001', 'Math Final (Upcoming)', CURRENT_DATE + INTERVAL '10 days', 100),
  ('12000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-00000000000a', 'f0000000-0000-0000-0000-000000000002', 'Physics Final',   CURRENT_DATE + INTERVAL '12 days', 100)
  ON CONFLICT (id) DO NOTHING;

  -- 10. Exam Results (WHERE NOT EXISTS prevents duplicate exam_id/student_id errors)
  INSERT INTO public.exam_results (id, exam_id, student_id, score, graded_by)
  SELECT gen_random_uuid(), r.eid, r.sid, r.score, r.gby
  FROM (VALUES
    ('12000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 82, 'b0000000-0000-0000-0000-000000000001'),
    ('12000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 88, 'b0000000-0000-0000-0000-000000000001'),
    ('12000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 45, 'b0000000-0000-0000-0000-000000000002'),
    ('12000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 91, 'b0000000-0000-0000-0000-000000000002'),
    ('12000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 79, 'b0000000-0000-0000-0000-000000000003'),
    ('12000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 75, 'b0000000-0000-0000-0000-000000000001'),
    ('12000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 82, 'b0000000-0000-0000-0000-000000000001'),
    ('12000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 38, 'b0000000-0000-0000-0000-000000000002'),
    ('12000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 88, 'b0000000-0000-0000-0000-000000000002'),
    ('12000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 90, 'b0000000-0000-0000-0000-000000000003'),
    ('12000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 95, 'b0000000-0000-0000-0000-000000000001')
  ) AS r(eid, sid, score, gby)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.exam_results er WHERE er.exam_id = r.eid AND er.student_id = r.sid
  );

  -- 11. Attendance (WHERE NOT EXISTS prevents duplicate student_id/section_id/date errors)
  INSERT INTO public.attendance (id, student_id, section_id, date, status, recorded_by)
  SELECT gen_random_uuid(), a.sid, a.secid, a.adate, a.astatus, a.recby
  FROM (VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '1 day', 'present', 'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '2 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '3 days', 'late',    'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '4 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '5 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '1 day', 'present', 'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '2 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '3 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '4 days', 'late',    'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '5 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000a', CURRENT_DATE - INTERVAL '6 days', 'present', 'b0000000-0000-0000-0000-000000000001')
  ) AS a(sid, secid, adate, astatus, recby)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.attendance att WHERE att.student_id = a.sid AND att.section_id = a.secid AND att.date = a.adate
  );

  -- 12. Notifications & Announcements
  INSERT INTO public.notifications (id, recipient_id, title, message, type, is_read, created_at) VALUES
  ('n0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Welcome to EthioSchool', 'We are glad to have you back for the new academic year.', 'general', false, CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('n0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Math Exam Graded', 'Your Math Mid-term 2 has been graded. Excellent work.', 'grade', false, CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('n0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'Attendance Update', 'Sara has maintained excellent attendance this term.', 'attendance', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('n0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Staff Meeting', 'All homeroom teachers are required to attend the assembly.', 'general', false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('n0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', '📢 Annual Science Fair & Cultural Exhibition', 'EthioSchool will host its annual STEM & Science Fair this Friday. Parents are cordially invited to attend project showcases starting at 9:00 AM.', 'announcement', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('n0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', '📌 Term 1 Mid-Semester Parent-Teacher Assembly', 'Mandatory general assembly for all parents on Saturday at 10:00 AM in the Main Auditorium to discuss academic milestones and curriculum updates.', 'event', false, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  ('n0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000001', '💡 Quarter 2 Tuition Fee Submission Notice', 'Quarter 2 tuition fee payments are due by the end of this month. Please upload your payment bank receipts via the Payments section.', 'finance', false, CURRENT_TIMESTAMP - INTERVAL '4 days')
  ON CONFLICT (id) DO NOTHING;

  -- 13. Payments
  INSERT INTO public.payments (id, student_id, amount, payment_date, payment_type, status, academic_year_id, receipt_number) VALUES
  ('p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 5000, CURRENT_DATE - INTERVAL '30 days', 'tuition',      'completed', '70000000-0000-0000-0000-000000000000', 'RCP-2024-001'),
  ('p0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 5000, CURRENT_DATE - INTERVAL '25 days', 'tuition',      'completed', '70000000-0000-0000-0000-000000000000', 'RCP-2024-002'),
  ('p0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 1500, CURRENT_DATE - INTERVAL '10 days', 'registration', 'completed', '70000000-0000-0000-0000-000000000000', 'RCP-2024-003'),
  ('p0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 5000, CURRENT_DATE - INTERVAL '5 days',  'tuition',      'pending',   '70000000-0000-0000-0000-000000000000', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- 14. Payment Submissions
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_submissions') THEN
    INSERT INTO public.payment_submissions (id, parent_id, student_id, amount, bank_name, transaction_reference, receipt_url, status, payment_type, created_at) VALUES
    ('ps000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 5000, 'Telebirr', 'TLB-99882310', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'approved', 'tuition', CURRENT_TIMESTAMP - INTERVAL '15 days'),
    ('ps000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 2500, 'Commercial Bank of Ethiopia (CBE)', 'CBE-44510092', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600', 'pending',  'tuition', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('ps000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 5000, 'Awash Bank', 'AWS-11200488', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', 'approved', 'tuition', CURRENT_TIMESTAMP - INTERVAL '10 days'),
    ('ps000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 5000, 'Dashen Bank', 'DSH-77102934', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600', 'pending',  'tuition', CURRENT_TIMESTAMP - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;
  END IF;

END $$;
