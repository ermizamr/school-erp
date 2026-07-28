import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard — metric card for the student list statistics grid.
 *
 * Props:
 *   label       string
 *   value       number | string
 *   icon        ReactNode
 *   color       CSS colour string   (default: --primary)
 *   trend       number | null       (positive = up, negative = down)
 *   trendLabel  string              (e.g. "vs last month")
 *   loading     bool
 */
export default function StatCard({ label, value, icon, color = 'var(--primary)', trend, trendLabel, loading = false }) {
  const trendPositive = trend > 0;
  const trendNeutral  = trend === 0 || trend == null;

  return (
    <div
      className="glass-card"
      style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0, transition: 'all 0.2s' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: '0.625rem',
          background: `${color}18`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {loading ? (
        <div style={{ height: 32, borderRadius: 6, background: 'var(--bg-surface-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
          {value ?? '—'}
        </div>
      )}

      {(trend != null || trendLabel) && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
          {trendNeutral ? (
            <Minus size={13} color="#94a3b8" />
          ) : trendPositive ? (
            <TrendingUp size={13} color="#10B981" />
          ) : (
            <TrendingDown size={13} color="#ef4444" />
          )}
          <span style={{ color: trendNeutral ? '#94a3b8' : trendPositive ? '#10B981' : '#ef4444', fontWeight: 600 }}>
            {trend != null && !trendNeutral ? `${trendPositive ? '+' : ''}${trend}` : ''}
          </span>
          {trendLabel && <span style={{ color: 'var(--text-secondary)' }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
