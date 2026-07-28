import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import {
  TrendingUp, Award, ChevronDown, ChevronUp, BarChart2, Star, Target
} from 'lucide-react';
import { MOCK_GRADES } from './mock/studentMockData';

/* ─── Helpers ─────────────────────────────────────────── */

const GRADE_COLOR = {
  'A+':'#10B981','A':'#10B981','A-':'#34D399',
  'B+':'#6366F1','B':'#6366F1','B-':'#818CF8',
  'C+':'#F59E0B','C':'#F59E0B','D':'#EF4444','F':'#DC2626',
};

const SUBJECT_DOT_COLORS = [
  '#10B981','#6366F1','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316',
];

/* ─── GPA Ring ─────────────────────────────────────────── */

function GpaRing({ gpa, size = 120 }) {
  const max = 4.0;
  const pct = (gpa / max);
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  const color = gpa >= 3.5 ? '#10B981' : gpa >= 3.0 ? '#6366F1' : gpa >= 2.0 ? '#F59E0B' : '#EF4444';

  return (
    <svg width={size} height={size} style={{ display:'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={10}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dashoffset 1s ease' }}/>
      <text x={size/2} y={size/2 - 6} textAnchor="middle" fill={color}
        fontSize={22} fontWeight={800}>{gpa.toFixed(2)}</text>
      <text x={size/2} y={size/2 + 16} textAnchor="middle" fill="var(--text-secondary)"
        fontSize={11} fontWeight={600}>GPA</text>
    </svg>
  );
}

/* ─── Expandable Grade Row ─────────────────────────────── */

