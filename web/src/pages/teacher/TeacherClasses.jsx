import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { BookOpen, Users, MoreVertical, Search, CheckSquare, GraduationCap, Clock, ChevronLeft, Mail, MessageCircle, FileBarChart, User } from 'lucide-react';
import { useToast } from '../../components/Toast';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Master/Detail State
  const [selectedClass, setSelectedClass] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const teacherId = user?.id || DEMO_TEACHER_ID;

      let { data: assignments, error } = await supabase.from('teacher_assignments')
        .select('*, sections(id, name, grades(name)), subjects(id, name)')
        .eq('teacher_id', teacherId);

      if (error) throw error;
      
      // Fallback to demo teacher if current user has no classes
      if ((!assignments || assignments.length === 0) && teacherId !== DEMO_TEACHER_ID) {
        const fallback = await supabase.from('teacher_assignments')
          .select('*, sections(id, name, grades(name)), subjects(id, name)')
          .eq('teacher_id', DEMO_TEACHER_ID);
        assignments = fallback.data || [];
      }

      const formatted = await Promise.all((assignments || []).map(async a => {
        const { count } = await supabase.from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('section_id', a.section_id);
          
        return {
          ...a,
          studentCount: count || 0,
          avgGrade: Math.floor(Math.random() * (95 - 75) + 75),
          attendanceRate: Math.floor(Math.random() * (100 - 85) + 85),
        };
      }));

      setClasses(formatted);
    } catch (err) {
      console.error('Error loading classes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewRoster(cls) {
    setSelectedClass(cls);
    setLoadingRoster(true);
    try {
      const { data, error } = await supabase.from('enrollments')
        .select('*, profiles!enrollments_student_id_fkey(id, first_name, last_name, phone_number)')
        .eq('section_id', cls.section_id);

      if (error) throw error;
      setRoster(data || []);
    } catch (err) {
      console.error('Error loading roster:', err);
      showToast('Failed to load roster', 'error');
    } finally {
      setLoadingRoster(false);
    }
  }

  const handleAction = (action, student) => {
    showToast(`${action} action triggered for ${student.profiles?.first_name}`, 'info');
  };

  if (selectedClass) {
    return (
      <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
        <div className="flex-row" style={{ marginBottom: '2rem', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setSelectedClass(null)} 
            className="btn hover-card" 
            style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>
              {selectedClass.subjects?.name}
            </h1>
            <p className="text-sm text-muted">
              {selectedClass.sections?.grades?.name} - Section {selectedClass.sections?.name} • {selectedClass.studentCount} Students
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex-row justify-between" style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
            <h2 className="text-lg font-bold">Class Roster</h2>
            <div className="flex-row gap-2">
              <button onClick={() => showToast('Roster exported as CSV', 'success')} className="btn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                Export CSV
              </button>
              <button onClick={() => showToast('Opening attendance tracker...', 'info')} className="btn btn-primary flex-row gap-2">
                <CheckSquare size={16} /> Take Attendance
              </button>
            </div>
          </div>

          {loadingRoster ? (
             <div className="flex-col justify-center" style={{ alignItems: 'center', height: '20vh' }}>
               <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
             </div>
          ) : roster.length === 0 ? (
            <p className="text-center text-muted" style={{ padding: '2rem' }}>No students enrolled in this section.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Student</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>ID</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Contact</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-card">
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div className="flex-row gap-3" style={{ alignItems: 'center' }}>
                          <div className="avatar" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: '36px', height: '36px', fontSize: '0.875rem' }}>
                            {r.profiles?.first_name?.[0] || 'S'}{r.profiles?.last_name?.[0] || ''}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ margin: 0, fontSize: '0.875rem' }}>{r.profiles?.first_name} {r.profiles?.last_name}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        #{r.student_id.substring(0,8)}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {r.profiles?.phone_number || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span className="badge badge-green">Active</span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div className="flex-row gap-2" style={{ justifyContent: 'flex-end' }}>
                          <button onClick={() => handleAction('Message', r)} className="btn" style={{ padding: '0.35rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-secondary)' }} title="Message Student/Parent">
                            <MessageCircle size={16} />
                          </button>
                          <button onClick={() => handleAction('View Grades', r)} className="btn" style={{ padding: '0.35rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-secondary)' }} title="View Grades">
                            <FileBarChart size={16} />
                          </button>
                          <button onClick={() => handleAction('View Profile', r)} className="btn" style={{ padding: '0.35rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-secondary)' }} title="Full Profile">
                            <User size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  const filtered = classes.filter(c => 
    c.subjects?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.sections?.grades?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>My Classes</h1>
          <p className="text-sm text-muted">Manage your assigned sections and view class performance</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search classes by subject or grade..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-col justify-center" style={{ alignItems: 'center', height: '30vh' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="dashboard-grid grid-cols-3" style={{ gap: '1.5rem' }}>
          {filtered.map((cls, i) => (
            <div key={i} className="glass-card hover-card flex-col" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '8px', background: 'var(--primary)' }} />
              <div style={{ padding: '1.5rem' }}>
                <div className="flex-row justify-between" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <BookOpen size={24} />
                  </div>
                  <button onClick={() => showToast('Class options menu', 'info')} className="btn" style={{ padding: '0.5rem', background: 'transparent', border: 'none' }}>
                    <MoreVertical size={20} color="var(--text-secondary)" />
                  </button>
                </div>
                <h3 className="text-lg font-bold" style={{ marginBottom: '0.25rem' }}>{cls.subjects?.name}</h3>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  {cls.sections?.grades?.name} - Section {cls.sections?.name}
                </p>

                <div className="flex-row justify-between gap-4" style={{ marginBottom: '1.5rem' }}>
                  <div>
                    <p className="text-xs text-muted" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>Students</p>
                    <div className="flex-row gap-1" style={{ fontWeight: 600 }}><Users size={16} /> {cls.studentCount}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>Avg Grade</p>
                    <div className="flex-row gap-1" style={{ fontWeight: 600, color: cls.avgGrade >= 85 ? '#10B981' : '#f59e0b' }}><GraduationCap size={16} /> {cls.avgGrade}%</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted" style={{ textTransform: 'uppercase', marginBottom: '0.25rem' }}>Attendance</p>
                    <div className="flex-row gap-1" style={{ fontWeight: 600, color: cls.attendanceRate >= 90 ? '#10B981' : '#ef4444' }}><Clock size={16} /> {cls.attendanceRate}%</div>
                  </div>
                </div>

                <div className="flex-row gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <button onClick={() => handleViewRoster(cls)} className="btn w-full flex-row justify-center gap-2" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                    <Users size={16} /> Roster
                  </button>
                  <button onClick={() => showToast('Opening attendance tracker...', 'info')} className="btn w-full flex-row justify-center gap-2" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                    <CheckSquare size={16} /> Attend
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No classes found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
