import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getTeacherIdFallback } from '../../utils/demoHelpers';
import { useToast } from '../../components/Toast';
import { Plus, X, BarChart2, Award } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

const GRADE_THRESHOLDS = [
  { letter: 'A', min: 90, color: '#10B981' },
  { letter: 'B', min: 80, color: '#3b82f6' },
  { letter: 'C', min: 70, color: '#f59e0b' },
  { letter: 'D', min: 60, color: '#f97316' },
  { letter: 'F', min: 0,  color: '#ef4444' },
];

function getGrade(score) {
  if (score === null || score === undefined || score === '') return { letter: '—', color: 'var(--text-secondary)' };
  const s = Number(score);
  return GRADE_THRESHOLDS.find(g => s >= g.min) || { letter: 'F', color: '#ef4444' };
}

// Mini grade distribution bar chart
function GradeDistribution({ scores }) {
  const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  scores.forEach(s => { if (s !== null && s !== undefined) counts[getGrade(s).letter]++; });
  const max = Math.max(...Object.values(counts), 1);
  const gradeColors = { A: '#10B981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' };
  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end', height: '50px' }}>
      {Object.entries(counts).map(([letter, count]) => (
        <div key={letter} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '0.65rem', color: gradeColors[letter], fontWeight: 700 }}>{count}</span>
          <div style={{ width: '100%', height: `${(count / max) * 36}px`, minHeight: count > 0 ? '6px' : '2px', backgroundColor: count > 0 ? gradeColors[letter] : 'rgba(255,255,255,0.06)', borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease' }} />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{letter}</span>
        </div>
      ))}
    </div>
  );
}

