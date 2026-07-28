import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ToastProvider } from '../../components/Toast';
import {
  LayoutDashboard, BookOpen, ClipboardList, BarChart2, CalendarCheck,
  GraduationCap, FileText, Calendar, MessageSquare, Library,
  CreditCard, Bus, Home, User, Settings, LogOut, School, Bell,
  Search, Menu, X, ChevronDown, BookMarked, Layers,
} from 'lucide-react';

import { MOCK_STUDENT, MOCK_NOTIFICATIONS } from './mock/studentMockData';

// ── Lazy import all pages ─────────────────────────────────────────────────────
import StudentHome         from './StudentHome';
import StudentSubjects     from './StudentSubjects';
import StudentAssignments  from './StudentAssignments';
import StudentGrades       from './StudentGrades';
import StudentAttendance   from './StudentAttendance';
import StudentExams        from './StudentExams';
import StudentMaterials    from './StudentMaterials';
import StudentCalendar     from './StudentCalendar';
import StudentMessages     from './StudentMessages';
import StudentLibrary      from './StudentLibrary';
import StudentFinance      from './StudentFinance';
import StudentTransport    from './StudentTransport';
import StudentHostel       from './StudentHostel';
import StudentProfile      from './StudentProfile';
import StudentSettings     from './StudentSettings';

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { key: 'home', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Academic',
    items: [
      { key: 'subjects',    label: 'My Subjects',       icon: BookOpen },
      { key: 'assignments', label: 'Assignments',        icon: ClipboardList },
      { key: 'grades',      label: 'Grades',             icon: BarChart2 },
      { key: 'attendance',  label: 'Attendance',         icon: CalendarCheck },
      { key: 'exams',       label: 'Exams',              icon: GraduationCap },
      { key: 'materials',   label: 'Learning Materials', icon: FileText },
      { key: 'calendar',    label: 'Calendar',           icon: Calendar },
    ],
  },
  {
    label: 'Communication',
    items: [
      { key: 'messages', label: 'Messages', icon: MessageSquare, badgeKey: 'messages' },
    ],
  },
  {
    label: 'Services',
    items: [
      { key: 'library',   label: 'Library',   icon: BookMarked },
      { key: 'finance',   label: 'Finance',   icon: CreditCard },
      { key: 'transport', label: 'Transport', icon: Bus },
      { key: 'hostel',    label: 'Hostel',    icon: Home },
    ],
  },
  {
    label: 'Account',
    items: [
      { key: 'profile',  label: 'Profile',  icon: User },
      { key: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name = 'S', size = 36, color = 'var(--primary)' }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, color, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      border: `2px solid ${color}40`,
    }}>
      {initials}
    </div>
  );
}

