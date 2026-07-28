import React, { useEffect, useState } from 'react';
import { getStudentBehavior } from '../../../lib/studentApi';
import { Trophy, AlertTriangle, Shield, Star } from 'lucide-react';

function Section({ title, icon: Icon, iconColor, children, empty }) {
  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>
        <Icon size={16} color={iconColor} /> {title}
      </div>
      {empty ? (
        <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No records found.</div>
      ) : children}
    </div>
  );
}

function RecordCard({ title, date, by, description, color }) {
  return (
    <div style={{ padding: '0.875rem 1rem', borderRadius: '0.625rem', background: `${color}08`, border: `1px solid ${color}25`, marginBottom: '0.625rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color }}>{title}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{date}</span>
      </div>
      {by && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>By: {by}</div>}
      {description && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{description}</div>}
    </div>
  );
}

export default function BehaviorTab({ student }) {
  const [behavior, setBehavior] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentBehavior(student.id).then(setBehavior).finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;
  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading behavior records…</div>;
  if (!behavior) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No behavior data available.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

      <Section title="Rewards & Recognition" icon={Trophy} iconColor="#f59e0b" empty={!behavior.rewards?.length}>
        {behavior.rewards?.map(r => (
          <RecordCard key={r.id} title={r.title} date={r.date} by={r.given_by} description={r.description} color="#f59e0b" />
        ))}
      </Section>

      <Section title="Achievements" icon={Star} iconColor="#a78bfa" empty={!behavior.achievements?.length}>
        {behavior.achievements?.map(a => (
          <RecordCard key={a.id} title={a.title} date={a.date} by={a.category} description={null} color="#a78bfa" />
        ))}
      </Section>

      <Section title="Warnings & Notices" icon={AlertTriangle} iconColor="#ef4444" empty={!behavior.warnings?.length}>
        {behavior.warnings?.map(w => (
          <RecordCard key={w.id} title={w.title} date={w.date} by={w.issued_by} description={w.description} color="#ef4444" />
        ))}
      </Section>

      <Section title="Discipline Records" icon={Shield} iconColor="#94a3b8" empty={!behavior.discipline_records?.length}>
        {behavior.discipline_records?.map(d => (
          <RecordCard key={d.id} title={d.incident} date={d.date} by={`Action: ${d.action_taken}`} description={d.resolved ? '✓ Resolved' : '⚠ Open'} color={d.resolved ? '#94a3b8' : '#f59e0b'} />
        ))}
      </Section>
    </div>
  );
}
