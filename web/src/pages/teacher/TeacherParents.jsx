import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getTeacherIdFallback } from '../../utils/demoHelpers';
import { Search, MessageSquare, Phone, Mail, CalendarCheck, BarChart2, ChevronRight, Users } from 'lucide-react';
import { useToast } from '../../components/Toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRADE_THRESHOLDS = [
  { letter: 'A', min: 90, color: '#10B981' },
  { letter: 'B', min: 80, color: '#3b82f6' },
  { letter: 'C', min: 70, color: '#f59e0b' },
  { letter: 'D', min: 60, color: '#f97316' },
  { letter: 'F', min: 0,  color: '#ef4444' },
];

function getGrade(score) {
  if (score === null || score === undefined) return { letter: '—', color: 'var(--text-secondary)' };
  return GRADE_THRESHOLDS.find(g => Number(score) >= g.min) || { letter: 'F', color: '#ef4444' };
}

// ─── Student Context Panel ────────────────────────────────────────────────────

function StudentContextPanel({ student }) {
  const [attSummary, setAttSummary] = useState(null);
  const [lastExam, setLastExam]     = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (student?.id) loadStudentData(student.id);
  }, [student?.id]);

  async function loadStudentData(studentId) {
    setLoading(true);
    try {
      const [{ data: attRaw }, { data: examResults }] = await Promise.all([
        supabase.from('attendance').select('status').eq('student_id', studentId),
        supabase
          .from('exam_results')
          .select('score, exams(title, date, max_score, subjects(name))')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      const att = attRaw || [];
      const total   = att.length;
      const present = att.filter(a => a.status === 'present' || a.status === 'late').length;
      setAttSummary({ total, present, rate: total > 0 ? Math.round((present / total) * 100) : null });

      setLastExam(examResults?.[0] || null);
    } catch (err) {
      console.error('StudentContextPanel error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!student) return null;

  const attColor = attSummary?.rate != null
    ? attSummary.rate >= 80 ? '#10B981' : attSummary.rate >= 60 ? '#f59e0b' : '#ef4444'
    : 'var(--text-secondary)';

  const examScore = lastExam?.score;
  const examGrade = getGrade(examScore);

  return (
    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', padding: '1rem', marginBottom: '1rem' }}>
      {/* Student name header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#3b82f6', fontSize: '0.72rem', flexShrink: 0 }}>
          {student.first_name?.[0]}{student.last_name?.[0]}
        </div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>
          {student.first_name} {student.last_name}
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Loading student data…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {/* Attendance */}
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: `${attColor}10`, border: `1px solid ${attColor}30`, borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <CalendarCheck size={13} color={attColor} />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance</span>
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: attColor }}>
              {attSummary?.rate != null ? `${attSummary.rate}%` : '—'}
            </p>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {attSummary?.present}/{attSummary?.total} days
            </p>
          </div>

          {/* Last exam */}
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: `${examGrade.color}10`, border: `1px solid ${examGrade.color}30`, borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <BarChart2 size={13} color={examGrade.color} />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Exam</span>
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: examGrade.color }}>
              {examScore != null ? `${examScore}` : '—'}
              {examScore != null && <span style={{ fontSize: '0.8rem', marginLeft: '0.3rem' }}>({examGrade.letter})</span>}
            </p>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lastExam?.exams?.subjects?.name || 'No exams yet'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeacherParents({ setActiveTab }) {
  const { showToast } = useToast();
  const [loading, setLoading]         = useState(true);
  const [parents, setParents]         = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedParent, setSelectedParent] = useState(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);
    try {
      const tid = await getTeacherIdFallback();

      // Get teacher's sections
      const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select('section_id')
        .eq('teacher_id', tid);

      if (!assignments || assignments.length === 0) {
        setParents([]);
        return;
      }

      const sectionIds = assignments.map(a => a.section_id);

      // Get students in those sections
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .in('section_id', sectionIds);

      if (!enrollments || enrollments.length === 0) {
        setParents([]);
        return;
      }

      const studentIds = enrollments.map(e => e.student_id);

      // Get parent links
      const { data: links, error } = await supabase
        .from('parent_student_links')
        .select(`
          parent_id,
          student_id,
          parent:profiles!parent_student_links_parent_id_fkey(id, first_name, last_name, email, phone_number),
          student:profiles!parent_student_links_student_id_fkey(id, first_name, last_name)
        `)
        .in('student_id', studentIds);

      if (error) throw error;

      // Group by parent
      const parentMap = new Map();
      (links || []).forEach(link => {
        if (!link.parent) return;
        if (!parentMap.has(link.parent.id)) {
          parentMap.set(link.parent.id, { parent: link.parent, students: [link.student] });
        } else {
          parentMap.get(link.parent.id).students.push(link.student);
        }
      });

      setParents(Array.from(parentMap.values()));
    } catch (err) {
      console.error('Error loading parents:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenMessages(parentEntry) {
    // Navigate to the messages tab. TeacherLayout passes setActiveTab down.
    setActiveTab?.('messages');
  }

  const filtered = parents.filter(p => {
    const pName = `${p.parent.first_name} ${p.parent.last_name}`.toLowerCase();
    const sName = p.students.map(s => `${s.first_name} ${s.last_name}`).join(' ').toLowerCase();
    return pName.includes(searchTerm.toLowerCase()) || sName.includes(searchTerm.toLowerCase());
  });

  // ── Detail view ──
  if (selectedParent) {
    const parentName   = `${selectedParent.parent.first_name} ${selectedParent.parent.last_name}`;
    const studentNames = selectedParent.students.map(s => `${s.first_name} ${s.last_name}`).join(', ');

    return (
      <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
        {/* Back + header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setSelectedParent(null)}
            className="btn hover-card"
            style={{ padding: '0.5rem 0.9rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ marginBottom: '0.15rem' }}>{parentName}</h1>
            <p className="text-sm text-muted" style={{ margin: 0 }}>Guardian of {studentNames}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Contact + Message button */}
          <div className="glass-card">
            <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 600 }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {selectedParent.parent.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <Mail size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.9rem' }}>{selectedParent.parent.email}</span>
                </div>
              )}
              {selectedParent.parent.phone_number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <Phone size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.9rem' }}>{selectedParent.parent.phone_number}</span>
                </div>
              )}
              {!selectedParent.parent.email && !selectedParent.parent.phone_number && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No contact details on record.</p>
              )}
            </div>

            {/* Open Messages */}
            <div style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontWeight: 600, fontSize: '0.95rem' }}>Send a Message</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Open the full messaging thread with {selectedParent.parent.first_name}
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenMessages(selectedParent)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}
              >
                <MessageSquare size={16} />
                Open Chat
              </button>
            </div>
          </div>

          {/* Right: Student context cards */}
          <div>
            <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600 }}>Student Overview</h2>
            {selectedParent.students.map(student => (
              <StudentContextPanel key={student.id} student={student} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Directory view ──
  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Parents Directory</h1>
          <p className="text-sm text-muted">Contact information and student overview for your students' guardians</p>
        </div>
        {parents.length > 0 && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <Users size={13} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
            {parents.length} guardian{parents.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by parent or student name…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '20vh' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Guardian</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Student(s)</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Contact</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                  className="hover-card"
                  onClick={() => setSelectedParent(p)}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                        {p.parent.first_name?.[0]}{p.parent.last_name?.[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{p.parent.first_name} {p.parent.last_name}</span>
                        <p className="text-xs text-muted m-0">Guardian</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {p.students.map(s => `${s.first_name} ${s.last_name}`).join(', ')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {p.parent.email && (
                      <p style={{ fontSize: '0.78rem', margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={12} />{p.parent.email}
                      </p>
                    )}
                    {p.parent.phone_number && (
                      <p style={{ fontSize: '0.78rem', margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={12} />{p.parent.phone_number}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleOpenMessages(p); }}
                        className="btn"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)' }}
                      >
                        <MessageSquare size={13} /> Message
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedParent(p); }}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        View <ChevronRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {searchTerm ? `No parents match "${searchTerm}"` : 'No parents linked to your sections yet.'}
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
