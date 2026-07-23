import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { BookOpen, Users, CalendarCheck, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

const DEMO_TEACHER_ID = 'demo-teacher';

// Ethiopian letter grade calculator
function getLetterGrade(score) {
  if (score >= 90) return { letter: 'A', color: '#10B981' };
  if (score >= 80) return { letter: 'B', color: '#3b82f6' };
  if (score >= 70) return { letter: 'C', color: '#f59e0b' };
  if (score >= 60) return { letter: 'D', color: '#f97316' };
  return { letter: 'F', color: '#ef4444' };
}

function StatCard({ icon: Icon, label, value, sub, color = 'var(--primary)', onClick }) {
  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', borderTop: `3px solid ${color}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            {label}
          </p>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          {sub && <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>{sub}</p>}
        </div>
        <div style={{ color, opacity: 0.7 }}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );
}

// Inline mini bar chart (pure CSS)
function MiniBar({ value, max = 100, color = 'var(--primary)' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
    </div>
  );
}

// Attendance heatmap dot (7-day)
function AttendanceDot({ rate }) {
  let color;
  if (rate === null) color = 'rgba(255,255,255,0.08)';
  else if (rate >= 90) color = '#10B981';
  else if (rate >= 70) color = '#f59e0b';
  else color = '#ef4444';
  return (
    <div
      title={rate === null ? 'No data' : `${rate}% present`}
      style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: color, flexShrink: 0 }}
    />
  );
}

