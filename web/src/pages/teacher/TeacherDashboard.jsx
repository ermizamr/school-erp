import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  BookOpen, Users, CalendarCheck, AlertTriangle, TrendingUp, Clock, 
  CalendarDays, CheckSquare, GraduationCap, FileText, UploadCloud, 
  PlusCircle, Megaphone, Bell, Search, Menu, ChevronRight, MessageSquare
} from 'lucide-react';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

function StatCard({ icon: Icon, label, value, sub, color = 'var(--primary)', onClick }) {
  return (
    <div className="glass-card hover-card" onClick={onClick} style={{ borderTop: `3px solid ${color}`, cursor: onClick ? 'pointer' : 'default' }}>
      <div className="flex-row justify-between" style={{ alignItems: 'flex-start' }}>
        <div>
          <p className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            {label}
          </p>
          <div className="text-xl font-bold" style={{ color, lineHeight: 1 }}>{value}</div>
          {sub && <p className="text-xs text-muted" style={{ marginTop: '0.4rem' }}>{sub}</p>}
        </div>
        <div style={{ color, opacity: 0.8, padding: '0.5rem', backgroundColor: `${color}15`, borderRadius: '0.5rem' }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// Components
const TodaysSchedule = ({ schedule, setActiveTab }) => {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="glass-card">
        <h2 className="text-lg font-semibold" style={{ margin: '0 0 1rem 0' }}>Today's Schedule</h2>
        <div className="text-center text-muted" style={{ padding: '2rem' }}>No classes scheduled for today.</div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="flex-row justify-between" style={{ marginBottom: '1.5rem' }}>
        <h2 className="text-lg font-semibold" style={{ margin: 0 }}>Today's Schedule</h2>
        <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }} onClick={() => setActiveTab && setActiveTab('lesson-plans')}><PlusCircle size={16} className="gap-2" /> Add Note</button>
      </div>
      <div className="timeline-container">
        {schedule.map((cls, idx) => {
          const isPassed = new Date(`1970-01-01T${cls.end_time}`) < new Date(`1970-01-01T${new Date().toTimeString().substring(0,8)}`);
          const isActive = new Date(`1970-01-01T${cls.start_time}`) <= new Date(`1970-01-01T${new Date().toTimeString().substring(0,8)}`) && !isPassed;
          
          return (
            <div key={cls.id || idx} className="timeline-item">
              <div className={`timeline-dot ${isActive ? 'active' : ''}`} style={isPassed && !isActive ? { background: 'var(--text-secondary)', borderColor: 'var(--text-secondary)'} : {}} />
              <div className={`p-4 rounded-xl border ${isActive ? 'border-primary bg-primary bg-opacity-10' : 'border-slate-700 bg-slate-800'}`}>
                <div className="flex-row justify-between">
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: isActive ? 'var(--primary)' : 'var(--text-primary)', margin: 0 }}>
                      {cls.subjects?.name || 'Unknown Subject'}
                    </h3>
                    <p className="text-sm text-muted">{cls.sections?.grades?.name} - Sec {cls.sections?.name} • {cls.room}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{cls.start_time?.substring(0,5)} - {cls.end_time?.substring(0,5)}</p>
                  </div>
                </div>
                {isActive && (
                  <div className="flex-row gap-3" style={{ marginTop: '1rem' }}>
                    <button className="btn btn-primary w-full" onClick={() => setActiveTab && setActiveTab('lesson-plans')}>Start Lesson</button>
                    <button className="btn w-full" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => setActiveTab && setActiveTab('attendance')}>Take Attendance</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuickActions = ({ setActiveTab }) => {
  const actions = [
    { icon: CheckSquare, label: 'Take Attendance', color: '#10B981', tab: 'attendance' },
    { icon: GraduationCap, label: 'Enter Grades', color: '#3b82f6', tab: 'classes' },
    { icon: PlusCircle, label: 'Create Assignment', color: '#a78bfa', tab: 'assignments' },
    { icon: UploadCloud, label: 'Upload Material', color: '#f59e0b', tab: 'materials' },
    { icon: Megaphone, label: 'Send Announcement', color: '#ec4899', tab: 'messages' },
    { icon: MessageSquare, label: 'Message Parent', color: '#06b6d4', tab: 'messages' },
  ];

  return (
    <div className="glass-card">
      <h2 className="text-lg font-semibold" style={{ marginBottom: '1.25rem', margin: 0 }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {actions.map((act, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTab && setActiveTab(act.tab)}
            className="hover-card flex-col justify-center" 
            style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <div style={{ color: act.color, padding: '0.5rem', backgroundColor: `${act.color}15`, borderRadius: '50%' }}>
              <act.icon size={20} />
            </div>
            <span className="text-xs font-semibold" style={{ textAlign: 'center', color: 'var(--text-primary)' }}>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const AtRiskStudents = ({ students, setActiveTab }) => {
  if (!students || students.length === 0) {
    return (
      <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
        <h2 className="text-lg font-semibold" style={{ margin: 0 }}>Students At Risk</h2>
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: '0.75rem', border: '1px dashed rgba(16,185,129,0.2)', marginTop: '1rem' }}>
          <p style={{ color: '#10B981', fontWeight: 500 }}>🎉 All students have good attendance this week!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '1.25rem' }}>
        <div className="flex-row gap-2">
          <AlertTriangle size={20} color="#ef4444" />
          <h2 className="text-lg font-semibold" style={{ margin: 0 }}>Students At Risk</h2>
          <span className="badge badge-red text-xs">2+ absences this week</span>
        </div>
        <button className="btn" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={() => setActiveTab && setActiveTab('attendance')}>
          Review All
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {students.map(s => (
          <div key={s.id} className="flex-row justify-between" style={{ padding: '0.875rem', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.75rem' }}>
            <div className="flex-row gap-3">
              <div className="avatar" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                {(s.first_name || '?')[0]}{(s.last_name || '')[0]}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ margin: 0 }}>{s.first_name} {s.last_name}</p>
                <p className="text-xs" style={{ color: '#ef4444', margin: 0 }}>{s.count} absences this week</p>
              </div>
            </div>
            <button className="btn" style={{ padding: '0.25rem 0.5rem', background: '#ef4444', color: 'white', fontSize: '0.75rem', borderRadius: '0.375rem' }} onClick={() => setActiveTab && setActiveTab('messages')}>Message</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AssignmentCenter = ({ assignments, setActiveTab }) => {
  return (
    <div className="glass-card">
      <div className="flex-row justify-between" style={{ marginBottom: '1.25rem' }}>
        <h2 className="text-lg font-semibold" style={{ margin: 0 }}>Assignment Center</h2>
        <button className="btn" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={() => setActiveTab && setActiveTab('assignments')}>View All</button>
      </div>
      
      {assignments && assignments.length > 0 ? (
        <div className="flex-col gap-3">
          {assignments.map((a, i) => (
            <div key={i} className="flex-row justify-between hover-card" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
              <div>
                <h3 className="text-sm font-semibold" style={{ margin: 0 }}>{a.title}</h3>
                <p className="text-xs text-muted" style={{ margin: '0.25rem 0 0 0' }}>
                  {a.sections?.grades?.name} Sec {a.sections?.name} • Due: {new Date(a.due_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex-col" style={{ alignItems: 'flex-end', gap: '0.25rem' }}>
                <span className={`badge ${a.status === 'grading' ? 'badge-yellow' : 'badge-blue'}`}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
                <div className="text-xs font-semibold" style={{ cursor: 'pointer', color: a.status === 'grading' ? '#f59e0b' : 'var(--primary)' }} onClick={() => setActiveTab && setActiveTab('assignments')}>
                  {a.status === 'grading' ? 'Grade Now →' : 'View →'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-sm text-center">No active assignments</p>
      )}
    </div>
  );
}

const GradebookSummary = ({ exams, setActiveTab }) => (
  <div className="glass-card">
    <div className="flex-row justify-between" style={{ marginBottom: '1.25rem' }}>
      <h2 className="text-lg font-semibold" style={{ margin: 0 }}>Gradebook Summary</h2>
      <button className="btn" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }} onClick={() => setActiveTab && setActiveTab('classes')}>Open Gradebook</button>
    </div>
    
    {exams && exams.length > 0 ? (
      <div className="flex-col gap-3">
        {exams.slice(0, 3).map((e, i) => (
          <div key={i} className="flex-row justify-between hover-card" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ margin: 0 }}>{e.title}</h3>
              <p className="text-xs text-muted" style={{ margin: '0.25rem 0 0 0' }}>
                {e.subjects?.name} • {e.sections?.grades?.name} Sec {e.sections?.name}
              </p>
            </div>
            <span className="badge badge-green">Recent</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted text-sm text-center">No recent exams</p>
    )}
  </div>
);

const MiniCalendar = ({ events }) => (
  <div className="glass-card">
    <div className="flex-row justify-between" style={{ marginBottom: '1.25rem' }}>
      <h2 className="text-lg font-semibold" style={{ margin: 0 }}>Upcoming Events</h2>
      <CalendarDays size={20} color="var(--primary)" />
    </div>
    
    {events && events.length > 0 ? (
      <div className="flex-col gap-3">
        {events.slice(0, 3).map((ev, i) => {
          const d = new Date(ev.event_date);
          return (
            <div key={i} className="flex-row gap-3 hover-card" style={{ padding: '0.75rem', borderRadius: '0.5rem' }}>
              <div className="flex-col justify-center" style={{ background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '0.5rem', minWidth: '48px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <span className="text-xs font-bold text-primary">{d.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                <span className="text-lg font-bold">{d.getDate()}</span>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ margin: 0 }}>{ev.title}</p>
                <p className="text-xs text-muted" style={{ margin: 0 }}>{ev.start_time?.substring(0,5) || ''} - {ev.location}</p>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-muted text-sm text-center">No upcoming events</p>
    )}
  </div>
);

const MessagesWidget = ({ messages }) => (
  <div className="glass-card">
    <div className="flex-row justify-between" style={{ marginBottom: '1.25rem' }}>
      <h2 className="text-lg font-semibold" style={{ margin: 0 }}>Recent Messages</h2>
      {messages && messages.filter(m => !m.is_read).length > 0 && (
        <span className="badge badge-blue">{messages.filter(m => !m.is_read).length} Unread</span>
      )}
    </div>
    
    {messages && messages.length > 0 ? (
      <div className="flex-col gap-3">
        {messages.slice(0,3).map((msg, i) => (
          <div key={i} className="flex-row gap-3 hover-card" style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
            <div className="avatar" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
              {msg.profiles?.first_name?.[0] || 'U'}{msg.profiles?.last_name?.[0] || ''}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex-row justify-between">
                <p className="text-sm font-semibold" style={{ margin: 0 }}>{msg.profiles?.first_name} {msg.profiles?.last_name}</p>
                <p className="text-xs text-muted" style={{ margin: 0 }}>
                  {new Date(msg.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xs text-muted" style={{ margin: '0.25rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted text-sm text-center">No recent messages</p>
    )}
  </div>
);

const AnalyticsPlaceholder = ({ stats }) => (
  <div className="glass-card">
    <div className="flex-row justify-between" style={{ marginBottom: '1.25rem' }}>
      <h2 className="text-lg font-semibold" style={{ margin: 0 }}>Class Performance Trend</h2>
      <TrendingUp size={20} color="var(--primary)" />
    </div>
    <div style={{ height: '120px', background: 'linear-gradient(180deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0) 100%)', borderRadius: '0.5rem', borderBottom: '2px solid var(--primary)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
      <p className="text-xs text-primary font-semibold">↑ Stable performance across {stats?.totalClasses || 0} classes</p>
    </div>
  </div>
);

const RecentActivity = ({ logs }) => (
  <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
    <h2 className="text-lg font-semibold" style={{ margin: '0 0 1.25rem 0' }}>Recent Activity</h2>
    {logs && logs.length > 0 ? (
      <div className="flex-row gap-6" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {logs.slice(0, 4).map((log, i) => (
          <div key={i} className="flex-row gap-2" style={{ minWidth: '200px' }}>
            <div className="timeline-dot" style={{ position: 'static', borderColor: 'var(--primary)' }} />
            <div>
              <p className="text-sm font-medium" style={{ margin: 0 }}>{log.action.replace(/_/g, ' ')}</p>
              <p className="text-xs text-muted" style={{ margin: 0 }}>{log.description}</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted text-sm">No recent activity found.</p>
    )}
  </div>
);

export default function TeacherDashboard({ setActiveTab }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalStudents: 0, todayPresentRate: null, upcomingExams: 0, atRiskCount: 0, totalClasses: 0 });
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  
  // New States for Database
  const [scheduleData, setScheduleData] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [examsData, setExamsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [messagesData, setMessagesData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const teacherId = user?.id || DEMO_TEACHER_ID;

      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', teacherId).single();
        if (prof) setProfile(prof);
      }

      // Check if teacher has any assignments, fallback if not
      let { data: assignData, error: classesError } = await supabase.from('teacher_assignments')
        .select('*, sections(id, name, grades(name)), subjects(id, name)')
        .eq('teacher_id', teacherId);
        
      if (!classesError && (!assignData || assignData.length === 0) && teacherId !== DEMO_TEACHER_ID) {
        const fallbackClasses = await supabase.from('teacher_assignments')
          .select('*, sections(id, name, grades(name)), subjects(id, name)')
          .eq('teacher_id', DEMO_TEACHER_ID);
        assignData = fallbackClasses.data || [];
      }
      const asgn = assignData || [];
      const sectionIds = [...new Set(asgn.map(a => a.section_id))];

      if (sectionIds.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Stats
      const { count: totalStudents } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).in('section_id', sectionIds);
      
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAtt } = await supabase.from('attendance').select('status').in('section_id', sectionIds).eq('date', today);
      let todayPresentRate = null;
      if (todayAtt && todayAtt.length > 0) {
        const present = todayAtt.filter(a => a.status === 'present').length;
        todayPresentRate = Math.round((present / todayAtt.length) * 100);
      }

      const in14 = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0];
      const { count: upcomingExams } = await supabase.from('exams').select('*', { count: 'exact', head: true }).in('section_id', sectionIds).gte('date', today).lte('date', in14);

      // 2. At risk
      const days = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - (6 - i) * 24 * 3600 * 1000).toISOString().split('T')[0]);
      const { data: recentAbsences } = await supabase.from('attendance').select('student_id, profiles(first_name, last_name, id)').in('section_id', sectionIds).eq('status', 'absent').gte('date', days[0]);
      const absenceCounts = {};
      const nameMap = {};
      (recentAbsences || []).forEach(a => {
        absenceCounts[a.student_id] = (absenceCounts[a.student_id] || 0) + 1;
        if (a.profiles) nameMap[a.student_id] = a.profiles;
      });
      const atRisk = Object.entries(absenceCounts).filter(([, count]) => count >= 2).map(([id, count]) => ({ id, count, ...nameMap[id] })).sort((a, b) => b.count - a.count).slice(0, 5);

      setAtRiskStudents(atRisk);
      setStats({
        totalStudents: totalStudents || 0,
        todayPresentRate,
        upcomingExams: upcomingExams || 0,
        atRiskCount: atRisk.length,
        totalClasses: sectionIds.length
      });

      // 3. Schedule
      const dow = new Date().getDay(); // 0 is Sunday, 1 is Monday... etc
      const { data: sched } = await supabase.from('class_schedules')
        .select('*, subjects(name), sections(name, grades(name))')
        .eq('teacher_id', teacherId)
        .eq('day_of_week', dow)
        .order('start_time', { ascending: true });
      setScheduleData(sched || []);

      // 4. Assignments
      const { data: assigns } = await supabase.from('assignments')
        .select('*, subjects(name), sections(name, grades(name))')
        .eq('teacher_id', teacherId)
        .order('due_date', { ascending: true });
      setAssignmentsData(assigns || []);

      // 5. Exams (Gradebook)
      const { data: exm } = await supabase.from('exams')
        .select('*, subjects(name), sections(name, grades(name))')
        .in('section_id', sectionIds)
        .order('date', { ascending: false });
      setExamsData(exm || []);

      // 6. Messages
      const { data: msgs } = await supabase.from('messages')
        .select('*, profiles!messages_sender_id_fkey(first_name, last_name)')
        .eq('receiver_id', teacherId)
        .order('created_at', { ascending: false });
      setMessagesData(msgs || []);

      // 7. Events
      const { data: evts } = await supabase.from('events')
        .select('*')
        .gte('event_date', today)
        .order('event_date', { ascending: true });
      setEventsData(evts || []);

      // 8. Activity Logs
      const { data: acts } = await supabase.from('activity_logs')
        .select('*')
        .eq('user_id', teacherId)
        .order('created_at', { ascending: false });
      setActivityData(acts || []);

    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-col justify-center" style={{ alignItems: 'center', height: '60vh', gap: '1.5rem' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite' }} />
        <p className="text-lg text-muted">Loading your workspace...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      
      {/* Top Header */}
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            {profile ? profile.first_name : 'Teacher'} 👋
          </h1>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Active Semester
          </p>
        </div>
        <div className="flex-row gap-4">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Search students, classes (Cmd+K)" style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', width: '280px', fontSize: '0.875rem', outline: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn hover-card" style={{ padding: '0.6rem', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }} onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} color="var(--text-primary)" />
            </button>
            {showNotifications && (
              <div className="glass-card" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '320px', zIndex: 50, padding: '1rem' }}>
                <h3 className="font-bold mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Notifications</h3>
                <div className="flex-col gap-3">
                  <div className="flex-row gap-3" style={{ alignItems: 'flex-start' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}><FileText size={16}/></div>
                    <div>
                      <p className="text-sm font-semibold m-0">Assignment due</p>
                      <p className="text-xs text-muted m-0">Chapter 4 Exercises is due today.</p>
                    </div>
                  </div>
                  <div className="flex-row gap-3" style={{ alignItems: 'flex-start' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><CheckSquare size={16}/></div>
                    <div>
                      <p className="text-sm font-semibold m-0">Grading reminder</p>
                      <p className="text-xs text-muted m-0">You have 12 pending grades for History.</p>
                    </div>
                  </div>
                  <button className="btn" style={{ width: '100%', border: 'none', color: 'var(--primary)', marginTop: '0.5rem' }}>Mark all as read</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="dashboard-grid grid-cols-4" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        <StatCard icon={BookOpen} label="My Classes" value={stats.totalClasses} sub="Active this semester" color="var(--primary)" onClick={() => setActiveTab && setActiveTab('classes')} />
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} sub="Across all sections" color="#3b82f6" />
        <StatCard icon={CheckSquare} label="Today's Attendance" value={stats.todayPresentRate !== null ? `${stats.todayPresentRate}%` : 'N/A'} sub="Average present rate" color={stats.todayPresentRate !== null ? (stats.todayPresentRate >= 80 ? '#10B981' : '#f59e0b') : '#10B981'} onClick={() => setActiveTab && setActiveTab('attendance')} />
        <StatCard icon={FileText} label="Pending Grading" value={assignmentsData.filter(a => a.status === 'grading').length} sub="Assignments awaiting review" color="#f59e0b" onClick={() => setActiveTab && setActiveTab('assignments')} />
      </div>

      {/* Main Content Layout */}
      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
        
        {/* Left Column */}
        <div className="flex-col gap-6">
          <TodaysSchedule schedule={scheduleData} setActiveTab={setActiveTab} />
          <AssignmentCenter assignments={assignmentsData} setActiveTab={setActiveTab} />
          <GradebookSummary exams={examsData} setActiveTab={setActiveTab} />
          <AnalyticsPlaceholder stats={stats} />
        </div>

        <div className="flex-col gap-6">
          <QuickActions setActiveTab={setActiveTab} />
          
          <div className="glass-card">
            <h2 className="text-lg font-semibold" style={{ margin: '0 0 1rem 0' }}>Attendance Summary</h2>
            <div className="flex-row justify-between hover-card" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ margin: 0 }}>Morning Registration</p>
                <p className="text-xs text-muted" style={{ margin: 0 }}>{stats.todayPresentRate !== null ? 'Submitted' : 'Not yet submitted'}</p>
              </div>
              <span className={`badge ${stats.todayPresentRate !== null ? 'badge-green' : 'badge-yellow'}`}>
                {stats.todayPresentRate !== null ? 'Submitted' : 'Pending'}
              </span>
            </div>
          </div>

          <AtRiskStudents students={atRiskStudents} setActiveTab={setActiveTab} />
          
          <MiniCalendar events={eventsData} />
          <MessagesWidget messages={messagesData} />
        </div>

        {/* Full Width Bottom Row */}
        <RecentActivity logs={activityData} />

      </div>
    </div>
  );
}
