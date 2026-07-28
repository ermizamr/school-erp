import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from './mock/studentMockData';

const TYPE_CONFIG = {
  assignment:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Assignment' },
  grade:        { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  label: 'Grade' },
  exam:         { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Exam' },
  message:      { color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  label: 'Message' },
  announcement: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Notice' },
  library:      { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   label: 'Library' },
  fee:          { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Finance' },
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unread = notifications.filter(n => !n.read).length;

  function markAllRead() { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }
  function markRead(id)   { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); }
  function remove(id)     { setNotifications(prev => prev.filter(n => n.id !== id)); }

  const types = ['all', ...Object.keys(TYPE_CONFIG)];
  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 720, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.25rem' }}>Notifications</h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{unread} unread · {notifications.length} total</div>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.5rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {types.map(type => {
          const cfg = TYPE_CONFIG[type];
          const active = filter === type;
          return (
            <button key={type} onClick={() => setFilter(type)} style={{
              padding: '0.35rem 0.875rem', borderRadius: '1rem', border: `1px solid ${active ? (cfg?.color || 'var(--primary)') : 'var(--border-color)'}`,
              background: active ? (cfg?.bg || 'rgba(16,185,129,0.12)') : 'transparent',
              color: active ? (cfg?.color || 'var(--primary)') : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 700 : 500, fontSize: '0.8rem',
            }}>
              {type === 'all' ? 'All' : cfg?.label}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Bell size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>No notifications in this category.</div>
          </div>
        ) : (
          filtered.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type] || { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: n.type };
            return (
              <div key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.25rem',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: n.read ? 'transparent' : 'rgba(16,185,129,0.04)',
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(16,185,129,0.04)'}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                  {n.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.875rem' }}>{n.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{n.time}</span>
                      <button onClick={e => { e.stopPropagation(); remove(n.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.1rem', opacity: 0.5 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{n.body}</div>
                  <div style={{ marginTop: '0.375rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{cfg.label}</span>
                  </div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
