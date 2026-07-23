import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search } from 'lucide-react';

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

export default function TeacherGradebook() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]); // [{exam_id, student_id, score}]
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    const tid = user?.id;
    setTeacherId(tid);

    let sectData;
    if (tid) {
      const { data: asgn } = await supabase.from('teacher_assignments').select('sections(id, name, grades(name))').eq('teacher_id', tid);
      const unique = [];
      const seen = new Set();
      (asgn || []).forEach(a => {
        if (a.sections && !seen.has(a.sections.id)) { seen.add(a.sections.id); unique.push(a.sections); }
      });
      sectData = unique;
    } else {
      const { data } = await supabase.from('sections').select('*, grades(name)');
      sectData = data || [];
    }
    setSections(sectData);
  }

  useEffect(() => {
    if (selectedSection) fetchGradebook();
  }, [selectedSection]);

  async function fetchGradebook() {
    setLoading(true);
    try {
      const [{ data: enrollments }, { data: examData }] = await Promise.all([
        supabase.from('enrollments').select('profiles(id, first_name, last_name)').eq('section_id', selectedSection),
        supabase.from('exams').select('id, title, date, subjects(name)').eq('section_id', selectedSection).order('date', { ascending: true }),
      ]);

      const studs = (enrollments || []).map(e => e.profiles).filter(Boolean);
      setStudents(studs);
      setExams(examData || []);

      if (examData && examData.length > 0 && studs.length > 0) {
        const { data: resultsData } = await supabase
          .from('exam_results')
          .select('exam_id, student_id, score')
          .in('exam_id', examData.map(e => e.id));
        setResults(resultsData || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getScore(studentId, examId) {
    const r = results.find(r => r.student_id === studentId && r.exam_id === examId);
    return r ? r.score : null;
  }

  function getStudentAverage(studentId) {
    const studentScores = results.filter(r => r.student_id === studentId).map(r => r.score);
    if (studentScores.length === 0) return null;
    return (studentScores.reduce((a, b) => a + Number(b), 0) / studentScores.length).toFixed(1);
  }

  function getExamAverage(examId) {
    const examScores = results.filter(r => r.exam_id === examId).map(r => Number(r.score));
    if (examScores.length === 0) return null;
    return (examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(1);
  }

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    padding: '0.65rem 1rem', borderRadius: '0.5rem',
    border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
    color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Gradebook</h1>
        <p>A full view of every student's exam scores in one section.</p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Section</label>
          <select style={{ ...inputStyle, width: '100%' }} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
            <option value="">Select a section</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.grades?.name} – {s.name}</option>)}
          </select>
        </div>
        {selectedSection && students.length > 0 && (
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Student</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Find student…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, width: '100%', paddingLeft: '2.25rem' }}
              />
            </div>
          </div>
        )}
      </div>

      {!selectedSection ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <p>Select a section to view its gradebook.</p>
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading gradebook…</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p>No exams created for this section yet.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)' }}>
                  Student
                </th>
                {exams.map(exam => (
                  <th key={exam.id} style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', minWidth: '90px' }}>
                    <div>{exam.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: '0.7rem' }}>{exam.subjects?.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, fontSize: '0.65rem' }}>{exam.date}</div>
                  </th>
                ))}
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', color: 'var(--primary)', minWidth: '80px' }}>
                  Average
                </th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', color: 'var(--primary)' }}>
                  Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, sIdx) => {
                const avg = getStudentAverage(student.id);
                const grade = getGrade(avg);
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.875rem 1.25rem', position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{student.first_name} {student.last_name}</span>
                      </div>
                    </td>
                    {exams.map(exam => {
                      const score = getScore(student.id, exam.id);
                      const g = getGrade(score);
                      return (
                        <td key={exam.id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {score !== null ? (
                            <span style={{ fontWeight: 600, color: g.color }}>{score}</span>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {avg !== null ? (
                        <span style={{ fontWeight: 700, color: grade.color, fontSize: '1.05rem' }}>{avg}</span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', backgroundColor: `${grade.color}20`, color: grade.color }}>
                        {grade.letter}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Class Average Row */}
              <tr style={{ backgroundColor: 'rgba(16,185,129,0.04)', borderTop: '2px solid var(--border-color)' }}>
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', position: 'sticky', left: 0, backgroundColor: 'rgba(16,185,129,0.06)', borderRight: '1px solid var(--border-color)' }}>
                  Class Avg
                </td>
                {exams.map(exam => {
                  const avg = getExamAverage(exam.id);
                  const g = getGrade(avg);
                  return (
                    <td key={exam.id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {avg !== null ? (
                        <span style={{ fontWeight: 700, color: g.color }}>{avg}</span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                  );
                })}
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
