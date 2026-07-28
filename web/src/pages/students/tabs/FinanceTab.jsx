import React, { useEffect, useState } from 'react';
import { getStudentFinance } from '../../../lib/studentApi';
import StatusBadge from '../../../components/students/StatusBadge';
import { DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';

function KpiBox({ label, value, color, icon: Icon }) {
  return (
    <div style={{ padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: '0.625rem', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

export default function FinanceTab({ student }) {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentFinance(student.id).then(setFinance).finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;
  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading finance records…</div>;
  if (!finance) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No finance data available.</div>;

  const totalPaid = finance.payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
  const totalInvoiced = finance.invoices?.reduce((s, i) => s + (i.amount || 0), 0) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* KPI Row */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <KpiBox label="Outstanding Balance" value={`ETB ${finance.outstanding_balance?.toLocaleString() ?? 0}`} color={finance.outstanding_balance > 0 ? '#ef4444' : '#10B981'} icon={AlertCircle} />
        <KpiBox label="Total Paid"          value={`ETB ${totalPaid.toLocaleString()}`}                          color="#10B981" icon={CheckCircle} />
        <KpiBox label="Scholarship"         value={finance.scholarship_amount > 0 ? `ETB ${finance.scholarship_amount.toLocaleString()}` : 'None'} color="#a78bfa" icon={DollarSign} />
      </div>

      {/* Invoices */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <FileText size={16} color="var(--primary)" /> Invoices
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Description', 'Amount', 'Due Date', 'Status', 'Paid Date'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(finance.invoices || []).map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 500, fontSize: '0.875rem' }}>{inv.description}</td>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>ETB {inv.amount?.toLocaleString()}</td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{inv.due_date}</td>
                <td style={{ padding: '0.875rem 1rem' }}><StatusBadge status={inv.status} /></td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{inv.paid_date || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment History */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <CheckCircle size={16} color="#10B981" /> Payment History
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Date', 'Amount', 'Method', 'Reference'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(finance.payments || []).map(pay => (
              <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{pay.date}</td>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#10B981' }}>ETB {pay.amount?.toLocaleString()}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{pay.method}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{pay.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!finance.payments || finance.payments.length === 0) && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No payments recorded yet.</div>
        )}
      </div>
    </div>
  );
}
