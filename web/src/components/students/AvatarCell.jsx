import React from 'react';

const COLORS = [
  '#10B981', '#3b82f6', '#f59e0b', '#ec4899',
  '#a78bfa', '#ef4444', '#06b6d4', '#84cc16',
];

function getColor(name) {
  const code = (name || 'U').charCodeAt(0);
  return COLORS[code % COLORS.length];
}

function getInitials(firstName, lastName) {
  const f = (firstName || '').charAt(0).toUpperCase();
  const l = (lastName  || '').charAt(0).toUpperCase();
  return `${f}${l}` || '?';
}

/**
 * AvatarCell — renders a student photo or a coloured initials avatar.
 *
 * Props:
 *   firstName  string
 *   lastName   string
 *   photoUrl   string | null
 *   size       number  (px, default 36)
 *   showName   bool    (default false) — render name + sub text beside avatar
 *   sub        string  — secondary text when showName is true
 */
export default function AvatarCell({ firstName, lastName, photoUrl, size = 36, showName = false, sub }) {
  const initials = getInitials(firstName, lastName);
  const color = getColor(firstName);
  const fontSize = size <= 32 ? '0.75rem' : size <= 40 ? '0.875rem' : '1rem';

  const avatar = photoUrl ? (
    <img
      src={photoUrl}
      alt={`${firstName} ${lastName}`}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        border: '2px solid var(--bg-surface-hover)',
      }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}cc, ${color})`,
      color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700, fontSize,
      flexShrink: 0, border: '2px solid var(--bg-surface-hover)',
      userSelect: 'none',
    }}>
      {initials}
    </div>
  );

  if (!showName) return avatar;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
      {avatar}
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {firstName} {lastName}
        </div>
        {sub && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
