import React from 'react';
import { BarChart2, TrendingUp, Download, Printer } from 'lucide-react';

export default function TeacherReports() {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Metric,Value\\n2026-07-20,Attendance,95%\\n2026-07-20,Average Grade,B+\\n2026-07-21,Attendance,98%\\n2026-07-21,Average Grade,A-";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "teacher_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Reports & Analytics</h1>
          <p className="text-sm text-muted">Detailed insights into class performance and attendance</p>
        </div>
        <div className="flex-row gap-2">
          <button className="btn" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={handlePrint}>
            <Printer size={18} /> Print
          </button>
          <button className="btn btn-primary gap-2" onClick={handleExportCSV}>
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
