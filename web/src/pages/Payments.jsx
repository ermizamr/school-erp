import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ student_id: '', amount: '', type: 'tuition', status: 'completed' });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [paymentsData, studentsData] = await Promise.all([
        api.getPayments(),
        api.getStudents()
      ]);
      setPayments(paymentsData);
      setStudents(studentsData);
    } catch (err) {
      toast({ title: 'Error', message: 'Failed to load payments', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.addPayment({ ...formData, amount: Number(formData.amount) });
      toast({ title: 'Success', message: 'Payment recorded successfully', type: 'success' });
      setShowModal(false);
      setFormData({ student_id: '', amount: '', type: 'tuition', status: 'completed' });
      loadData();
    } catch (err) {
      toast({ title: 'Error', message: 'Failed to record payment', type: 'error' });
    }
  }

  const getStatusBadge = (status) => {
    let bg = 'rgba(255,255,255,0.1)';
    let color = 'white';
    if (status === 'completed') {
      bg = 'rgba(16, 185, 129, 0.2)';
      color = '#10B981';
    } else if (status === 'pending') {
      bg = 'rgba(245, 158, 11, 0.2)';
      color = '#F59E0B';
    } else if (status === 'failed') {
      bg = 'rgba(239, 68, 68, 0.2)';
      color = '#EF4444';
    }
    return (
      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', backgroundColor: bg, color, textTransform: 'capitalize', fontWeight: 500 }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Payments</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Record Payment</button>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No payments found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Student Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Amount (ETB)</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>{payment.student?.first_name} {payment.student?.last_name}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{payment.amount}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{new Date(payment.created_at || payment.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{payment.type}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{getStatusBadge(payment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-surface)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Record Payment</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select 
                required
                value={formData.student_id}
                onChange={e => setFormData({...formData, student_id: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
              <input 
                required type="number" min="0" step="0.01"
                placeholder="Amount (ETB)" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
              />
              <select 
                required
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
              >
                <option value="tuition">Tuition</option>
                <option value="registration">Registration</option>
                <option value="other">Other</option>
              </select>
              <select 
                required
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
