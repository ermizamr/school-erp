import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ToastProvider } from '../../components/Toast';
import {
  LayoutDashboard, BarChart2, CalendarCheck, Bell, LogOut, School, User, AlertCircle
} from 'lucide-react';

import StudentHome from './StudentHome';
import StudentGrades from './StudentGrades';
import StudentAttendance from './StudentAttendance';
import StudentNotifications from './StudentNotifications';

const NAV_ITEMS = [
  { key: 'home',          label: 'Dashboard',    icon: LayoutDashboard },
  { key: 'grades',        label: 'My Grades',    icon: BarChart2 },
  { key: 'attendance',    label: 'Attendance',   icon: CalendarCheck },
  { key: 'notifications', label: 'Notifications',icon: Bell },
];

export default function StudentLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  // Student's own profile + enrollment (the "data context" shared across all tabs)
  const [profile, setProfile] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { initProfile(); }, []);

  async function initProfile() {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Demo mode — no real profile; create a stub so sub-pages can still render
        setProfile({ id: null, first_name: 'Demo', last_name: 'Student', role: 'student' });
        setLoadingProfile(false);
        return;
      }

      const [{ data: prof }, { data: enrData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('enrollments')
          .select('*, sections(id, name, grades(name))')
          .eq('student_id', user.id)
          .limit(1)
          .maybeSingle(),
      ]);

      setProfile(prof || { id: user.id, first_name: 'Student', last_name: '', role: 'student' });
      setEnrollment(enrData || null);

      // Unread notifications count
      if (user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      }
    } catch (err) {
      console.error('StudentLayout init error', err);
      setProfile({ id: null, first_name: 'Demo', last_name: 'Student', role: 'student' });
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  function renderContent() {
    if (loadingProfile) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your portal…</p>
        </div>
      );
    }
    switch (activeTab) {
      case 'home':          return <StudentHome profile={profile} enrollment={enrollment} setActiveTab={setActiveTab} />;
      case 'grades':        return <StudentGrades profile={profile} enrollment={enrollment} />;
      case 'attendance':    return <StudentAttendance profile={profile} enrollment={enrollment} />;
      case 'notifications': return <StudentNotifications profile={profile} />;
      default:              return <StudentHome profile={profile} enrollment={enrollment} setActiveTab={setActiveTab} />;
    }
  }

  return (
    <ToastProvider>
      <div className="app-layout">

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Brand */}
          <div className="sidebar-brand">
            <School size={22} />
            <span>EthioSchool</span>
          </div>

          {/* Role badge + profile mini card */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10B981', backgroundColor: 'rgba(16,185,129,0.12)', padding: '0.3rem 0.75rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '0.9rem' }}>
              🎓 Student Portal
            </span>
            {profile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#10B981', fontSize: '0.9rem', flexShrink: 0 }}>
                  {profile.first_name[0]}{profile.last_name?.[0] || ''}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {enrollment
                      ? `${enrollment.sections?.grades?.name} · Sec. ${enrollment.sections?.name}`
                      : 'Student'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  // Clear unread badge when opening notifications
                  if (key === 'notifications') setUnreadCount(0);
                }}
                className={`nav-link ${activeTab === key ? 'active' : ''}`}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', position: 'relative' }}
              >
                <Icon size={19} />
                <span>{label}</span>
                {/* Unread badge on notifications */}
                {key === 'notifications' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: '#ef4444', color: 'white',
                    fontSize: '0.65rem', fontWeight: 700,
                    padding: '0.1rem 0.45rem', borderRadius: '1rem',
                    lineHeight: 1.5,
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={handleLogout}
              className="btn"
              style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
          {renderContent()}
        </main>
      </div>
    </ToastProvider>
  );
}
