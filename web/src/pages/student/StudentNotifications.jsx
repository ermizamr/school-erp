import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Bell, Check, BookOpen, Users, Megaphone } from 'lucide-react';

const TYPE_CONFIG = {
  general:    { label: 'General',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: Bell },
  attendance: { label: 'Attendance', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Users },
  grade:      { label: 'Grade',      color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: BookOpen },
};

export default function StudentNotifications({ profile }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (profile) load();
    else setLoading(false);
  }, [profile]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', profile.id)
        .order('created_at', { ascending: false });
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading notifications…</div>;

  return (
    <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ margin: 0 }}>Notifications</h1>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '1rem' }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <p>Messages from your teachers and school administration.</p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn"
            onClick={markAllRead}
            style={{ border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            <Check size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[{ key: 'all', label: 'All' }, ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 500, fontSize: '0.85rem',
              backgroundColor: filter === key ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
              color: filter === key ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {label}
            {key === 'all' && notifications.length > 0 && (
              <span style={{ marginLeft: '0.4rem', opacity: 0.7 }}>({notifications.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Megaphone size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
          </h2>
          <p>You'll see messages from your teachers here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filtered.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
            const Icon = cfg.icon;
            const timeAgo = (() => {
              const diff = Date.now() - new Date(n.created_at).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 1) return 'Just now';
              if (mins < 60) return `${mins}m ago`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `${hrs}h ago`;
              return `${Math.floor(hrs / 24)}d ago`;
            })();

            return (
              <div
                key={n.id}
                className="glass-card"
                onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  padding: '1.1rem 1.35rem',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  borderLeft: `3px solid ${n.is_read ? 'var(--border-color)' : cfg.color}`,
                  opacity: n.is_read ? 0.75 : 1,
                  cursor: n.is_read ? 'default' : 'pointer',
                  transition: 'opacity 0.2s',
                  position: 'relative',
                }}
              >
                {/* Icon */}
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: n.is_read ? 'rgba(255,255,255,0.05)' : cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s' }}>
                  <Icon size={17} color={n.is_read ? 'var(--text-secondary)' : cfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.3rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: n.is_read ? 500 : 700 }}>{n.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span className="badge" style={{ backgroundColor: n.is_read ? 'rgba(255,255,255,0.05)' : cfg.bg, color: n.is_read ? 'var(--text-secondary)' : cfg.color, fontSize: '0.65rem' }}>
                        {cfg.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{timeAgo}</span>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{n.message}</p>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
