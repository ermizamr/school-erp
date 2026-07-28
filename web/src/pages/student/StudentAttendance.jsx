import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  CheckCircle2, XCircle, AlertTriangle, Calendar, Clock, User, AlertCircle
} from 'lucide-react';
import { MOCK_ATTENDANCE } from './mock/studentMockData';

/* ─── Helpers ─────────────────────────────────────────── */

const DAY_STATUS = {
  present: { color:'#10B981', bg:'#10B98130', label:'Present' },
  absent:  { color:'#EF4444', bg:'#EF444430', label:'Absent'  },
  late:    { color:'#F59E0B', bg:'#F59E0B30', label:'Late'    },
  weekend: { color:'#475569', bg:'#47556918', label:'Weekend' },
  holiday: { color:'#6366F1', bg:'#6366F130', label:'Holiday' },
  future:  { color:'transparent', bg:'transparent', label:''   },
};

/* ─── Attendance Ring ─────────────────────────────────── */

function AttendanceRing({ pct, size = 100 }) {
  const color = pct >= 90 ? '#10B981' : pct >= 75 ? '#F59E0B' : '#EF4444';
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} style={{ display:'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dashoffset 1s ease' }}/>
      <text x={size/2} y={size/2-4} textAnchor="middle" fill={color} fontSize={18} fontWeight={800}>{pct}%</text>
      <text x={size/2} y={size/2+14} textAnchor="middle" fill="var(--text-secondary)" fontSize={10} fontWeight={600}>ATTENDANCE</text>
    </svg>
  );
}

/* ─── KPI Card ─────────────────────────────────────────── */

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-card mobile-wrap" style={{
      borderRadius:14,padding:'18px 20px',display:'flex',
      alignItems:'center',gap:16,flex:1,minWidth:130,
    }}>
      <div style={{
        width:44,height:44,borderRadius:12,
        background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',
      }}>
        <Icon size={20} color={color}/>
      </div>
      <div>
        <div style={{ fontSize:24,fontWeight:800,color:'var(--text-primary)' }}>{value}</div>
        <div style={{ fontSize:12,color:'var(--text-secondary)',fontWeight:500 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── Calendar Grid ───────────────────────────────────── */

const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function buildCalendarDays(year, month, attendance) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1);
  // Monday-start: (0=Sun→6, 1=Mon→0, ..., 6=Sat→5)
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells = [];

  for (let i = 0; i < startOffset; i++) cells.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayOfWeek = new Date(year, month, d).getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const cellDate = new Date(year, month, d);
    const isFuture = cellDate > today;

    let status = 'future';
    if (isFuture) {
      status = 'future';
    } else if (isWeekend) {
      status = 'weekend';
    } else {
      const record = attendance.calendar?.[dateStr];
      status = record || 'present';
    }

    cells.push({ day: d, status, dateStr });
  }

  return cells;
}