export default function TeacherExams() {
  const { toast } = useToast();
  const [view, setView] = useState('list'); // 'list' | 'grade'
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState(null);
  const [assignments, setAssignments] = useState([]);

  // Create exam modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', subject_id: '', section_id: '', date: '', max_score: '100' });

  // Score entry
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [savingScores, setSavingScores] = useState(false);

  useEffect(() => { init(); }, []);

  async function init() {
    setLoading(true);
    const tid = await getTeacherIdFallback();
    setTeacherId(tid);

    const [sectRes, subRes, examsRes, asgnRes] = await Promise.all([
      supabase.from('sections').select('*, grades(name)'),
      supabase.from('subjects').select('*'),
      tid
        ? supabase.from('exams').select('*, subjects(name), sections(name, grades(name))').in('section_id',
            (await supabase.from('teacher_assignments').select('section_id').eq('teacher_id', tid)).data?.map(a => a.section_id) || []
          )
        : supabase.from('exams').select('*, subjects(name), sections(name, grades(name))'),
      tid
        ? supabase.from('teacher_assignments').select('section_id, subject_id').eq('teacher_id', tid)
        : { data: [] }
    ]);

    setSections(sectRes.data || []);
    setSubjects(subRes.data || []);
    setExams(examsRes.data || []);
    setAssignments(asgnRes.data || []);
    setLoading(false);
  }

  async function handleCreateExam(e) {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        subject_id: form.subject_id,
        section_id: form.section_id,
        date: form.date,
        max_score: Number(form.max_score) || 100,
      };
      const { error } = await supabase.from('exams').insert([payload]);
      if (error) throw error;
      toast.success('Exam created!');
      setShowModal(false);
      setForm({ title: '', subject_id: '', section_id: '', date: '', max_score: '100' });
      init();
    } catch (err) {
      toast.error(err.message || 'Failed to create exam');
    }
  }

  async function openGradeEntry(exam) {
    setSelectedExam(exam);
    setView('grade');
    const [{ data: enrollments }, { data: results }] = await Promise.all([
      supabase.from('enrollments').select('profiles(id, first_name, last_name)').eq('section_id', exam.section_id),
      supabase.from('exam_results').select('student_id, score').eq('exam_id', exam.id)
    ]);
    const studs = (enrollments || []).map(e => e.profiles).filter(Boolean);
    setStudents(studs);
    const map = {};
    (results || []).forEach(r => { map[r.student_id] = r.score; });
    setScores(map);
  }

  async function handleSaveScores() {
    setSavingScores(true);
    try {
      const records = students
        .filter(st => scores[st.id] !== undefined && scores[st.id] !== '')
        .map(st => ({
          exam_id: selectedExam.id,
          student_id: st.id,
          score: Number(scores[st.id]),
          ...(teacherId ? { graded_by: teacherId } : {}),
        }));
      const { error } = await supabase.from('exam_results').upsert(records, { onConflict: 'exam_id,student_id' });
      if (error) throw error;
      toast.success('Scores saved!');
      setView('list');
    } catch (err) {
      toast.error(err.message || 'Failed to save scores');
    } finally {
      setSavingScores(false);
    }
  }

  const allScores = Object.values(scores).filter(s => s !== '' && s !== undefined);
  const avg = allScores.length > 0 ? (allScores.reduce((a, b) => a + Number(b), 0) / allScores.length).toFixed(1) : null;
  const highest = allScores.length > 0 ? Math.max(...allScores.map(Number)) : null;
  const lowest = allScores.length > 0 ? Math.min(...allScores.map(Number)) : null;
  const graded = allScores.length;

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading exams…</div>;

  // ─── GRADE ENTRY VIEW ───
  if (view === 'grade' && selectedExam) {
    return (
      <div style={{ animation: 'fadeSlideIn 0.25s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button className="btn" onClick={() => setView('list')} style={{ border: '1px solid var(--border-color)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              ← Back to Exams
            </button>
            <h1 style={{ marginBottom: '0.25rem' }}>{selectedExam.title}</h1>
            <p>{selectedExam.sections?.grades?.name} – {selectedExam.sections?.name} · {selectedExam.subjects?.name} · {selectedExam.date}</p>
          </div>
          <button className="btn btn-primary" onClick={handleSaveScores} disabled={savingScores}>
            {savingScores ? 'Saving…' : 'Save All Scores'}
          </button>
        </div>

        {/* Stats bar */}
        {allScores.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Class Average', value: avg, color: avg >= 70 ? '#10B981' : '#f59e0b' },
              { label: 'Highest Score', value: highest, color: '#3b82f6' },
              { label: 'Lowest Score', value: lowest, color: lowest < 50 ? '#ef4444' : '#f97316' },
              { label: 'Graded', value: `${graded}/${students.length}`, color: 'var(--primary)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{label}</p>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value ?? '—'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Grade Distribution */}
        {allScores.length > 0 && (
          <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Grade Distribution</h2>
              <p style={{ fontSize: '0.8rem' }}>{graded} scores entered</p>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <GradeDistribution scores={Object.values(scores)} />
            </div>
          </div>
        )}

        {/* Student score rows */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{students.length} students · Max score: {selectedExam.max_score || 100}</span>
          </div>
          {students.map((st, idx) => {
            const score = scores[st.id];
            const grade = getGrade(score);
            return (
              <div key={st.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.9rem 1.5rem',
                borderBottom: idx < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {st.first_name[0]}{st.last_name[0]}
                  </div>
                  <span style={{ fontWeight: 500 }}>{st.first_name} {st.last_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Mini bar */}
                  {score !== undefined && score !== '' && (
                    <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(Number(score) / (selectedExam.max_score || 100)) * 100}%`, height: '100%', backgroundColor: grade.color, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                    </div>
                  )}
                  {/* Score input */}
                  <input
                    type="number"
                    min="0"
                    max={selectedExam.max_score || 100}
                    placeholder="Score"
                    value={score !== undefined ? score : ''}
                    onChange={e => setScores(prev => ({ ...prev, [st.id]: e.target.value }))}
                    style={{ width: '80px', padding: '0.45rem 0.65rem', borderRadius: '0.4rem', border: `1px solid ${score !== undefined && score !== '' ? grade.color : 'var(--border-color)'}`, backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit', textAlign: 'center', fontWeight: 600 }}
                  />
                  {/* Letter grade badge */}
                  <span style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', backgroundColor: `${grade.color}20`, color: grade.color, flexShrink: 0 }}>
                    {grade.letter}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── EXAM LIST VIEW ───
  return (
    <div style={{ animation: 'fadeSlideIn 0.25s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Exams & Grading</h1>
          <p>{exams.length} exam{exams.length !== 1 ? 's' : ''} in your classes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '0.4rem' }} /> Create Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <BarChart2 size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem', display: 'block', opacity: 0.35 }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No exams yet</h2>
          <p>Create your first exam to start entering scores.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowModal(true)}>
            Create Exam
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {exams.map(exam => {
            const isPast = new Date(exam.date) < new Date();
            const daysUntil = Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <div key={exam.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{exam.title}</h3>
                    {isPast
                      ? <span className="badge badge-blue">Past</span>
                      : daysUntil <= 3
                      ? <span className="badge badge-red">In {daysUntil}d</span>
                      : <span className="badge badge-yellow">In {daysUntil}d</span>}
                  </div>
                  <p style={{ fontSize: '0.82rem', margin: 0 }}>
                    {exam.sections?.grades?.name} – {exam.sections?.name} &nbsp;·&nbsp; {exam.subjects?.name} &nbsp;·&nbsp; {exam.date}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}
                  onClick={() => openGradeEntry(exam)}
                >
                  {isPast ? 'View / Edit Scores' : 'Enter Scores'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Exam Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Exam</h2>
            <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Exam Title *</label>
                <input required style={inputStyle} placeholder="e.g. Mid-term Examination" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Section *</label>
                  <select required style={inputStyle} value={form.section_id} onChange={e => setForm({ ...form, section_id: e.target.value })}>
                    <option value="">Select section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.grades?.name} – {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Subject *</label>
                  <select required style={inputStyle} value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Exam Date *</label>
                  <input required type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Max Score</label>
                  <input type="number" min="1" style={inputStyle} value={form.max_score} onChange={e => setForm({ ...form, max_score: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
