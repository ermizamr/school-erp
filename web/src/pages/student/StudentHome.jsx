import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  TrendingUp, TrendingDown, Minus, BookOpen, CalendarCheck,
  Clock, Award, AlertCircle, ChevronRight
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRADE_BANDS = [
  { letter: 'A+', min: 95, color: '#10B981', gpa: 4.0 },
  { letter: 'A',  min: 90, color: '#10B981', gpa: 4.0 },
  { letter: 'A-', min: 85, color: '#34d399', gpa: 3.7 },
  { letter: 'B+', min: 80, color: '#3b82f6', gpa: 3.3 },
  { letter: 'B',  min: 75, color: '#3b82f6', gpa: 3.0 },
  { letter: 'B-', min: 70, color: '#60a5fa', gpa: 2.7 },
  { letter: 'C+', min: 65, color: '#f59e0b', gpa: 2.3 },
  { letter: 'C',  min: 60, color: '#f59e0b', gpa: 2.0 },
  { letter: 'C-', min: 55, color: '#fbbf24', gpa: 1.7 },
  { letter: 'D',  min: 50, color: '#f97316', gpa: 1.0 },
  { letter: 'F',  min: 0,  color: '#ef4444', gpa: 0.0 },
];

export function getLetterGrade(score) {
  if (score === null || score === undefined) return { letter: '—', color: 'var(--text-secondary)', gpa: null };
  const s = Number(score);
  return GRADE_BANDS.find(g => s >= g.min) || { letter: 'F', color: '#ef4444', gpa: 0.0 };
}

export function calcGPA(scores) {
  const valid = scores.filter(s => s !== null && s !== undefined);
  if (valid.length === 0) return null;
  const gpaPoints = valid.map(s => getLetterGrade(s).gpa);
  return (gpaPoints.reduce((a, b) => a + b, 0) / gpaPoints.length).toFixed(2);
}

