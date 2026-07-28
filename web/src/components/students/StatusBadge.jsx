import React from 'react';

const CONFIG = {
  active:      { label: 'Active',      bg: 'rgba(16,185,129,0.12)',  color: '#10B981' },
  graduated:   { label: 'Graduated',   bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  transferred: { label: 'Transferred', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  suspended:   { label: 'Suspended',   bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  archived:    { label: 'Archived',    bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
  // Fee status
  paid:        { label: 'Paid',        bg: 'rgba(16,185,129,0.12)',  color: '#10B981' },
  pending:     { label: 'Pending',     bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  overdue:     { label: 'Overdue',     bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  partial:     { label: 'Partial',     bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  // Gender
  male:        { label: 'Male',        bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  female:      { label: 'Female',      bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
  // Generic
  borrowed:    { label: 'Borrowed',    bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  returned:    { label: 'Returned',    bg: 'rgba(16,185,129,0.12)',  color: '#10B981' },
  overdue_lib: { label: 'Overdue',     bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = CONFIG[status?.toLowerCase()] || { label: status, bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' };
  const fontSize = size === 'sm' ? '0.72rem' : '0.8rem';
  const padding  = size === 'sm' ? '0.2rem 0.6rem' : '0.25rem 0.75rem';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding,
      borderRadius: '1rem',
      fontSize,
      fontWeight: 600,
      letterSpacing: '0.02em',
      background: cfg.bg,
      color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
