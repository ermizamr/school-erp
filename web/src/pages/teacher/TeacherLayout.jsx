import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ToastProvider } from '../../components/Toast';
import {
  LayoutDashboard, CalendarCheck, BarChart2, BookOpen, Megaphone, LogOut, School
} from 'lucide-react';

import TeacherDashboard from './TeacherDashboard';
import TeacherAttendance from './TeacherAttendance';
import TeacherExams from './TeacherExams';
import TeacherGradebook from './TeacherGradebook';
import TeacherNotifications from './TeacherNotifications';

const NAV_ITEMS = [
  { key: 'overview',      label: 'Dashboard',  icon: LayoutDashboard },
  { key: 'attendance',    label: 'Attendance', icon: CalendarCheck },
  { key: 'exams',         label: 'Exams & Grading', icon: BarChart2 },
  { key: 'gradebook',     label: 'Gradebook',  icon: BookOpen },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
];

export default function TeacherLayout() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  function renderContent() {
    switch (activeTab) {
      case 'overview':      return <TeacherDashboard setActiveTab={setActiveTab} />;
      case 'attendance':    return <TeacherAttendance />;
      case 'exams':         return <TeacherExams />;
      case 'gradebook':     return <TeacherGradebook />;
      case 'announcements': return <TeacherNotifications />;
      default:              return <TeacherDashboard setActiveTab={setActiveTab} />;
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
                onClick={() => setActiveTab(key)}
                className={`nav-link ${activeTab === key ? 'active' : ''}`}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
              >
                <Icon size={19} />
                <span>{label}</span>
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
