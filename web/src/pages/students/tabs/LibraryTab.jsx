import React, { useEffect, useState } from 'react';
import { getStudentLibrary } from '../../../lib/studentApi';
import { BookOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import StatusBadge from '../../../components/students/StatusBadge';

export default function LibraryTab({ student }) {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentLibrary(student.id).then(setLibrary).finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;
  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading library records…</div>;
  if (!library)  return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No library data available.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* KPIs */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Currently Borrowed', value: library.books_borrowed, color: '#f59e0b', icon: BookOpen },
          { label: 'Total Returned',     value: library.books_returned, color: '#10B981', icon: CheckCircle },
          { label: 'Overdue Books',      value: library.overdue_count,  color: '#ef4444', icon: AlertTriangle },
          { label: 'Outstanding Fines',  value: library.fines > 0 ? `ETB ${library.fines}` : 'None', color: library.fines > 0 ? '#ef4444' : '#10B981', icon: Clock },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: `${k.color}18`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.625rem' }}>
                <Icon size={18} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color, letterSpacing: '-0.03em' }}>{k.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 600 }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Currently Borrowed */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={16} color="var(--primary)" /> Currently Borrowed Books
        </div>
        {library.current_books?.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No books currently borrowed.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Title', 'Author', 'Borrowed Date', 'Due Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {library.current_books?.map(book => (
                <tr key={book.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{book.title}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{book.author}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{book.borrowed_date}</td>
                  <td style={{ padding: '0.875rem 1rem', color: book.status === 'overdue' ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: book.status === 'overdue' ? 600 : 400 }}>{book.due_date}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <StatusBadge status={book.status === 'overdue' ? 'overdue' : book.status === 'borrowed' ? 'pending' : 'paid'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Return History */}
      {library.history?.length > 0 && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} color="#10B981" /> Return History
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Title', 'Returned Date', 'Fine'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {library.history.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{b.title}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{b.returned_date}</td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: b.fine > 0 ? 700 : 400, color: b.fine > 0 ? '#ef4444' : '#10B981' }}>
                    {b.fine > 0 ? `ETB ${b.fine}` : 'No Fine'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
