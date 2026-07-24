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
      // 1. Fetch all exams in the child's section (ordered by date for trajectory)
      const { data: examsRaw, error: examsErr } = await supabase
        .from('exams')
        .select('id, title, date, max_score, subjects(id, name)')
        .eq('section_id', sectionId)
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

      // Subjects with most graded exams first, then alphabetical
      arr.sort((a, b) =>
        b.gradedCount - a.gradedCount || a.subjectName.localeCompare(b.subjectName),
      );

      setSubjectData(arr);
    } catch (err) {
      console.error('ParentGrades load error', err);
      setError('Failed to load grades. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (child?.id && enrollment?.section_id) {
      load(child.id, enrollment.section_id);
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
        <>
          {/* ── Summary table ─────────────────────────────────────────────── */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Award size={18} color="#f59e0b" />
              <h2 style={{ fontSize: '1rem', margin: 0 }}>Grade Summary</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                {allScores.length} exam{allScores.length !== 1 ? 's' : ''} graded across {subjectData.length} subject{subjectData.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th style={{ textAlign: 'center' }}>Exams Graded</th>
                    <th style={{ textAlign: 'center' }}>Avg Score</th>
                    <th style={{ textAlign: 'center' }}>Percentage</th>
                    <th style={{ textAlign: 'center' }}>Grade</th>
                    <th style={{ textAlign: 'center' }}>Remarks</th>
                    <th style={{ textAlign: 'center' }}>vs Class</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectData.map(sub => {
                    const g   = getLetterGrade(sub.avg);
                    const pct = sub.avg !== null ? Math.min(100, sub.avg).toFixed(1) : null;
                    const diff = sub.avg !== null && sub.classOverall !== null
                      ? sub.avg - sub.classOverall
                      : null;
                    return (
                      <tr
                        key={sub.subjectId}
                        onClick={() => setExpandedId(prev => prev === sub.subjectId ? null : sub.subjectId)}
                        style={{ cursor: 'pointer' }}
                        title="Click to see individual exams"
                      >
                        {/* Subject name with colour accent */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '3px', height: '36px', backgroundColor: g.color, borderRadius: '2px', flexShrink: 0 }} />
                            <div>
                              <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{sub.subjectName}</p>
                              {sub.trend && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                                  {sub.trend === 'up'   && <TrendingUp   size={11} color="#10B981" />}
                                  {sub.trend === 'down' && <TrendingDown size={11} color="#ef4444" />}
                                  <span style={{ fontSize: '0.68rem', color: sub.trend === 'up' ? '#10B981' : sub.trend === 'down' ? '#ef4444' : 'var(--text-secondary)' }}>
                                    {sub.trend === 'up' ? 'Improving' : sub.trend === 'down' ? 'Declining' : 'Steady'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Exams graded count */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {sub.gradedCount}/{sub.exams.length}
                          </span>
                        </td>

                        {/* Average raw score */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: g.color }}>
                            {sub.avg !== null ? sub.avg.toFixed(1) : '—'}
                          </span>
                        </td>

                        {/* Percentage with mini fill bar */}
                        <td style={{ textAlign: 'center' }}>
                          {pct !== null ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: g.color }}>{pct}%</span>
                              <div style={{ width: '80px', height: '5px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', backgroundColor: g.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                              </div>
                            </div>
                          ) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                        </td>

                        {/* Letter grade badge */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '36px', height: '36px', borderRadius: '50%',
                            backgroundColor: `${g.color}20`, fontWeight: 800,
                            color: g.color, fontSize: '0.9rem',
                          }}>
                            {g.letter}
                          </div>
                        </td>

                        {/* Remarks */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.8rem', fontWeight: 500,
                            color: g.color,
                            backgroundColor: `${g.color}12`,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '1rem',
                            whiteSpace: 'nowrap',
                          }}>
                            {sub.avg !== null ? getRemark(sub.avg) : '—'}
                          </span>
                        </td>

                        {/* vs Class average */}
                        <td style={{ textAlign: 'center' }}>
                          {diff !== null ? (
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: diff > 1 ? '#10B981' : diff < -1 ? '#ef4444' : 'var(--text-secondary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px',
                            }}>
                              {diff > 1  && <TrendingUp   size={12} />}
                              {diff < -1 && <TrendingDown size={12} />}
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Overall totals row */}
                {overallAvg !== null && (
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan={2}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>
                          Overall Average
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: overallGrade.color }}>
                          {overallAvg.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: overallGrade.color }}>
                          {Math.min(100, overallAvg).toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '36px', height: '36px', borderRadius: '50%',
                          backgroundColor: `${overallGrade.color}20`,
                          fontWeight: 800, color: overallGrade.color, fontSize: '0.9rem',
                        }}>
                          {overallGrade.letter}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.8rem', fontWeight: 600,
                          color: overallGrade.color,
                          backgroundColor: `${overallGrade.color}12`,
                          padding: '0.2rem 0.6rem', borderRadius: '1rem',
                        }}>
                          {getRemark(overallAvg)}
                        </span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ── Per-subject expandable detail cards ───────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              ↓ Click any row in the table above, or a subject below, to see individual exam results.
            </p>

            {subjectData.map(sub => {
              const g      = getLetterGrade(sub.avg);
              const isOpen = expandedId === sub.subjectId;

              return (
                <div key={sub.subjectId} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Subject header button */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : sub.subjectId)}
                    style={{
                      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.5rem', fontFamily: 'inherit', textAlign: 'left',
                      borderLeft: `4px solid ${g.color}`,
                    }}
                  >
                    {/* Name + progress bar */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sub.subjectName}</span>
                        {sub.trend === 'up'   && <TrendingUp   size={14} color="#10B981" />}
                        {sub.trend === 'down' && <TrendingDown size={14} color="#ef4444" />}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {sub.gradedCount}/{sub.exams.length} graded
                        </span>
                      </div>
                      <ScoreBar score={sub.avg || 0} color={g.color} />
                    </div>

                    {/* Sparkline */}
                    {sub.trajectory.length >= 2 && (
                      <Sparkline scores={sub.trajectory} color={g.color} />
                    )}

                    {/* Class avg + grade */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      {sub.classOverall !== null && (
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', margin: '0 0 0.1rem' }}>Class avg</p>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.classOverall.toFixed(1)}</span>
                        </div>
                      )}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.45rem', fontWeight: 700, color: g.color, lineHeight: 1 }}>
                          {sub.avg !== null ? sub.avg.toFixed(1) : '—'}
                        </div>
                      </div>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: `${g.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, color: g.color, fontSize: '0.9rem',
                      }}>
                        {g.letter}
                      </div>
                      {/* Inquire with Teacher button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const inquiryText = `Hi, I would like to inquire about ${child?.first_name || 'my child'}'s test score and academic progress in ${sub.subjectName}.`;
                          navigate(`/parent/messages?subjectId=${sub.subjectId}&inquiry=${encodeURIComponent(inquiryText)}`);
                        }}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(245,158,11,0.1)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245,158,11,0.3)',
                          borderRadius: '0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <MessageSquare size={13} /> Inquire
                      </button>

                      <span style={{
                        color: 'var(--text-secondary)', fontSize: '1rem',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}>▾</span>
                    </div>
                  </button>

                  {/* Expanded exam rows */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border-color)' }}>
                      {sub.exams.map((exam, idx) => {
                        const eg   = getLetterGrade(exam.myScore);
                        const diff = exam.myScore !== null && exam.classAvg !== null
                          ? exam.myScore - exam.classAvg
                          : null;
                        const isPast = new Date(exam.date) < new Date();

                        return (
                          <div
                            key={exam.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '1rem',
                              padding: '0.85rem 1.5rem 0.85rem 2rem',
                              borderBottom: idx < sub.exams.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                              backgroundColor: 'rgba(255,255,255,0.01)',
                            }}
                          >
                            {/* Exam info */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                <p style={{ fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>{exam.title}</p>
                                {!isPast && (
                                  <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>Upcoming</span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{exam.date}</span>
                            </div>

                            {/* vs class */}
                            {diff !== null && (
                              <span style={{
                                fontSize: '0.72rem',
                                color: diff > 0 ? '#10B981' : diff < 0 ? '#ef4444' : 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0,
                              }}>
                                {diff > 0 ? <TrendingUp size={11} /> : diff < 0 ? <TrendingDown size={11} /> : null}
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)} vs class
                              </span>
                            )}

                            {/* Score bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '160px' }}>
                              <ScoreBar score={exam.myScore ?? 0} max={exam.max_score} color={eg.color} />
                              <span style={{ fontWeight: 700, color: eg.color, minWidth: '30px', textAlign: 'right', fontSize: '0.875rem' }}>
                                {exam.myScore !== null ? exam.myScore : '—'}
                              </span>
                              <div style={{
                                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                backgroundColor: `${eg.color}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, color: eg.color, fontSize: '0.7rem',
                              }}>
                                {eg.letter}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
