import { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, FileText, ClipboardList,
  Calendar, User, Mail, Clock, Award, Hash, MapPin, MessageCircle,
  ExternalLink, Search, Filter, Layers, BookMarked
} from 'lucide-react';
import {
  MOCK_SUBJECTS,
  MOCK_ASSIGNMENTS,
  MOCK_EXAMS,
  MOCK_MATERIALS
} from './mock/studentMockData';

const SUBJECT_COLORS = [
  { border: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: '#10B981' },
  { border: '#6366F1', bg: 'rgba(99,102,241,0.12)', icon: '#6366F1' },
  { border: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: '#F59E0B' },
  { border: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: '#EF4444' },
  { border: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', icon: '#8B5CF6' },
  { border: '#EC4899', bg: 'rgba(236,72,153,0.12)', icon: '#EC4899' },
  { border: '#14B8A6', bg: 'rgba(20,184,166,0.12)', icon: '#14B8A6' },
  { border: '#F97316', bg: 'rgba(249,115,22,0.12)', icon: '#F97316' },
];

const SUBJECT_ICONS = [BookOpen, Layers, FileText, BookMarked, ClipboardList, Award, Calendar, Hash];

const GRADE_COLORS = {
  'A+': '#10B981', 'A': '#10B981', 'A-': '#34D399',
  'B+': '#6366F1', 'B': '#6366F1', 'B-': '#818CF8',
  'C+': '#F59E0B', 'C': '#F59E0B', 'C-': '#FCD34D',
  'D': '#EF4444', 'F': '#DC2626',
};

const TABS = ['Materials', 'Assignments', 'Upcoming Exams', 'Teacher Info'];

function GradeBadge({ grade, score }) {
  const color = GRADE_COLORS[grade] || '#94A3B8';
  return (
    <span style={{
      background: `${color}22`,
      color,
      border: `1px solid ${color}55`,
      borderRadius: 8,
      padding: '2px 10px',
      fontSize: 13,
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }}>
      {grade}
      {score !== undefined && (
        <span style={{ fontWeight: 400, fontSize: 11, opacity: 0.85 }}>{score}%</span>
      )}
    </span>
  );
}

function SubjectCard({ subject, index }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Materials');
  const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  const Icon = SUBJECT_ICONS[index % SUBJECT_ICONS.length];

  const subjectMaterials = MOCK_MATERIALS.filter(m => m.subjectId === subject.id).slice(0, 3);
  const subjectAssignments = MOCK_ASSIGNMENTS.filter(a => a.subjectId === subject.id).slice(0, 3);
  const subjectExams = MOCK_EXAMS.filter(e => e.subjectId === subject.id && e.status === 'upcoming').slice(0, 3);

  return (
    <div className="glass-card" style={{
      borderLeft: `4px solid ${color.border}`,
      borderRadius: 16,
      padding: 0,
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${color.border}33`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Card Header */}
      <div style={{ padding: '20px 20px 16px 20px' }}>
        <div className="mobile-wrap"  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={24} color={color.icon} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{subject.name}</span>
                <span style={{
                  background: 'var(--bg-color)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  padding: '1px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}>{subject.code}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <User size={12} color="var(--text-secondary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{subject.teacher}</span>
              </div>
            </div>
          </div>
          <GradeBadge grade={subject.grade} score={subject.score} />
        </div>

        {/* Info Row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPin size={12} color="var(--text-secondary)" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subject.room || 'Room TBA'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Award size={12} color="var(--text-secondary)" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subject.credits} Credits</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={12} color="var(--text-secondary)" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subject.schedule || 'Mon, Wed, Fri'}</span>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
          <button
            style={{
              background: `${color.border}22`, color: color.border,
              border: `1px solid ${color.border}44`, borderRadius: 8,
              padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onClick={e => { e.stopPropagation(); setExpanded(true); setActiveTab('Materials'); }}
          >
            <FileText size={13} /> View Materials
          </button>
          <button
            style={{
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)', borderRadius: 8,
              padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <MessageCircle size={13} /> Message Teacher
          </button>
          <button
            style={{
              marginLeft: 'auto', background: 'transparent', color: 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', padding: 4,
              display: 'flex', alignItems: 'center',
            }}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable Section */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-color)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 20px' }}>
            {TABS.map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '12px 14px', fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
                  color: activeTab === tab ? color.border : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? `2px solid ${color.border}` : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                }}
              >{tab}</button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '16px 20px 20px 20px' }}>
            {activeTab === 'Materials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {subjectMaterials.length === 0 ? (
                  <EmptyState message="No materials uploaded yet" />
                ) : subjectMaterials.map(mat => (
                  <div className="mobile-wrap"  key={mat.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', background: 'var(--bg-color)',
                    borderRadius: 10, border: '1px solid var(--border-color)',
                  }}>
                    <FileText size={16} color={color.icon} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{mat.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{mat.type} · {mat.size || '2.4 MB'}</div>
                    </div>
                    <ExternalLink size={14} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'Assignments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {subjectAssignments.length === 0 ? (
                  <EmptyState message="No assignments for this subject" />
                ) : subjectAssignments.map(a => (
                  <div className="mobile-wrap"  key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', background: 'var(--bg-color)',
                    borderRadius: 10, border: '1px solid var(--border-color)',
                  }}>
                    <ClipboardList size={16} color={color.icon} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Due: {a.dueDate}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'Upcoming Exams' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {subjectExams.length === 0 ? (
                  <EmptyState message="No upcoming exams scheduled" />
                ) : subjectExams.map(ex => (
                  <div className="mobile-wrap"  key={ex.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', background: 'var(--bg-color)',
                    borderRadius: 10, border: '1px solid var(--border-color)',
                  }}>
                    <Calendar size={16} color={color.icon} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{ex.title || ex.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{ex.date} · {ex.time || '09:00 AM'} · {ex.room}</div>
                    </div>
                    <span style={{
                      background: '#6366F122', color: '#818CF8',
                      border: '1px solid #6366F144', borderRadius: 6,
                      padding: '2px 8px', fontSize: 11, fontWeight: 600,
                    }}>{ex.daysLeft ?? '?'} days</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'Teacher Info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: User, label: 'Name', value: subject.teacher },
                  { icon: Mail, label: 'Email', value: subject.teacherEmail || `${subject.teacher?.toLowerCase().replace(' ', '.')}@school.edu` },
                  { icon: Clock, label: 'Office Hours', value: subject.officeHours || 'Mon & Wed, 2:00 PM – 4:00 PM' },
                  { icon: MapPin, label: 'Office', value: subject.officeRoom || 'Faculty Block, Room 204' },
                ].map(({ icon: I, label, value }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '10px 14px', background: 'var(--bg-color)',
                    borderRadius: 10, border: '1px solid var(--border-color)',
                  }}>
                    <I size={16} color={color.icon} />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginTop: 1 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { color: '#F59E0B', bg: '#F59E0B22', label: 'Pending' },
    in_progress: { color: '#6366F1', bg: '#6366F122', label: 'In Progress' },
    submitted: { color: '#10B981', bg: '#10B98122', label: 'Submitted' },
    graded: { color: '#8B5CF6', bg: '#8B5CF622', label: 'Graded' },
  };
  const s = map[status] || { color: '#94A3B8', bg: '#94A3B822', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}44`,
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>{s.label}</span>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{
      padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)',
      fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <BookOpen size={28} opacity={0.3} />
      <span>{message}</span>
    </div>
  );
}

export default function StudentSubjects() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_SUBJECTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase()) ||
    s.teacher?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: 'var(--text-primary)',
          margin: 0, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <BookOpen size={26} color="var(--primary)" />
          My Subjects
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
          {filtered.length} subject{filtered.length !== 1 ? 's' : ''} enrolled this semester
        </p>
      </div>

      {/* Search + Filter Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderRadius: 10, padding: '8px 14px',
        }}>
          <Search size={15} color="var(--text-secondary)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects, teachers..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 14, width: '100%',
            }}
          />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderRadius: 10, padding: '8px 14px',
        }}>
          <Filter size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All Subjects</span>
        </div>
      </div>

      {/* Subject Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{
          padding: 48, textAlign: 'center', borderRadius: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <BookOpen size={48} color="var(--text-secondary)" opacity={0.3} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            No subjects found matching "{search}"
          </p>
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'var(--primary)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
            }}
          >Clear Search</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 20,
        }}>
          {filtered.map((subject, i) => (
            <SubjectCard key={subject.id} subject={subject} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