export default function TeacherDashboard({ setActiveTab }) {
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]); // [{section, subject}]
  const [stats, setStats] = useState({ totalStudents: 0, todayPresentRate: null, upcomingExams: 0, atRiskCount: 0 });
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [weeklyRates, setWeeklyRates] = useState([]); // [{date, rate}] last 7 days
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const teacherId = user?.id || DEMO_TEACHER_ID;

      // Profile
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', teacherId).single();
        setProfile(prof);
      }

      // Teacher assignments → sections & subjects
      const { data: assignData } = await supabase
        .from('teacher_assignments')
        .select('*, sections(id, name, grades(name)), subjects(id, name)')
        .eq('teacher_id', teacherId);

      const asgn = assignData || [];
      setAssignments(asgn);

      // Unique section IDs
      const sectionIds = [...new Set(asgn.map(a => a.section_id))];

      if (sectionIds.length === 0) {
        setLoading(false);
        return;
      }

      // Total enrolled students across all my sections
      const { count: totalStudents } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .in('section_id', sectionIds);

      // Today's attendance rate across my sections
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAtt } = await supabase
        .from('attendance')
        .select('status')
        .in('section_id', sectionIds)
        .eq('date', today);

      let todayPresentRate = null;
      if (todayAtt && todayAtt.length > 0) {
        const present = todayAtt.filter(a => a.status === 'present').length;
        todayPresentRate = Math.round((present / todayAtt.length) * 100);
      }

      // Upcoming exams (next 14 days)
      const in14 = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0];
      const { count: upcomingExams } = await supabase
        .from('exams')
        .select('*', { count: 'exact', head: true })
        .in('section_id', sectionIds)
        .gte('date', today)
        .lte('date', in14);

      // Weekly attendance rates (last 7 calendar days)
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 24 * 3600 * 1000);
        return d.toISOString().split('T')[0];
      });

      const { data: weeklyAtt } = await supabase
        .from('attendance')
        .select('date, status')
        .in('section_id', sectionIds)
        .gte('date', days[0])
        .lte('date', days[6]);

      const ratesByDay = days.map(date => {
        const dayRecords = (weeklyAtt || []).filter(a => a.date === date);
        if (dayRecords.length === 0) return { date, rate: null };
        const present = dayRecords.filter(a => a.status === 'present').length;
        return { date, rate: Math.round((present / dayRecords.length) * 100) };
      });
      setWeeklyRates(ratesByDay);

      // At-risk students: >2 absences in last 7 days in my sections
      const { data: recentAbsences } = await supabase
        .from('attendance')
        .select('student_id, profiles(first_name, last_name, id)')
        .in('section_id', sectionIds)
        .eq('status', 'absent')
        .gte('date', days[0]);

      const absenceCounts = {};
      const nameMap = {};
      (recentAbsences || []).forEach(a => {
        absenceCounts[a.student_id] = (absenceCounts[a.student_id] || 0) + 1;
        if (a.profiles) nameMap[a.student_id] = a.profiles;
      });

      const atRisk = Object.entries(absenceCounts)
        .filter(([, count]) => count >= 2)
        .map(([id, count]) => ({ id, count, ...nameMap[id] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAtRiskStudents(atRisk);

      setStats({
        totalStudents: totalStudents || 0,
        todayPresentRate,
        upcomingExams: upcomingExams || 0,
        atRiskCount: atRisk.length,
      });
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
    }
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const getDayLabel = (dateStr) => {
    const day = new Date(dateStr).getDay(); // 0=Sun
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return labels[day];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p>Loading your dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {profile ? profile.first_name : 'Teacher'} 👋
        </h1>
        <p>Here's what's happening in your classes today.</p>
      </div>

      {/* Stats Row */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard
          icon={BookOpen}
          label="My Classes"
          value={[...new Set(assignments.map(a => a.section_id))].length}
          sub={`${assignments.length} subject assignment${assignments.length !== 1 ? 's' : ''}`}
          color="var(--primary)"
          onClick={() => setActiveTab('classes')}
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          sub="across all my sections"
          color="#3b82f6"
        />
        <StatCard
          icon={CalendarCheck}
          label="Today's Attendance"
          value={stats.todayPresentRate !== null ? `${stats.todayPresentRate}%` : '—'}
          sub={stats.todayPresentRate !== null ? 'recorded today' : 'not yet recorded'}
          color={stats.todayPresentRate !== null ? (stats.todayPresentRate >= 80 ? '#10B981' : '#f59e0b') : 'var(--text-secondary)'}
          onClick={() => setActiveTab('attendance')}
        />
        <StatCard
          icon={Clock}
          label="Upcoming Exams"
          value={stats.upcomingExams}
          sub="in the next 14 days"
          color="#a78bfa"
          onClick={() => setActiveTab('exams')}
        />
        <StatCard
          icon={AlertTriangle}
          label="At-Risk Students"
          value={stats.atRiskCount}
          sub="2+ absences this week"
          color="#ef4444"
        />
      </div>

      {/* Two-column lower section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>

        {/* Weekly Attendance Heatmap */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>Weekly Attendance Pulse</h2>
          <p style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>Last 7 days across all your sections</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
            {weeklyRates.map(({ date, rate }) => (
              <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {rate !== null ? `${rate}%` : '—'}
                </span>
                <div style={{
                  width: '100%',
                  height: `${rate !== null ? Math.max(8, rate * 0.6) : 8}px`,
                  backgroundColor: rate === null ? 'rgba(255,255,255,0.06)' : rate >= 90 ? '#10B981' : rate >= 70 ? '#f59e0b' : '#ef4444',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease',
                  minHeight: '8px'
                }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{getDayLabel(date)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {[{ color: '#10B981', label: '≥90%' }, { color: '#f59e0b', label: '70–89%' }, { color: '#ef4444', label: '<70%' }].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: color }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Classes List */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>My Classes</h2>
            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }} onClick={() => setActiveTab('classes')}>
              View All
            </button>
          </div>
          {assignments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No class assignments yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {assignments.slice(0, 5).map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.9rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {a.sections?.grades?.name} – {a.sections?.name}
                    </span>
                    <p style={{ fontSize: '0.78rem', margin: 0 }}>{a.subjects?.name}</p>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Active</span>
                </div>
              ))}
              {assignments.length > 5 && (
                <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setActiveTab('classes')}>
                  + {assignments.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>

        {/* At-Risk Students Panel */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Students At Risk</h2>
              <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>2+ absences this week</span>
            </div>
            <button className="btn" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', border: '1px solid var(--border-color)' }} onClick={() => setActiveTab('attendance')}>
              Take Attendance
            </button>
          </div>
          {atRiskStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: '0.75rem', border: '1px dashed rgba(16,185,129,0.2)' }}>
              <p style={{ color: '#10B981', fontWeight: 500 }}>🎉 All students have good attendance this week!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {atRiskStudents.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#ef4444', fontSize: '0.9rem', flexShrink: 0 }}>
                    {(s.first_name || '?')[0]}{(s.last_name || '')[0]}
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>
                      {s.first_name} {s.last_name}
                    </p>
                    <p style={{ color: '#ef4444', margin: 0, fontSize: '0.75rem' }}>{s.count} absences this week</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
