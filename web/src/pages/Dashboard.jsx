import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Users, BookOpen, CalendarCheck, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;
  if (!stats) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Failed to load dashboard data.</div>;

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users },
    { label: 'Total Teachers', value: stats.totalTeachers, icon: BookOpen },
    { label: "Today's Attendance", value: `${stats.todayAttendanceRate}%`, icon: CalendarCheck },
    { label: 'Academic Year', value: stats.activeAcademicYear, icon: Calendar },
  ];

  return (
    <div>
      <h1>Dashboard Overview</h1>
      <p>Here's what's happening at your school.</p>

      <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
        {cards.map((card, idx) => (
          <div key={idx} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                <h3 className="metric-value">{card.value}</h3>
              </div>
              <div style={{ color: 'var(--primary)', opacity: 0.8 }}>
                <card.icon size={32} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="glass-card">
          <h2>Recent Activities</h2>
          <p style={{ marginTop: '1rem' }}>No recent activities yet. Activities will appear here as data flows in.</p>
        </div>
        <div className="glass-card">
          <h2>Quick Actions</h2>
          <p style={{ marginTop: '1rem' }}>Navigate the sidebar to manage students, attendance, and more.</p>
        </div>
      </div>
    </div>
  );
}
