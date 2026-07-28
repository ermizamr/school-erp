import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Download, Upload, RefreshCw,
  Users, UserCheck, UserPlus, GraduationCap, ArrowRightLeft,
  AlertOctagon, User, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import StatCard from '../../components/students/StatCard';
import StudentTable from '../../components/students/StudentTable';
import StudentFilters from '../../components/students/StudentFilters';
import BulkActionBar from '../../components/students/BulkActionBar';
import ConfirmDialog from '../../components/students/ConfirmDialog';
import { getStudents, getStudentStats, bulkAction, archiveStudent, deleteStudent, exportStudentsCSV } from '../../lib/studentApi';

const PAGE_SIZES = [10, 20, 50];

export default function StudentList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────
  const [students, setStudents]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch]         = useState('');
  const [filters, setFilters]       = useState({});
  const [sortKey, setSortKey]       = useState('first_name');
  const [sortOrder, setSortOrder]   = useState('asc');
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [confirm, setConfirm]       = useState(null); // { type, ids, student }
  const [actionLoading, setActionLoading] = useState(false);

  // ── Data loading ──────────────────────────────────────────
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudents({ search, filters, sort: sortKey, order: sortOrder, page, pageSize });
      setStudents(res.students);
      setTotal(res.total);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortKey, sortOrder, page, pageSize]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await getStudentStats();
      setStats(s);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // Reset page when search/filters change
  useEffect(() => { setPage(1); setSelectedIds([]); }, [search, filters]);

  // ── Sort ──────────────────────────────────────────────────
  function handleSort(col) {
    if (sortKey === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortKey(col); setSortOrder('asc'); }
  }

  // ── Selection ─────────────────────────────────────────────
  function handleSelectAll(checked) {
    setSelectedIds(checked ? students.map(s => s.id) : []);
  }
  function handleSelectOne(id, checked) {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  }

  // ── Bulk action handler ───────────────────────────────────
  async function handleBulkAction(action, ids) {
    if (action === 'delete') {
      setConfirm({ type: 'bulk_delete', ids });
      return;
    }
    if (action === 'archive') {
      setConfirm({ type: 'bulk_archive', ids });
      return;
    }
    if (action === 'export') {
      try { await exportStudentsCSV(filters); toast.success('Export complete'); }
      catch { toast.error('Export failed'); }
      return;
    }
    // Other actions (promote, transfer, assign_*) — show toast for now
    toast.info(`Action "${action}" applied to ${ids.length} student(s).`);
  }

  // ── Row action handler ────────────────────────────────────
  function handleRowAction(action, student) {
    if (action === 'delete')  { setConfirm({ type: 'delete', ids: [student.id], student }); return; }
    if (action === 'archive') { setConfirm({ type: 'archive', ids: [student.id], student }); return; }
    if (action === 'promote') { toast.info(`Promote ${student.first_name} — coming soon.`); }
  }

  // ── Confirm dialog execute ────────────────────────────────
  async function executeConfirm() {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.type === 'delete' || confirm.type === 'bulk_delete') {
        for (const id of confirm.ids) await deleteStudent(id);
        toast.success(`${confirm.ids.length} student(s) deleted.`);
      } else if (confirm.type === 'archive' || confirm.type === 'bulk_archive') {
        await bulkAction(confirm.ids, 'archive');
        toast.success(`${confirm.ids.length} student(s) archived.`);
      }
      setConfirm(null);
      setSelectedIds([]);
      loadStudents();
      loadStats();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  // ── Stat cards config ────────────────────────────────────
  const statCards = stats ? [
    { label: 'Total Students',      value: stats.total,         icon: <Users size={18} />,          color: '#10B981' },
    { label: 'Active Students',     value: stats.active,        icon: <UserCheck size={18} />,       color: '#3b82f6' },
    { label: 'New Admissions',      value: stats.new_admissions, icon: <UserPlus size={18} />,       color: '#a78bfa' },
    { label: 'Graduated',           value: stats.graduated,     icon: <GraduationCap size={18} />,   color: '#06b6d4' },
    { label: 'Transferred',         value: stats.transferred,   icon: <ArrowRightLeft size={18} />,  color: '#f59e0b' },
    { label: 'Suspended',           value: stats.suspended,     icon: <AlertOctagon size={18} />,    color: '#ef4444' },
    { label: 'Male Students',       value: stats.male,          icon: <User size={18} />,            color: '#3b82f6' },
    { label: 'Female Students',     value: stats.female,        icon: <User size={18} />,            color: '#ec4899' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>Students</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage all student records, profiles, and academic data.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={async () => { try { await exportStudentsCSV(filters); toast.success('Export ready'); } catch { toast.error('Export failed'); } }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
          >
            <Download size={15} /> Export
          </button>
          <button
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}
          >
            <Upload size={15} /> Import
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/students/new')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.875rem' }}>
        {statsLoading
          ? [...Array(8)].map((_, i) => <StatCard key={i} loading label="Loading" />)
          : statCards.map(c => <StatCard key={c.label} {...c} />)
        }
      </div>

      {/* ── Search Bar ──────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '0.875rem 1.125rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 200 }}>
          <Search size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input
            type="search"
            placeholder="Search by name, ID, admission number, guardian, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.1rem' }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Per page:</label>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.375rem', color: 'var(--text-primary)', padding: '0.3rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <button
            onClick={() => setShowFilters(v => !v)}
            className="btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem',
              fontSize: '0.8rem', background: showFilters ? 'rgba(16,185,129,0.12)' : 'transparent',
              border: `1px solid ${showFilters ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
              color: showFilters ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            Filters {activeFilterCount > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '1rem', fontSize: '0.68rem', padding: '0.05rem 0.4rem', fontWeight: 700 }}>{activeFilterCount}</span>}
          </button>

          <button
            onClick={() => { loadStudents(); loadStats(); }}
            title="Refresh"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── Main area: filters sidebar + table ──────────── */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

        {/* Filter Sidebar */}
        {showFilters && (
          <div style={{ flexShrink: 0, width: 230 }}>
            <StudentFilters
              filters={filters}
              onChange={f => { setFilters(f); setPage(1); }}
              onReset={() => { setFilters({}); setPage(1); }}
              activeCount={activeFilterCount}
            />
          </div>
        )}

        {/* Table Card */}
        <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', minWidth: 0 }}>
          {/* Bulk Bar */}
          {selectedIds.length > 0 && (
            <div style={{ padding: '0.75rem 1rem 0' }}>
              <BulkActionBar
                selectedIds={selectedIds}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedIds([])}
              />
            </div>
          )}

          {/* Table */}
          <StudentTable
            students={students}
            loading={loading}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            onActionRow={handleRowAction}
          />

          {/* Pagination Footer */}
          {!loading && students.length > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-color)',
              flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> students
                {selectedIds.length > 0 && <> · <strong style={{ color: 'var(--primary)' }}>{selectedIds.length} selected</strong></>}
              </span>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn"
                  style={{ padding: '0.35rem 0.6rem', background: 'transparent', border: '1px solid var(--border-color)', color: page === 1 ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: page === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={15} />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="btn"
                      style={{
                        padding: '0.35rem 0.65rem', minWidth: 34,
                        background: page === p ? 'var(--primary)' : 'transparent',
                        border: `1px solid ${page === p ? 'var(--primary)' : 'var(--border-color)'}`,
                        color: page === p ? '#fff' : 'var(--text-primary)',
                        fontWeight: page === p ? 700 : 400, fontSize: '0.8rem',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn"
                  style={{ padding: '0.35rem 0.6rem', background: 'transparent', border: '1px solid var(--border-color)', color: page === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Dialog ───────────────────────────────── */}
      <ConfirmDialog
        open={!!confirm}
        title={
          confirm?.type?.includes('delete') ? 'Delete Student(s)?' :
          confirm?.type?.includes('archive') ? 'Archive Student(s)?' : 'Confirm Action'
        }
        message={
          confirm?.type?.includes('delete')
            ? `This will permanently delete ${confirm?.ids?.length} student record(s). This action cannot be undone.`
            : `This will archive ${confirm?.ids?.length} student record(s). You can restore them later from the archive.`
        }
        confirmText={confirm?.type?.includes('delete') ? 'Delete' : 'Archive'}
        variant={confirm?.type?.includes('delete') ? 'danger' : 'warning'}
        onConfirm={executeConfirm}
        onCancel={() => setConfirm(null)}
        loading={actionLoading}
      />
    </div>
  );
}
