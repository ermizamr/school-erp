import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { GRADES, SECTIONS, HOUSES } from '../../lib/mockData';

const selectStyle = {
  width: '100%', padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem', border: '1px solid var(--border-color)',
  background: 'rgba(15,23,42,0.5)', color: 'var(--text-primary)',
  fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none',
  cursor: 'pointer',
};

const labelStyle = {
  display: 'block', fontSize: '0.75rem', fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: '0.35rem',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const STATUSES = ['active', 'graduated', 'transferred', 'suspended', 'archived'];
const FEE_STATUSES = ['paid', 'pending', 'overdue', 'partial'];
const GENDERS = ['male', 'female'];

export default function StudentFilters({ filters, onChange, onReset, activeCount }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: '0.875rem', padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
      minWidth: 220,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
          <SlidersHorizontal size={15} color="var(--primary)" />
          Filters
          {activeCount > 0 && (
            <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem' }}>
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 500 }}
          >
            <X size={13} /> Reset
          </button>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

      {/* Grade */}
      <div>
        <label style={labelStyle}>Grade</label>
        <select style={selectStyle} value={filters.grade_id || ''} onChange={e => set('grade_id', e.target.value)}>
          <option value="">All Grades</option>
          {GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      {/* Section */}
      <div>
        <label style={labelStyle}>Section</label>
        <select style={selectStyle} value={filters.section_id || ''} onChange={e => set('section_id', e.target.value)}>
          <option value="">All Sections</option>
          {(filters.grade_id ? SECTIONS.filter(s => s.grade_id === filters.grade_id) : SECTIONS).map(s => (
            <option key={s.id} value={s.id}>{s.grade_name} – {s.name}</option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div>
        <label style={labelStyle}>Gender</label>
        <select style={selectStyle} value={filters.gender || ''} onChange={e => set('gender', e.target.value)}>
          <option value="">All</option>
          {GENDERS.map(g => <option key={g} value={g} style={{ textTransform: 'capitalize' }}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
        </select>
      </div>

      {/* Enrollment Status */}
      <div>
        <label style={labelStyle}>Enrollment Status</label>
        <select style={selectStyle} value={filters.enrollment_status || ''} onChange={e => set('enrollment_status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Fee Status */}
      <div>
        <label style={labelStyle}>Fee Status</label>
        <select style={selectStyle} value={filters.fee_status || ''} onChange={e => set('fee_status', e.target.value)}>
          <option value="">All</option>
          {FEE_STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* House */}
      <div>
        <label style={labelStyle}>House</label>
        <select style={selectStyle} value={filters.house || ''} onChange={e => set('house', e.target.value)}>
          <option value="">All Houses</option>
          {HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Transport */}
      <div>
        <label style={labelStyle}>Transport</label>
        <select style={selectStyle}
          value={filters.has_transport === undefined ? '' : String(filters.has_transport)}
          onChange={e => set('has_transport', e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">All</option>
          <option value="true">Uses Bus</option>
          <option value="false">No Bus</option>
        </select>
      </div>

      {/* Hostel */}
      <div>
        <label style={labelStyle}>Hostel</label>
        <select style={selectStyle}
          value={filters.has_hostel === undefined ? '' : String(filters.has_hostel)}
          onChange={e => set('has_hostel', e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">All</option>
          <option value="true">Boarding</option>
          <option value="false">Day Scholar</option>
        </select>
      </div>

      {/* Scholarship */}
      <div>
        <label style={labelStyle}>Scholarship</label>
        <select style={selectStyle}
          value={filters.scholarship === undefined ? '' : String(filters.scholarship)}
          onChange={e => set('scholarship', e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value="">All</option>
          <option value="true">Has Scholarship</option>
          <option value="false">No Scholarship</option>
        </select>
      </div>

      {/* Min Attendance */}
      <div>
        <label style={labelStyle}>Min. Attendance %</label>
        <input
          type="number" min="0" max="100" step="5"
          placeholder="e.g. 80"
          value={filters.min_attendance || ''}
          onChange={e => set('min_attendance', e.target.value ? Number(e.target.value) : undefined)}
          style={{ ...selectStyle, cursor: 'text' }}
        />
      </div>
    </div>
  );
}
