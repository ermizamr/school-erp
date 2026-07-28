import React from 'react';
import { ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';

const MOCK_ASSIGNMENTS = [
  { id: 'a1', title: 'Mathematics Problem Set – Chapter 5', subject: 'Mathematics', teacher: 'Mr. Ahmed', due_date: '2026-07-20', submitted_date: '2026-07-19', score: 18, max_score: 20, status: 'graded' },
  { id: 'a2', title: 'English Essay – "My Future Goals"', subject: 'English', teacher: 'Ms. Sara', due_date: '2026-07-25', submitted_date: '2026-07-25', score: null, max_score: 25, status: 'submitted' },
  { id: 'a3', title: 'Physics Lab Report – Pendulum Motion', subject: 'Physics', teacher: 'Mr. Daniel', due_date: '2026-07-18', submitted_date: null, score: null, max_score: 30, status: 'missing' },
  { id: 'a4', title: 'History: Ethiopian Empire Research', subject: 'History', teacher: 'Mrs. Tigist', due_date: '2026-08-05', submitted_date: null, score: null, max_score: 20, status: 'pending' },
  { id: 'a5', title: 'Biology Diagram – Cell Structure', subject: 'Biology', teacher: 'Ms. Hiwot', due_date: '2026-07-15', submitted_date: '2026-07-14', score: 29, max_score: 30, status: 'graded' },
];

const STATUS_CFG = {
  graded:    { label: 'Graded',    color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle },
  submitted: { label: 'Submitted', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Clock },
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  missing:   { label: 'Missing',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: XCircle },
};

export default function AssignmentsTab({ student }) {
  if (!student) return null;

  const graded    = MOCK_ASSIGNMENTS.filter(a => a.status === 'graded');
  const avgScore  = graded.length
    ? (graded.reduce((s, a) => s + (a.score / a.max_score) * 100, 0) / graded.length).toFixed(1)
    : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* KPIs */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Total Assigned', value: MOCK_ASSIGNMENTS.length, color: '#3b82f6' },
          { label: 'Graded',         value: MOCK_ASSIGNMENTS.filter(a => a.status === 'graded').length, color: '#10B981' },
          { label: 'Missing',        value: MOCK_ASSIGNMENTS.filter(a => a.status === 'missing').length, color: '#ef4444' },
          { label: 'Average Score',  value: `${avgScore}%`, color: 'var(--primary)' },
        ].map(k => (
          <div key={k.label} style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: k.color, letterSpacing: '-0.03em' }}>{k.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 600 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Assignments Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <ClipboardList size={16} color="var(--primary)" /> Assignments
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Assignment', 'Subject', 'Teacher', 'Due Date', 'Submitted', 'Score', 'Status'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_ASSIGNMENTS.map(a => {
              const cfg = STATUS_CFG[a.status] || STATUS_CFG.pending;
              const Icon = cfg.icon;
              const scorePct = a.score != null ? `${a.score}/${a.max_score}` : '—';
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem', maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{a.subject}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{a.teacher}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: a.status === 'missing' ? '#ef4444' : 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: a.status === 'missing' ? 600 : 400 }}>{a.due_date}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{a.submitted_date || <span style={{ color: '#ef4444' }}>Not submitted</span>}</td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: a.score != null ? 'var(--primary)' : 'var(--text-secondary)' }}>{scorePct}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
