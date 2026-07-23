import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Mail, Phone, ExternalLink, Filter, ShieldAlert } from 'lucide-react';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const teacherId = user?.id || DEMO_TEACHER_ID;

      // 1. Get teacher's sections
      let { data: assignments } = await supabase.from('teacher_assignments')
        .select('section_id')
        .eq('teacher_id', teacherId);
        
      if ((!assignments || assignments.length === 0) && teacherId !== DEMO_TEACHER_ID) {
        const fallback = await supabase.from('teacher_assignments')
          .select('section_id')
          .eq('teacher_id', DEMO_TEACHER_ID);
        assignments = fallback.data || [];
      }
        
      const sectionIds = [...new Set((assignments || []).map(a => a.section_id))];

      if (sectionIds.length > 0) {
        // 2. Get enrollments in those sections
        const { data: enrolls, error } = await supabase.from('enrollments')
          .select('student_id, sections(name, grades(name)), profiles!enrollments_student_id_fkey(first_name, last_name, phone_number)')
          .in('section_id', sectionIds);

        if (error) throw error;
        
        // Remove duplicates if a student is in multiple sections taught by same teacher
        const uniqueStudents = {};
        (enrolls || []).forEach(e => {
          if (!uniqueStudents[e.student_id]) {
            uniqueStudents[e.student_id] = {
              id: e.student_id,
              profile: e.profiles,
              // We'll just take the first section info for demo purposes
              section: e.sections,
              // mock risk factor
              atRisk: Math.random() > 0.8,
              gpa: (Math.random() * (4.0 - 2.0) + 2.0).toFixed(1)
            };
          }
        });
        
        setStudents(Object.values(uniqueStudents));
      }
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter(s => 
    `${s.profile?.first_name} ${s.profile?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>My Students</h1>
          <p className="text-sm text-muted">View directory and monitor performance across all your classes</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="flex-row gap-4">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search students by name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
            />
          </div>
          <button onClick={() => showToast('Filters menu coming soon', 'info')} className="btn flex-row gap-2" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-col justify-center" style={{ alignItems: 'center', height: '30vh' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Student Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Grade & Section</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>GPA</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact Info</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex-row gap-3">
                      <div className="avatar" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                        {(s.profile?.first_name || 'S')[0]}{(s.profile?.last_name || '')[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm m-0">{s.profile?.first_name} {s.profile?.last_name}</p>
                        <p className="text-xs text-muted m-0">ID: {s.id.substring(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p className="text-sm m-0">{s.section?.grades?.name}</p>
                    <p className="text-xs text-muted m-0">Section {s.section?.name}</p>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span className="font-bold text-sm" style={{ color: s.gpa >= 3.0 ? '#10B981' : s.gpa >= 2.5 ? '#f59e0b' : '#ef4444' }}>
                      {s.gpa}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex-col gap-1">
                      <p className="text-xs m-0 flex-row gap-1" style={{ color: 'var(--text-secondary)' }}><Mail size={12}/> student@demo.com</p>
                      <p className="text-xs m-0 flex-row gap-1" style={{ color: 'var(--text-secondary)' }}><Phone size={12}/> {s.profile?.phone_number || 'N/A'}</p>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {s.atRisk ? (
                      <span className="badge badge-red flex-row gap-1" style={{ margin: '0 auto' }}>
                        <ShieldAlert size={12}/> At Risk
                      </span>
                    ) : (
                      <span className="badge badge-green">On Track</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => showToast('Opening student profile...', 'info')} className="btn flex-row gap-2" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
                      Profile <ExternalLink size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
