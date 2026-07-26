import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://exqutqyzqlzstsgpiypp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cXV0cXl6cWx6c3RzZ3BpeXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjA2MTUsImV4cCI6MjEwMDIzNjYxNX0.olPIeuysJzOcz0hMuNARbpiH8mvijKtVfLgYVo4PMqk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedEverything() {
  console.log('🚀 Populating full school database with rich testing data...');

  try {
    // 1. Profiles (Admin, Teachers, Students, Parents)
    const profiles = [
      { id: 'a0000000-0000-0000-0000-000000000001', first_name: 'Admin', last_name: 'Director', role: 'admin' },
      { id: 'b0000000-0000-0000-0000-000000000001', first_name: 'Abebe', last_name: 'Kebede', role: 'teacher' },
      { id: 'b0000000-0000-0000-0000-000000000002', first_name: 'Hanna', last_name: 'Tadesse', role: 'teacher' },
      { id: 'b0000000-0000-0000-0000-000000000003', first_name: 'Solomon', last_name: 'Girma', role: 'teacher' },
      { id: 'd0000000-0000-0000-0000-000000000001', first_name: 'Sara', last_name: 'Alemu', role: 'student' },
      { id: 'd0000000-0000-0000-0000-000000000002', first_name: 'Dawit', last_name: 'Alemu', role: 'student' },
      { id: 'c0000000-0000-0000-0000-000000000001', first_name: 'Alemu', last_name: 'Tesfaye', role: 'parent' },
    ];

    for (const p of profiles) {
      const { error } = await supabase.from('profiles').upsert(p, { onConflict: 'id' });
      if (error) console.log(`[Info] Profiles upsert (${p.first_name}):`, error.message);
      else console.log(`✓ Profile seeded: ${p.first_name} ${p.last_name} (${p.role})`);
    }

    // 2. Subjects
    const subjects = [
      { id: 'f0000000-0000-0000-0000-000000000001', name: 'Mathematics' },
      { id: 'f0000000-0000-0000-0000-000000000002', name: 'Physics' },
      { id: 'f0000000-0000-0000-0000-000000000003', name: 'Chemistry' },
      { id: 'f0000000-0000-0000-0000-000000000005', name: 'English Literature' },
    ];

    for (const s of subjects) {
      const { error } = await supabase.from('subjects').upsert(s, { onConflict: 'id' });
      if (error) console.log(`[Info] Subjects upsert (${s.name}):`, error.message);
      else console.log(`✓ Subject seeded: ${s.name}`);
    }

    // 3. Sections
    const sections = [
      { id: 'c0000000-0000-0000-0000-000000000010', name: '10-A' },
      { id: 'c0000000-0000-0000-0000-000000000009', name: '9-B' },
    ];

    for (const sec of sections) {
      const { error } = await supabase.from('sections').upsert(sec, { onConflict: 'id' });
      if (error) console.log(`[Info] Section upsert (${sec.name}):`, error.message);
      else console.log(`✓ Section seeded: Grade ${sec.name}`);
    }

    // 4. Teacher Assignments
    const assignments = [
      { id: 'a0000000-0000-0000-0000-000000000001', teacher_id: profiles[1].id, section_id: sections[0].id, subject_id: subjects[0].id },
      { id: 'a0000000-0000-0000-0000-000000000002', teacher_id: profiles[2].id, section_id: sections[0].id, subject_id: subjects[1].id },
      { id: 'a0000000-0000-0000-0000-000000000003', teacher_id: profiles[3].id, section_id: sections[0].id, subject_id: subjects[3].id },
      { id: 'a0000000-0000-0000-0000-000000000004', teacher_id: profiles[1].id, section_id: sections[1].id, subject_id: subjects[0].id },
    ];

    for (const a of assignments) {
      const { error } = await supabase.from('teacher_assignments').upsert(a, { onConflict: 'id' });
      if (error) console.log('[Info] Teacher assignment upsert:', error.message);
      else console.log('✓ Teacher assignment seeded');
    }

    // 5. Parent-Children Relationships
    const parentLinks = [
      { parent_id: profiles[6].id, student_id: profiles[4].id, relationship: 'father' },
      { parent_id: profiles[6].id, student_id: profiles[5].id, relationship: 'father' },
    ];

    for (const link of parentLinks) {
      const { error } = await supabase.from('parent_children').upsert(link, { onConflict: 'parent_id,student_id' });
      if (error) console.log('[Info] Parent link upsert:', error.message);
      else console.log('✓ Parent-child relationship seeded');
    }

    // 6. Enrollments
    const enrollments = [
      { id: 'e0000000-0000-0000-0000-000000000001', student_id: profiles[4].id, section_id: sections[0].id },
      { id: 'e0000000-0000-0000-0000-000000000002', student_id: profiles[5].id, section_id: sections[1].id },
    ];

    for (const enr of enrollments) {
      const { error } = await supabase.from('enrollments').upsert(enr, { onConflict: 'id' });
      if (error) console.log('[Info] Enrollment upsert:', error.message);
      else console.log('✓ Student enrollment seeded');
    }

    // 7. Exams & Results
    const exams = [
      { id: 'e1000000-0000-0000-0000-000000000001', section_id: sections[0].id, subject_id: subjects[0].id, title: 'Midterm Algebra Exam', date: '2026-03-15', max_score: 100 },
      { id: 'e1000000-0000-0000-0000-000000000002', section_id: sections[0].id, subject_id: subjects[0].id, title: 'Calculus & Functions Test', date: '2026-04-20', max_score: 100 },
      { id: 'e1000000-0000-0000-0000-000000000003', section_id: sections[0].id, subject_id: subjects[1].id, title: 'Kinematics & Motion Test', date: '2026-03-10', max_score: 100 },
      { id: 'e1000000-0000-0000-0000-000000000004', section_id: sections[0].id, subject_id: subjects[3].id, title: 'Essay Writing & Analysis', date: '2026-03-05', max_score: 100 },
    ];

    for (const ex of exams) {
      const { error } = await supabase.from('exams').upsert(ex, { onConflict: 'id' });
      if (error) console.log(`[Info] Exam upsert (${ex.title}):`, error.message);
      else console.log(`✓ Exam seeded: ${ex.title}`);
    }

    const results = [
      { id: 'f1000000-0000-0000-0000-000000000001', exam_id: exams[0].id, student_id: profiles[4].id, score: 92 },
      { id: 'f1000000-0000-0000-0000-000000000002', exam_id: exams[1].id, student_id: profiles[4].id, score: 96 },
      { id: 'f1000000-0000-0000-0000-000000000003', exam_id: exams[2].id, student_id: profiles[4].id, score: 89 },
      { id: 'f1000000-0000-0000-0000-000000000004', exam_id: exams[3].id, student_id: profiles[4].id, score: 94 },
    ];

    for (const r of results) {
      const { error } = await supabase.from('exam_results').upsert(r, { onConflict: 'id' });
      if (error) console.log('[Info] Exam result upsert:', error.message);
      else console.log(`✓ Exam result seeded: ${r.score}`);
    }

    // 8. Sample Messages
    const sampleMsgs = [
      {
        id: 'm1000000-0000-0000-0000-000000000001',
        sender_id: profiles[6].id,
        receiver_id: profiles[1].id,
        student_id: profiles[4].id,
        content: 'Hello Abebe, how is Sara performing in Mathematics calculus modules?',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'm1000000-0000-0000-0000-000000000002',
        sender_id: profiles[1].id,
        receiver_id: profiles[6].id,
        student_id: profiles[4].id,
        content: 'Hello Alemu! Sara is doing wonderfully in Calculus (96%). She is leading her study group.',
        is_read: true,
        created_at: new Date(Date.now() - 43200000).toISOString(),
      }
    ];

    for (const msg of sampleMsgs) {
      const { error } = await supabase.from('messages').upsert(msg, { onConflict: 'id' });
      if (error) console.log('[Info] Message upsert:', error.message);
      else console.log('✓ Initial test message seeded');
    }

    console.log('🎉 Full school population script finished cleanly!');

  } catch (err) {
    console.error('Seed execution error:', err);
  }
}

seedEverything();
