import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getLetterGrade, calcGPA } from '../../lib/grades';
import { Ring } from '../../lib/Ring';
import {
  TrendingUp, TrendingDown, Minus, BookOpen,
  CalendarCheck, Clock, AlertCircle, ChevronRight, Bell
} from 'lucide-react';

function CountdownChip({ dateStr }) {
  const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (days < 0)  return <span className="badge badge-blue">Past</span>;
  if (days === 0) return <span className="badge badge-red" style={{ animation: 'pulse 1.5s infinite' }}>Today!</span>;
  if (days <= 3)  return <span className="badge badge-red">{days}d left</span>;
  if (days <= 7)  return <span className="badge badge-yellow">{days}d left</span>;
  return <span className="badge badge-green">{days}d</span>;
}

export default function ParentHome({ child, enrollment, setActiveTab }) {
  const [examResults, setExamResults]       = useState([]);
  const [upcomingExams, setUpcomingExams]   = useState([]);
  const [attSummary, setAttSummary]         = useState({ present: 0, total: 0 });
  const [subjectScores, setSubjectScores]   = useState([]);
  const [recentNotifs, setRecentNotifs]     = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    if (child?.id) load(child.id, enrollment?.section_id);
    else setLoading(false);
  }, [child, enrollment]);

  async function load(studentId, sectionId) {
    setLoading(true);
    try {
      const today   = new Date().toISOString().split('T')[0];
      const in30    = new Date(Date.now() + 30*86400000).toISOString().split('T')[0];

      const [
        { data: results },
        { data: upcomingRaw },
        { data: attRaw },
        { data: notifRaw },
      ] = await Promise.all([
        supabase.from('exam_results')
          .select('score, exams(id, title, date, max_score, subjects(id, name))')
          .eq('student_id', studentId),

        sectionId
          ? supabase.from('exams')
              .select('id, title, date, subjects(name)')
              .eq('section_id', sectionId)
              .gte('date', today).lte('date', in30)
              .order('date', { ascending: true }).limit(4)
          : { data: [] },

        supabase.from('attendance')
          .select('status')
          .eq('student_id', studentId),

        supabase.from('notifications')
          .select('id, title, message, type, is_read, created_at')
          .eq('recipient_id', studentId)
          .order('created_at', { ascending: false })
          .limit(4),
      ]);

      // Attendance
      const att = attRaw || [];
      const present = att.filter(a => a.status === 'present' || a.status === 'late').length;
      setAttSummary({ present, total: att.length });

      // Group by subject
      const bySubject = {};
      (results || []).forEach(r => {
        if (!r.exams) return;
        const subId   = r.exams.subjects?.id;
        const subName = r.exams.subjects?.name || 'Unknown';
        if (!bySubject[subId]) bySubject[subId] = { name: subName, scores: [], exams: [] };
        bySubject[subId].scores.push(Number(r.score));
        bySubject[subId].exams.push({
          title: r.exams.title, date: r.exams.date,
          score: Number(r.score), max: r.exams.max_score,
        });
      });

      const subArr = Object.entries(bySubject).map(([id, d]) => ({
        id, name: d.name,
        avg: d.scores.length ? d.scores.reduce((a,b)=>a+b,0)/d.scores.length : null,
        exams: d.exams.sort((a,b)=>new Date(a.date)-new Date(b.date)),
      }));

      setExamResults(results || []);
      setUpcomingExams(upcomingRaw || []);
      setSubjectScores(subArr);
      setRecentNotifs(notifRaw || []);
    } catch (err) {
      console.error('ParentHome load error', err);
    } finally {
      setLoading(false);
    }
  }

  const allScores    = examResults.map(r => r.score).filter(s => s !== null);
  const overallAvg   = allScores.length ? allScores.reduce((a,b)=>a+Number(b),0)/allScores.length : null;
  const overallGrade = getLetterGrade(overallAvg);
  const gpa          = calcGPA(allScores);
  const attRate      = attSummary.total > 0 ? Math.round((attSummary.present/attSummary.total)*100) : null;
  const attColor     = attRate === null ? 'var(--text-secondary)' : attRate >= 80 ? '#10B981' : attRate >= 60 ? '#f59e0b' : '#ef4444';

  // Trend
  const sorted = [...examResults]
    .filter(r => r.score !== null && r.exams?.date)
    .sort((a,b) => new Date(a.exams.date) - new Date(b.exams.date));
  let trend = null;
  if (sorted.length >= 4) {
    const mid = Math.floor(sorted.length/2);
    const early = sorted.slice(0,mid).reduce((a,b)=>a+Number(b.score),0)/mid;
    const late  = sorted.slice(mid).reduce((a,b)=>a+Number(b.score),0)/(sorted.length-mid);
    const diff  = late - early;
    trend = diff > 3 ? 'up' : diff < -3 ? 'down' : 'stable';
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'55vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid var(--border-color)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
      <p>Loading {child?.first_name || 'child'}'s data…</p>
    </div>
  );

  if (!child?.id) return (
    <div className="glass-card" style={{ textAlign:'center', padding:'5rem 2rem' }}>
      <BookOpen size={48} style={{ color:'var(--text-secondary)', opacity:0.3, margin:'0 auto 1rem', display:'block' }} />
      <h2 style={{ marginBottom:'0.5rem' }}>No child selected</h2>
      <p>Select a child from the sidebar to view their progress.</p>
    </div>
  );

  return (
    <div style={{ animation:'fadeSlideIn 0.3s ease-out' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>

      {/* Header */}
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ marginBottom:'0.25rem' }}>
          {child.first_name}'s Overview
        </h1>
        <p>
          {enrollment
            ? `${enrollment.sections?.grades?.name} · Section ${enrollment.sections?.name}`
            : 'Academic progress at a glance'}
        </p>
      </div>

      {/* Low-attendance alert */}
      {attRate !== null && attRate < 75 && (
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.4rem', backgroundColor:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'0.75rem', borderLeft:'4px solid #ef4444', marginBottom:'1.5rem' }}>
          <AlertCircle size={22} color="#ef4444" style={{ flexShrink:0 }} />
          <div>
            <p style={{ fontWeight:600, color:'#ef4444', margin:0 }}>⚠️ Attendance Warning</p>
            <p style={{ margin:0, fontSize:'0.875rem' }}>
              {child.first_name}'s attendance is <strong style={{ color:'#ef4444' }}>{attRate}%</strong> — below the required 75% minimum. Please follow up with the school.
            </p>
          </div>
        </div>
      )}

      {/* Hero: GPA + Attendance rings */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1.25rem', marginBottom:'1.5rem' }}>

        {/* GPA */}
        <div
          className="glass-card"
          onClick={() => setActiveTab('grades')}
          style={{ display:'flex', alignItems:'center', gap:'1.25rem', borderTop:`3px solid ${overallGrade.color}`, cursor:'pointer' }}
        >
          <Ring pct={overallAvg || 0} size={74} stroke={7} color={overallGrade.color}>
            <span style={{ fontSize:'1.05rem', fontWeight:800, color:overallGrade.color, lineHeight:1 }}>{overallGrade.letter}</span>
          </Ring>
          <div>
            <p style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.3rem' }}>GPA</p>
            <div style={{ fontSize:'2rem', fontWeight:700, color:overallGrade.color, lineHeight:1 }}>{gpa || '—'}</div>
            {trend && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', marginTop:'0.4rem' }}>
                {trend==='up'     && <><TrendingUp  size={13} color="#10B981"/><span style={{ fontSize:'0.72rem', color:'#10B981'  }}>Improving</span></>}
                {trend==='down'   && <><TrendingDown size={13} color="#ef4444"/><span style={{ fontSize:'0.72rem', color:'#ef4444'  }}>Declining</span></>}
                {trend==='stable' && <><Minus        size={13} color="#f59e0b"/><span style={{ fontSize:'0.72rem', color:'#f59e0b'  }}>Steady</span></>}
              </div>
            )}
          </div>
        </div>

        {/* Attendance */}
        <div
          className="glass-card"
          onClick={() => setActiveTab('attendance')}
          style={{ display:'flex', alignItems:'center', gap:'1.25rem', borderTop:`3px solid ${attColor}`, cursor:'pointer' }}
        >
          <Ring pct={attRate || 0} size={74} stroke={7} color={attColor}>
            <span style={{ fontSize:'0.8rem', fontWeight:700, color:attColor, lineHeight:1 }}>
              {attRate !== null ? `${attRate}%` : '—'}
            </span>
          </Ring>
          <div>
            <p style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.3rem' }}>Attendance</p>
            <div style={{ fontSize:'1.75rem', fontWeight:700, lineHeight:1, color:attColor }}>
              {attSummary.present}<span style={{ fontSize:'1rem', color:'var(--text-secondary)' }}>/{attSummary.total}</span>
            </div>
            <p style={{ fontSize:'0.75rem', marginTop:'0.3rem' }}>days present</p>
          </div>
        </div>

        {/* Exams graded */}
        <div className="glass-card" style={{ borderTop:'3px solid #a78bfa' }}>
          <p style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>Exams Graded</p>
          <div style={{ fontSize:'2rem', fontWeight:700, color:'#a78bfa', lineHeight:1 }}>{allScores.length}</div>
          <p style={{ fontSize:'0.8rem', marginTop:'0.4rem' }}>
            {allScores.length > 0
              ? `Class avg: ${(allScores.reduce((a,b)=>a+Number(b),0)/allScores.length).toFixed(1)}`
              : 'No results yet'}
          </p>
        </div>

        {/* Upcoming */}
        <div className="glass-card" style={{ borderTop:'3px solid #f97316', cursor:'pointer' }} onClick={()=>setActiveTab('grades')}>
          <p style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>Upcoming Exams</p>
          <div style={{ fontSize:'2rem', fontWeight:700, color:'#f97316', lineHeight:1 }}>{upcomingExams.length}</div>
          <p style={{ fontSize:'0.8rem', marginTop:'0.4rem' }}>
            {upcomingExams.length > 0 ? `Next: ${upcomingExams[0].subjects?.name}` : 'None scheduled'}
          </p>
        </div>
      </div>

      {/* Two columns: Subject bars + Upcoming exams */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.5rem', marginBottom:'1.5rem' }}>

        {/* Subject performance */}
        <div className="glass-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h2 style={{ fontSize:'1.1rem', margin:0 }}>Subject Performance</h2>
            <button className="btn" onClick={()=>setActiveTab('grades')} style={{ fontSize:'0.75rem', padding:'0.3rem 0.7rem', border:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:'0.25rem' }}>
              Details <ChevronRight size={13}/>
            </button>
          </div>
          {subjectScores.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem 0' }}>
              <p style={{ color:'var(--text-secondary)' }}>No grades recorded yet.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
              {subjectScores.map(sub => {
                const g = getLetterGrade(sub.avg);
                const pct = sub.avg !== null ? Math.min(100, sub.avg) : 0;
                return (
                  <div key={sub.id}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
                      <span style={{ fontSize:'0.875rem', fontWeight:500 }}>{sub.name}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                        <span style={{ fontSize:'0.875rem', fontWeight:700, color:g.color }}>{sub.avg !== null ? sub.avg.toFixed(1) : '—'}</span>
                        <span style={{ fontSize:'0.72rem', fontWeight:700, color:g.color, backgroundColor:`${g.color}18`, padding:'0.1rem 0.4rem', borderRadius:'0.3rem' }}>{g.letter}</span>
                      </div>
                    </div>
                    <div style={{ height:'6px', backgroundColor:'rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', backgroundColor:g.color, borderRadius:'3px', transition:'width 0.7s ease' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming exams */}
        <div className="glass-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h2 style={{ fontSize:'1.1rem', margin:0 }}>Upcoming Exams</h2>
            <Clock size={18} color="var(--text-secondary)"/>
          </div>
          {upcomingExams.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem 0' }}>
              <CalendarCheck size={36} style={{ color:'var(--text-secondary)', opacity:0.3, margin:'0 auto 0.75rem', display:'block' }}/>
              <p>No exams in the next 30 days.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {upcomingExams.map(exam => {
                const days = Math.ceil((new Date(exam.date) - new Date())/86400000);
                const uc   = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : 'var(--primary)';
                return (
                  <div key={exam.id} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.85rem 1rem', backgroundColor:'var(--bg-surface-hover)', borderRadius:'0.65rem', borderLeft:`3px solid ${uc}` }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, margin:0, fontSize:'0.9rem' }}>{exam.title}</p>
                      <p style={{ margin:0, fontSize:'0.78rem', color:'var(--text-secondary)' }}>{exam.subjects?.name} · {exam.date}</p>
                    </div>
                    <CountdownChip dateStr={exam.date}/>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent teacher messages */}
      {recentNotifs.length > 0 && (
        <div className="glass-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h2 style={{ fontSize:'1.1rem', margin:0, display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <Bell size={18} color="var(--primary)"/> Recent Messages
            </h2>
            <button className="btn" onClick={()=>setActiveTab('messages')} style={{ fontSize:'0.75rem', padding:'0.3rem 0.7rem', border:'1px solid var(--border-color)' }}>
              View All
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {recentNotifs.map(n => (
              <div key={n.id} style={{ display:'flex', alignItems:'center', gap:'0.9rem', padding:'0.75rem 1rem', backgroundColor:'var(--bg-surface-hover)', borderRadius:'0.6rem', opacity: n.is_read ? 0.7 : 1 }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor: n.is_read ? 'var(--text-secondary)' : 'var(--primary)', flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight: n.is_read ? 400 : 600, margin:0, fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.title}</p>
                  <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.message}</p>
                </div>
                <span style={{ fontSize:'0.7rem', color:'var(--text-secondary)', flexShrink:0 }}>
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
