import { CreditCard, Trophy, Receipt, History, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { MOCK_FINANCE } from './mock/studentMockData';

const INVOICE_STATUS = {
  paid:      { color: '#10B981', bg: 'rgba(16,185,129,0.13)',  label: 'Paid'       },
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.13)',  label: 'Pending'    },
  overdue:   { color: '#ef4444', bg: 'rgba(239,68,68,0.13)',   label: 'Overdue'    },
  applied:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.13)',  label: 'Applied'    },
};

function StatusBadge({ status }) {
  const cfg = INVOICE_STATUS[status] || INVOICE_STATUS.pending;
  const icons = { paid: CheckCircle, pending: Clock, overdue: XCircle, applied: Trophy };
  const Icon = icons[status] || Clock;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color,
      borderRadius: 7, padding: '3px 10px', fontSize: 11, fontWeight: 700,
    }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function SectionTitle({ icon: Icon, color = 'var(--primary)', children }) {
  return (
    <h2 style={{
      margin: '0 0 16px', fontSize: 16, fontWeight: 700,
      color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Icon size={16} color={color} /> {children}
    </h2>
  );
}

function formatCurrency(amount) {
  return `ETB ${Number(amount).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;
}

export default function StudentFinance() {
  const finance  = MOCK_FINANCE || {};
  const invoices = finance.invoices || [];
  const payments = finance.payments || [];
  const scholarship = finance.scholarship || null;
  const balance     = finance.balance ?? 0;

  const invoiceTotal = invoices.reduce((s, inv) => s + (inv.amount || 0), 0);

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <CreditCard size={22} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Finance
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Fees, invoices & payment history
          </p>
        </div>
      </div>

      {/* ─── Hero row: Balance + Scholarship ─── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, marginBottom: 28,
        alignItems: 'stretch',
      }}>
        {/* Balance card */}
        <div className="glass-card" style={{
          borderRadius: 18, padding: '28px 32px',
          background: balance > 0
            ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)'
            : 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0.03) 100%)',
          border: balance > 0
            ? '1.5px solid rgba(239,68,68,0.4)'
            : '1.5px solid rgba(16,185,129,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative ring */}
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 160, height: 160, borderRadius: '50%',
            border: `40px solid ${balance > 0 ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)'}`,
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
            Outstanding Balance
          </div>
          <div style={{
            fontSize: 40, fontWeight: 900, lineHeight: 1,
            color: balance > 0 ? '#ef4444' : '#10B981',
            letterSpacing: '-1px', marginBottom: 10,
          }}>
            {formatCurrency(balance)}
          </div>
          {balance > 0 ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(239,68,68,0.12)', color: '#ef4444',
              borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600,
            }}>
              <AlertCircle size={13} /> Payment required — avoid service interruptions
            </div>
          ) : (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(16,185,129,0.12)', color: '#10B981',
              borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600,
            }}>
              <CheckCircle size={13} /> All fees cleared — great standing!
            </div>
          )}
        </div>

        {/* Scholarship card */}
        {scholarship && (
          <div className="glass-card" style={{
            borderRadius: 18, padding: '22px 26px', minWidth: 260,
            border: '1.5px solid rgba(245,158,11,0.35)',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trophy size={18} color="#f59e0b" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                Scholarship
              </span>
            </div>
            <div style={{
              fontSize: 26, fontWeight: 800, color: '#f59e0b',
              letterSpacing: '-0.5px',
            }}>
              {formatCurrency(scholarship.amount)}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
              {scholarship.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {scholarship.description}
            </div>
          </div>
        )}
      </div>

      {/* ─── Invoices ─── */}
      <div style={{ marginBottom: 36 }}>
        <SectionTitle icon={Receipt} color="#a855f7">Invoices</SectionTitle>

        <div className="glass-card" style={{
          borderRadius: 14, overflow: 'hidden',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(16,185,129,0.05)' }}>
                  {['Date', 'Description', 'Amount', 'Status', 'Paid Date'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: h === 'Amount' ? 'right' : 'left',
                      fontWeight: 700, fontSize: 11, color: 'var(--text-secondary)',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: '1px solid var(--border-color)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={i} style={{
                    borderBottom: i < invoices.length - 1 ? '1px solid var(--border-color)' : 'none',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {inv.date}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {inv.description}
                    </td>
                    <td style={{
                      padding: '12px 16px', textAlign: 'right',
                      color: 'var(--text-primary)', fontWeight: 700,
                      fontFeatureSettings: '"tnum"',
                    }}>
                      {formatCurrency(inv.amount)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {inv.paidDate || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Total row */}
              <tfoot>
                <tr style={{ background: 'rgba(16,185,129,0.06)', borderTop: '2px solid var(--primary)' }}>
                  <td colSpan={2} style={{
                    padding: '12px 16px', fontWeight: 700,
                    color: 'var(--text-primary)', fontSize: 13,
                  }}>Total</td>
                  <td style={{
                    padding: '12px 16px', textAlign: 'right',
                    fontWeight: 800, color: 'var(--primary)', fontSize: 14,
                    fontFeatureSettings: '"tnum"',
                  }}>
                    {formatCurrency(invoiceTotal)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table></div>
          </div>
        </div>
      </div>

      {/* ─── Payment History ─── */}
      <div style={{ marginBottom: 36 }}>
        <SectionTitle icon={History} color="#3b82f6">Payment History</SectionTitle>

        <div className="glass-card" style={{
          borderRadius: 14, overflow: 'hidden',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(16,185,129,0.05)' }}>
                  {['Date', 'Description', 'Amount', 'Method', 'Reference'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: h === 'Amount' ? 'right' : 'left',
                      fontWeight: 700, fontSize: 11, color: 'var(--text-secondary)',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: '1px solid var(--border-color)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{
                      padding: '32px', textAlign: 'center',
                      color: 'var(--text-secondary)', fontSize: 13,
                    }}>No payment history available.</td>
                  </tr>
                ) : (
                  payments.map((p, i) => (
                    <tr key={i} style={{
                      borderBottom: i < payments.length - 1 ? '1px solid var(--border-color)' : 'none',
                      transition: 'background 0.1s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {p.date}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {p.description}
                      </td>
                      <td style={{
                        padding: '12px 16px', textAlign: 'right',
                        color: '#10B981', fontWeight: 700,
                        fontFeatureSettings: '"tnum"',
                      }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                          borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                        }}>{p.method}</span>
                      </td>
                      <td style={{
                        padding: '12px 16px', color: 'var(--text-secondary)',
                        fontFamily: 'monospace', fontSize: 12,
                      }}>
                        {p.reference}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table></div>
          </div>
        </div>
      </div>
    </div>
  );
}
