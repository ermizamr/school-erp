import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ToastProvider } from '../../components/Toast';
import {
  LayoutDashboard, CalendarCheck, BarChart2, BookOpen, Megaphone, LogOut, School,
  Users, FileText, ClipboardCheck, GraduationCap, Calendar, MessageSquare, Settings, User
} from 'lucide-react';

import TeacherDashboard from './TeacherDashboard';
import TeacherAttendance from './TeacherAttendance';
import TeacherExams from './TeacherExams';
import TeacherGradebook from './TeacherGradebook';
import TeacherNotifications from './TeacherNotifications';
import TeacherAssignments from './TeacherAssignments';
import TeacherMessages from './TeacherMessages';
import TeacherClasses from './TeacherClasses';
import TeacherStudents from './TeacherStudents';
import TeacherCalendar from './TeacherCalendar';
import TeacherLessonPlans from './TeacherLessonPlans';
import TeacherMaterials from './TeacherMaterials';
import TeacherReports from './TeacherReports';
import TeacherParents from './TeacherParents';
import TeacherSettings from './TeacherSettings';

const NAV_ITEMS = [
  { key: 'overview',      label: 'Dashboard',          icon: LayoutDashboard },
  { key: 'classes',       label: 'My Classes',         icon: BookOpen },
  { key: 'students',      label: 'Students',           icon: Users },
  { key: 'attendance',    label: 'Attendance',         icon: ClipboardCheck },
  { key: 'gradebook',     label: 'Gradebook',          icon: GraduationCap },
  { key: 'assignments',   label: 'Assignments',        icon: FileText },
  { key: 'exams',         label: 'Exams',              icon: BarChart2 },
  { key: 'lesson_plans',  label: 'Lesson Plans',       icon: BookOpen },
  { key: 'materials',     label: 'Teaching Materials', icon: FileText },
  { key: 'messages',      label: 'Messages',           icon: MessageSquare },
  { key: 'parents',       label: 'Parents',            icon: Users },
  { key: 'reports',       label: 'Reports',            icon: BarChart2 },
  { key: 'calendar',      label: 'Calendar',           icon: Calendar },
  { key: 'profile',       label: 'Profile',            icon: User },
  { key: 'settings',      label: 'Settings',           icon: Settings },
];

export default function TeacherLayout() {
  const [activeTab, setActiveTab] = useState('overview');
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Poll unread message count every 30 s
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Clear badge when messages tab is active
  useEffect(() => {
    if (activeTab === 'messages') setUnreadCount(0);
  }, [activeTab]);

  async function fetchUnread() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    } catch { /* silently ignore */ }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  // Allow children to navigate AND refresh unread count
  function handleTabChange(key) {
    setActiveTab(key);
    if (key !== 'messages') fetchUnread();
  }

  function renderContent() {
    switch (activeTab) {
      case 'overview':      return <TeacherDashboard setActiveTab={handleTabChange} />;
      case 'classes':       return <TeacherClasses />;
      case 'students':      return <TeacherStudents />;
      case 'attendance':    return <TeacherAttendance />;
      case 'gradebook':     return <TeacherGradebook />;
      case 'assignments':   return <TeacherAssignments />;
      case 'exams':         return <TeacherExams />;
      case 'lesson_plans':  return <TeacherLessonPlans />;
      case 'materials':     return <TeacherMaterials />;
      case 'messages':      return <TeacherMessages onMessageRead={fetchUnread} />;
      case 'parents':       return <TeacherParents setActiveTab={handleTabChange} />;
      case 'reports':       return <TeacherReports />;
      case 'calendar':      return <TeacherCalendar />;
      case 'profile':       return <TeacherSettings />;
      case 'settings':      return <TeacherSettings />;
      case 'announcements': return <TeacherNotifications />;
      default:              return <TeacherDashboard setActiveTab={handleTabChange} />;
    }
  }

  return (
    <ToastProvider>
      <div className="app-layout" style={{ position: 'relative' }}>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Brand */}
          <div className="sidebar-brand">
            <School size={22} />
            <span>EthioSchool</span>
          </div>

          {/* Role badge */}
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)', padding: '0.3rem 0.75rem', borderRadius: '1rem' }}>
              👨‍🏫 Teacher Portal
            </span>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`nav-link ${activeTab === key ? 'active' : ''}`}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
              >
                <Icon size={19} />
                <span>{label}</span>
                {/* Unread badge on Messages nav item */}
                {key === 'messages' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '1rem',
                    lineHeight: 1.5,
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
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
