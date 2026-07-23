import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, ChevronRight, Flame, AlertCircle } from 'lucide-react';

const STATUS_CFG = {
  present: { color:'#10B981', bg:'rgba(16,185,129,0.18)', label:'Present'  },
  absent:  { color:'#ef4444', bg:'rgba(239,68,68,0.18)',  label:'Absent'   },
  late:    { color:'#f59e0b', bg:'rgba(245,158,11,0.18)', label:'Late'     },
  excused: { color:'#3b82f6', bg:'rgba(59,130,246,0.18)', label:'Excused'  },
};
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildGrid(year, month) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const grid = [];
  let week = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { grid.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); grid.push(week); }
  return grid;
}

export default function ParentAttendance({ child }) {
  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [records,   setRecords]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (child?.id) load(child.id);
    else setLoading(false);
  }, [child]);

  async function load(studentId) {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('attendance').select('date, status')
        .eq('student_id', studentId)
        .order('date', { ascending: true });
      setRecords(data || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }

  const attMap = {};
  records.forEach(r => { attMap[r.date] = r.status; });

  const monthStr   = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}`;
  const monthRecs  = records.filter(r => r.date.startsWith(monthStr));
  const mStats     = { present:0, absent:0, late:0, excused:0 };
  monthRecs.forEach(r => { mStats[r.status] = (mStats[r.status]||0)+1; });
  const mTotal = monthRecs.length;
  const mRate  = mTotal > 0 ? Math.round(((mStats.present+mStats.late)/mTotal)*100) : null;

  const totalAll   = records.length;
  const presentAll = records.filter(r=>r.status==='present'||r.status==='late').length;
  const overallRate= totalAll > 0 ? Math.round((presentAll/totalAll)*100) : null;

  // Streak
  let streak = 0;
  const todayStr = now.toISOString().split('T')[0];
  const sorted = [...records].sort((a,b)=>new Date(b.date)-new Date(a.date));
  for (const r of sorted) {
    if (r.date > todayStr) continue;
    if (r.status==='present'||r.status==='late') streak++;
    else break;
  }

  const grid = buildGrid(viewYear, viewMonth);
  const canGoNext = viewYear < now.getFullYear() || (viewYear===now.getFullYear() && viewMonth < now.getMonth());

  function prevMonth() {
    if (viewMonth===0) { setViewYear(y=>y-1); setViewMonth(11); } else setViewMonth(m=>m-1);
  }
  function nextMonth() {
    if (viewMonth===11) { setViewYear(y=>y+1); setViewMonth(0); } else setViewMonth(m=>m+1);
  }

  if (loading) return <div style={{ padding:'2rem', color:'var(--text-secondary)' }}>Loading attendance…</div>;

  if (!child?.id) return (
    <div className="glass-card" style={{ textAlign:'center', padding:'5rem 2rem' }}>
      <p>Select a child from the sidebar.</p>
    </div>
  );

  return (
    <div style={{ animation:'fadeSlideIn 0.3s ease-out' }}>
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ marginBottom:'0.25rem' }}>{child.first_name}'s Attendance</h1>
        <p>Month-by-month attendance calendar and statistics.</p>
      </div>

      {/* Warning */}
      {overallRate !== null && overallRate < 75 && (
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.4rem', backgroundColor:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'0.75rem', borderLeft:'4px solid #ef4444', marginBottom:'1.5rem' }}>
          <AlertCircle size={22} color="#ef4444" style={{ flexShrink:0 }}/>
          <p style={{ margin:0, fontSize:'0.875rem' }}>
            <strong style={{ color:'#ef4444' }}>Attendance at {overallRate}%</strong> — below the 75% minimum required to sit exams.
          </p>
        </div>
      )}

      {/* Attendance risk meter */}
      <div className="glass-card" style={{ marginBottom:'1.5rem', padding:'1.1rem 1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
          <span style={{ fontSize:'0.82rem', fontWeight:500 }}>Overall Attendance Rate</span>
          <span style={{ fontWeight:700, color: overallRate >= 80 ? '#10B981' : overallRate >= 60 ? '#f59e0b' : '#ef4444' }}>
            {overallRate !== null ? `${overallRate}%` : '—'}
          </span>
        </div>
        {/* Multi-segment bar: present | late | absent | excused */}
        <div style={{ height:'10px', borderRadius:'5px', overflow:'hidden', display:'flex', gap:'1px' }}>
          {totalAll > 0 ? Object.entries(mStats.present !== undefined ? {present:presentAll, absent:records.filter(r=>r.status==='absent').length, late:records.filter(r=>r.status==='late').length, excused:records.filter(r=>r.status==='excused').length} : {}).map(([key, val]) => (
            val > 0 && (
              <div key={key} style={{ flex:val, backgroundColor:STATUS_CFG[key]?.color, transition:'flex 0.5s ease' }}/>
            )
          )) : <div style={{ flex:1, backgroundColor:'rgba(255,255,255,0.06)' }}/>}
        </div>
        <div style={{ display:'flex', gap:'0.2rem', marginTop:'0.4rem' }}>
          {/* threshold marker at 75% */}
          <div style={{ position:'relative', width:'100%', height:'14px' }}>
            <div style={{ position:'absolute', left:'75%', top:0, width:'2px', height:'14px', backgroundColor:'#ef4444', opacity:0.6 }}/>
            <span style={{ position:'absolute', left:'75%', top:0, marginLeft:'4px', fontSize:'0.62rem', color:'#ef4444', whiteSpace:'nowrap' }}>75% min</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'1rem', marginBottom:'2rem' }}>
        <div className="glass-card" style={{ textAlign:'center', borderTop:`3px solid ${overallRate>=80?'#10B981':overallRate>=60?'#f59e0b':'#ef4444'}` }}>
          <p style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.4rem' }}>Overall</p>
          <div style={{ fontSize:'2rem', fontWeight:800, color:overallRate>=80?'#10B981':overallRate>=60?'#f59e0b':'#ef4444', lineHeight:1 }}>
            {overallRate !== null ? `${overallRate}%` : '—'}
          </div>
          <p style={{ fontSize:'0.78rem', marginTop:'0.3rem' }}>{presentAll}/{totalAll} days</p>
        </div>
        <div className="glass-card" style={{ textAlign:'center', borderTop:'3px solid #f97316' }}>
          <p style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.4rem' }}>Streak</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}>
            <Flame size={22} color="#f97316"/>
            <span style={{ fontSize:'2rem', fontWeight:800, color:'#f97316', lineHeight:1 }}>{streak}</span>
          </div>
          <p style={{ fontSize:'0.78rem', marginTop:'0.3rem' }}>days in a row</p>
        </div>
        <div className="glass-card" style={{ textAlign:'center', borderTop:'3px solid #ef4444' }}>
          <p style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.4rem' }}>Absences</p>
          <div style={{ fontSize:'2rem', fontWeight:800, color:'#ef4444', lineHeight:1 }}>
            {records.filter(r=>r.status==='absent').length}
          </div>
          <p style={{ fontSize:'0.78rem', marginTop:'0.3rem' }}>all time</p>
        </div>
        <div className="glass-card" style={{ textAlign:'center', borderTop:'3px solid #a78bfa' }}>
          <p style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.4rem' }}>This Month</p>
          <div style={{ fontSize:'2rem', fontWeight:800, color:'#a78bfa', lineHeight:1 }}>
            {mRate !== null ? `${mRate}%` : '—'}
          </div>
          <p style={{ fontSize:'0.78rem', marginTop:'0.3rem' }}>{MONTH_NAMES[viewMonth]}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <button onClick={prevMonth} style={{ background:'none', border:'1px solid var(--border-color)', borderRadius:'0.4rem', padding:'0.4rem 0.7rem', color:'white', cursor:'pointer' }}>
            <ChevronLeft size={18}/>
          </button>
          <h2 style={{ margin:0, fontSize:'1.2rem' }}>{MONTH_NAMES[viewMonth]} {viewYear}</h2>
          <button onClick={nextMonth} disabled={!canGoNext} style={{ background:'none', border:'1px solid var(--border-color)', borderRadius:'0.4rem', padding:'0.4rem 0.7rem', color:canGoNext?'white':'var(--text-secondary)', cursor:canGoNext?'pointer':'default', opacity:canGoNext?1:0.4 }}>
            <ChevronRight size={18}/>
          </button>
        </div>

        {/* Month summary strip */}
        {mTotal > 0 && (
          <div style={{ display:'flex', gap:'1.25rem', flexWrap:'wrap', marginBottom:'1.25rem', padding:'0.75rem 1rem', backgroundColor:'rgba(255,255,255,0.03)', borderRadius:'0.5rem' }}>
            {Object.entries(STATUS_CFG).map(([k,cfg]) => mStats[k]>0 && (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'3px', backgroundColor:cfg.color }}/>
                <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{cfg.label}: <strong style={{ color:cfg.color }}>{mStats[k]}</strong></span>
              </div>
            ))}
          </div>
        )}

        {/* Day headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'6px' }}>
          {DAY_NAMES.map(d=>(
            <div key={d} style={{ textAlign:'center', fontSize:'0.72rem', fontWeight:600, color:'var(--text-secondary)', padding:'0.3rem 0', textTransform:'uppercase', letterSpacing:'0.05em' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          {grid.map((week,wi)=>(
            <div key={wi} style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
              {week.map((day,di)=>{
                if (!day) return <div key={di}/>;
                const ds     = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const status = attMap[ds];
                const cfg    = status ? STATUS_CFG[status] : null;
                const isToday  = ds === todayStr;
                const isFuture = ds > todayStr;
                return (
                  <div key={di} title={status ? STATUS_CFG[status].label : 'No record'} style={{ aspectRatio:'1', borderRadius:'0.4rem', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:isToday?800:status?600:400, backgroundColor:cfg?cfg.bg:isFuture?'transparent':'rgba(255,255,255,0.03)', color:cfg?cfg.color:isFuture?'rgba(255,255,255,0.2)':'var(--text-secondary)', border:isToday?'2px solid var(--primary)':'1px solid transparent', minWidth:0 }}>
                    {day}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:'1.25rem', flexWrap:'wrap', marginTop:'1.5rem', paddingTop:'1rem', borderTop:'1px solid var(--border-color)' }}>
          {Object.entries(STATUS_CFG).map(([k,cfg])=>(
            <div key={k} style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <div style={{ width:'14px', height:'14px', borderRadius:'3px', backgroundColor:cfg.bg, border:`1px solid ${cfg.color}` }}/>
              <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
