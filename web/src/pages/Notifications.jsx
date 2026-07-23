import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { supabase } from '../supabaseClient';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [userId, setUserId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadNotifications(user.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function loadNotifications(uid) {
    try {
      setLoading(true);
      const data = await api.getNotifications(uid);
      setNotifications(data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  }

  const filteredNotifications = notifications.filter(n => filter === 'all' ? true : !n.is_read);

  if (!userId) {
    return (
      <div>
        <h1>Notifications</h1>
        <div className="glass-card" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Notifications</h1>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button 
            onClick={() => setFilter('all')}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '0.25rem', 
              backgroundColor: filter === 'all' ? 'var(--bg-surface-hover)' : 'transparent',
              color: filter === 'all' ? 'white' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '0.25rem', 
              backgroundColor: filter === 'unread' ? 'var(--bg-surface-hover)' : 'transparent',
              color: filter === 'unread' ? 'white' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            Unread
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className="glass-card"
              onClick={() => !notification.is_read && handleMarkRead(notification.id)}
              style={{ 
                padding: '1.5rem', 
                cursor: !notification.is_read ? 'pointer' : 'default',
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                borderLeft: !notification.is_read ? '4px solid var(--primary)' : '4px solid transparent'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {notification.title}
                    {!notification.is_read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }}></span>
                    )}
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>{notification.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
