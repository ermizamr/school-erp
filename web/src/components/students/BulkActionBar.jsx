import React, { useState } from 'react';
import {
  ArrowUpCircle, ArrowRightLeft, Trash2, Archive,
  BookOpen, Layout, Home, Printer, Download, MessageSquare,
  ChevronDown, X,
} from 'lucide-react';

const ACTIONS = [
  { key: 'promote',        label: 'Promote',        icon: ArrowUpCircle,  color: '#10B981', group: 'academic' },
  { key: 'assign_class',   label: 'Assign Class',   icon: BookOpen,       color: '#3b82f6', group: 'academic' },
  { key: 'assign_section', label: 'Assign Section', icon: Layout,         color: '#3b82f6', group: 'academic' },
  { key: 'assign_house',   label: 'Assign House',   icon: Home,           color: '#a78bfa', group: 'academic' },
  { key: 'transfer',       label: 'Transfer',       icon: ArrowRightLeft, color: '#f59e0b', group: 'manage' },
  { key: 'archive',        label: 'Archive',        icon: Archive,        color: '#94a3b8', group: 'manage' },
  { key: 'delete',         label: 'Delete',         icon: Trash2,         color: '#ef4444', group: 'danger'  },
  { key: 'print_ids',      label: 'Print IDs',      icon: Printer,        color: '#06b6d4', group: 'tools'   },
  { key: 'export',         label: 'Export',         icon: Download,       color: '#06b6d4', group: 'tools'   },
  { key: 'message',        label: 'Send Message',   icon: MessageSquare,  color: '#10B981', group: 'tools'   },
];

export default function BulkActionBar({ selectedIds, onAction, onClearSelection }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const count = selectedIds.length;

  function handleAction(key) {
    setOpenDropdown(null);
    onAction?.(key, selectedIds);
  }

  if (count === 0) return null;

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1.25rem',
      background: 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.25)',
      borderRadius: '0.75rem',
      marginBottom: '0.75rem',
      flexWrap: 'wrap',
      animation: 'fadeSlideIn 0.2s ease-out',
    }}>
      {/* Selection count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
        <button
          onClick={onClearSelection}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.15rem' }}
          aria-label="Clear selection"
        >
          <X size={16} />
        </button>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
          {count} selected
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />

      {/* Quick action buttons */}
      {ACTIONS.filter(a => a.group !== 'danger').map(action => (
        <button
          key={action.key}
          onClick={() => handleAction(action.key)}
          className="btn"
          style={{
            padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 600,
            background: `${action.color}14`,
            color: action.color,
            border: `1px solid ${action.color}30`,
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}
        >
          <action.icon size={14} />
          {action.label}
        </button>
      ))}

      {/* Danger actions in dropdown */}
      <div style={{ position: 'relative', marginLeft: 'auto' }}>
        <button
          className="btn"
          onClick={() => setOpenDropdown(openDropdown === 'danger' ? null : 'danger')}
          style={{
            padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 600,
            background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}
        >
          More actions <ChevronDown size={13} />
        </button>
        {openDropdown === 'danger' && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: '0.625rem', padding: '0.375rem', minWidth: 140,
            boxShadow: 'var(--shadow-lg)', zIndex: 300,
          }}>
            {ACTIONS.filter(a => a.group === 'danger').map(action => (
              <button
                key={action.key}
                onClick={() => handleAction(action.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                  padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer',
                  color: action.color, fontSize: '0.875rem', fontWeight: 500, borderRadius: '0.375rem',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${action.color}12`}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <action.icon size={14} />
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