function GradeRow({ subject, idx }) {
  const [open, setOpen] = useState(false);
  const dotColor = SUBJECT_DOT_COLORS[idx % SUBJECT_DOT_COLORS.length];
  const gradeColor = GRADE_COLOR[subject.grade] || 'var(--text-secondary)';

  return (
    <>
      <tr style={{ borderBottom:'1px solid var(--border-color)', cursor:'pointer' }}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => e.currentTarget.style.background='var(--bg-color)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >
        <td style={{ padding:'12px 16px',display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ width:10,height:10,borderRadius:'50%',background:dotColor,display:'inline-block',flexShrink:0 }}/>
          <span style={{ fontWeight:600,fontSize:14,color:'var(--text-primary)' }}>{subject.name}</span>
        </td>
        <td style={{ padding:'12px 8px',fontSize:13,color:'var(--text-secondary)',textAlign:'center' }}>
          {subject.quizAvg ?? '—'}%
        </td>
        <td style={{ padding:'12px 8px',fontSize:13,color:'var(--text-secondary)',textAlign:'center' }}>
          {subject.assignmentAvg ?? '—'}%
        </td>
        <td style={{ padding:'12px 8px',fontSize:13,color:'var(--text-secondary)',textAlign:'center' }}>
          {subject.midterm ?? '—'}%
        </td>
        <td style={{ padding:'12px 8px',fontSize:13,color:'var(--text-secondary)',textAlign:'center' }}>
          {subject.final ?? '—'}%
        </td>
        <td style={{ padding:'12px 8px',textAlign:'center' }}>
          <div style={{ display:'flex',alignItems:'center',gap:6,justifyContent:'center' }}>
            <div style={{
              width:60,height:6,borderRadius:3,background:'var(--border-color)',overflow:'hidden',
            }}>
              <div style={{ width:`${subject.overall}%`,height:'100%',borderRadius:3,background:gradeColor,transition:'width 1s'}}/>
            </div>
            <span style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)' }}>{subject.overall}%</span>
          </div>
        </td>
        <td style={{ padding:'12px 8px',textAlign:'center' }}>
          <span style={{
            background:`${gradeColor}20`,color:gradeColor,
            border:`1px solid ${gradeColor}40`,borderRadius:8,
            padding:'3px 10px',fontSize:13,fontWeight:800,
          }}>{subject.grade}</span>
        </td>
        <td style={{ padding:'12px 8px',textAlign:'center' }}>
          <span style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)' }}>{subject.gpa?.toFixed(2) ?? '—'}</span>
        </td>
        <td style={{ padding:'12px 8px',textAlign:'center' }}>
          {open ? <ChevronUp size={16} color="var(--text-secondary)"/> : <ChevronDown size={16} color="var(--text-secondary)"/>}
        </td>
      </tr>

      {/* Expanded Breakdown */}
      {open && subject.assessments?.length > 0 && (
        <tr style={{ background:'var(--bg-color)' }}>
          <td colSpan={9} style={{ padding:'0 16px 12px 16px' }}>
            <div style={{
              background:'var(--bg-surface)',borderRadius:10,
              border:'1px solid var(--border-color)',overflow:'hidden',marginTop:4,
            }}>
              <div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}><table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
                <thead>
                  <tr style={{ background:`${dotColor}14`,borderBottom:'1px solid var(--border-color)' }}>
                    {['Assessment','Type','Score','Max','Weight','Date'].map(h => (
                      <th key={h} style={{ padding:'8px 12px',textAlign:'left',
                        fontWeight:700,color:'var(--text-secondary)',fontSize:11,textTransform:'uppercase',letterSpacing:0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subject.assessments.map((a,i) => (
                    <tr key={i} style={{ borderBottom:'1px solid var(--border-color)' }}>
                      <td style={{ padding:'8px 12px',fontWeight:600,color:'var(--text-primary)' }}>{a.name}</td>
                      <td style={{ padding:'8px 12px',color:'var(--text-secondary)' }}>{a.type}</td>
                      <td style={{ padding:'8px 12px',fontWeight:700,color:dotColor }}>{a.score}</td>
                      <td style={{ padding:'8px 12px',color:'var(--text-secondary)' }}>{a.max}</td>
                      <td style={{ padding:'8px 12px',color:'var(--text-secondary)' }}>{a.weight}%</td>
                      <td style={{ padding:'8px 12px',color:'var(--text-secondary)' }}>{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Custom Tooltip ──────────────────────────────────── */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'var(--bg-surface)',border:'1px solid var(--border-color)',
      borderRadius:10,padding:'10px 16px',boxShadow:'0 8px 24px rgba(0,0,0,0.3)',
    }}>
      <p style={{ margin:'0 0 4px',fontSize:12,color:'var(--text-secondary)',fontWeight:600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ margin:0,fontSize:14,fontWeight:800,color:p.color }}>
          GPA {p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

/* ─── Section Header ──────────────────────────────────── */

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
      <div style={{
        width:36,height:36,borderRadius:10,
        background:'#10B98118',display:'flex',alignItems:'center',justifyContent:'center',
      }}>
        <Icon size={18} color="var(--primary)"/>
      </div>
      <div>
        <div style={{ fontWeight:700,fontSize:15,color:'var(--text-primary)' }}>{title}</div>
        {subtitle && <div style={{ fontSize:12,color:'var(--text-secondary)' }}>{subtitle}</div>}
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */

export default function StudentGrades() {
  const grades = MOCK_GRADES;

  const subjects = grades.subjects || [];
  const semesterTrend = grades.semesterTrend || [];
  const radarData = subjects.map(s => ({
    subject: s.name?.length > 10 ? s.name.slice(0,10)+'…' : s.name,
    score: s.overall,
  }));

  return (
    <div style={{ padding:'24px',maxWidth:1200,margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:0,fontSize:26,fontWeight:800,color:'var(--text-primary)',display:'flex',alignItems:'center',gap:10 }}>
          <BarChart2 size={26} color="var(--primary)"/>Academic Grades
        </h1>
        <p style={{ margin:'4px 0 0',fontSize:14,color:'var(--text-secondary)' }}>
          Semester {grades.semester || 'Spring 2026'} · {grades.academicYear || '2025–2026'}
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="glass-card" style={{ borderRadius:16,padding:'24px',marginBottom:24 }}>
        <div style={{ display:'flex',gap:32,alignItems:'center',flexWrap:'wrap' }}>
          {/* GPA Ring */}
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:8 }}>
            <GpaRing gpa={grades.gpa ?? 3.72} size={120}/>
            <span style={{ fontSize:12,color:'var(--text-secondary)',fontWeight:600 }}>Overall GPA</span>
          </div>

          <div style={{ width:'1px',height:80,background:'var(--border-color)' }}/>

          {/* Stat Cards */}
          {[
            { label:'Average Score', value:`${grades.avgScore ?? 87}%`, icon:Target, color:'#10B981' },
            { label:'Class Rank', value:`#${grades.rank ?? 4}`, icon:Award, color:'#F59E0B' },
            { label:'Trend', value: grades.trend ?? '+0.12', icon:TrendingUp, color: (grades.trend ?? '+0.12').startsWith('+') ? '#10B981' : '#EF4444' },
          ].map(({ label,value,icon:Icon,color }) => (
            <div key={label} style={{ display:'flex',flexDirection:'column',gap:6 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <div style={{
                  width:40,height:40,borderRadius:10,
                  background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',
                }}>
                  <Icon size={18} color={color}/>
                </div>
                <div>
                  <div style={{ fontSize:22,fontWeight:800,color:'var(--text-primary)' }}>{value}</div>
                  <div style={{ fontSize:11,color:'var(--text-secondary)',fontWeight:600 }}>{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24 }}>
        {/* Semester GPA Trend */}
        <div className="glass-card" style={{ borderRadius:16,padding:'20px' }}>
          <SectionHeader icon={TrendingUp} title="Semester GPA Trend" subtitle="Your GPA progression over time"/>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={semesterTrend} margin={{ top:5,right:16,left:-10,bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false}/>
              <XAxis dataKey="semester" tick={{ fontSize:11,fill:'var(--text-secondary)' }} axisLine={false} tickLine={false}/>
              <YAxis domain={[2.0,4.0]} tick={{ fontSize:11,fill:'var(--text-secondary)' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="gpa" stroke="#10B981" strokeWidth={3}
                dot={{ fill:'#10B981',r:5,strokeWidth:0 }}
                activeDot={{ r:7,fill:'#10B981' }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="glass-card" style={{ borderRadius:16,padding:'20px' }}>
          <SectionHeader icon={Star} title="Subject Performance Map" subtitle="Visual breakdown by subject"/>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} margin={{ top:0,right:20,bottom:0,left:20 }}>
              <PolarGrid stroke="var(--border-color)"/>
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:10,fill:'var(--text-secondary)' }}/>
              <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fontSize:9,fill:'var(--text-secondary)' }} tickCount={4}/>
              <Radar name="Score" dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.25} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Table */}
      <div className="glass-card" style={{ borderRadius:16,overflow:'hidden' }}>
        <div style={{ padding:'20px 20px 0' }}>
          <SectionHeader icon={BarChart2} title="Subject Grade Breakdown" subtitle="Click any row to see detailed assessment breakdown"/>
        </div>
        <div style={{ overflowX:'auto' }}>
          <div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}><table style={{ width:'100%',borderCollapse:'collapse',minWidth:780 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border-color)',background:'var(--bg-color)' }}>
                {['Subject','Quiz Avg','Assign. Avg','Mid-Term','Final Exam','Overall','Grade','GPA',''].map((h,i) => (
                  <th key={i} style={{
                    padding:'12px 8px',fontSize:11,fontWeight:700,
                    color:'var(--text-secondary)',textTransform:'uppercase',
                    letterSpacing:0.6,textAlign: i===0?'left':'center',
                    paddingLeft: i===0?16:8,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((s,i) => <GradeRow key={s.name} subject={s} idx={i}/>)}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}
