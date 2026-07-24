import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getLetterGrade, calcGPA } from '../../lib/grades';
import { Ring } from '../../lib/Ring';
import {
  TrendingUp, TrendingDown, Minus, BookOpen,
  CalendarCheck, Clock, AlertCircle, ChevronRight, Bell,
  Megaphone, Calendar, Info, Sparkles, MessageSquare, ExternalLink, Filter, CheckCircle2, X
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
  const [schoolEvents, setSchoolEvents]     = useState([]);
  const [recentAbsence, setRecentAbsence]   = useState(null);
  const [loading, setLoading]               = useState(true);

  // Announcement filter & modal state
  const [noticeFilter, setNoticeFilter]     = useState('all'); // 'all', 'announcement', 'event', 'academic'
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    if (child?.id) load(child.id, enrollment?.section_id);
    else setLoading(false);
  }, [child, enrollment]);

  async function load(studentId, sectionId) {
    setLoading(true);
    try {
      const today   = new Date().toISOString().split('T')[0];
      const in30    = new Date(Date.now() + 30*86400000).toISOString().split('T')[0];
      const past7   = new Date(Date.now() - 7*86400000).toISOString().split('T')[0];

      const [
        { data: results },
        { data: upcomingRaw },
        { data: attRaw },
        { data: notifRaw },
        { data: absenceRaw },
        { data: eventsRaw },
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
          .select('status, date')
          .eq('student_id', studentId),

        supabase.from('notifications')
          .select('id, title, message, type, is_read, created_at')
          .or(`recipient_id.eq.${studentId},recipient_id.is.null`)
          .order('created_at', { ascending: false })
          .limit(10),

        supabase.from('attendance')
          .select('date')
          .eq('student_id', studentId)
          .eq('status', 'absent')
          .gte('date', past7)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase.from('events')
          .select('id, title, description, event_date, start_time, location, type')
          .order('event_date', { ascending: true })
          .limit(5),
      ]);

      setRecentAbsence(absenceRaw?.date || null);

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
      setSchoolEvents(eventsRaw || []);
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

  // Combine notifications & school events into unified school notices list
  const combinedNotices = [
    ...(recentNotifs || []).map(n => ({
      id: n.id,
      title: n.title,
      content: n.message,
      category: n.type || 'general',
      date: n.created_at,
      source: 'Official Administration Notice',
      isEvent: false,
    })),
    ...(schoolEvents || []).map(e => ({
      id: e.id,
      title: `📅 ${e.title}`,
      content: `${e.description || 'School Event'} | Location: ${e.location || 'School Campus'} | Time: ${e.start_time || 'TBA'}`,
      category: 'event',
      date: e.event_date,
      source: 'School Academic Calendar',
      isEvent: true,
    }))
  ].sort((a,b) => new Date(b.date) - new Date(a.date));

  // Filter notices
  const filteredNotices = combinedNotices.filter(n => {
    if (noticeFilter === 'all') return true;
    if (noticeFilter === 'announcement') return n.category === 'announcement' || n.category === 'general';
    if (noticeFilter === 'event') return n.category === 'event' || n.isEvent;
    if (noticeFilter === 'academic') return n.category === 'grade' || n.category === 'attendance' || n.category === 'finance';
    return true;
  });

  const getNoticeBadge = (category) => {
    switch (category) {
      case 'announcement':
      case 'general':
        return { label: '📢 Announcement', bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' };
      case 'event':
        return { label: '📌 Event / Assembly', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
      case 'grade':
      case 'academic':
        return { label: '🎓 Academic Notice', bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.3)' };
      case 'finance':
        return { label: '💡 Financial Notice', bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' };
      case 'attendance':
        return { label: '⚠️ Attendance Notice', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' };
      default:
        return { label: '📢 Notice', bg: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', border: 'var(--border-color)' };
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid var(--border-color)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
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
        <p style={{ color: 'var(--text-secondary)' }}>
          {enrollment
            ? `${enrollment.sections?.grades?.name} · Section ${enrollment.sections?.name}`
            : 'Academic progress at a glance'}
        </p>
      </div>

      {/* Automated Absence Notification Banner */}
      {recentAbsence && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', padding:'1rem 1.4rem', backgroundColor:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)', borderRadius:'0.75rem', borderLeft:'5px solid #ef4444', marginBottom:'1.5rem', boxShadow:'0 4px 20px rgba(239,68,68,0.15)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
            <AlertCircle size={24} color="#ef4444" style={{ flexShrink:0 }} />
            <div>
              <p style={{ fontWeight:700, color:'#ef4444', margin:'0 0 0.15rem', fontSize:'0.9rem' }}>
                🚨 Absence Alert
              </p>
              <p style={{ margin:0, fontSize:'0.875rem', color:'var(--text-primary)' }}>
                <strong>{child.first_name}</strong> was marked absent on <strong>{recentAbsence}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('messages')}
            className="btn"
            style={{
              padding:'0.5rem 1rem', backgroundColor:'#ef4444', color:'white',
              border:'none', borderRadius:'0.5rem', fontSize:'0.82rem', fontWeight:700,
              cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'0.4rem',
            }}
          >
            Contact Class Teacher
          </button>
        </div>
      )}

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

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px, 1fr))', gap:'1.25rem', marginBottom:'2rem' }}>
        
        {/* Overall GPA */}
        <div className="glass-card" style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
          <Ring score={overallAvg || 0} size={64} strokeWidth={6} color={overallGrade.color}>
            <span style={{ fontSize:'1rem', fontWeight:800, color:overallGrade.color }}>
              {gpa}
            </span>
          </Ring>
          <div>
            <p style={{ margin:0, fontSize:'0.78rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Overall GPA</p>
            <h3 style={{ margin:0, fontSize:'1.4rem', color:overallGrade.color }}>{overallGrade.letter} Grade</h3>
            <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>
              Avg {overallAvg !== null ? `${overallAvg.toFixed(1)}%` : 'No data'}
            </p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="glass-card" style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'50%', backgroundColor:`${attColor}18`, color:attColor, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.1rem', flexShrink:0 }}>
            {attRate !== null ? `${attRate}%` : '—'}
          </div>
          <div>
            <p style={{ margin:0, fontSize:'0.78rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Attendance</p>
            <h3 style={{ margin:0, fontSize:'1.2rem', color:attColor }}>
              {attRate === null ? 'No records' : attRate >= 80 ? 'Good' : 'Needs attention'}
            </h3>
            <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>
              {attSummary.present} of {attSummary.total} days present
            </p>
          </div>
        </div>

        {/* Academic Trend */}
        <div className="glass-card" style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'50%', backgroundColor: trend === 'up' ? 'rgba(16,185,129,0.15)' : trend === 'down' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: trend === 'up' ? '#10B981' : trend === 'down' ? '#ef4444' : '#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {trend === 'up'   && <TrendingUp   size={26} />}
            {trend === 'down' && <TrendingDown size={26} />}
            {(!trend || trend === 'stable') && <Minus size={26} />}
          </div>
          <div>
            <p style={{ margin:0, fontSize:'0.78rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Performance Trend</p>
            <h3 style={{ margin:0, fontSize:'1.2rem' }}>
              {trend === 'up' ? 'Improving 📈' : trend === 'down' ? 'Declining 📉' : 'Steady ➡️'}
            </h3>
            <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>
              Across recent exams
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Subject Performance & Upcoming Exams */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1.5rem', marginBottom:'2rem' }}>
        
        {/* Subject Performance */}
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

      {/* ─── SCHOOL ANNOUNCEMENTS & OFFICIAL NOTICES SECTION ─── */}
      <div className="glass-card" style={{ padding:'1.5rem', marginBottom:'2rem' }}>
        {/* Section Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem', borderBottom:'1px solid var(--border-color)', paddingBottom:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
            <div style={{ width:'38px', height:'38px', borderRadius:'0.6rem', backgroundColor:'rgba(59,130,246,0.15)', color:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Megaphone size={22} />
            </div>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <h2 style={{ fontSize:'1.15rem', margin:0 }}>School Announcements & Official Notices</h2>
                <span style={{ backgroundColor:'rgba(59,130,246,0.15)', color:'#3b82f6', fontSize:'0.7rem', fontWeight:700, padding:'0.15rem 0.5rem', borderRadius:'1rem' }}>
                  {filteredNotices.length} Notice{filteredNotices.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', margin:0 }}>Official broadcasts from EthioSchool Administration</p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
            {[
              { key:'all', label:'All Notices' },
              { key:'announcement', label:'📢 Broadcasts' },
              { key:'event', label:'📌 Events' },
              { key:'academic', label:'🎓 Academic' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setNoticeFilter(f.key)}
                style={{
                  padding:'0.35rem 0.75rem', fontSize:'0.78rem', borderRadius:'1rem',
                  border: noticeFilter === f.key ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  backgroundColor: noticeFilter === f.key ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: noticeFilter === f.key ? '#3b82f6' : 'var(--text-secondary)',
                  cursor:'pointer', fontWeight: noticeFilter === f.key ? 700 : 400,
                  transition:'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notices List */}
        {filteredNotices.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--text-secondary)' }}>
            <Bell size={36} style={{ opacity:0.3, margin:'0 auto 0.5rem', display:'block' }} />
            No official school notices under this filter category.
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'1rem' }}>
            {filteredNotices.map(n => {
              const badge = getNoticeBadge(n.category);
              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedNotice(n)}
                  style={{
                    padding:'1.1rem', borderRadius:'0.75rem',
                    backgroundColor:'rgba(255,255,255,0.02)',
                    border:`1px solid ${badge.border}`,
                    cursor:'pointer', transition:'all 0.2s',
                    display:'flex', flexDirection:'column', justifyContent:'space-between',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                >
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.65rem' }}>
                      <span style={{
                        fontSize:'0.7rem', fontWeight:700,
                        backgroundColor: badge.bg, color: badge.color,
                        padding:'0.2rem 0.55rem', borderRadius:'1rem',
                      }}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>
                        {new Date(n.date).toLocaleDateString([], { month:'short', day:'numeric' })}
                      </span>
                    </div>
                    <h3 style={{ fontSize:'0.95rem', margin:'0 0 0.4rem', fontWeight:600, color:'var(--text-primary)', lineHeight:1.35 }}>
                      {n.title}
                    </h3>
                    <p style={{
                      fontSize:'0.82rem', color:'var(--text-secondary)', margin:0,
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                    }}>
                      {n.content}
                    </p>
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.85rem', paddingTop:'0.6rem', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize:'0.68rem', color:'var(--text-secondary)', fontStyle:'italic' }}>
                      {n.source}
                    </span>
                    <span style={{ fontSize:'0.75rem', color: badge.color, fontWeight:600, display:'inline-flex', alignItems:'center', gap:'0.2rem' }}>
                      Read Notice <ChevronRight size={13}/>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Distinct Footer Divider to Teacher Direct Messages */}
        <div style={{ marginTop:'1.5rem', paddingTop:'1rem', borderTop:'1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem', backgroundColor:'rgba(245,158,11,0.04)', padding:'1rem 1.25rem', borderRadius:'0.65rem', border:'1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <MessageSquare size={20} color="#f59e0b" style={{ flexShrink:0 }} />
            <div>
              <p style={{ margin:0, fontWeight:600, fontSize:'0.875rem', color:'var(--text-primary)' }}>
                Need to discuss {child.first_name}'s progress directly with a teacher?
              </p>
              <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>
                Use the 1-on-1 Direct Messaging Portal to send real-time private messages to subject teachers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('messages')}
            className="btn"
            style={{
              padding:'0.45rem 0.9rem', backgroundColor:'rgba(245,158,11,0.15)',
              color:'#f59e0b', border:'1px solid rgba(245,158,11,0.3)',
              borderRadius:'0.5rem', fontSize:'0.8rem', fontWeight:700,
              cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.4rem', whiteSpace:'nowrap',
            }}
          >
            Open Teacher Messages <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Notice Inspection Modal */}
      {selectedNotice && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, bottom:0,
          backgroundColor:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
          zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'1.5rem',
        }}>
          <div className="glass-card" style={{ maxWidth:'550px', width:'100%', padding:'1.75rem', position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
              <div>
                <span style={{
                  fontSize:'0.72rem', fontWeight:700,
                  backgroundColor: getNoticeBadge(selectedNotice.category).bg,
                  color: getNoticeBadge(selectedNotice.category).color,
                  padding:'0.2rem 0.6rem', borderRadius:'1rem', display:'inline-block', marginBottom:'0.5rem',
                }}>
                  {getNoticeBadge(selectedNotice.category).label}
                </span>
                <h2 style={{ margin:0, fontSize:'1.2rem', lineHeight:1.3 }}>{selectedNotice.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                style={{ background:'none', border:'none', color:'white', cursor:'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:'1.25rem', borderBottom:'1px solid var(--border-color)', paddingBottom:'0.75rem', display:'flex', justifyContent:'space-between' }}>
              <span>Issued by: <strong>{selectedNotice.source}</strong></span>
              <span>Date: {new Date(selectedNotice.date).toLocaleDateString([], { year:'numeric', month:'long', day:'numeric' })}</span>
            </div>

            <div style={{ fontSize:'0.9rem', lineHeight:1.6, color:'var(--text-primary)', marginBottom:'1.5rem', whiteSpace:'pre-line' }}>
              {selectedNotice.content}
            </div>

            <button
              onClick={() => setSelectedNotice(null)}
              className="btn btn-primary"
              style={{ width:'100%', padding:'0.75rem' }}
            >
              Close Notice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
