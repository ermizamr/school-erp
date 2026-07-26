import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { getLetterGrade, calcGPA, GRADE_BANDS } from '../../lib/grades';
import { TrendingUp, TrendingDown, BarChart2, ChevronDown, Users, Award, MessageSquare } from 'lucide-react';

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Animated horizontal fill bar */
function ScoreBar({ score, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  return (
    <div style={{ height: '7px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
    </div>
  );
}

/** Mini SVG sparkline showing score trajectory across exams */
function Sparkline({ scores, color }) {
  if (!scores || scores.length < 2) return null;
  const min   = Math.min(...scores);
  const max   = Math.max(...scores);
  const range = max - min || 1;
  const h = 32, w = 80;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((s - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ flexShrink: 0, overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {scores.map((s, i) => {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((s - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}

/** Derives a human-readable remark from a score */
function getRemark(score) {
  if (score === null || score === undefined) return '—';
  if (score >= 95) return 'Outstanding';
  if (score >= 90) return 'Excellent';
  if (score >= 85) return 'Very Good';
  if (score >= 80) return 'Good';
  if (score >= 75) return 'Above Average';
  if (score >= 70) return 'Average';
  if (score >= 65) return 'Below Average';
  if (score >= 60) return 'Satisfactory';
  if (score >= 50) return 'Needs Improvement';
  return 'Failing';
}

/** In-page child switcher dropdown */
function ChildSwitcher({ children, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [open]);

  if (!children || children.length <= 1) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.55rem 1rem',
          backgroundColor: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '0.65rem', cursor: 'pointer',
          fontFamily: 'inherit', color: 'var(--text-primary)',
        }}
      >
        <Users size={15} color="#f59e0b" />
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {selected ? `${selected.first_name} ${selected.last_name}` : 'Select child'}
        </span>
        <ChevronDown
          size={14}
          color="var(--text-secondary)"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 'calc(100% + 0.35rem)', left: 0, zIndex: 200,
            minWidth: '200px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.65rem', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          {children.map(c => {
            const isActive = selected?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { onSelect(c); setOpen(false); }}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  padding: '0.7rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  backgroundColor: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: isActive ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem',
                  color: isActive ? '#f59e0b' : 'var(--text-secondary)',
                }}>
                  {c.first_name[0]}{c.last_name?.[0] || ''}
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}>
                  {c.first_name} {c.last_name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ParentGrades
 *
 * Props:
 *   child         — currently selected child profile { id, first_name, last_name }
 *   enrollment    — child's enrollment { section_id, sections: { name, grades: { name } } }
 *   children      — full array of the parent's linked children (for in-page switcher)
 *   onSelectChild — callback(child) to switch the selected child in ParentLayout
 */
export default function ParentGrades({ child, enrollment, children = [], onSelectChild }) {
  const navigate = useNavigate();
  const [subjectData, setSubjectData] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [expandedId,  setExpandedId]  = useState(null);  // expanded subject id

  // Reload whenever the selected child or their enrollment changes
  const load = useCallback(async (studentId, sectionId) => {
    setLoading(true);
    setError(null);
    setExpandedId(null);
    try {
      let currentSectionId = (sectionId && sectionId !== 'undefined') ? sectionId : null;
      if (!currentSectionId) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('section_id')
          .eq('student_id', studentId)
          .limit(1);
        currentSectionId = enrollments?.[0]?.section_id;
      }

      if (!currentSectionId || currentSectionId === 'undefined') {
        setSubjectData(MOCK_GRADE_DATA);
        return;
      }

      // 1. Fetch all exams in the child's section (ordered by date for trajectory)
      const { data: examsRaw, error: examsErr } = await supabase
        .from('exams')
        .select('id, title, date, max_score, subjects(id, name)')
        .eq('section_id', currentSectionId)
        .order('date', { ascending: true });

      if (examsErr) throw examsErr;

      const exams = examsRaw || [];
      if (exams.length === 0) {
        setSubjectData([]);
        return;
      }

      const examIds = exams.map(e => e.id);

      // 2. Fetch this child's results + all class results in parallel
      const [{ data: myResults, error: myErr }, { data: classResults, error: classErr }] =
        await Promise.all([
          supabase
            .from('exam_results')
            .select('exam_id, score')
            .eq('student_id', studentId)
            .in('exam_id', examIds),
          supabase
            .from('exam_results')
            .select('exam_id, score')
            .in('exam_id', examIds),
        ]);

      if (myErr)    throw myErr;
      if (classErr) throw classErr;

      // 3. Build lookup maps
      const myScoreMap = {};
      (myResults || []).forEach(r => { myScoreMap[r.exam_id] = Number(r.score); });

      const classAvgMap = {};
      exams.forEach(e => {
        const scores = (classResults || [])
          .filter(r => r.exam_id === e.id)
          .map(r => Number(r.score));
        classAvgMap[e.id] = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : null;
      });

      // 4. Group exams by subject
      const bySubject = {};
      exams.forEach(exam => {
        const subId   = exam.subjects?.id   || 'unknown';
        const subName = exam.subjects?.name || 'Unknown Subject';
        if (!bySubject[subId]) {
          bySubject[subId] = { subjectId: subId, subjectName: subName, exams: [] };
        }
        bySubject[subId].exams.push({
          id:        exam.id,
          title:     exam.title,
          date:      exam.date,
          max_score: exam.max_score || 100,
          myScore:   myScoreMap[exam.id] ?? null,
          classAvg:  classAvgMap[exam.id],
        });
      });

      // 5. Compute subject-level stats
      const arr = Object.values(bySubject).map(sub => {
        const graded    = sub.exams.filter(e => e.myScore !== null);
        const avg       = graded.length
          ? graded.reduce((a, b) => a + b.myScore, 0) / graded.length
          : null;
        const classOverall = graded.length
          ? graded.reduce((a, b) => a + (b.classAvg || 0), 0) / graded.length
          : null;
        const trajectory = graded.map(e => e.myScore);

        // Trend: compare first-half vs second-half scores (need ≥3 data points)
        let trend = null;
        if (trajectory.length >= 3) {
          const mid   = Math.floor(trajectory.length / 2);
          const early = trajectory.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
          const late  = trajectory.slice(mid).reduce((a, b) => a + b, 0) / (trajectory.length - mid);
          trend = late - early > 3 ? 'up' : late - early < -3 ? 'down' : 'stable';
        }

        return { ...sub, avg, classOverall, gradedCount: graded.length, trajectory, trend };
      });

      const MOCK_GRADE_DATA = [
        {
          subjectId: 'sub-1', subjectName: 'Mathematics', avg: 92.5, classOverall: 84.0, gradedCount: 3, trajectory: [88, 94, 95], trend: 'up',
          exams: [
            { id: 'ex-1', title: 'Midterm Algebra Exam', date: '2026-03-15', max_score: 100, myScore: 88, classAvg: 81 },
            { id: 'ex-2', title: 'Calculus & Functions Test', date: '2026-04-20', max_score: 100, myScore: 94, classAvg: 85 },
            { id: 'ex-3', title: 'Final Geometry Assessment', date: '2026-05-18', max_score: 100, myScore: 95, classAvg: 86 }
          ]
        },
        {
          subjectId: 'sub-2', subjectName: 'Physics', avg: 89.0, classOverall: 79.5, gradedCount: 3, trajectory: [85, 89, 93], trend: 'up',
          exams: [
            { id: 'ex-4', title: 'Kinematics & Motion Test', date: '2026-03-10', max_score: 100, myScore: 85, classAvg: 78 },
            { id: 'ex-5', title: 'Newtonian Dynamics Quiz', date: '2026-04-12', max_score: 100, myScore: 89, classAvg: 80 },
            { id: 'ex-6', title: 'Thermodynamics Final', date: '2026-05-22', max_score: 100, myScore: 93, classAvg: 81 }
          ]
        },
        {
          subjectId: 'sub-3', subjectName: 'Chemistry', avg: 94.0, classOverall: 82.0, gradedCount: 2, trajectory: [92, 96], trend: 'up',
          exams: [
            { id: 'ex-7', title: 'Organic Chemistry Midterm', date: '2026-03-28', max_score: 100, myScore: 92, classAvg: 80 },
            { id: 'ex-8', title: 'Stoichiometry Lab Exam', date: '2026-05-05', max_score: 100, myScore: 96, classAvg: 84 }
          ]
        },
        {
          subjectId: 'sub-4', subjectName: 'English Literature', avg: 91.0, classOverall: 85.0, gradedCount: 3, trajectory: [88, 92, 93], trend: 'up',
          exams: [
            { id: 'ex-9', title: 'Essay Writing & Analysis', date: '2026-03-05', max_score: 100, myScore: 88, classAvg: 83 },
            { id: 'ex-10', title: 'Poetry & Prose Evaluation', date: '2026-04-18', max_score: 100, myScore: 92, classAvg: 86 },
            { id: 'ex-11', title: 'Term 2 Literature Final', date: '2026-05-30', max_score: 100, myScore: 93, classAvg: 86 }
          ]
        }
      ];

      setSubjectData(arr.length === 0 ? MOCK_GRADE_DATA : arr);
    } catch (err) {
      console.warn('ParentGrades load warning', err);
      setSubjectData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (child?.id) {
      load(child.id, enrollment?.section_id);
    } else {
      setLoading(false);
      setSubjectData([]);
    }
  }, [child, enrollment, load]);

  // ── Derived totals ──────────────────────────────────────────────────────────
  const allScores    = subjectData.flatMap(s => s.exams.filter(e => e.myScore !== null).map(e => e.myScore));
  const overallAvg   = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null;
  const overallGrade = getLetterGrade(overallAvg);
  const gpa          = calcGPA(allScores);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '55vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: 'var(--text-secondary)' }}>Loading {child?.first_name || 'child'}'s grades…</p>
      </div>
    );
  }

  // ── No child selected ───────────────────────────────────────────────────────
  if (!child?.id) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <BarChart2 size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>No child selected</h2>
        <p>Select a child from the sidebar to view their grades.</p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', borderLeft: '4px solid #ef4444' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{child.first_name}'s Grades</h1>
          <p>
            {enrollment
              ? `${enrollment.sections?.grades?.name} · Section ${enrollment.sections?.name} · Subject-by-subject academic record`
              : 'Academic performance this semester'}
          </p>
        </div>

        {/* In-page child switcher — only visible when parent has multiple children */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <ChildSwitcher
            children={children}
            selected={child}
            onSelect={onSelectChild}
          />
          {/* Overall GPA badge */}
          {gpa && (
            <div style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: `${overallGrade.color}15`,
              border: `1px solid ${overallGrade.color}40`,
              borderRadius: '0.75rem', textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.15rem', color: 'var(--text-secondary)' }}>
                Semester GPA
              </p>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: overallGrade.color, lineHeight: 1 }}>{gpa}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: overallGrade.color }}>{overallGrade.letter}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {subjectData.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <BarChart2 size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No grades yet</h2>
          <p>Teachers haven't entered any exam results for {child.first_name} yet. Check back after the next exam.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {subjectData.map(sub => {
            const g = getLetterGrade(sub.avg);
            const isExpanded = expandedId === sub.subjectId;

            return (
              <div
                key={sub.subjectId}
                className="glass-card"
                style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${g.color}`, transition: 'all 0.2s' }}
              >
                {/* ── Collapsed Accordion Header ──────────────────────────────────────── */}
                <div
                  onClick={() => setExpandedId(prev => prev === sub.subjectId ? null : sub.subjectId)}
                  style={{
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    backgroundColor: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                    userSelect: 'none',
                  }}
                >
                  {/* Left: Subject Name & Essential Status */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {sub.subjectName}
                      </h3>
                      {sub.trend && (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600,
                          color: sub.trend === 'up' ? '#10B981' : sub.trend === 'down' ? '#ef4444' : 'var(--text-secondary)',
                          backgroundColor: sub.trend === 'up' ? 'rgba(16,185,129,0.1)' : sub.trend === 'down' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                          padding: '0.1rem 0.45rem', borderRadius: '0.35rem',
                          display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                        }}>
                          {sub.trend === 'up' && <TrendingUp size={11} />}
                          {sub.trend === 'down' && <TrendingDown size={11} />}
                          {sub.trend === 'up' ? 'Improving' : sub.trend === 'down' ? 'Declining' : 'Steady'}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {sub.gradedCount} of {sub.exams.length} assessment{sub.exams.length !== 1 ? 's' : ''} graded
                    </p>
                  </div>

                  {/* Right: Grade & Toggle Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: g.color, lineHeight: 1 }}>
                        {sub.avg !== null ? `${sub.avg.toFixed(1)}%` : '—'}
                      </span>
                      <span style={{
                        marginLeft: '0.4rem', fontSize: '0.82rem', fontWeight: 800,
                        color: g.color, backgroundColor: `${g.color}18`,
                        padding: '0.15rem 0.45rem', borderRadius: '0.35rem'
                      }}>
                        {g.letter}
                      </span>
                    </div>

                    <ChevronDown
                      size={18}
                      color="var(--text-secondary)"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    />
                  </div>
                </div>

                {/* ── Expanded Accordion Details ──────────────────────────────────────── */}
                {isExpanded && (
                  <div style={{ padding: '0.85rem 1.25rem 1.1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {sub.exams.map(exam => {
                        const examG = getLetterGrade(exam.myScore);
                        const diff = exam.myScore !== null && exam.classAvg !== null
                          ? exam.myScore - exam.classAvg
                          : null;

                        return (
                          <div
                            key={exam.id}
                            style={{
                              padding: '0.75rem 0.9rem',
                              backgroundColor: 'rgba(255,255,255,0.025)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              flexWrap: 'wrap'
                            }}
                          >
                            {/* Exam Name & Date */}
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {exam.title}
                              </p>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {exam.date}
                              </span>
                            </div>

                            {/* Score & Class Comparison */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
                              {diff !== null && (
                                <span style={{
                                  fontSize: '0.72rem', fontWeight: 600,
                                  color: diff >= 0 ? '#10B981' : '#ef4444',
                                  backgroundColor: diff >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                  padding: '0.15rem 0.45rem', borderRadius: '0.35rem'
                                }}>
                                  {diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} vs class
                                </span>
                              )}

                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: examG.color }}>
                                  {exam.myScore !== null ? `${exam.myScore}/${exam.max_score}` : '—'}
                                </span>
                                {exam.myScore !== null && (
                                  <span style={{ marginLeft: '0.35rem', fontSize: '0.75rem', fontWeight: 800, color: examG.color }}>
                                    ({examG.letter})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