// ── Notification Panel ────────────────────────────────────────────────────────
function NotificationPanel({ notifications, onClose }) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div style={{
      position: 'absolute', top: '110%', right: 0, width: 360,
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: '0.875rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      zIndex: 200, overflow: 'hidden',
    }}>
      <div className="mobile-wrap"  style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
          {unread > 0 && <span style={{ marginLeft: '0.5rem', background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>{unread}</span>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={16} /></button>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.slice(0, 8).map(n => (
          <div key={n.id} style={{
            padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            background: n.read ? 'transparent' : 'rgba(16,185,129,0.04)',
            cursor: 'pointer',
          }}
            onClick={onClose}
          >
            <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.82rem', marginBottom: '0.2rem' }}>{n.title}</div>
              <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.body}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
      <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>View all notifications</button>
      </div>
    </div>
  );
}

// ── Profile Menu ──────────────────────────────────────────────────────────────
function ProfileMenu({ student, onNavigate, onLogout, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: '110%', right: 0, width: 220,
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: '0.875rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      zIndex: 200, overflow: 'hidden',
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Avatar name={`${student.first_name} ${student.last_name}`} size={40} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.first_name} {student.last_name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{student.grade_name} · {student.student_id}</div>
        </div>
      </div>
      {[
        { label: 'My Profile', icon: User, key: 'profile' },
        { label: 'Settings', icon: Settings, key: 'settings' },
      ].map(item => (
        <button key={item.key} onClick={() => { onNavigate(item.key); onClose(); }} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.75rem 1rem', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit',
          fontSize: '0.875rem', fontWeight: 500,
        }}>
          <item.icon size={15} color="var(--text-secondary)" /> {item.label}
        </button>
      ))}
      <div style={{ borderTop: '1px solid var(--border-color)' }}>
        <button onClick={onLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.75rem 1rem', background: 'none', border: 'none',
          cursor: 'pointer', color: '#ef4444', fontFamily: 'inherit',
          fontSize: '0.875rem', fontWeight: 500,
        }}>
          <LogOut size={15} color="#ef4444" /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function StudentLayout() {
  const [activeTab, setActiveTab]       = useState('home');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [showNotif, setShowNotif]       = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [student, setStudent]           = useState(MOCK_STUDENT);
  const notifRef  = useRef(null);
  const profileRef = useRef(null);
  const navigate  = useNavigate();

  const unreadNotif = notifications.filter(n => !n.read).length;
  const unreadMsg   = 3;

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  function navigate2(key) {
    setActiveTab(key);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }

  function getBadge(key) {
    if (key === 'messages') return unreadMsg;
    return 0;
  }

  const PAGE_MAP = {
    home:        <StudentHome        student={student} setActiveTab={navigate2} />,
    subjects:    <StudentSubjects    student={student} />,
    assignments: <StudentAssignments student={student} />,
    grades:      <StudentGrades      student={student} />,
    attendance:  <StudentAttendance  student={student} />,
    exams:       <StudentExams       student={student} />,
    materials:   <StudentMaterials   student={student} />,
    calendar:    <StudentCalendar    student={student} />,
    messages:    <StudentMessages    student={student} />,
    library:     <StudentLibrary     student={student} />,
    finance:     <StudentFinance     student={student} />,
    transport:   <StudentTransport   student={student} />,
    hostel:      <StudentHostel      student={student} />,
    profile:     <StudentProfile     student={student} setStudent={setStudent} />,
    settings:    <StudentSettings    student={student} />,
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="sidebar-brand" style={{ padding: '1.25rem 1.5rem' }}>
        <School size={22} />
        <span>EthioSchool</span>
      </div>

      {/* Student mini-card */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)', margin: '0 0.75rem 0.5rem', background: 'rgba(16,185,129,0.05)', borderRadius: '0.75rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
          🎓 Student Portal
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Avatar name={`${student.first_name} ${student.last_name}`} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {student.first_name} {student.last_name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {student.grade_name} · Sec {student.section_name}
            </div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.75rem' }}>
        {NAV_SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom: '0.25rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.75rem 0.35rem', opacity: 0.7 }}>
              {section.label}
            </div>
            {section.items.map(({ key, label, icon: Icon }) => {
              const badge = getBadge(key);
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => navigate2(key)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.575rem 0.875rem', borderRadius: '0.625rem', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    fontSize: '0.845rem', fontWeight: active ? 700 : 500,
                    background: active ? 'rgba(16,185,129,0.15)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                    marginBottom: '0.1rem', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                >
                  {active && <div style={{ position: 'absolute', left: 0, width: 3, height: 24, background: 'var(--primary)', borderRadius: '0 2px 2px 0' }} />}
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '1rem', lineHeight: 1.5 }}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          padding: '0.625rem', borderRadius: '0.625rem', border: '1px solid var(--border-color)',
          background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-color)' }}>

        {/* ── Desktop Sidebar ─────────────────────────────────── */}
        <aside style={{
          width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)',
          height: '100vh', position: 'sticky', top: 0, overflowY: 'auto',
        }}
          className="student-sidebar-desktop"
        >
          <SidebarContent />
        </aside>

        {/* ── Mobile Sidebar Overlay ──────────────────────────── */}
        {sidebarOpen && (
          <>
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150, backdropFilter: 'blur(2px)' }}
            />
            <aside style={{
              position: 'fixed', top: 0, left: 0, width: 260, height: '100vh',
              background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)',
              zIndex: 160, display: 'flex', flexDirection: 'column',
              animation: 'slideInLeft 0.2s ease-out',
            }}>
              <button onClick={() => setSidebarOpen(false)} style={{
                position: 'absolute', top: '1rem', right: '1rem', background: 'none',
                border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
              }}>
                <X size={20} />
              </button>
              <SidebarContent />
            </aside>
          </>
        )}

        {/* ── Main Area ──────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Sticky Header */}
          <header style={{
            height: 60, display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0 1.5rem', borderBottom: '1px solid var(--border-color)',
            background: 'rgba(30,41,59,0.9)', backdropFilter: 'blur(12px)',
            position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
          }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'none' }}
              className="mobile-menu-btn"
            >
              <Menu size={20} />
            </button>

            {/* Page title */}
            <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>
              {NAV_SECTIONS.flatMap(s => s.items).find(i => i.key === activeTab)?.label || 'Dashboard'}
            </div>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search subjects, assignments, materials..."
                style={{
                  width: '100%', padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                  background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                  borderRadius: '0.625rem', color: 'var(--text-primary)', fontFamily: 'inherit',
                  fontSize: '0.82rem', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              {/* Notification bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
                  style={{
                    position: 'relative', background: showNotif ? 'rgba(16,185,129,0.1)' : 'transparent',
                    border: '1px solid', borderColor: showNotif ? 'rgba(16,185,129,0.3)' : 'var(--border-color)',
                    borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--text-secondary)',
                    padding: '0.45rem 0.55rem', display: 'flex', alignItems: 'center',
                  }}
                >
                  <Bell size={17} color={showNotif ? 'var(--primary)' : undefined} />
                  {unreadNotif > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4, width: 17, height: 17,
                      background: '#ef4444', borderRadius: '50%', fontSize: '0.65rem',
                      fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid var(--bg-surface)',
                    }}>
                      {unreadNotif}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <NotificationPanel
                    notifications={notifications}
                    onClose={() => setShowNotif(false)}
                  />
                )}
              </div>

              {/* Profile avatar */}
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent',
                    border: '1px solid var(--border-color)', borderRadius: '0.75rem',
                    cursor: 'pointer', padding: '0.3rem 0.625rem 0.3rem 0.375rem',
                  }}
                >
                  <Avatar name={`${student.first_name} ${student.last_name}`} size={28} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.first_name}
                  </span>
                  <ChevronDown size={13} color="var(--text-secondary)" />
                </button>
                {showProfile && (
                  <ProfileMenu
                    student={student}
                    onNavigate={navigate2}
                    onLogout={handleLogout}
                    onClose={() => setShowProfile(false)}
                  />
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            <div key={activeTab} style={{ animation: 'fadeSlideIn 0.18s ease-out', maxWidth: 1280, margin: '0 auto' }}>
              {PAGE_MAP[activeTab]}
            </div>
          </main>
        </div>
      </div>

      {/* Responsive & animation styles */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .student-sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </ToastProvider>
  );
}
