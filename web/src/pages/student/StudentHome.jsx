import React, { useState, useEffect } from 'react';
import {
  BookOpen, ClipboardList, CalendarCheck, GraduationCap, MessageSquare,
  Bell, TrendingUp, TrendingDown, Minus, Clock, ChevronRight,
  Zap, Download, Calendar, Library, FileText, CheckCircle, AlertTriangle, Star,
  ArrowRight, Play, Eye,
} from 'lucide-react';
import {
  MOCK_STUDENT, MOCK_SCHEDULE, MOCK_ASSIGNMENTS, MOCK_EXAMS,
  MOCK_GRADES, MOCK_ATTENDANCE, MOCK_ANNOUNCEMENTS, MOCK_NOTIFICATIONS,
} from './mock/studentMockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ── Helpers ───────────────────────────────────────────────────────────────────
const GRADE_BANDS = [
  { letter: 'A+', min: 95, color: '#10B981', gpa: 4.0 },
  { letter: 'A',  min: 90, color: '#10B981', gpa: 4.0 },
  { letter: 'A-', min: 85, color: '#34d399', gpa: 3.7 },
  { letter: 'B+', min: 80, color: '#3b82f6', gpa: 3.3 },
  { letter: 'B',  min: 75, color: '#3b82f6', gpa: 3.0 },
  { letter: 'C+', min: 65, color: '#f59e0b', gpa: 2.3 },
  { letter: 'C',  min: 60, color: '#f59e0b', gpa: 2.0 },
  { letter: 'F',  min: 0,  color: '#ef4444', gpa: 0.0 },
];
function getGrade(score) {
  return GRADE_BANDS.find(g => score >= g.min) || { letter: 'F', color: '#ef4444', gpa: 0 };
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function CountdownChip({ dateStr }) {
  const d = daysUntil(dateStr);
  if (d < 0) return <span style={chip('#6b7280', 'rgba(107,114,128,0.15)')}>Past</span>;
  if (d === 0) return <span style={chip('#ef4444', 'rgba(239,68,68,0.12)')}>Today!</span>;
  if (d <= 2)  return <span style={chip('#ef4444', 'rgba(239,68,68,0.12)')}>{d}d left</span>;
  if (d <= 7)  return <span style={chip('#f59e0b', 'rgba(245,158,11,0.12)')}>{d}d left</span>;
  return <span style={chip('#10B981', 'rgba(16,185,129,0.12)')}>{d}d left</span>;
}
function chip(color, bg) {
  return { padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.72rem', fontWeight: 700, color, background: bg, whiteSpace: 'nowrap' };
}

function Ring({ pct = 0, size = 72, stroke = 7, color = '#10B981', children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'var(--primary)', onClick, urgent }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-surface)', border: `1px solid ${urgent ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
      borderRadius: '0.875rem', padding: '1.125rem 1.25rem', cursor: onClick ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.15s',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={21} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{sub}</div>}
      </div>
      {urgent && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', position: 'absolute', top: 12, right: 12, boxShadow: '0 0 6px #ef4444' }} />
      )}
    </div>
  );
}

