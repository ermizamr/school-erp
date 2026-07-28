import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog — accessible confirmation modal for destructive actions.
 *
 * Props:
 *   open        bool
 *   title       string
 *   message     string | ReactNode
 *   confirmText string  (default "Confirm")
 *   cancelText  string  (default "Cancel")
 *   variant     'danger' | 'warning' | 'info'
 *   onConfirm   () => void
 *   onCancel    () => void
 *   loading     bool
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const confirmRef = useRef(null);

  // Trap focus on open
  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onCancel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const colors = {
    danger:  { icon: '#ef4444', btn: '#ef4444', btnHover: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
    warning: { icon: '#f59e0b', btn: '#f59e0b', btnHover: '#d97706', bg: 'rgba(245,158,11,0.1)' },
    info:    { icon: '#3b82f6', btn: '#3b82f6', btnHover: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
  };
  const c = colors[variant] || colors.danger;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        className="glass-card"
        style={{ width: '100%', maxWidth: 440, backgroundColor: 'var(--bg-surface)', padding: '2rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '0.75rem', background: c.bg, color: c.icon }}>
              <AlertTriangle size={20} />
            </div>
            <h3 id="confirm-title" style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</h3>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {message && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {message}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn"
            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className="btn"
            style={{
              background: c.btn,
              color: '#fff',
              opacity: loading ? 0.7 : 1,
              boxShadow: `0 4px 14px 0 ${c.btn}50`,
            }}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
