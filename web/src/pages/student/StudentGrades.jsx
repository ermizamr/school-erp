import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Award, TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';
import { getLetterGrade, calcGPA } from './StudentHome';

// Score bar component
function ScoreBar({ score, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  return (
    <div style={{ height: '7px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden', flex: 1 }}>
      <div
        style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.6s ease' }}
      />
    </div>
  );
}

// Compare to class average badge
function VsClass({ score, classAvg }) {
  if (classAvg === null || score === null) return null;
  const diff = score - classAvg;
  if (Math.abs(diff) < 1) return <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>≈ Class avg</span>;
  if (diff > 0) return (
    <span style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px' }}>
      <TrendingUp size={11} /> +{diff.toFixed(1)} vs class
    </span>
  );
  return (
    <span style={{ fontSize: '0.72rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '2px' }}>
      <TrendingDown size={11} /> {diff.toFixed(1)} vs class
    </span>
  );
}

export default function StudentGrades({ profile, enrollment }) {
  const [subjectData, setSubjectData] = useState([]); // [{subjectId, subjectName, exams:[{...}], avg, classAvgs}]
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    if (profile && enrollment) load();
    else setLoading(false);
  }, [profile, enrollment]);

  async function load() {
    setLoading(true);
    try {
      const studentId = profile.id;
      const sectionId = enrollment.section_id;

      // All exams in this section
      const { data: examsRaw } = await supabase
        .from('exams')
        .select('id, title, date, max_score, subjects(id, name)')
        .eq('section_id', sectionId)
        .order('date', { ascending: true });

      const exams = examsRaw || [];
      if (exams.length === 0) { setSubjectData([]); setLoading(false); return; }

      // This student's results
      const { data: myResults } = await supabase
        .from('exam_results')
        .select('exam_id, score')
        .eq('student_id', studentId)
        .in('exam_id', exams.map(e => e.id));

      // All class results for class avg
      const { data: classResults } = await supabase
        .from('exam_results')
        .select('exam_id, score')
        .in('exam_id', exams.map(e => e.id));

      // Build class avg per exam
      const classAvgMap = {};
      exams.forEach(e => {
        const scores = (classResults || []).filter(r => r.exam_id === e.id).map(r => Number(r.score));
        classAvgMap[e.id] = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      });

      // My score map
      const myScoreMap = {};
      (myResults || []).forEach(r => { myScoreMap[r.exam_id] = Number(r.score); });

      // Group by subject
      const bySubject = {};
      exams.forEach(exam => {
        const subId = exam.subjects?.id;
        const subName = exam.subjects?.name || 'Unknown';
        if (!bySubject[subId]) bySubject[subId] = { subjectId: subId, subjectName: subName, exams: [] };
        bySubject[subId].exams.push({
          id: exam.id,
          title: exam.title,
          date: exam.date,
          max_score: exam.max_score || 100,
          myScore: myScoreMap[exam.id] ?? null,
          classAvg: classAvgMap[exam.id],
        });
      });

      const arr = Object.values(bySubject).map(sub => {
        const scored = sub.exams.filter(e => e.myScore !== null);
        const avg = scored.length ? scored.reduce((a, b) => a + b.myScore, 0) / scored.length : null;
        const classOverallAvg = scored.length
          ? scored.reduce((a, b) => a + (b.classAvg || 0), 0) / scored.length
          : null;
        return { ...sub, avg, classOverallAvg, scoredCount: scored.length };
      });

      // Sort: subjects with scores first
      arr.sort((a, b) => (b.scoredCount - a.scoredCount));
      setSubjectData(arr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const allScores = subjectData.flatMap(s => s.exams.filter(e => e.myScore !== null).map(e => e.myScore));
  const gpa = calcGPA(allScores);
  const overallAvg = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null;
  const overallGrade = getLetterGrade(overallAvg);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading grades…</div>;

  return (
    <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>My Grades</h1>
          <p>Your complete academic record for this semester.</p>
        </div>
        {/* GPA badge */}
        {gpa && (
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: `${overallGrade.color}15`, border: `1px solid ${overallGrade.color}40`, borderRadius: '0.75rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem', color: 'var(--text-secondary)' }}>Semester GPA</p>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: overallGrade.color, lineHeight: 1 }}>{gpa}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: overallGrade.color }}>{overallGrade.letter}</div>
          </div>
        )}
      </div>

      {subjectData.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <BarChart2 size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No grades yet</h2>
          <p>Your teachers haven't entered any results yet. Check back soon.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {subjectData.map(sub => {
            const g = getLetterGrade(sub.avg);
            const isExpanded = expandedSubject === sub.subjectId;
            return (
              <div key={sub.subjectId} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Subject header row */}
                <button
                  onClick={() => setExpandedSubject(isExpanded ? null : sub.subjectId)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.1rem 1.5rem', fontFamily: 'inherit', textAlign: 'left',
                    borderLeft: `4px solid ${g.color}`,
                  }}
                >
                  {/* Subject name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{sub.subjectName}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {sub.scoredCount}/{sub.exams.length} exam{sub.exams.length !== 1 ? 's' : ''} graded
                      </span>
                    </div>
                    <ScoreBar score={sub.avg || 0} color={g.color} />
                  </div>
                  {/* Avg + Grade badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <VsClass score={sub.avg} classAvg={sub.classOverallAvg} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: g.color, lineHeight: 1 }}>
                        {sub.avg !== null ? sub.avg.toFixed(1) : '—'}
                      </div>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: `${g.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: g.color, fontSize: '0.9rem' }}>
                      {g.letter}
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▾
                    </span>
                  </div>
                </button>

                {/* Expanded exam rows */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-color)' }}>
                    {sub.exams.map((exam, idx) => {
                      const eg = getLetterGrade(exam.myScore);
                      const isPast = new Date(exam.date) < new Date();
                      return (
                        <div
                          key={exam.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '0.9rem 1.5rem 0.9rem 2rem',
                            borderBottom: idx < sub.exams.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            backgroundColor: 'rgba(255,255,255,0.01)',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{exam.title}</span>
                              {!isPast && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>Upcoming</span>}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{exam.date}</span>
                          </div>

                          {/* Class average comparison */}
                          {exam.classAvg !== null && (
                            <div style={{ textAlign: 'center', minWidth: '70px' }}>
                              <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: '0 0 0.15rem' }}>Class avg</p>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{exam.classAvg.toFixed(1)}</span>
                            </div>
                          )}

                          {/* Score bar + number */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '160px' }}>
                            <ScoreBar score={exam.myScore !== null ? exam.myScore : 0} max={exam.max_score} color={eg.color} />
                            <span style={{ fontWeight: 700, color: eg.color, minWidth: '32px', textAlign: 'right', fontSize: '0.9rem' }}>
                              {exam.myScore !== null ? exam.myScore : '—'}
                            </span>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: `${eg.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: eg.color, fontSize: '0.72rem', flexShrink: 0 }}>
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
      )}
    </div>
  );
}
