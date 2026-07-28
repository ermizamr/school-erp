import { useState } from 'react';
import {
  BookOpen, AlertTriangle, CheckCircle, Clock, RefreshCw,
  Info, RotateCcw, Library, DollarSign
} from 'lucide-react';
import { MOCK_LIBRARY } from './mock/studentMockData';

const STATUS_CONFIG = {
  borrowed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Borrowed' },
  overdue:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Overdue'  },
  returned: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Returned' },
};

function getDueDays(dueDateStr) {
  const due = new Date(dueDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
}

function DueBadge({ dueDateStr }) {
  const days = getDueDays(dueDateStr);
  if (days < 0) return (
    <span style={{
      background: 'rgba(239,68,68,0.15)', color: '#ef4444',
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>⚠ Overdue by {Math.abs(days)}d</span>
  );
  if (days === 0) return (
    <span style={{
      background: 'rgba(239,68,68,0.12)', color: '#f97316',
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>Due Today</span>
  );
  if (days < 7) return (
    <span style={{
      background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>Due in {days}d</span>
  );
  return (
    <span style={{
      background: 'rgba(16,185,129,0.12)', color: '#10B981',
      borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
    }}>Due in {days}d</span>
  );
}

function Toast({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
      background: '#10B981', color: '#fff',
      borderRadius: 12, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
      fontWeight: 600, fontSize: 14,
      animation: 'fadeInUp 0.25s ease',
    }}>
      <CheckCircle size={18} />
      {message}
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.25)', border: 'none',
        borderRadius: 6, padding: '2px 8px', color: '#fff',
        cursor: 'pointer', fontSize: 12, marginLeft: 6,
      }}>✕</button>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card" style={{
      borderRadius: 14, padding: '18px 20px',
      border: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: color + '22', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

export default function StudentLibrary() {
  const [books, setBooks] = useState(MOCK_LIBRARY.borrowed || []);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRenew = (bookId) => {
    setBooks(prev => prev.map(b => {
      if (b.id !== bookId) return b;
      const due = new Date(b.dueDate);
      due.setDate(due.getDate() + 14);
      return { ...b, dueDate: due.toISOString().split('T')[0], status: 'borrowed' };
    }));
    showToast('Renewal successful! Due date extended by 14 days.');
  };

  const history   = MOCK_LIBRARY.history   || [];
  const overdue   = books.filter(b => getDueDays(b.dueDate) < 0);
  const totalFine = (MOCK_LIBRARY.history || []).reduce((s, h) => s + (h.fine || 0), 0);

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <Library size={22} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Library
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Manage your borrowed books and library account
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <KPICard icon={BookOpen} label="Borrowed"       value={books.length}           color="#3b82f6" />
        <KPICard icon={CheckCircle} label="Returned"    value={history.length}         color="#10B981" />
        <KPICard icon={AlertTriangle} label="Overdue"   value={overdue.length}         color="#ef4444" />
        <KPICard icon={DollarSign} label="Outstanding Fines" value={`ETB ${totalFine}`} color="#f59e0b" />
      </div>

      {/* ─── Overdue alert ─── */}
      {overdue.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle size={18} color="#ef4444" />
          <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>
            You have {overdue.length} overdue {overdue.length === 1 ? 'book' : 'books'}.
            Please return them to avoid additional fines.
          </span>
        </div>
      )}

      {/* ─── Currently Borrowed ─── */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{
          margin: '0 0 16px', fontSize: 16, fontWeight: 700,
          color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <BookOpen size={16} color="var(--primary)" /> Currently Borrowed ({books.length})
        </h2>

        {books.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 0',
            color: 'var(--text-secondary)', fontSize: 14,
          }}>
            <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
            No books currently borrowed.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {books.map(book => {
              const days = getDueDays(book.dueDate);
              const isOverdue = days < 0;
              return (
                <div key={book.id} className="glass-card" style={{
                  borderRadius: 16, overflow: 'hidden',
                  border: isOverdue
                    ? '1px solid rgba(239,68,68,0.4)'
                    : '1px solid var(--border-color)',
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  {isOverdue && (
                    <div style={{
                      background: 'rgba(239,68,68,0.12)', padding: '8px 14px',
                      display: 'flex', alignItems: 'center', gap: 6,
                      borderBottom: '1px solid rgba(239,68,68,0.2)',
                    }}>
                      <AlertTriangle size={13} color="#ef4444" />
                      <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>
                        OVERDUE — Return immediately
                      </span>
                    </div>
                  )}
                  <div style={{ padding: '16px 18px', display: 'flex', gap: 14 }}>
                    <div style={{
                      width: 48, height: 64, borderRadius: 8,
                      background: isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, flexShrink: 0,
                      border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                    }}>
                      {book.cover || '📚'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
                        marginBottom: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{book.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        {book.author}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        📅 Borrowed: {book.borrowedDate}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        🔔 Due: {book.dueDate}
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <DueBadge dueDateStr={book.dueDate} />
                      </div>
                      <button
                        onClick={() => handleRenew(book.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '6px 12px', borderRadius: 8,
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          color: 'var(--primary)', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <RefreshCw size={12} /> Renew Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Return History ─── */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{
          margin: '0 0 16px', fontSize: 16, fontWeight: 700,
          color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <RotateCcw size={16} color="#3b82f6" /> Return History
        </h2>

        <div className="glass-card" style={{
          borderRadius: 14, overflow: 'hidden',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(16,185,129,0.06)' }}>
                  {['Title', 'Author', 'Returned Date', 'Fine'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontWeight: 700, fontSize: 11, color: 'var(--text-secondary)',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: '1px solid var(--border-color)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={{
                    borderBottom: i < history.length - 1 ? '1px solid var(--border-color)' : 'none',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {h.title}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {h.author}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {h.returnedDate}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {h.fine > 0 ? (
                        <span style={{
                          background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                          borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                        }}>ETB {h.fine}</span>
                      ) : (
                        <span style={{
                          background: 'rgba(16,185,129,0.12)', color: '#10B981',
                          borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                        }}>No Fine</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>
      </div>

      {/* ─── Library Rules ─── */}
      <div className="glass-card" style={{
        borderRadius: 14, padding: '18px 22px',
        border: '1px solid rgba(59,130,246,0.25)',
        background: 'rgba(59,130,246,0.04)',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Info size={18} color="#3b82f6" style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{
              fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 8,
            }}>Library Rules & Policies</div>
            <ul style={{
              margin: 0, padding: '0 0 0 18px',
              color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8,
            }}>
              {(MOCK_LIBRARY.rules || [
                'Maximum loan period is 14 days per book.',
                'Each student may borrow up to 3 books at a time.',
                'Lost books must be reported immediately and replacement cost will be charged.',
                'Overdue fines are ETB 2 per day per book.',
                'Books may be renewed once online if no holds are placed.',
                'Library card must be presented for all transactions.',
              ]).map((rule, i) => <li key={i}>{rule}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
