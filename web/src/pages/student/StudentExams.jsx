import { useState } from 'react';
import {
  Calendar, Clock, MapPin, Award, ChevronDown, ChevronUp,
  Printer, Download, BookOpen, Star, AlertCircle, Zap
} from 'lucide-react';
import { MOCK_EXAMS } from './mock/studentMockData';

/* ─── Helpers ─────────────────────────────────────────── */

const GRADE_COLOR = {
  'A+':'#10B981','A':'#10B981','A-':'#34D399',
  'B+':'#6366F1','B':'#6366F1','B-':'#818CF8',
  'C+':'#F59E0B','C':'#F59E0B','D':'#EF4444','F':'#DC2626',
};

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
}

/* ─── Countdown Card ──────────────────────────────────── */

function CountdownCard({ exam }) {
  const days = daysUntil(exam.date);
  const urgency = days <= 3 ? '#EF4444' : days <= 7 ? '#F59E0B' : '#10B981';

  return (
    <div style={{
      background:`linear-gradient(135deg, ${urgency}18 0%, ${urgency}06 100%)`,
      border:`1px solid ${urgency}44`,borderRadius:20,padding:'28px 32px',
      display:'flex',alignItems:'center',gap:32,flexWrap:'wrap',marginBottom:20,
      position:'relative',overflow:'hidden',
    }}>
      {/* Background Glow */}
      <div style={{
        position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',
        background:`${urgency}10`,filter:'blur(40px)',pointerEvents:'none',
      }}/>

      {/* Countdown Number */}
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
        <span style={{ fontSize:80,fontWeight:900,color:urgency,lineHeight:1 }}>{days}</span>
        <span style={{ fontSize:14,fontWeight:700,color:urgency,textTransform:'uppercase',letterSpacing:2 }}>
          {days === 1 ? 'Day' : 'Days'}
        </span>
        <span style={{ fontSize:11,color:'var(--text-secondary)',fontWeight:600 }}>Until Next Exam</span>
      </div>

      <div style={{ width:'1px',height:80,background:`${urgency}40` }}/>

      <div style={{ flex:1,minWidth:200 }}>
        <div style={{ fontSize:11,color:'var(--text-secondary)',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:6 }}>
          Next Exam
        </div>
        <div style={{ fontSize:22,fontWeight:800,color:'var(--text-primary)',marginBottom:10 }}>{exam.subject}</div>
        <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
          {[
            { icon:Calendar, text:formatDate(exam.date) },
            { icon:Clock, text:exam.time || '09:00 AM – 11:00 AM' },
            { icon:MapPin, text:`Room ${exam.room}` },
            { icon:Star, text:`Seat No: ${exam.seat || 'A-12'}` },
          ].map(({ icon:Icon, text }) => (
            <div key={text} style={{ display:'flex',alignItems:'center',gap:8 }}>
              <Icon size={14} color={urgency}/>
              <span style={{ fontSize:13,color:'var(--text-secondary)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Study Tip Chip */}
      <div style={{
        display:'flex',flexDirection:'column',gap:8,padding:'14px 18px',
        background:`${urgency}10`,border:`1px dashed ${urgency}40`,
        borderRadius:12,maxWidth:200,
      }}>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <Zap size={14} color={urgency}/>
          <span style={{ fontSize:11,fontWeight:800,color:urgency,textTransform:'uppercase',letterSpacing:0.8 }}>Study Tip</span>
        </div>
        <p style={{ margin:0,fontSize:12,color:'var(--text-secondary)',lineHeight:1.6 }}>
          {days <= 3
            ? '🔥 Focus on key topics. Review past papers. Get good sleep the night before.'
            : days <= 7
            ? '📚 Make a study schedule. Practice problems daily and take short breaks.'
            : '✅ Start early. Build strong notes and group study sessions help!'}
        </p>
      </div>
    </div>
  );
}

/* ─── Upcoming Exam Card ──────────────────────────────── */

function UpcomingExamCard({ exam }) {
  const days = daysUntil(exam.date);
  const chip = days <= 3
    ? { color:'#EF4444', bg:'#EF444418', border:'#EF444440' }
    : days <= 7
    ? { color:'#F59E0B', bg:'#F59E0B18', border:'#F59E0B40' }
    : { color:'#10B981', bg:'#10B98118', border:'#10B98140' };

  return (
    <div className="glass-card mobile-wrap" style={{
      borderRadius:14,padding:'16px 20px',
      display:'flex',alignItems:'center',gap:16,
      transition:'box-shadow 0.2s,transform 0.2s',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateX(4px)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(16,185,129,0.15)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
    >
      <div style={{
        width:44,height:44,borderRadius:12,
        background:'#10B98118',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
      }}>
        <BookOpen size={20} color="var(--primary)"/>
      </div>

      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontWeight:700,fontSize:14,color:'var(--text-primary)' }}>{exam.subject}</div>
        <div style={{ display:'flex',gap:14,marginTop:5,flexWrap:'wrap' }}>
          <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-secondary)' }}>
            <Calendar size={12}/>{formatDate(exam.date)}
          </span>
          <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-secondary)' }}>
            <Clock size={12}/>{exam.time || '09:00 AM'}
          </span>
          <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-secondary)' }}>
            <MapPin size={12}/>Room {exam.room}
          </span>
          <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-secondary)' }}>
            <Star size={12}/>Seat: {exam.seat || 'TBA'}
          </span>
        </div>
      </div>

      <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0 }}>
        <span style={{
          background:chip.bg,color:chip.color,border:`1px solid ${chip.border}`,
          borderRadius:8,padding:'4px 12px',fontSize:12,fontWeight:700,
        }}>{days === 0 ? 'Today!' : `${days}d left`}</span>
        <span style={{ fontSize:11,color:'var(--text-secondary)' }}>Max: {exam.maxScore || 100} pts</span>
      </div>
    </div>
  );
}

