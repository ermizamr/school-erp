import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Edit, Printer, Download, MessageSquare,
  AlertOctagon, MoreHorizontal, User, BookOpen, GraduationCap,
  BarChart2, ClipboardList, DollarSign, Heart, Bus, Home, Library,
  Shield, FileText, Clock, Users,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getStudentById } from '../../lib/studentApi';
import AvatarCell from '../../components/students/AvatarCell';
import StatusBadge from '../../components/students/StatusBadge';

// ── Tabs ───────────────────────────────────────────────────────
import OverviewTab      from './tabs/OverviewTab';
import AcademicTab      from './tabs/AcademicTab';
import AttendanceTab    from './tabs/AttendanceTab';
import GradesTab        from './tabs/GradesTab';
import ExamResultsTab   from './tabs/ExamResultsTab';
import AssignmentsTab   from './tabs/AssignmentsTab';
import FinanceTab       from './tabs/FinanceTab';
import MedicalTab       from './tabs/MedicalTab';
import BehaviorTab      from './tabs/BehaviorTab';
import ParentsTab       from './tabs/ParentsTab';
import LibraryTab       from './tabs/LibraryTab';
import TransportTab     from './tabs/TransportTab';
import HostelTab        from './tabs/HostelTab';
import DocumentsTab     from './tabs/DocumentsTab';
import TimelineTab      from './tabs/TimelineTab';

// ── Tab config ─────────────────────────────────────────────────
const TABS = [
  { key: 'overview',    label: 'Overview',    icon: User },
  { key: 'academic',    label: 'Academic',    icon: GraduationCap },
  { key: 'attendance',  label: 'Attendance',  icon: BarChart2 },
  { key: 'grades',      label: 'Grades',      icon: BookOpen },
  { key: 'exams',       label: 'Exams',       icon: GraduationCap },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
  { key: 'finance',     label: 'Finance',     icon: DollarSign },
  { key: 'medical',     label: 'Medical',     icon: Heart },
  { key: 'behavior',    label: 'Behavior',    icon: Shield },
  { key: 'parents',     label: 'Parents',     icon: Users },
  { key: 'library',     label: 'Library',     icon: BookOpen },
  { key: 'transport',   label: 'Transport',   icon: Bus },
  { key: 'hostel',      label: 'Hostel',      icon: Home },
  { key: 'documents',   label: 'Documents',   icon: FileText },
  { key: 'timeline',    label: 'Timeline',    icon: Clock },
];

// ── Loading skeleton ───────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-card" style={{ height: 160, animation: 'pulse 1.5s infinite' }} />
      <div className="glass-card" style={{ height: 48, animation: 'pulse 1.5s infinite' }} />
      <div className="glass-card" style={{ height: 400, animation: 'pulse 1.5s infinite' }} />
    </div>
  );
}

// ── Small QuickStat ────────────────────────────────────────────
function QStat({ label, value, color = 'var(--primary)' }) {
  return (
    <div style={{ textAlign: 'center', padding: '0.75rem 1rem', minWidth: 80 }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function StudentProfile() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const [student, setStudent]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    getStudentById(id)
      .then(data => { setStudent(data); })
      .catch(() => toast.error('Failed to load student profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ProfileSkeleton />;
  if (!student) return (
    <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
      <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Student Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The student record could not be found.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard/students')}>← Back to Students</button>
    </div>
  );

  const attColor = student.attendance_percentage >= 90 ? '#10B981' : student.attendance_percentage >= 75 ? '#f59e0b' : '#ef4444';
  const gpaColor = student.gpa >= 3.5 ? '#10B981' : student.gpa >= 2.5 ? '#f59e0b' : '#ef4444';

  const tabContent = {
    overview:    <OverviewTab    student={student} />,
    academic:    <AcademicTab    student={student} />,
    attendance:  <AttendanceTab  student={student} />,
    grades:      <GradesTab      student={student} />,
    exams:       <ExamResultsTab student={student} />,
    assignments: <AssignmentsTab student={student} />,
    finance:     <FinanceTab     student={student} />,
    medical:     <MedicalTab     student={student} />,
    behavior:    <BehaviorTab    student={student} />,
    parents:     <ParentsTab     student={student} />,
    library:     <LibraryTab     student={student} />,
    transport:   <TransportTab   student={student} />,
    hostel:      <HostelTab      student={student} />,
    documents:   <DocumentsTab   student={student} />,
    timeline:    <TimelineTab    student={student} />,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Breadcrumb ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <button
          onClick={() => navigate('/dashboard/students')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontWeight: 500, padding: 0 }}
        >
          <ChevronLeft size={15} /> Students
        </button>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{student.first_name} {student.last_name}</span>
      </div>

      {/* ── Profile Header Card ────────────────────────── */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <AvatarCell firstName={student.first_name} lastName={student.last_name} photoUrl={student.photo_url} size={80} />

          {/* Core info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
              </h1>
              <StatusBadge status={student.enrollment_status} size="md" />
              {student.scholarship && (
                <span style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.375rem', border: '1px solid rgba(167,139,250,0.25)' }}>
                  🏆 {student.scholarship}
                </span>
              )}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{student.student_id}</span>
              {' · '}{student.grade_name} {student.section_name && `· Section ${student.section_name}`}
              {student.roll_number && ` · Roll #${student.roll_number}`}
              {' · '}{student.admission_date && `Admitted ${student.admission_date}`}
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {student.house && (
                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', padding: '0.2rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.78rem', fontWeight: 500 }}>
                  🏠 {student.house}
                </span>
              )}
              {student.has_transport && (
                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', padding: '0.2rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.78rem', fontWeight: 500 }}>
                  🚌 Bus
                </span>
              )}
              {student.has_hostel && (
                <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', padding: '0.2rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.78rem', fontWeight: 500 }}>
                  🏠 Boarding
                </span>
              )}
              <StatusBadge status={student.fee_status} />
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <QStat label="Attendance" value={`${student.attendance_percentage?.toFixed(0) ?? '—'}%`} color={attColor} />
            <div style={{ width: 1, background: 'var(--border-color)', margin: '0.5rem 0' }} />
            <QStat label="Avg Grade" value={`${student.average_grade?.toFixed(1) ?? '—'}`} color="#3b82f6" />
            <div style={{ width: 1, background: 'var(--border-color)', margin: '0.5rem 0' }} />
            <QStat label="GPA" value={student.gpa?.toFixed(2) ?? '—'} color={gpaColor} />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => toast.info('Message feature coming soon')}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.82rem', padding: '0.45rem 0.875rem' }}
            >
              <MessageSquare size={14} /> Message
            </button>
            <button
              onClick={() => window.print()}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.82rem', padding: '0.45rem 0.875rem' }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', padding: '0.45rem 0.875rem' }}
              onClick={() => toast.info('Edit mode coming soon')}
            >
              <Edit size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ───────────────────────────────────── */}
      <div style={{ overflowX: 'auto', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0', minWidth: 'max-content' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.75rem 1.125rem', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500, fontSize: '0.82rem',
                  fontFamily: 'inherit',
                  borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────── */}
      <div key={activeTab} style={{ animation: 'fadeSlideIn 0.18s ease-out' }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
