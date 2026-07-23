-- Extensive Seed Data for EthioSchool ERP Demo

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Create Auth Users (Admins, Teachers, Students, Parents)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
-- Admin
('aa000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
-- Teachers
('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'science@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
('b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arts@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
-- Students
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
-- Parents
('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'parent@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp),
('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'parent2@demo.com', extensions.crypt('password123', extensions.gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Profiles
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
VALUES
('70000000-0000-0000-0000-000000000000', '2016 E.C. (2023/24)', '2023-09-01', '2024-06-30', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Grades & Sections
INSERT INTO public.grades (id, name, level) VALUES
('60000000-0000-0000-0000-000000000009', 'Grade 9', 9),
('60000000-0000-0000-0000-000000000010', 'Grade 10', 10),
('60000000-0000-0000-0000-000000000011', 'Grade 11', 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sections (id, name, grade_id, academic_year_id) VALUES
('c0000000-0000-0000-0000-00000000000A', 'A', '60000000-0000-0000-0000-000000000009', '70000000-0000-0000-0000-000000000000'),
('c0000000-0000-0000-0000-00000000000B', 'B', '60000000-0000-0000-0000-000000000009', '70000000-0000-0000-0000-000000000000'),
('c0000000-0000-0000-0000-00000000000C', 'A', '60000000-0000-0000-0000-000000000010', '70000000-0000-0000-0000-000000000000')
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

-- 6. Enrollments (Distribute students across sections)
INSERT INTO public.enrollments (id, student_id, section_id) VALUES
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-00000000000A'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-00000000000A'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-00000000000B'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-00000000000B'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-00000000000B'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-00000000000C'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-00000000000C'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-00000000000C')
ON CONFLICT (student_id, section_id) DO NOTHING;

-- 7. Parent Children Link
INSERT INTO public.parent_student_links (id, parent_id, student_id) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004')
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- 8. Teacher Assignments
INSERT INTO public.teacher_assignments (id, teacher_id, section_id, subject_id) VALUES
('8aa00000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000001'), -- Math 9A
('8aa00000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000B', 'f0000000-0000-0000-0000-000000000001'), -- Math 9B
('8aa00000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000002'), -- Physics 9A
('8aa00000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000003'), -- Chem 9A
('8aa00000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000005')  -- English 9A
ON CONFLICT (id) DO NOTHING;

-- 9. Exams
INSERT INTO public.exams (id, section_id, subject_id, title, date, max_score) VALUES
('12000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000001', 'Math Mid-term 1', CURRENT_DATE - INTERVAL '40 days', 100),
('12000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000001', 'Math Mid-term 2', CURRENT_DATE - INTERVAL '20 days', 100),
('12000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000002', 'Physics Quiz 1',  CURRENT_DATE - INTERVAL '30 days', 50),
('12000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000003', 'Chem Practical',  CURRENT_DATE - INTERVAL '15 days', 100),
('12000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000005', 'English Essay',   CURRENT_DATE - INTERVAL '5 days', 100),
('12000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000001', 'Math Final (Upcoming)', CURRENT_DATE + INTERVAL '10 days', 100),
('12000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000002', 'Physics Final',   CURRENT_DATE + INTERVAL '12 days', 100)
ON CONFLICT (id) DO NOTHING;

-- 10. Exam Results
INSERT INTO public.exam_results (id, exam_id, student_id, score, graded_by) VALUES
-- Student 1 (Good grades)
(gen_random_uuid(), '12000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 82, 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), '12000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 88, 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), '12000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 45, 'b0000000-0000-0000-0000-000000000002'),
(gen_random_uuid(), '12000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 91, 'b0000000-0000-0000-0000-000000000002'),
(gen_random_uuid(), '12000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 79, 'b0000000-0000-0000-0000-000000000003'),
-- Student 2 (Struggling a bit)
(gen_random_uuid(), '12000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 65, 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), '12000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 70, 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), '12000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 25, 'b0000000-0000-0000-0000-000000000002'),
(gen_random_uuid(), '12000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 55, 'b0000000-0000-0000-0000-000000000002'),
(gen_random_uuid(), '12000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 68, 'b0000000-0000-0000-0000-000000000003'),
-- Student 3 
(gen_random_uuid(), '12000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 95, 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (exam_id, student_id) DO NOTHING;

-- 11. Attendance
INSERT INTO public.attendance (id, student_id, section_id, date, status, recorded_by) VALUES
-- s1 attendance
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '1 day', 'present', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '2 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '3 days', 'late', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '4 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '5 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
-- s2 attendance (Risk meter trigger < 75%)
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '1 day', 'absent', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '2 days', 'absent', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '3 days', 'present', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '4 days', 'late', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '5 days', 'absent', 'b0000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', CURRENT_DATE - INTERVAL '6 days', 'excused', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (student_id, section_id, date) DO NOTHING;

-- 12. Notifications
INSERT INTO public.notifications (id, recipient_id, title, message, type, is_read, created_at) VALUES
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'Welcome to EthioSchool', 'We are glad to have you back for the new academic year.', 'general', false, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'Math Exam Graded', 'Your Math Mid-term 2 has been graded. Excellent work.', 'grade', false, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 'Attendance Warning', 'You have missed 3 classes this week. Please contact the office.', 'attendance', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Staff Meeting', 'All homeroom teachers are required to attend the assembly.', 'general', false, CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- 13. Payments
INSERT INTO public.payments (id, student_id, amount, payment_date, payment_type, status, academic_year_id) VALUES
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 5000, CURRENT_DATE - INTERVAL '30 days', 'tuition', 'completed', '70000000-0000-0000-0000-000000000000'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000002', 5000, CURRENT_DATE - INTERVAL '25 days', 'tuition', 'completed', '70000000-0000-0000-0000-000000000000'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000003', 1500, CURRENT_DATE - INTERVAL '10 days', 'registration', 'completed', '70000000-0000-0000-0000-000000000000'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000004', 5000, CURRENT_DATE - INTERVAL '5 days', 'tuition', 'pending', '70000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- 14. Teacher Dashboard Seed Data
-- Class Schedules for Teacher 1 (Math)
INSERT INTO public.class_schedules (id, section_id, subject_id, teacher_id, day_of_week, start_time, end_time, room) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', EXTRACT(DOW FROM CURRENT_DATE), '09:00:00', '10:30:00', 'Room 302'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-00000000000B', 'f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', EXTRACT(DOW FROM CURRENT_DATE), '11:00:00', '12:30:00', 'Room 305')
ON CONFLICT DO NOTHING;

-- Assignments
INSERT INTO public.assignments (id, section_id, subject_id, teacher_id, title, description, due_date, status) VALUES
('a1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Algebra Equations', 'Solve equations on pg 42', CURRENT_TIMESTAMP + INTERVAL '1 day', 'published'),
('a1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-00000000000A', 'f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Geometry Practice', 'Draw the shapes', CURRENT_TIMESTAMP - INTERVAL '1 day', 'grading')
ON CONFLICT DO NOTHING;

-- Messages
INSERT INTO public.messages (id, sender_id, receiver_id, content, is_read, created_at) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Regarding Dawits absence yesterday, he had a mild fever.', false, NOW() - INTERVAL '15 minutes')
ON CONFLICT DO NOTHING;

-- Events
INSERT INTO public.events (id, title, description, event_date, start_time, end_time, location, type) VALUES
(gen_random_uuid(), 'Parent-Teacher Conference', 'Discuss student progress', CURRENT_DATE + INTERVAL '2 days', '16:00:00', '18:00:00', 'Main Hall', 'meeting'),
(gen_random_uuid(), 'Staff Meeting', 'Monthly sync', CURRENT_DATE + INTERVAL '5 days', '15:15:00', '16:15:00', 'Staff Room', 'meeting')
ON CONFLICT DO NOTHING;

-- Activity Logs
INSERT INTO public.activity_logs (id, user_id, action, description, created_at) VALUES
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'graded_assignment', 'Graded Algebra Equations', NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'attendance_submitted', 'Submitted Morning Attendance for 9A', NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;
