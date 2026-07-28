import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, MoreVertical, ArrowUpCircle, Archive, Trash2 } from 'lucide-react';
import AvatarCell from './AvatarCell';
import StatusBadge from './StatusBadge';

const th = {
  padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)',
  fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em',
  whiteSpace: 'nowrap', userSelect: 'none',
};
const td = { padding: '0.875rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' };

function AttendancePill({ pct }) {
  const color = pct >= 90 ? '#10B981' : pct >= 75 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 90 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--bg-surface-hover)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color, minWidth: 36, textAlign: 'right' }}>
        {pct?.toFixed(0)}%
      </span>
    </div>
  );
}

function GradeCell({ avg }) {
  const color = avg >= 85 ? '#10B981' : avg >= 70 ? '#f59e0b' : '#ef4444';
  return <span style={{ fontWeight: 700, color, fontSize: '0.875rem' }}>{avg?.toFixed(1) ?? '—'}</span>;
}

export default function StudentTable({
  students,
  loading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  sortKey,
  sortOrder,
  onSort,
  onActionRow,
}) {
  const navigate = useNavigate();
  const allSelected = students.length > 0 && students.every(s => selectedIds.includes(s.id));
  const someSelected = students.some(s => selectedIds.includes(s.id));

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ opacity: 0.3 }}>↕</span>;
    return <span style={{ color: 'var(--primary)' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const SortTh = ({ col, children, style: extraStyle }) => (
    <th
      style={{ ...th, cursor: 'pointer', ...extraStyle }}
      onClick={() => onSort(col)}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        {children} <SortIcon col={col} />
      </span>
    </th>
  );

  if (loading) {
    return (
      <div style={{ padding: '1rem' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.875rem 1rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-surface-hover)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ flex: 1, height: 16, borderRadius: 4, background: 'var(--bg-surface-hover)', animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.05}s` }} />
            <div style={{ width: 80, height: 16, borderRadius: 4, background: 'var(--bg-surface-hover)', animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎓</div>
        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No students found</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto' }}>
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
            <th style={{ ...th, width: 44, paddingRight: 0 }}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={e => onSelectAll(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: 16, height: 16 }}
                aria-label="Select all"
              />
            </th>
            <SortTh col="student_id">ID</SortTh>
            <SortTh col="first_name">Student</SortTh>
            <SortTh col="grade_name">Grade</SortTh>
            <th style={th}>Section</th>
            <SortTh col="gender">Gender</SortTh>
            <th style={th}>Age</th>
            <th style={th}>Guardian</th>
            <th style={th}>Phone</th>
            <SortTh col="attendance_percentage">Attendance</SortTh>
            <SortTh col="average_grade">Avg Grade</SortTh>
            <th style={th}>Fee Status</th>
            <th style={th}>Status</th>
            <th style={{ ...th, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const selected = selectedIds.includes(student.id);
            const dob = student.date_of_birth ? new Date(student.date_of_birth) : null;
            const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : '—';

            return (
              <tr
                key={student.id}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  background: selected ? 'rgba(16,185,129,0.05)' : 'transparent',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = selected ? 'rgba(16,185,129,0.05)' : 'transparent'; }}
              >
                <td style={{ ...td, paddingRight: 0, width: 44 }}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={e => { e.stopPropagation(); onSelectOne(student.id, e.target.checked); }}
                    style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: 16, height: 16 }}
                    aria-label={`Select ${student.first_name}`}
                  />
                </td>

                <td style={td} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {student.student_id}
                  </span>
                </td>

                <td style={td} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <AvatarCell
                    firstName={student.first_name} lastName={student.last_name}
                    photoUrl={student.photo_url} size={34} showName
                    sub={`Roll #${student.roll_number || '—'}`}
                  />
                </td>

                <td style={td} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{student.grade_name}</span>
                </td>

                <td style={td} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>
                    {student.section_name || '—'}
                  </span>
                </td>

                <td style={td} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <StatusBadge status={student.gender} />
                </td>

                <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.875rem' }}
                  onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  {age}
                </td>

                <td style={{ ...td, maxWidth: 150 }} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {student.guardian_name || '—'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {student.guardian_relationship}
                  </div>
                </td>

                <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.82rem' }}
                  onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  {student.guardian_phone || '—'}
                </td>

                <td style={{ ...td, minWidth: 120 }} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <AttendancePill pct={student.attendance_percentage ?? 0} />
                </td>

                <td style={td} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <GradeCell avg={student.average_grade} />
                </td>

                <td style={td} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <StatusBadge status={student.fee_status} />
                </td>

                <td style={td} onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                  <StatusBadge status={student.enrollment_status} />
                </td>

                <td style={{ ...td, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/students/${student.id}`); }}
                      title="View Profile"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.3rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onActionRow?.('promote', student); }}
                      title="Promote"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.3rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <ArrowUpCircle size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onActionRow?.('archive', student); }}
                      title="Archive"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.3rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Archive size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onActionRow?.('delete', student); }}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.3rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
