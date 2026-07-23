import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getTeacherIdFallback } from '../../utils/demoHelpers';
import { useToast } from '../../components/Toast';
import { CheckCircle, XCircle, Clock, CalendarCheck, CheckSquare } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

const STATUS_CONFIG = {
  present: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Present', icon: CheckCircle },
  absent:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Absent',  icon: XCircle },
  late:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Late',    icon: Clock },
  excused: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Excused', icon: CheckSquare },
};

export default function TeacherAttendance() {
  const { toast } = useToast();
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [teacherId, setTeacherId] = useState(null);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 });

  useEffect(() => { init(); }, []);

  async function init() {
    setLoadingInit(true);
    const tid = await getTeacherIdFallback();
    setTeacherId(tid);

    if (tid) {
      const { data } = await supabase
        .from('teacher_assignments')
        .select('*, sections(id, name, grades(name))')
        .eq('teacher_id', tid);
      const asgn = data || [];
      setAssignments(asgn);
      const uniqueSections = [];
      const seen = new Set();
      asgn.forEach(a => {
        if (!seen.has(a.section_id)) {
          seen.add(a.section_id);
          uniqueSections.push(a.sections);
        }
      });
      setSections(uniqueSections.filter(Boolean));
    } else {
      // Demo: fetch all sections
      const { data } = await supabase.from('sections').select('*, grades(name)');
      setSections(data || []);
    }
    setLoadingInit(false);
  }

  useEffect(() => {
    if (selectedSection && selectedDate) fetchStudentsAndAttendance();
  }, [selectedSection, selectedDate]);

  async function fetchStudentsAndAttendance() {
    setLoadingStudents(true);
    try {
      const [{ data: enrollments }, { data: attRecords }] = await Promise.all([
        supabase.from('enrollments').select('profiles(id, first_name, last_name)').eq('section_id', selectedSection),
        supabase.from('attendance').select('student_id, status').eq('section_id', selectedSection).eq('date', selectedDate)
      ]);

      const studs = (enrollments || []).map(e => e.profiles).filter(Boolean);
      setStudents(studs);

      const attMap = {};
      (attRecords || []).forEach(r => { attMap[r.student_id] = r.status; });
      setAttendance(attMap);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    const s = { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 };
    students.forEach(st => {
      const status = attendance[st.id];
      if (status) s[status] = (s[status] || 0) + 1;
      else s.unmarked++;
    });
    setSummary(s);
  }, [attendance, students]);

  function markAll(status) {
    const updated = {};
    students.forEach(st => { updated[st.id] = status; });
    setAttendance(updated);
  }

  function toggleStudent(id) {
    const cur = attendance[id];
    const order = ['present', 'absent', 'late', 'excused'];
    const next = cur ? order[(order.indexOf(cur) + 1) % order.length] : 'present';
    setAttendance(prev => ({ ...prev, [id]: next }));
  }

  async function handleSave() {
    if (!selectedSection || students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map(st => ({
        student_id: st.id,
        section_id: selectedSection,
        date: selectedDate,
        status: attendance[st.id] || 'absent',
        ...(teacherId ? { recorded_by: teacherId } : {}),
      }));
      const { error } = await supabase.from('attendance').upsert(records, { onConflict: 'student_id,section_id,date' });
      if (error) throw error;
      toast.success('Attendance saved successfully!');
    } catch (err) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  }

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );
  const completionPct = students.length > 0 ? Math.round(((students.length - summary.unmarked) / students.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Attendance</h1>
          <p>Select a class and date to record attendance.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => markAll('present')} disabled={!selectedSection || loadingStudents} style={{ border: '1px solid #10B981', color: '#10B981' }}>
            ✓ All Present
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!selectedSection || students.length === 0 || saving}>
            {saving ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Class / Section
          </label>
          {loadingInit ? (
            <div style={{ ...inputStyle, color: 'var(--text-secondary)' }}>Loading…</div>
          ) : (
            <select style={inputStyle} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
              <option value="">Select a section</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.grades?.name} – {s.name}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Date
          </label>
          <input style={inputStyle} type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
        </div>
      </div>

      {/* Progress + Summary strip */}
      {selectedSection && students.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cfg.label}: <strong style={{ color: cfg.color }}>{summary[key] || 0}</strong></span>
                </div>
              ))}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Unmarked: <strong style={{ color: 'var(--text-secondary)' }}>{summary.unmarked}</strong></span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: completionPct === 100 ? '#10B981' : 'var(--text-secondary)' }}>
              {completionPct}% complete
            </span>
          </div>
          <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPct}%`, height: '100%', backgroundColor: completionPct === 100 ? '#10B981' : 'var(--primary)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Search */}
      {selectedSection && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search student by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>
      )}

      {/* Student List */}
      {!selectedSection ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <CalendarCheck size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
          <p>Select a section above to start recording attendance.</p>
        </div>
      ) : loadingStudents ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading students…</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No students found{search ? ` matching "${search}"` : ' in this section'}.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Click a student to cycle status</span>
          </div>
          {filteredStudents.map((student, idx) => {
            const status = attendance[student.id];
            const cfg = status ? STATUS_CONFIG[status] : null;
            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.875rem 1.5rem',
                  borderBottom: idx < filteredStudents.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: 'pointer',
                  backgroundColor: cfg ? cfg.bg : 'transparent',
                  transition: 'background-color 0.15s',
                }}
              >
                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: cfg ? cfg.bg : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${cfg ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem', color: cfg ? cfg.color : 'var(--text-secondary)'
                  }}>
                    {student.first_name[0]}{student.last_name[0]}
                  </div>
                  <span style={{ fontWeight: 500 }}>{student.first_name} {student.last_name}</span>
                </div>

                {/* Status buttons */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                    <button
                      key={key}
                      onClick={e => { e.stopPropagation(); setAttendance(prev => ({ ...prev, [student.id]: key })); }}
                      style={{
                        padding: '0.3rem 0.65rem', borderRadius: '0.35rem', fontSize: '0.75rem', fontWeight: 600,
                        border: `1px solid ${attendance[student.id] === key ? c.color : 'rgba(255,255,255,0.08)'}`,
                        backgroundColor: attendance[student.id] === key ? c.bg : 'transparent',
                        color: attendance[student.id] === key ? c.color : 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit'
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
