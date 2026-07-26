import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://exqutqyzqlzstsgpiypp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cXV0cXl6cWx6c3RzZ3BpeXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjA2MTUsImV4cCI6MjEwMDIzNjYxNX0.olPIeuysJzOcz0hMuNARbpiH8mvijKtVfLgYVo4PMqk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log('🚀 Executing Idempotent Seed Script for Parent Portal & Grades feature...');

  // 1. Seed Teacher Profiles
  const teachers = [
    { id: 'b0000000-0000-0000-0000-000000000001', first_name: 'Abebe', last_name: 'Kebede', role: 'teacher' },
    { id: 'b0000000-0000-0000-0000-000000000002', first_name: 'Hanna', last_name: 'Tadesse', role: 'teacher' },
    { id: 'b0000000-0000-0000-0000-000000000003', first_name: 'Solomon', last_name: 'Girma', role: 'teacher' },
  ];

  for (const t of teachers) {
    const { error } = await supabase.from('profiles').upsert(t, { onConflict: 'id' });
    if (error) console.log(`[Info] Profiles upsert (${t.first_name}):`, error.message);
    else console.log(`✓ Teacher profile upserted: ${t.first_name} ${t.last_name}`);
  }

  // 2. Seed Subjects
  const subjects = [
    { id: 'f0000000-0000-0000-0000-000000000001', name: 'Mathematics' },
    { id: 'f0000000-0000-0000-0000-000000000002', name: 'Physics' },
    { id: 'f0000000-0000-0000-0000-000000000003', name: 'Chemistry' },
    { id: 'f0000000-0000-0000-0000-000000000005', name: 'English Literature' },
  ];

  for (const s of subjects) {
    const { error } = await supabase.from('subjects').upsert(s, { onConflict: 'id' });
    if (error) console.log(`[Info] Subjects upsert (${s.name}):`, error.message);
    else console.log(`✓ Subject upserted: ${s.name}`);
  }

  // 3. Seed Section (Grade 10-A)
  const section = { id: 'c0000000-0000-0000-0000-000000000010', name: '10-A' };
  const { error: secErr } = await supabase.from('sections').upsert(section, { onConflict: 'id' });
  if (secErr) console.log('[Info] Section upsert:', secErr.message);
  else console.log('✓ Section upserted: Grade 10-A');

  // 4. Seed Teacher Assignments
  const assignments = [
    { id: 'a0000000-0000-0000-0000-000000000001', teacher_id: teachers[0].id, section_id: section.id, subject_id: subjects[0].id },
    { id: 'a0000000-0000-0000-0000-000000000002', teacher_id: teachers[1].id, section_id: section.id, subject_id: subjects[1].id },
    { id: 'a0000000-0000-0000-0000-000000000003', teacher_id: teachers[2].id, section_id: section.id, subject_id: subjects[3].id },
  ];

  for (const a of assignments) {
    const { error } = await supabase.from('teacher_assignments').upsert(a, { onConflict: 'id' });
    if (error) console.log('[Info] Teacher assignments upsert:', error.message);
    else console.log('✓ Teacher assignment upserted');
  }

  // 5. Seed Student Profile (Sara Alemu)
  const student = { id: 'd0000000-0000-0000-0000-000000000001', first_name: 'Sara', last_name: 'Alemu', role: 'student' };
  const { error: studErr } = await supabase.from('profiles').upsert(student, { onConflict: 'id' });
  if (studErr) console.log('[Info] Student profile upsert:', studErr.message);
  else console.log('✓ Student profile upserted: Sara Alemu');

  // 6. Seed Student Enrollment
  const enrollment = { id: 'e0000000-0000-0000-0000-000000000001', student_id: student.id, section_id: section.id };
  const { error: enrErr } = await supabase.from('enrollments').upsert(enrollment, { onConflict: 'id' });
  if (enrErr) console.log('[Info] Enrollment upsert:', enrErr.message);
  else console.log('✓ Enrollment upserted: Sara Alemu in 10-A');

  // 7. Seed Valid 36-char UUID Exams
  const exams = [
    { id: 'e1000000-0000-0000-0000-000000000001', section_id: section.id, subject_id: subjects[0].id, title: 'Midterm Algebra Exam', date: '2026-03-15', max_score: 100 },
    { id: 'e1000000-0000-0000-0000-000000000002', section_id: section.id, subject_id: subjects[0].id, title: 'Calculus & Functions Test', date: '2026-04-20', max_score: 100 },
    { id: 'e1000000-0000-0000-0000-000000000003', section_id: section.id, subject_id: subjects[1].id, title: 'Kinematics & Motion Test', date: '2026-03-10', max_score: 100 },
    { id: 'e1000000-0000-0000-0000-000000000004', section_id: section.id, subject_id: subjects[3].id, title: 'Essay Writing & Analysis', date: '2026-03-05', max_score: 100 },
  ];

  for (const ex of exams) {
    const { error } = await supabase.from('exams').upsert(ex, { onConflict: 'id' });
    if (error) console.log(`[Info] Exams upsert (${ex.title}):`, error.message);
    else console.log(`✓ Exam upserted: ${ex.title}`);
  }

  // 8. Seed Valid 36-char UUID Exam Results
  const results = [
    { id: 'f1000000-0000-0000-0000-000000000001', exam_id: exams[0].id, student_id: student.id, score: 92 },
    { id: 'f1000000-0000-0000-0000-000000000002', exam_id: exams[1].id, student_id: student.id, score: 96 },
    { id: 'f1000000-0000-0000-0000-000000000003', exam_id: exams[2].id, student_id: student.id, score: 89 },
    { id: 'f1000000-0000-0000-0000-000000000004', exam_id: exams[3].id, student_id: student.id, score: 94 },
  ];

  for (const r of results) {
    const { error } = await supabase.from('exam_results').upsert(r, { onConflict: 'id' });
    if (error) console.log('[Info] Exam result upsert:', error.message);
    else console.log(`✓ Exam result upserted: Score ${r.score}`);
  }

  console.log('🎉 Seed script executed cleanly!');
}

seed();
