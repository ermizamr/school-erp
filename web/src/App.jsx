import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Outlet, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { supabase } from './supabaseClient';
import Login from './Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Academics from './pages/Academics';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import TeacherLayout from './pages/teacher/TeacherLayout';
import {
  LayoutDashboard, Users, BookOpen, CalendarCheck,
  FileText, CreditCard, Bell, LogOut, School
} from 'lucide-react';

function DashboardLayout() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/dashboard/students', icon: Users, label: 'Students' },
    { to: '/dashboard/academics', icon: BookOpen, label: 'Academics' },
    { to: '/dashboard/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/dashboard/exams', icon: FileText, label: 'Exams & Grading' },
    { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <School size={24} />
          <span>EthioSchool ERP</span>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center', backgroundColor: 'transparent', color: 'var(--text-secondary)' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="academics" element={<Academics />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="exams" element={<Exams />} />
            <Route path="payments" element={<Payments />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="/teacher/*" element={<TeacherLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
