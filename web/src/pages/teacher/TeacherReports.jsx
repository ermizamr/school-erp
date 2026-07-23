import React from 'react';
import { BarChart2, TrendingUp, Download, Printer } from 'lucide-react';

export default function TeacherReports() {
  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Reports & Analytics</h1>
          <p className="text-sm text-muted">Detailed insights into class performance and attendance</p>
        </div>
        <div className="flex-row gap-2">
          <button className="btn" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            <Printer size={18} /> Print
          </button>
          <button className="btn btn-primary gap-2">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="dashboard-grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="glass-card flex-col justify-center" style={{ padding: '3rem', alignItems: 'center', minHeight: '300px' }}>
          <TrendingUp size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 className="text-lg font-bold">Grade Distribution</h3>
          <p className="text-muted text-sm text-center">Visual chart will be rendered here.</p>
        </div>
        <div className="glass-card flex-col justify-center" style={{ padding: '3rem', alignItems: 'center', minHeight: '300px' }}>
          <BarChart2 size={48} style={{ color: '#10b981', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 className="text-lg font-bold">Attendance Trends</h3>
          <p className="text-muted text-sm text-center">Visual chart will be rendered here.</p>
        </div>
      </div>
    </div>
  );
}