// Circular progress ring (SVG)
function Ring({ pct, size = 80, stroke = 7, color = '#10B981', children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// Countdown chip for upcoming exams
function CountdownChip({ dateStr }) {
  const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return <span className="badge badge-blue">Past</span>;
  if (days === 0) return <span className="badge badge-red">Today!</span>;
  if (days <= 3) return <span className="badge badge-red">{days}d left</span>;
  if (days <= 7) return <span className="badge badge-yellow">{days}d left</span>;
  return <span className="badge badge-green">{days}d left</span>;
}

export default function StudentHome({ profile, enrollment, setActiveTab }) {
  const [examResults, setExamResults] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, total: 0 });
  const [subjectScores, setSubjectScores] = useState([]); // [{subject, avg, exams:[]}]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && enrollment) load();
    else setLoading(false);
  }, [profile, enrollment]);

  async function load() {
    setLoading(true);
    try {
      const studentId = profile.id;
      const sectionId = enrollment.section_id;
      const today = new Date().toISOString().split('T')[0];
      const in30 = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

      const [
        { data: results },
        { data: upcomingRaw },
        { data: attRaw },
      ] = await Promise.all([
        // All this student's exam results with exam+subject info
        supabase
          .from('exam_results')
          .select('score, exams(id, title, date, max_score, subjects(id, name))')
          .eq('student_id', studentId),

        // Upcoming exams in their section
        supabase
          .from('exams')
          .select('id, title, date, max_score, subjects(name)')
          .eq('section_id', sectionId)
          .gte('date', today)
          .lte('date', in30)
          .order('date', { ascending: true })
          .limit(4),

        // All attendance records for this student
        supabase
          .from('attendance')
          .select('status')
          .eq('student_id', studentId),
      ]);

      // Attendance summary
      const attAll = attRaw || [];
      const present = attAll.filter(a => a.status === 'present').length;
      const late = attAll.filter(a => a.status === 'late').length;
      setAttendanceSummary({ present: present + late, total: attAll.length });

      // Group scores by subject
      const bySubject = {};
      (results || []).forEach(r => {
        if (!r.exams) return;
        const subId = r.exams.subjects?.id;
        const subName = r.exams.subjects?.name || 'Unknown';
        if (!bySubject[subId]) bySubject[subId] = { name: subName, scores: [], exams: [] };
        bySubject[subId].scores.push(Number(r.score));
        bySubject[subId].exams.push({ title: r.exams.title, date: r.exams.date, score: Number(r.score), max: r.exams.max_score });
      });

      const subArr = Object.entries(bySubject).map(([id, data]) => ({
        id, name: data.name,
        avg: data.scores.length ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : null,
        exams: data.exams.sort((a, b) => new Date(a.date) - new Date(b.date)),
      }));
      setSubjectScores(subArr);
      setExamResults(results || []);
      setUpcomingExams(upcomingRaw || []);
    } catch (err) {
      console.error('StudentHome load error', err);
    } finally {
      setLoading(false);
    }
  }

  // Overall GPA from all scores
  const allScores = examResults.map(r => r.score).filter(s => s !== null);
  const gpa = calcGPA(allScores);
  const overallAvg = allScores.length ? (allScores.reduce((a, b) => a + Number(b), 0) / allScores.length) : null;
  const overallGrade = getLetterGrade(overallAvg);

  // Trend: compare first-half vs second-half of exams
  const sorted = [...examResults]
    .filter(r => r.score !== null && r.exams?.date)
    .sort((a, b) => new Date(a.exams.date) - new Date(b.exams.date));
  let trend = null;
  if (sorted.length >= 4) {
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid).reduce((a, b) => a + Number(b.score), 0) / mid;
    const secondHalf = sorted.slice(mid).reduce((a, b) => a + Number(b.score), 0) / (sorted.length - mid);
    const diff = secondHalf - firstHalf;
    if (diff > 3) trend = 'up';
    else if (diff < -3) trend = 'down';
    else trend = 'stable';
  }

  const attRate = attendanceSummary.total > 0
    ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100)
    : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>
          {greeting}, {profile?.first_name || 'Student'} 👋
        </h1>
        <p>
          {enrollment
            ? `${enrollment.sections?.grades?.name} · Section ${enrollment.sections?.name}`
            : 'Your academic overview is below.'}
        </p>
      </div>

      {/* Hero stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

        {/* GPA Card */}
        <div className="glass-card" style={{ borderTop: `3px solid ${overallGrade.color}`, display: 'flex', alignItems: 'center', gap: '1.25rem' }}
          onClick={() => setActiveTab('grades')} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setActiveTab('grades')}
          style={{ borderTop: `3px solid ${overallGrade.color}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
        >
          <Ring pct={overallAvg || 0} size={72} stroke={6} color={overallGrade.color}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: overallGrade.color, lineHeight: 1 }}>
              {overallGrade.letter}
            </span>
          </Ring>
          <div>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Overall GPA</p>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: overallGrade.color, lineHeight: 1 }}>
              {gpa || '—'}
            </div>
            {trend && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem' }}>
                {trend === 'up' && <><TrendingUp size={14} color="#10B981" /><span style={{ fontSize: '0.75rem', color: '#10B981' }}>Improving</span></>}
                {trend === 'down' && <><TrendingDown size={14} color="#ef4444" /><span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Declining</span></>}
                {trend === 'stable' && <><Minus size={14} color="#f59e0b" /><span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Steady</span></>}
              </div>
            )}
          </div>
        </div>

        {/* Attendance Card */}
        <div
          className="glass-card"
          onClick={() => setActiveTab('attendance')}
          style={{ borderTop: `3px solid ${attRate >= 80 ? '#10B981' : attRate >= 60 ? '#f59e0b' : '#ef4444'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
        >
          <Ring
            pct={attRate || 0}
            size={72} stroke={6}
            color={attRate >= 80 ? '#10B981' : attRate >= 60 ? '#f59e0b' : '#ef4444'}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: attRate >= 80 ? '#10B981' : attRate >= 60 ? '#f59e0b' : '#ef4444', lineHeight: 1 }}>
              {attRate !== null ? `${attRate}%` : '—'}
            </span>
          </Ring>
          <div>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Attendance</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
              {attendanceSummary.present}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/{attendanceSummary.total}</span>
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>days present</p>
          </div>
        </div>

        {/* Exams graded */}
        <div className="glass-card" style={{ borderTop: '3px solid #a78bfa' }}>
          <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Exams Graded</p>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#a78bfa', lineHeight: 1 }}>{allScores.length}</div>
          <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
            {allScores.length > 0
              ? `Avg score: ${(allScores.reduce((a,b)=>a+Number(b),0)/allScores.length).toFixed(1)}`
              : 'No results yet'}
          </p>
        </div>

        {/* Upcoming exams */}
        <div className="glass-card" style={{ borderTop: '3px solid #f97316', cursor: 'pointer' }} onClick={() => setActiveTab('grades')}>
          <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Upcoming Exams</p>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f97316', lineHeight: 1 }}>{upcomingExams.length}</div>
          <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
            {upcomingExams.length > 0
              ? `Next: ${upcomingExams[0].subjects?.name}`
              : 'None scheduled'}
          </p>
        </div>
      </div>

      {/* Two-column lower section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

        {/* Subject Performance */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Subject Performance</h2>
            <button
              className="btn"
              onClick={() => setActiveTab('grades')}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', border: '1px solid var(--border-color)' }}
            >
              Full Report <ChevronRight size={13} style={{ marginLeft: '2px' }} />
            </button>
          </div>
          {subjectScores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <BookOpen size={36} style={{ color: 'var(--text-secondary)', opacity: 0.3, margin: '0 auto 0.75rem', display: 'block' }} />
              <p style={{ fontSize: '0.9rem' }}>No grades recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {subjectScores.map(sub => {
                const g = getLetterGrade(sub.avg);
                const pct = sub.avg !== null ? Math.min(100, Math.max(0, sub.avg)) : 0;
                return (
                  <div key={sub.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{sub.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: g.color }}>
                          {sub.avg !== null ? sub.avg.toFixed(1) : '—'}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: g.color, backgroundColor: `${g.color}18`, padding: '0.1rem 0.4rem', borderRadius: '0.3rem' }}>
                          {g.letter}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: g.color, borderRadius: '3px', transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Upcoming Exams</h2>
            <Clock size={18} color="var(--text-secondary)" />
          </div>
          {upcomingExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CalendarCheck size={36} style={{ color: 'var(--text-secondary)', opacity: 0.3, margin: '0 auto 0.75rem', display: 'block' }} />
              <p style={{ fontSize: '0.9rem' }}>No exams in the next 30 days.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingExams.map(exam => {
                const days = Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24));
                const urgentColor = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : 'var(--primary)';
                return (
                  <div key={exam.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '0.65rem', borderLeft: `3px solid ${urgentColor}` }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{exam.title}</p>
                      <p style={{ margin: 0, fontSize: '0.78rem' }}>{exam.subjects?.name} · {exam.date}</p>
                    </div>
                    <CountdownChip dateStr={exam.date} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attendance Status Banner */}
        {attRate !== null && attRate < 75 && (
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.5rem', backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', borderLeft: '4px solid #ef4444' }}>
            <AlertCircle size={22} color="#ef4444" flexShrink={0} />
            <div>
              <p style={{ fontWeight: 600, color: '#ef4444', margin: 0 }}>Attendance Warning</p>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                Your attendance is <strong style={{ color: '#ef4444' }}>{attRate}%</strong>. Students must maintain at least 75% to sit exams.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
