import { useState, useRef } from 'react';
import {
  ClipboardList, Search, Filter, ChevronDown, ChevronUp,
  Paperclip, MessageSquare, Upload, X, CheckCircle2, Clock,
  AlertCircle, Star, BookOpen, Calendar, User, TrendingUp
} from 'lucide-react';
import { MOCK_ASSIGNMENTS } from './mock/studentMockData';

/* ─── Helpers ─────────────────────────────────────────── */

const STATUS_MAP = {
  pending:     { color: '#F59E0B', bg: '#F59E0B18', label: 'Pending',     icon: Clock },
  in_progress: { color: '#6366F1', bg: '#6366F118', label: 'In Progress', icon: TrendingUp },
  submitted:   { color: '#10B981', bg: '#10B98118', label: 'Submitted',   icon: CheckCircle2 },
  graded:      { color: '#8B5CF6', bg: '#8B5CF618', label: 'Graded',      icon: Star },
};

const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

const GRADE_COLOR = {
  'A+':'#10B981','A':'#10B981','A-':'#34D399',
  'B+':'#6366F1','B':'#6366F1','B-':'#818CF8',
  'C+':'#F59E0B','C':'#F59E0B','D':'#EF4444','F':'#DC2626',
};

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

function DueChip({ dueDate }) {
  const days = daysUntil(dueDate);
  if (days < 0) return (
    <span style={{ background:'#EF444418',color:'#EF4444',border:'1px solid #EF444440',
      borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700 }}>Overdue</span>
  );
  if (days === 0) return (
    <span style={{ background:'#EF444418',color:'#EF4444',border:'1px solid #EF444440',
      borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700 }}>Due Today</span>
  );
  if (days <= 3) return (
    <span style={{ background:'#F59E0B18',color:'#F59E0B',border:'1px solid #F59E0B40',
      borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700 }}>Due in {days}d</span>
  );
  return (
    <span style={{ background:'var(--bg-color)',color:'var(--text-secondary)',border:'1px solid var(--border-color)',
      borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:600 }}>Due in {days}d</span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { color:'#94A3B8', bg:'#94A3B818', label: status };
  const Icon = s.icon || Clock;
  return (
    <span style={{ background:s.bg,color:s.color,border:`1px solid ${s.color}44`,
      borderRadius:8,padding:'3px 10px',fontSize:12,fontWeight:700,
      display:'inline-flex',alignItems:'center',gap:5 }}>
      <Icon size={12}/>{s.label}
    </span>
  );
}

/* ─── Submission Modal ────────────────────────────────── */

function SubmitModal({ assignment, onClose, onSubmit }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const fileRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  }

  function handleFileChange(e) {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  }

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,padding:16,backdropFilter:'blur(4px)',
    }} onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="glass-card" style={{
        width:'100%',maxWidth:520,borderRadius:20,padding:28,
        boxShadow:'0 24px 80px rgba(0,0,0,0.5)',position:'relative',
        border:'1px solid var(--border-color)',
      }}>
        {/* Header */}
        <div className="mobile-wrap"  style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <div>
            <h2 style={{ margin:0,fontSize:18,fontWeight:800,color:'var(--text-primary)' }}>
              Submit Assignment
            </h2>
            <p style={{ margin:'4px 0 0',fontSize:13,color:'var(--text-secondary)' }}>
              {assignment.title}
            </p>
          </div>
          <button onClick={onClose} style={{
            background:'var(--bg-color)',border:'1px solid var(--border-color)',
            borderRadius:8,padding:6,cursor:'pointer',color:'var(--text-secondary)',
            display:'flex',alignItems:'center',
          }}><X size={18}/></button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border:`2px dashed ${dragging ? '#10B981' : 'var(--border-color)'}`,
            borderRadius:14,padding:'28px 20px',
            background: dragging ? '#10B98110' : 'var(--bg-color)',
            display:'flex',flexDirection:'column',alignItems:'center',
            gap:10,cursor:'pointer',transition:'all 0.2s',marginBottom:16,
          }}
        >
          <Upload size={28} color={dragging ? '#10B981' : 'var(--text-secondary)'} />
          <p style={{ margin:0,fontSize:13,color:'var(--text-secondary)',textAlign:'center' }}>
            <span style={{ color:'var(--primary)',fontWeight:700 }}>Click to upload</span> or drag and drop files here
          </p>
          <span style={{ fontSize:11,color:'var(--text-secondary)' }}>PDF, DOC, DOCX, ZIP (max 50MB)</span>
          <input ref={fileRef} type="file" multiple hidden onChange={handleFileChange}/>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:16 }}>
            {files.map((f,i) => (
              <div key={i} style={{
                display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
                background:'var(--bg-color)',borderRadius:8,border:'1px solid var(--border-color)',
              }}>
                <Paperclip size={14} color="var(--primary)"/>
                <span style={{ flex:1,fontSize:13,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{f.name}</span>
                <button onClick={() => setFiles(prev => prev.filter((_,j)=>j!==i))}
                  style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',padding:0 }}>
                  <X size={14}/>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <label style={{ fontSize:12,fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:6 }}>
          Notes for Teacher (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add any notes or comments about your submission..."
          rows={3}
          style={{
            width:'100%',boxSizing:'border-box',background:'var(--bg-color)',
            border:'1px solid var(--border-color)',borderRadius:10,
            color:'var(--text-primary)',fontSize:13,padding:'10px 12px',
            outline:'none',resize:'vertical',fontFamily:'inherit',marginBottom:20,
          }}
        />

        {/* Actions */}
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{
            background:'var(--bg-color)',color:'var(--text-secondary)',
            border:'1px solid var(--border-color)',borderRadius:10,
            padding:'10px 20px',fontSize:13,fontWeight:600,cursor:'pointer',
          }}>Cancel</button>
          <button onClick={() => onSubmit(files, notes)} style={{
            background:'var(--primary)',color:'#fff',border:'none',
            borderRadius:10,padding:'10px 24px',fontSize:13,fontWeight:700,cursor:'pointer',
            display:'flex',alignItems:'center',gap:8,
          }}>
            <CheckCircle2 size={15}/> Submit Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Assignment Card ─────────────────────────────────── */

function AssignmentCard({ assignment, onSubmit }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const s = STATUS_MAP[assignment.status] || STATUS_MAP.pending;
  const priorityColor = PRIORITY_COLOR[assignment.priority] || '#94A3B8';
  const gradeColor = GRADE_COLOR[assignment.grade] || 'var(--text-secondary)';

  const canSubmit = assignment.status === 'pending' || assignment.status === 'in_progress';
  const isGraded = assignment.status === 'graded';

  return (
    <>
      {showModal && (
        <SubmitModal
          assignment={assignment}
          onClose={() => setShowModal(false)}
          onSubmit={(files, notes) => {
            setShowModal(false);
            onSubmit(assignment.id, files, notes);
          }}
        />
      )}
      <div className="glass-card" style={{
        borderRadius:14,overflow:'hidden',
        borderLeft:`3px solid ${s.color}`,
        transition:'box-shadow 0.2s',
      }}>
        {/* Main Row */}
        <div style={{ padding:'16px 18px',display:'flex',alignItems:'flex-start',gap:14 }}>
          {/* Priority Dot */}
          <div style={{
            width:10,height:10,borderRadius:'50%',background:priorityColor,
            flexShrink:0,marginTop:4,boxShadow:`0 0 6px ${priorityColor}88`,
          }}/>

          {/* Content */}
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
              <span style={{ fontWeight:700,fontSize:15,color:'var(--text-primary)' }}>{assignment.title}</span>
              <StatusBadge status={assignment.status}/>
            </div>
            <div style={{ display:'flex',gap:16,marginTop:6,flexWrap:'wrap' }}>
              <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-secondary)' }}>
                <BookOpen size={12}/>{assignment.subject}
              </span>
              <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-secondary)' }}>
                <User size={12}/>{assignment.teacher}
              </span>
              <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text-secondary)' }}>
                <Calendar size={12}/>{assignment.dueDate}
              </span>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8,flexShrink:0 }}>
            <DueChip dueDate={assignment.dueDate}/>
            {isGraded && assignment.score !== undefined && (
              <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                <span style={{ fontSize:14,fontWeight:800,color:'var(--text-primary)' }}>
                  {assignment.score}/{assignment.maxScore}
                </span>
                <span style={{
                  background:`${gradeColor}22`,color:gradeColor,
                  border:`1px solid ${gradeColor}44`,borderRadius:6,
                  padding:'1px 8px',fontSize:12,fontWeight:700,
                }}>{assignment.grade}</span>
              </div>
            )}
          </div>

          <button onClick={() => setExpanded(v=>!v)} style={{
            background:'none',border:'none',cursor:'pointer',
            color:'var(--text-secondary)',padding:4,flexShrink:0,
          }}>
            {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          </button>
        </div>

        {/* Expanded Section */}
        {expanded && (
          <div style={{
            borderTop:'1px solid var(--border-color)',
            padding:'16px 18px 20px',
            display:'flex',flexDirection:'column',gap:14,
          }}>
            {/* Description */}
            {assignment.description && (
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:6 }}>Description</div>
                <p style={{ margin:0,fontSize:13,color:'var(--text-primary)',lineHeight:1.6,
                  background:'var(--bg-color)',borderRadius:10,padding:'10px 14px',
                  border:'1px solid var(--border-color)' }}>{assignment.description}</p>
              </div>
            )}

            {/* Attachments */}
            {assignment.attachments?.length > 0 && (
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:6 }}>Attachments</div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                  {assignment.attachments.map((att,i) => (
                    <div key={i} style={{
                      display:'flex',alignItems:'center',gap:6,
                      background:'var(--bg-color)',border:'1px solid var(--border-color)',
                      borderRadius:8,padding:'5px 12px',fontSize:12,color:'var(--text-primary)',cursor:'pointer',
                    }}>
                      <Paperclip size={12} color="var(--primary)"/>{att}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Feedback */}
            {isGraded && assignment.feedback && (
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:6 }}>
                  Teacher Feedback
                </div>
                <div style={{
                  background:'#8B5CF610',border:'1px solid #8B5CF640',
                  borderRadius:10,padding:'12px 14px',
                  display:'flex',gap:10,
                }}>
                  <MessageSquare size={16} color="#8B5CF6" style={{ flexShrink:0,marginTop:1 }}/>
                  <p style={{ margin:0,fontSize:13,color:'var(--text-primary)',lineHeight:1.6 }}>{assignment.feedback}</p>
                </div>
              </div>
            )}

            {/* Submission History */}
            {assignment.submittedAt && (
              <div className="mobile-scroll-x"  style={{
                display:'flex',alignItems:'center',gap:6,fontSize:12,
                color:'var(--text-secondary)',padding:'6px 12px',
                background:'var(--bg-color)',borderRadius:8,width:'fit-content',
              }}>
                <CheckCircle2 size={13} color="#10B981"/>
                Submitted on {assignment.submittedAt}
              </div>
            )}

            {/* Actions */}
            <div style={{ display:'flex',gap:10,marginTop:4 }}>
              {canSubmit && (
                <button onClick={() => setShowModal(true)} style={{
                  background:'var(--primary)',color:'#fff',border:'none',
                  borderRadius:10,padding:'9px 20px',fontSize:13,fontWeight:700,
                  cursor:'pointer',display:'flex',alignItems:'center',gap:8,
                }}>
                  <Upload size={14}/> Submit Assignment
                </button>
              )}
              {isGraded && (
                <button style={{
                  background:'#8B5CF618',color:'#8B5CF6',border:'1px solid #8B5CF644',
                  borderRadius:10,padding:'9px 20px',fontSize:13,fontWeight:700,
                  cursor:'pointer',display:'flex',alignItems:'center',gap:8,
                }}>
                  <MessageSquare size={14}/> View Feedback
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── KPI Card ────────────────────────────────────────── */

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-card mobile-wrap" style={{
      borderRadius:14,padding:'18px 20px',display:'flex',
      alignItems:'center',gap:16,flex:1,minWidth:140,
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

/* ─── Main Page ───────────────────────────────────────── */

const TAB_LIST = ['All', 'Pending', 'In Progress', 'Submitted', 'Graded'];
const TAB_KEY  = { 'All': null, 'Pending':'pending', 'In Progress':'in_progress', 'Submitted':'submitted', 'Graded':'graded' };

export default function StudentAssignments() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);

  const subjects = [...new Set(MOCK_ASSIGNMENTS.map(a => a.subject))];

  const filtered = assignments.filter(a => {
    const matchTab = !TAB_KEY[activeTab] || a.status === TAB_KEY[activeTab];
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !subjectFilter || a.subject === subjectFilter;
    return matchTab && matchSearch && matchSubject;
  });

  const counts = {
    total: assignments.length,
    pending: assignments.filter(a => a.status==='pending').length,
    submitted: assignments.filter(a => a.status==='submitted').length,
    graded: assignments.filter(a => a.status==='graded').length,
  };

  function handleSubmit(id) {
    setAssignments(prev => prev.map(a => a.id===id ? {...a, status:'submitted', submittedAt: new Date().toLocaleDateString() } : a));
  }

  return (
    <div style={{ padding:'24px',maxWidth:1100,margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0,fontSize:26,fontWeight:800,color:'var(--text-primary)',display:'flex',alignItems:'center',gap:10 }}>
          <ClipboardList size={26} color="var(--primary)"/>Assignments
        </h1>
        <p style={{ margin:'4px 0 0',fontSize:14,color:'var(--text-secondary)' }}>
          Manage and submit your coursework
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'flex',gap:14,marginBottom:24,flexWrap:'wrap' }}>
        <KpiCard label="Total" value={counts.total} icon={ClipboardList} color="#6366F1"/>
        <KpiCard label="Pending" value={counts.pending} icon={AlertCircle} color="#F59E0B"/>
        <KpiCard label="Submitted" value={counts.submitted} icon={CheckCircle2} color="#10B981"/>
        <KpiCard label="Graded" value={counts.graded} icon={Star} color="#8B5CF6"/>
      </div>

      {/* Search + Filter */}
      <div style={{ display:'flex',gap:12,marginBottom:20,flexWrap:'wrap' }}>
        <div style={{
          flex:1,minWidth:200,display:'flex',alignItems:'center',gap:10,
          background:'var(--bg-surface)',border:'1px solid var(--border-color)',
          borderRadius:10,padding:'8px 14px',
        }}>
          <Search size={15} color="var(--text-secondary)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search assignments..."
            style={{ background:'none',border:'none',outline:'none',color:'var(--text-primary)',fontSize:14,width:'100%' }}/>
        </div>
        <select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}
          style={{
            background:'var(--bg-surface)',border:'1px solid var(--border-color)',
            borderRadius:10,padding:'8px 14px',color:'var(--text-primary)',fontSize:13,
            outline:'none',cursor:'pointer',
          }}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="mobile-scroll-x"  style={{
        display:'flex',gap:4,marginBottom:20,
        background:'var(--bg-surface)',borderRadius:12,
        padding:4,width:'fit-content',border:'1px solid var(--border-color)',
      }}>
        {TAB_LIST.map(tab => {
          const key = TAB_KEY[tab];
          const count = key ? assignments.filter(a=>a.status===key).length : assignments.length;
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{
              background: isActive ? 'var(--primary)' : 'none',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border:'none',borderRadius:8,padding:'7px 14px',
              fontSize:13,fontWeight:isActive?700:500,cursor:'pointer',
              display:'flex',alignItems:'center',gap:6,transition:'all 0.15s',
            }}>
              {tab}
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-color)',
                borderRadius:20,padding:'0 7px',fontSize:11,fontWeight:700,
                color: isActive ? '#fff' : 'var(--text-secondary)',
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Assignment List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{
          padding:48,textAlign:'center',borderRadius:16,
          display:'flex',flexDirection:'column',alignItems:'center',gap:12,
        }}>
          <ClipboardList size={48} color="var(--text-secondary)" opacity={0.3}/>
          <p style={{ color:'var(--text-secondary)',fontSize:15,margin:0 }}>
            No assignments found
          </p>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {filtered.map(a => (
            <AssignmentCard key={a.id} assignment={a} onSubmit={handleSubmit}/>
          ))}
        </div>
      )}
    </div>
  );
}