// ── Schedule Status Badge ─────────────────────────────────────────────────────
function ScheduleStatus({ status }) {
  const cfg = {
    completed: { label: 'Completed', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    ongoing:   { label: '● Live Now', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    upcoming:  { label: 'Upcoming',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  }[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };
  return <span style={{ ...chip(cfg.color, cfg.bg), fontWeight: status === 'ongoing' ? 800 : 700 }}>{cfg.label}</span>;
}

// ── Priority Badge ────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const cfg = {
    high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    low:    { label: 'Low',    color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  }[priority] || { label: priority, color: '#6b7280', bg: 'transparent' };
  return <span style={chip(cfg.color, cfg.bg)}>{cfg.label}</span>;
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, action, onAction }) {
  return (
    <div className="mobile-wrap"  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{title}</h2>
      {action && (
        <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
          {action} <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
      <strong>{label}</strong>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentHome({ student = MOCK_STUDENT, setActiveTab }) {
  const s = student;
  const pendingAssignments = MOCK_ASSIGNMENTS.filter(a => a.status === 'pending' || a.status === 'in_progress');
  const upcomingExams = MOCK_EXAMS.filter(e => e.status === 'upcoming').flatMap(e => e.timetable || []);
  const todayClasses = MOCK_SCHEDULE;
  const ongoingClass = MOCK_SCHEDULE.find(c => c.status === 'ongoing');
  const gradeColor = s.gpa >= 3.5 ? '#10B981' : s.gpa >= 2.5 ? '#f59e0b' : '#ef4444';
  const attColor   = s.attendance_percentage >= 90 ? '#10B981' : s.attendance_percentage >= 75 ? '#f59e0b' : '#ef4444';
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const chartData = MOCK_ATTENDANCE.monthly_summary.map(m => ({
    month: m.month, Present: m.present, Absent: m.absent, Late: m.late,
  }));

  // Recent grades from breakdown
  const recentGrades = MOCK_GRADES.subjects
    .flatMap(sub => sub.breakdown.slice(-2).map(b => ({ subject: sub.name, color: sub.color, ...b, teacher: sub.teacher, comment: sub.teacher_comment })))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Hero Greeting ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(59,130,246,0.08) 100%)',
        border: '1px solid rgba(16,185,129,0.2)', borderRadius: '1rem',
        padding: '1.5rem 2rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blob */}
        <div style={{ position: 'absolute', right: -20, top: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(40px)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              {dayName}, {fullDate}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.35rem', letterSpacing: '-0.03em' }}>
              {greeting}, {s.first_name}! 👋
            </h1>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {s.grade_name} · Section {s.section_name} · {s.academic_year}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{s.student_id}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'GPA', value: s.gpa?.toFixed(2), color: gradeColor },
              { label: 'Attendance', value: `${s.attendance_percentage}%`, color: attColor },
              { label: 'Class Rank', value: `#${s.rank}`, color: '#a78bfa' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, letterSpacing: '-0.03em' }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.15rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Class Alert */}
        {ongoingClass && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.625rem', padding: '0.625rem 1rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
              {ongoingClass.icon} {ongoingClass.subject} is happening now — {ongoingClass.room} · {ongoingClass.start_time}–{ongoingClass.end_time}
            </span>
            <button style={{ marginLeft: 'auto', background: 'var(--primary)', border: 'none', borderRadius: '0.375rem', color: '#000', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Play size={12} fill="#000" /> Join
            </button>
          </div>
        )}
      </div>

      {/* ── 8 KPI Stat Cards ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
        <StatCard icon={BookOpen}    label="Today's Classes"     value={todayClasses.length}         color="#3b82f6"   onClick={() => setActiveTab('subjects')} />
        <StatCard icon={ClipboardList} label="Pending Assignments" value={pendingAssignments.length} color="#f59e0b"   urgent={pendingAssignments.some(a => daysUntil(a.due_date) <= 1)} onClick={() => setActiveTab('assignments')} sub={`${pendingAssignments.filter(a => daysUntil(a.due_date) <= 3).length} due soon`} />
        <StatCard icon={CalendarCheck} label="Attendance"         value={`${s.attendance_percentage}%`} color={attColor}  onClick={() => setActiveTab('attendance')} sub={`${MOCK_ATTENDANCE.present} present days`} />
        <StatCard icon={TrendingUp}  label="Average Grade"        value={`${s.average_grade}%`}       color="#10B981"   onClick={() => setActiveTab('grades')} sub={`GPA: ${s.gpa?.toFixed(2)}`} />
        <StatCard icon={GraduationCap} label="Upcoming Exams"    value={MOCK_EXAMS.filter(e => e.status === 'upcoming').length} color="#a78bfa" onClick={() => setActiveTab('exams')} sub="Next: Aug 5th" />
        <StatCard icon={MessageSquare} label="Unread Messages"   value={3}                            color="#ec4899"   urgent onClick={() => setActiveTab('messages')} />
        <StatCard icon={Bell}        label="Notifications"        value={MOCK_NOTIFICATIONS.filter(n => !n.read).length} color="#06b6d4" onClick={() => {}} />
        <StatCard icon={Star}        label="Class Rank"           value={`#${s.rank}`}                color="#f97316"   sub={`of ${s.total_students} students`} />
      </div>

      {/* ── Today's Schedule + Quick Actions ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.25rem', alignItems: 'start' }}>

        {/* Schedule */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <SectionHeader title="📅 Today's Schedule" action="View Timetable" onAction={() => setActiveTab('calendar')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {MOCK_SCHEDULE.map(cls => (
              <div className="mobile-wrap"  key={cls.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.875rem 1rem', borderRadius: '0.75rem',
                border: cls.status === 'ongoing' ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-color)',
                background: cls.status === 'ongoing' ? 'rgba(16,185,129,0.06)' : 'var(--bg-color)',
                transition: 'all 0.15s',
              }}>
                {/* Color dot */}
                <div style={{ width: 4, height: 44, borderRadius: 2, background: cls.color, flexShrink: 0 }} />
                {/* Subject */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{cls.icon} {cls.subject}</span>
                    <ScheduleStatus status={cls.status} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {cls.teacher} · {cls.room} · {cls.start_time}–{cls.end_time}
                  </div>
                </div>
                {/* Actions */}
                {cls.status !== 'completed' && (
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {cls.status === 'ongoing' && (
                      <button style={{ background: 'var(--primary)', border: 'none', borderRadius: '0.5rem', color: '#000', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Play size={11} fill="#000" /> Join
                      </button>
                    )}
                    <button onClick={() => setActiveTab('materials')} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.5rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FileText size={11} /> Materials
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: '1.25rem', minWidth: 200 }}>
          <SectionHeader title="⚡ Quick Actions" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Submit Assignment', icon: ClipboardList, color: '#f59e0b', tab: 'assignments' },
              { label: 'View Grades',        icon: TrendingUp,    color: '#10B981', tab: 'grades' },
              { label: 'Attendance',         icon: CalendarCheck, color: '#3b82f6', tab: 'attendance' },
              { label: 'Calendar',           icon: Calendar,      color: '#a78bfa', tab: 'calendar' },
              { label: 'Messages',           icon: MessageSquare, color: '#ec4899', tab: 'messages' },
              { label: 'Library',            icon: Library,       color: '#06b6d4', tab: 'library' },
              { label: 'Materials',          icon: FileText,      color: '#f97316', tab: 'materials' },
              { label: 'Exam Schedule',      icon: GraduationCap, color: '#ef4444', tab: 'exams' },
            ].map(a => (
              <button key={a.label} onClick={() => setActiveTab(a.tab)} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
                background: `${a.color}10`, border: `1px solid ${a.color}25`,
                color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.82rem', fontWeight: 600, textAlign: 'left',
                transition: 'all 0.12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${a.color}20`; e.currentTarget.style.transform = 'translateX(3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <a.icon size={15} color={a.color} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pending Assignments + Upcoming Exams ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Pending Assignments */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <SectionHeader title="📋 Pending Assignments" action="View All" onAction={() => setActiveTab('assignments')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {pendingAssignments.slice(0, 4).map(asn => (
              <div key={asn.id} style={{
                padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
              }}>
                <div className="mobile-wrap"  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.845rem', flex: 1 }}>{asn.title}</div>
                  <PriorityBadge priority={asn.priority} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {asn.subject} · {asn.teacher}
                </div>
                <div className="mobile-wrap"  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Clock size={12} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.77rem', color: daysUntil(asn.due_date) <= 1 ? '#ef4444' : 'var(--text-secondary)', fontWeight: daysUntil(asn.due_date) <= 1 ? 700 : 400 }}>
                      Due {asn.due_date}
                    </span>
                    <CountdownChip dateStr={asn.due_date} />
                  </div>
                  <button onClick={() => setActiveTab('assignments')} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.375rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', padding: '0.275rem 0.625rem' }}>
                    Submit
                  </button>
                </div>
              </div>
            ))}
            {pendingAssignments.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 0.5rem', display: 'block', color: '#10B981' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>All caught up!</div>
                <div style={{ fontSize: '0.78rem' }}>No pending assignments.</div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <SectionHeader title="🎓 Upcoming Exams" action="View All" onAction={() => setActiveTab('exams')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {upcomingExams.slice(0, 5).map((ex, i) => (
              <div className="mobile-wrap"  key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
                <div style={{ textAlign: 'center', minWidth: 44, background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', padding: '0.375rem' }}>
                  <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>{new Date(ex.date).toLocaleString('en', { month: 'short' })}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>{new Date(ex.date).getDate()}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.845rem', marginBottom: '0.2rem' }}>{ex.subject}</div>
                  <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>{ex.start}–{ex.end} · {ex.room}</div>
                </div>
                <CountdownChip dateStr={ex.date} />
              </div>
            ))}
            {upcomingExams.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <GraduationCap size={32} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>No upcoming exams</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Grades + Attendance Chart ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Recent Grades */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <SectionHeader title="⭐ Recent Grades" action="View All" onAction={() => setActiveTab('grades')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {recentGrades.map((g, i) => {
              const grade = getGrade(g.score);
              const pct = (g.score / g.max) * 100;
              return (
                <div key={i} style={{ padding: '0.75rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
                  <div className="mobile-wrap"  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.845rem' }}>{g.subject}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginLeft: '0.5rem' }}>· {g.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: grade.color }}>{g.score}/{g.max}</span>
                      <span style={{ fontWeight: 800, color: grade.color, background: `${grade.color}18`, padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.8rem' }}>{grade.letter}</span>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: grade.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <SectionHeader title="📊 Attendance — Last 6 Months" action="Details" onAction={() => setActiveTab('attendance')} />
          <div className="mobile-wrap"  style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Ring pct={MOCK_ATTENDANCE.overall_percentage} size={72} color={attColor}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: attColor }}>{MOCK_ATTENDANCE.overall_percentage}%</span>
            </Ring>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[
                { label: 'Present', value: MOCK_ATTENDANCE.present, color: '#10B981' },
                { label: 'Absent',  value: MOCK_ATTENDANCE.absent,  color: '#ef4444' },
                { label: 'Late',    value: MOCK_ATTENDANCE.late,    color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}:</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Present" fill="#10B981" radius={[2,2,0,0]} barSize={10} />
              <Bar dataKey="Absent"  fill="#ef4444" radius={[2,2,0,0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Announcements ─────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <SectionHeader title="📢 Announcements" action="View All" onAction={() => {}} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
          {MOCK_ANNOUNCEMENTS.slice(0, 4).map(ann => {
            const typeColor = { academic: '#3b82f6', event: '#10B981', school: '#a78bfa', teacher: '#f59e0b' }[ann.type] || 'var(--primary)';
            return (
              <div key={ann.id} style={{
                padding: '1rem', borderRadius: '0.75rem', border: `1px solid ${ann.read ? 'var(--border-color)' : `${typeColor}30`}`,
                background: ann.read ? 'var(--bg-color)' : `${typeColor}08`, cursor: 'pointer',
              }}>
                <div className="mobile-wrap"  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: ann.read ? 600 : 800, fontSize: '0.845rem', flex: 1 }}>{ann.title}</span>
                  {!ann.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor, flexShrink: 0, marginTop: 4 }} />}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ann.body}
                </p>
                <div className="mobile-wrap"  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: typeColor, fontWeight: 700, background: `${typeColor}15`, padding: '0.1rem 0.45rem', borderRadius: '0.25rem' }}>
                    {ann.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{ann.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
