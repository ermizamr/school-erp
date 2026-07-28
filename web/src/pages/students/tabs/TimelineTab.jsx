import React, { useEffect, useState } from 'react';
import { getStudentTimeline } from '../../../lib/studentApi';
import { GraduationCap, AlertTriangle, Award, CreditCard, MessageSquare, BookOpen } from 'lucide-react';

const TYPE_CONFIG = {
  admission:  { icon: GraduationCap, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  attendance: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  grade:      { icon: BookOpen,      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  behavior:   { icon: Award,         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  payment:    { icon: CreditCard,    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
  message:    { icon: MessageSquare, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
};

export default function TimelineTab({ student }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentTimeline(student.id).then(setEvents).finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;
  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading timeline…</div>;

  return (
    <div className="glass-card">
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Activity Timeline</h3>
      {events.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No timeline events yet.</div>
      ) : (
        <div className="timeline-container">
          {events.map((ev, i) => {
            const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.grade;
            const Icon = cfg.icon;
            return (
              <div key={ev.id || i} className="timeline-item">
                <div className="timeline-dot" style={{ background: cfg.color, border: 'none', boxShadow: `0 0 0 4px ${cfg.bg}` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ev.description}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {ev.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