/* ─── Past Result Card ────────────────────────────────── */

function PastResultCard({ exam }) {
  const [open, setOpen] = useState(false);
  const gradeColor = GRADE_COLOR[exam.grade] || 'var(--text-secondary)';
  const scorePct = exam.maxScore ? Math.round((exam.score / exam.maxScore) * 100) : null;

  return (
    <div className="glass-card" style={{ borderRadius:14,overflow:'hidden',borderLeft:`3px solid ${gradeColor}` }}>
      <div className="mobile-wrap" 
        style={{ padding:'16px 20px',display:'flex',alignItems:'center',gap:16,cursor:'pointer' }}
        onClick={() => setOpen(v=>!v)}
      >
        <div style={{
          width:44,height:44,borderRadius:12,flexShrink:0,
          background:`${gradeColor}18`,display:'flex',alignItems:'center',justifyContent:'center',
        }}>
          <Award size={20} color={gradeColor}/>
        </div>

        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontWeight:700,fontSize:14,color:'var(--text-primary)' }}>{exam.subject}</div>
          <div style={{ display:'flex',gap:14,marginTop:4,flexWrap:'wrap' }}>
            <span style={{ fontSize:12,color:'var(--text-secondary)',display:'flex',alignItems:'center',gap:5 }}>
              <Calendar size={12}/>{formatDate(exam.date)}
            </span>
            {exam.rank && (
              <span style={{ fontSize:12,color:'var(--text-secondary)' }}>
                🏆 Rank #{exam.rank}
              </span>
            )}
          </div>
        </div>

        <div className="mobile-wrap"  style={{ display:'flex',alignItems:'center',gap:12,flexShrink:0 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:20,fontWeight:800,color:'var(--text-primary)' }}>
              {exam.score}/{exam.maxScore}
            </div>
            {scorePct !== null && (
              <div style={{ fontSize:11,color:'var(--text-secondary)' }}>{scorePct}%</div>
            )}
          </div>
          <span style={{
            background:`${gradeColor}20`,color:gradeColor,
            border:`1px solid ${gradeColor}44`,borderRadius:10,
            padding:'4px 12px',fontSize:16,fontWeight:900,
          }}>{exam.grade}</span>
          {open ? <ChevronUp size={16} color="var(--text-secondary)"/> : <ChevronDown size={16} color="var(--text-secondary)"/>}
        </div>
      </div>

      {/* Breakdown */}
      {open && exam.breakdown?.length > 0 && (
        <div style={{ borderTop:'1px solid var(--border-color)',padding:'14px 20px 16px' }}>
          <div style={{ fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:0.7,marginBottom:10 }}>
            Score Breakdown
          </div>
          <div style={{
            background:'var(--bg-color)',borderRadius:10,
            border:'1px solid var(--border-color)',overflow:'hidden',
          }}>
            <div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}><table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border-color)',background:`${gradeColor}10` }}>
                  {['Section','Score','Max','Percentage'].map(h => (
                    <th key={h} style={{
                      padding:'8px 14px',textAlign:'left',fontSize:11,fontWeight:700,
                      color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:0.5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exam.breakdown.map((b,i) => {
                  const pct = Math.round((b.score/b.max)*100);
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid var(--border-color)' }}>
                      <td style={{ padding:'9px 14px',fontWeight:600,color:'var(--text-primary)' }}>{b.section}</td>
                      <td style={{ padding:'9px 14px',fontWeight:700,color:gradeColor }}>{b.score}</td>
                      <td style={{ padding:'9px 14px',color:'var(--text-secondary)' }}>{b.max}</td>
                      <td style={{ padding:'9px 14px' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          <div style={{ flex:1,height:5,borderRadius:3,background:'var(--border-color)' }}>
                            <div style={{ width:`${pct}%`,height:'100%',borderRadius:3,background:gradeColor }}/>
                          </div>
                          <span style={{ fontSize:12,fontWeight:600,color:'var(--text-primary)',width:36,textAlign:'right' }}>{pct}%</span>
                        </div>
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

/* ─── Timetable Tab ───────────────────────────────────── */

function TimetableTab({ exams }) {
  const allExams = [...exams].sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      {/* Action Buttons */}
      <div style={{ display:'flex',gap:10,marginBottom:20,flexWrap:'wrap' }}>
        <button style={{
          display:'flex',alignItems:'center',gap:8,
          background:'var(--bg-surface)',color:'var(--text-secondary)',
          border:'1px solid var(--border-color)',borderRadius:10,
          padding:'9px 18px',fontSize:13,fontWeight:600,cursor:'pointer',
        }}>
          <Printer size={15}/> Print Timetable
        </button>
        <button style={{
          display:'flex',alignItems:'center',gap:8,
          background:'var(--primary)',color:'#fff',
          border:'none',borderRadius:10,
          padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer',
        }}>
          <Download size={15}/> Download Admit Card
        </button>
      </div>

      <div className="glass-card" style={{ borderRadius:16,overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}><table style={{ width:'100%',borderCollapse:'collapse',minWidth:640 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border-color)',background:'var(--bg-color)' }}>
                {['Date','Subject','Start','End','Room','Max Score','Status'].map(h => (
                  <th key={h} style={{
                    padding:'12px 16px',fontSize:11,fontWeight:700,
                    color:'var(--text-secondary)',textTransform:'uppercase',
                    letterSpacing:0.6,textAlign:'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allExams.map((ex,i) => {
                const isPast = ex.status === 'past';
                const isUpcoming = ex.status === 'upcoming';
                const statusColor = isPast ? '#10B981' : '#6366F1';
                return (
                  <tr key={i}
                    style={{ borderBottom:'1px solid var(--border-color)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-color)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}
                  >
                    <td style={{ padding:'12px 16px',fontWeight:600,color:'var(--text-primary)',fontSize:13,whiteSpace:'nowrap' }}>
                      {formatDate(ex.date)}
                    </td>
                    <td style={{ padding:'12px 16px',fontWeight:700,color:'var(--text-primary)',fontSize:13 }}>{ex.subject}</td>
                    <td style={{ padding:'12px 16px',color:'var(--text-secondary)',fontSize:13 }}>{ex.startTime || ex.time || '09:00'}</td>
                    <td style={{ padding:'12px 16px',color:'var(--text-secondary)',fontSize:13 }}>{ex.endTime || '11:00'}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{
                        display:'flex',alignItems:'center',gap:5,
                        fontSize:12,color:'var(--text-secondary)',
                      }}>
                        <MapPin size={11}/>Room {ex.room}
                      </span>
                    </td>
                    <td style={{ padding:'12px 16px',color:'var(--text-secondary)',fontSize:13 }}>{ex.maxScore || 100}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{
                        background:`${statusColor}18`,color:statusColor,
                        border:`1px solid ${statusColor}40`,
                        borderRadius:6,padding:'2px 10px',fontSize:12,fontWeight:700,textTransform:'capitalize',
                      }}>{ex.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */

const TABS = ['Upcoming', 'Past Results', 'Timetable'];

export default function StudentExams() {
  const [activeTab, setActiveTab] = useState('Upcoming');

  const upcomingExams = (MOCK_EXAMS || []).filter(e => e.status === 'upcoming')
    .sort((a,b) => new Date(a.date) - new Date(b.date));
  const pastExams = (MOCK_EXAMS || []).filter(e => e.status === 'past');
  const nextExam = upcomingExams[0];

  return (
    <div style={{ padding:'24px',maxWidth:1100,margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0,fontSize:26,fontWeight:800,color:'var(--text-primary)',display:'flex',alignItems:'center',gap:10 }}>
          <AlertCircle size={26} color="var(--primary)"/>Exams
        </h1>
        <p style={{ margin:'4px 0 0',fontSize:14,color:'var(--text-secondary)' }}>
          {upcomingExams.length} upcoming · {pastExams.length} completed
        </p>
      </div>

      {/* Tabs */}
      <div className="mobile-scroll-x"  style={{
        display:'flex',gap:4,marginBottom:24,
        background:'var(--bg-surface)',borderRadius:12,
        padding:4,width:'fit-content',border:'1px solid var(--border-color)',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{
              background: isActive ? 'var(--primary)' : 'none',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border:'none',borderRadius:8,padding:'8px 20px',
              fontSize:13,fontWeight:isActive?700:500,cursor:'pointer',
              transition:'all 0.15s',
            }}>{tab}</button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'Upcoming' && (
        <div>
          {/* Next Exam Countdown */}
          {nextExam ? (
            <CountdownCard exam={nextExam}/>
          ) : (
            <div className="glass-card" style={{
              borderRadius:16,padding:'32px',textAlign:'center',marginBottom:20,
              display:'flex',flexDirection:'column',alignItems:'center',gap:12,
            }}>
              <AlertCircle size={40} color="var(--text-secondary)" opacity={0.3}/>
              <p style={{ color:'var(--text-secondary)',fontSize:15,margin:0 }}>
                No upcoming exams scheduled
              </p>
            </div>
          )}

          {/* Upcoming Exam List */}
          {upcomingExams.length > 0 && (
            <div>
              <div style={{ fontWeight:700,fontSize:15,color:'var(--text-primary)',marginBottom:12 }}>
                All Upcoming Exams
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {upcomingExams.map(ex => (
                  <UpcomingExamCard key={ex.id} exam={ex}/>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Past Results' && (
        <div>
          {pastExams.length === 0 ? (
            <div className="glass-card" style={{
              padding:'48px',textAlign:'center',borderRadius:16,
              display:'flex',flexDirection:'column',alignItems:'center',gap:12,
            }}>
              <Award size={48} color="var(--text-secondary)" opacity={0.3}/>
              <p style={{ color:'var(--text-secondary)',fontSize:15,margin:0 }}>No past exam results yet</p>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {pastExams.map(ex => (
                <PastResultCard key={ex.id} exam={ex}/>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Timetable' && (
        <TimetableTab exams={MOCK_EXAMS || []}/>
      )}
    </div>
  );
}
