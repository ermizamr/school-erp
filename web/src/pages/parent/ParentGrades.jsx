import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getLetterGrade, calcGPA } from '../../lib/grades';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

function ScoreBar({ score, max = 100, color }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  return (
    <div style={{ height:'7px', backgroundColor:'rgba(255,255,255,0.07)', borderRadius:'4px', overflow:'hidden', flex:1 }}>
      <div style={{ width:`${pct}%`, height:'100%', backgroundColor:color, borderRadius:'4px', transition:'width 0.6s ease' }}/>
    </div>
  );
}

// Mini horizontal sparkline for score trajectory per subject
function Sparkline({ scores, color }) {
  if (!scores || scores.length < 2) return null;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const h = 32, w = 80;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((s - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ flexShrink:0, overflow:'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      {scores.map((s, i) => {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((s - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color}/>;
      })}
    </svg>
  );
}

export default function ParentGrades({ child, enrollment }) {
  const [subjectData, setSubjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (child?.id && enrollment?.section_id) load(child.id, enrollment.section_id);
    else setLoading(false);
  }, [child, enrollment]);

  async function load(studentId, sectionId) {
    setLoading(true);
    try {
      const { data: examsRaw } = await supabase
        .from('exams')
        .select('id, title, date, max_score, subjects(id, name)')
        .eq('section_id', sectionId)
        .order('date', { ascending: true });

      const exams = examsRaw || [];
      if (!exams.length) { setSubjectData([]); setLoading(false); return; }

      const [{ data: myResults }, { data: classResults }] = await Promise.all([
        supabase.from('exam_results').select('exam_id, score').eq('student_id', studentId).in('exam_id', exams.map(e=>e.id)),
        supabase.from('exam_results').select('exam_id, score').in('exam_id', exams.map(e=>e.id)),
      ]);

      const classAvgMap = {};
      exams.forEach(e => {
        const sc = (classResults||[]).filter(r=>r.exam_id===e.id).map(r=>Number(r.score));
        classAvgMap[e.id] = sc.length ? sc.reduce((a,b)=>a+b,0)/sc.length : null;
      });
      const myScoreMap = {};
      (myResults||[]).forEach(r => { myScoreMap[r.exam_id] = Number(r.score); });

      const bySubject = {};
      exams.forEach(exam => {
        const sid = exam.subjects?.id;
        const sn  = exam.subjects?.name || 'Unknown';
        if (!bySubject[sid]) bySubject[sid] = { subjectId:sid, subjectName:sn, exams:[] };
        bySubject[sid].exams.push({
          id:exam.id, title:exam.title, date:exam.date,
          max_score:exam.max_score||100,
          myScore:myScoreMap[exam.id]??null,
          classAvg:classAvgMap[exam.id],
        });
      });

      const arr = Object.values(bySubject).map(sub => {
        const scored = sub.exams.filter(e=>e.myScore!==null);
        const avg = scored.length ? scored.reduce((a,b)=>a+b.myScore,0)/scored.length : null;
        const classOverall = scored.length ? scored.reduce((a,b)=>a+(b.classAvg||0),0)/scored.length : null;
        const trajectory = sub.exams.filter(e=>e.myScore!==null).map(e=>e.myScore);
        // Trend per subject
        let trend = null;
        if (trajectory.length >= 3) {
          const mid = Math.floor(trajectory.length/2);
          const early = trajectory.slice(0,mid).reduce((a,b)=>a+b,0)/mid;
          const late  = trajectory.slice(mid).reduce((a,b)=>a+b,0)/(trajectory.length-mid);
          trend = late-early > 3 ? 'up' : late-early < -3 ? 'down' : 'stable';
        }
        return { ...sub, avg, classOverall, scoredCount:scored.length, trajectory, trend };
      }).sort((a,b)=>b.scoredCount-a.scoredCount);

      setSubjectData(arr);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const allScores = subjectData.flatMap(s => s.exams.filter(e=>e.myScore!==null).map(e=>e.myScore));
  const gpa = calcGPA(allScores);
  const overallAvg = allScores.length ? allScores.reduce((a,b)=>a+b,0)/allScores.length : null;
  const overallGrade = getLetterGrade(overallAvg);

  if (loading) return <div style={{ padding:'2rem', color:'var(--text-secondary)' }}>Loading grades…</div>;

  if (!child?.id) return (
    <div className="glass-card" style={{ textAlign:'center', padding:'5rem 2rem' }}>
      <p>Select a child from the sidebar to view their grades.</p>
    </div>
  );

  return (
    <div style={{ animation:'fadeSlideIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ marginBottom:'0.25rem' }}>{child.first_name}'s Grades</h1>
          <p>Subject-by-subject academic performance this semester.</p>
        </div>
        {gpa && (
          <div style={{ padding:'0.75rem 1.5rem', backgroundColor:`${overallGrade.color}15`, border:`1px solid ${overallGrade.color}40`, borderRadius:'0.75rem', textAlign:'center' }}>
            <p style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.2rem', color:'var(--text-secondary)' }}>Semester GPA</p>
            <div style={{ fontSize:'2rem', fontWeight:800, color:overallGrade.color, lineHeight:1 }}>{gpa}</div>
            <div style={{ fontSize:'0.8rem', fontWeight:700, color:overallGrade.color }}>{overallGrade.letter}</div>
          </div>
        )}
      </div>

      {subjectData.length === 0 ? (
        <div className="glass-card" style={{ textAlign:'center', padding:'5rem 2rem' }}>
          <BarChart2 size={48} style={{ color:'var(--text-secondary)', opacity:0.3, margin:'0 auto 1rem', display:'block' }}/>
          <h2 style={{ fontSize:'1.25rem', marginBottom:'0.5rem' }}>No grades yet</h2>
          <p>Teachers haven't entered results yet.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {subjectData.map(sub => {
            const g = getLetterGrade(sub.avg);
            const isExp = expanded === sub.subjectId;
            return (
              <div key={sub.subjectId} className="glass-card" style={{ padding:0, overflow:'hidden' }}>
                {/* Subject header */}
                <button
                  onClick={()=>setExpanded(isExp ? null : sub.subjectId)}
                  style={{ width:'100%', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'1rem', padding:'1.1rem 1.5rem', fontFamily:'inherit', textAlign:'left', borderLeft:`4px solid ${g.color}` }}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, fontSize:'1rem' }}>{sub.subjectName}</span>
                      {sub.trend === 'up'   && <TrendingUp   size={15} color="#10B981"/>}
                      {sub.trend === 'down' && <TrendingDown size={15} color="#ef4444"/>}
                      <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>
                        {sub.scoredCount}/{sub.exams.length} graded
                      </span>
                    </div>
                    <div style={{ height:'6px', backgroundColor:'rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ width:`${sub.avg||0}%`, height:'100%', backgroundColor:g.color, borderRadius:'3px', transition:'width 0.7s ease' }}/>
                    </div>
                  </div>

                  {/* Sparkline trajectory */}
                  {sub.trajectory.length >= 2 && (
                    <Sparkline scores={sub.trajectory} color={g.color}/>
                  )}

                  {/* Avg + grade */}
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexShrink:0 }}>
                    {sub.classOverall !== null && (
                      <div style={{ textAlign:'center' }}>
                        <p style={{ fontSize:'0.62rem', color:'var(--text-secondary)', margin:'0 0 0.1rem' }}>Class avg</p>
                        <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{sub.classOverall.toFixed(1)}</span>
                      </div>
                    )}
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'1.5rem', fontWeight:700, color:g.color, lineHeight:1 }}>{sub.avg !== null ? sub.avg.toFixed(1) : '—'}</div>
                    </div>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', backgroundColor:`${g.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:g.color, fontSize:'0.9rem' }}>{g.letter}</div>
                    <span style={{ color:'var(--text-secondary)', transform: isExp ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>▾</span>
                  </div>
                </button>

                {/* Expanded exam rows */}
                {isExp && (
                  <div style={{ borderTop:'1px solid var(--border-color)' }}>
                    {sub.exams.map((exam, idx) => {
                      const eg   = getLetterGrade(exam.myScore);
                      const diff = exam.myScore !== null && exam.classAvg !== null ? exam.myScore - exam.classAvg : null;
                      return (
                        <div key={exam.id} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.9rem 1.5rem 0.9rem 2rem', borderBottom: idx < sub.exams.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', backgroundColor:'rgba(255,255,255,0.01)' }}>
                          <div style={{ flex:1 }}>
                            <p style={{ fontWeight:500, margin:0, fontSize:'0.9rem' }}>{exam.title}</p>
                            <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{exam.date}</span>
                          </div>
                          {/* vs class */}
                          {diff !== null && (
                            <span style={{ fontSize:'0.75rem', color: diff > 0 ? '#10B981' : diff < 0 ? '#ef4444' : 'var(--text-secondary)', display:'flex', alignItems:'center', gap:'2px', flexShrink:0 }}>
                              {diff > 0 ? <TrendingUp size={12}/> : diff < 0 ? <TrendingDown size={12}/> : null}
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)} vs class
                            </span>
                          )}
                          {/* score bar */}
                          <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', minWidth:'160px' }}>
                            <ScoreBar score={exam.myScore||0} max={exam.max_score} color={eg.color}/>
                            <span style={{ fontWeight:700, color:eg.color, minWidth:'30px', textAlign:'right', fontSize:'0.9rem' }}>
                              {exam.myScore !== null ? exam.myScore : '—'}
                            </span>
                            <div style={{ width:'28px', height:'28px', borderRadius:'50%', backgroundColor:`${eg.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:eg.color, fontSize:'0.72rem', flexShrink:0 }}>
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
