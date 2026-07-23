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