function CalendarGrid({ year, month, attendance }) {
  const cells = buildCalendarDays(year, month, attendance);
  const monthName = new Date(year, month, 1).toLocaleString('default', { month:'long', year:'numeric' });

  return (
    <div>
      <div style={{ fontWeight:700,fontSize:15,color:'var(--text-primary)',marginBottom:12 }}>{monthName}</div>
      {/* Week headers */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,minmax(35px,1fr))',gap:4,marginBottom:6 }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{ textAlign:'center',fontSize:11,fontWeight:700,color:'var(--text-secondary)',padding:'4px 0' }}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,minmax(35px,1fr))',gap:4 }}>
        {cells.map((cell,i) => {
          if (!cell) return <div key={`empty-${i}`}/>;
          const st = DAY_STATUS[cell.status];
          return (
            <div key={cell.dateStr} title={st.label}
              style={{
                aspectRatio:'1',borderRadius:8,
                background: st.bg,
                border: `1px solid ${st.color}55`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:12,fontWeight:600,
                color: cell.status==='future' ? 'var(--text-secondary)' : st.color,
                opacity: cell.status==='future' ? 0.35 : 1,
                transition:'transform 0.1s',cursor: cell.status!=='future'?'default':'default',
              }}
              onMouseEnter={e => { if(cell.status!=='future') e.currentTarget.style.transform='scale(1.08)'; }}
              onMouseLeave={e => e.currentTarget.style.transform=''}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display:'flex',gap:14,marginTop:14,flexWrap:'wrap' }}>
        {Object.entries(DAY_STATUS).filter(([k])=>k!=='future').map(([k,v]) => (
          <div key={k} style={{ display:'flex',alignItems:'center',gap:5 }}>
            <div style={{ width:12,height:12,borderRadius:3,background:v.bg,border:`1px solid ${v.color}55` }}/>
            <span style={{ fontSize:11,color:'var(--text-secondary)',fontWeight:500 }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Custom Tooltip ──────────────────────────────────── */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'var(--bg-surface)',border:'1px solid var(--border-color)',
      borderRadius:10,padding:'10px 16px',boxShadow:'0 8px 24px rgba(0,0,0,0.3)',
    }}>
      <p style={{ margin:'0 0 4px',fontSize:12,color:'var(--text-secondary)',fontWeight:600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin:'2px 0',fontSize:13,fontWeight:700,color:p.fill }}>
          {p.name}: {p.value} days
        </p>
      ))}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */

export default function StudentAttendance() {
  const att = MOCK_ATTENDANCE;
  const pct = att.overallPct ?? Math.round((att.present / (att.present + att.absent + att.late)) * 100);
  const isAtRisk = pct < 80;

  // Use current month (July 2026) for calendar
  const CAL_YEAR = 2026;
  const CAL_MONTH = 6; // July (0-indexed)

  return (
    <div style={{ padding:'24px',maxWidth:1200,margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0,fontSize:26,fontWeight:800,color:'var(--text-primary)',display:'flex',alignItems:'center',gap:10 }}>
          <Calendar size={26} color="var(--primary)"/>Attendance
        </h1>
        <p style={{ margin:'4px 0 0',fontSize:14,color:'var(--text-secondary)' }}>
          Academic Year {att.academicYear || '2025–2026'}
        </p>
      </div>

      {/* At-Risk Banner */}
      {isAtRisk && (
        <div className="mobile-wrap"  style={{
          background:'#EF444412',border:'1px solid #EF444440',
          borderRadius:12,padding:'14px 20px',marginBottom:20,
          display:'flex',alignItems:'center',gap:12,
        }}>
          <AlertTriangle size={20} color="#EF4444"/>
          <div>
            <div style={{ fontWeight:700,fontSize:14,color:'#EF4444' }}>Attendance At-Risk Warning</div>
            <div style={{ fontSize:12,color:'var(--text-secondary)',marginTop:2 }}>
              Your attendance ({pct}%) is below the required 80% threshold. Please attend classes regularly to avoid academic penalties.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display:'flex',gap:14,marginBottom:24,flexWrap:'wrap' }}>
        <KpiCard label="Overall %" value={`${pct}%`} icon={CheckCircle2} color={pct>=90?'#10B981':pct>=75?'#F59E0B':'#EF4444'}/>
        <KpiCard label="Present Days" value={att.present} icon={CheckCircle2} color="#10B981"/>
        <KpiCard label="Absent Days" value={att.absent} icon={XCircle} color="#EF4444"/>
        <KpiCard label="Late Days" value={att.late} icon={AlertCircle} color="#F59E0B"/>
      </div>

      {/* Ring + Bar Chart Row */}
      <div style={{ display:'grid',gridTemplateColumns:'auto 1fr',gap:20,marginBottom:24 }}>
        {/* Ring */}
        <div className="glass-card" style={{
          borderRadius:16,padding:'24px 28px',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,
        }}>
          <AttendanceRing pct={pct} size={140}/>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)' }}>
              {att.present} / {(att.present||0)+(att.absent||0)+(att.late||0)} days
            </div>
            <div style={{ fontSize:11,color:'var(--text-secondary)',marginTop:2 }}>Total School Days</div>
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="glass-card" style={{ borderRadius:16,padding:'20px' }}>
          <div style={{ fontWeight:700,fontSize:15,color:'var(--text-primary)',marginBottom:4 }}>Monthly Attendance</div>
          <div style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:14 }}>Present vs Absent per month</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={att.monthly || []} margin={{ top:4,right:16,left:-10,bottom:4 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11,fill:'var(--text-secondary)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:'var(--text-secondary)' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Legend wrapperStyle={{ fontSize:12,color:'var(--text-secondary)' }}/>
              <Bar dataKey="present" name="Present" fill="#10B981" radius={[4,4,0,0]}/>
              <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-card" style={{ borderRadius:16,padding:'24px',marginBottom:24 }}>
        <div style={{ fontWeight:700,fontSize:15,color:'var(--text-primary)',marginBottom:4 }}>Calendar View</div>
        <div style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:20 }}>Day-by-day attendance status</div>
        <CalendarGrid year={CAL_YEAR} month={CAL_MONTH} attendance={att}/>
      </div>

      {/* Absence History Table */}
      {att.absences?.length > 0 && (
        <div className="glass-card" style={{ borderRadius:16,overflow:'hidden' }}>
          <div style={{ padding:'20px 20px 0' }}>
            <div style={{ fontWeight:700,fontSize:15,color:'var(--text-primary)',marginBottom:4 }}>Absence History</div>
            <div style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:16 }}>Record of all absences and tardiness</div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}><table style={{ width:'100%',borderCollapse:'collapse',minWidth:520 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border-color)',background:'var(--bg-color)' }}>
                  {['Date','Type','Reason','Status'].map(h => (
                    <th key={h} style={{
                      padding:'11px 16px',fontSize:11,fontWeight:700,
                      color:'var(--text-secondary)',textTransform:'uppercase',
                      letterSpacing:0.6,textAlign:'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {att.absences.map((ab,i) => {
                  const excused = ab.excused;
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid var(--border-color)' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-color)'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}
                    >
                      <td style={{ padding:'12px 16px',fontSize:13,fontWeight:600,color:'var(--text-primary)' }}>{ab.date}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{
                          background: ab.type==='absent'?'#EF444418':'#F59E0B18',
                          color: ab.type==='absent'?'#EF4444':'#F59E0B',
                          border: `1px solid ${ab.type==='absent'?'#EF444440':'#F59E0B40'}`,
                          borderRadius:6,padding:'2px 10px',fontSize:12,fontWeight:700,textTransform:'capitalize',
                        }}>{ab.type}</span>
                      </td>
                      <td style={{ padding:'12px 16px',fontSize:13,color:'var(--text-secondary)' }}>{ab.reason || '—'}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{
                          background: excused?'#10B98118':'#EF444418',
                          color: excused?'#10B981':'#EF4444',
                          border: `1px solid ${excused?'#10B98140':'#EF444440'}`,
                          borderRadius:6,padding:'2px 10px',fontSize:12,fontWeight:700,
                        }}>{excused?'Excused':'Unexcused'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );
}
