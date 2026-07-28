import React, { useEffect, useState } from 'react';
import { getStudentExamResults } from '../../../lib/studentApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Award, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

export default function ExamResultsTab({ student }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentExamResults(student.id).then(setResults).finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;

  const chartData = results.map(r => ({
    name: r.name?.length > 20 ? r.name.slice(0, 20) + '…' : r.name,
    score: r.score,
    avg: r.class_avg,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Chart */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
          <TrendingUp size={16} color="var(--primary)" /> Exam Score vs Class Average
        </div>
        {loading ? (
          <div style={{ height: 200, background: 'var(--bg-surface-hover)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" name="Your Score" fill="var(--primary)" radius={[3,3,0,0]} barSize={18} />
              <Bar dataKey="avg" name="Class Avg"  fill="#3b82f640" radius={[3,3,0,0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Exam Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <Award size={16} color="var(--primary)" /> Exam Results
        </div>
        {loading ? (
          <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading…</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Exam', 'Date', 'Score', 'Max', 'Percentage', 'Rank', 'Class Avg'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map(r => {
                const pct = r.max_score > 0 ? ((r.score / r.max_score) * 100).toFixed(1) : '—';
                const color = Number(pct) >= 85 ? '#10B981' : Number(pct) >= 70 ? '#f59e0b' : '#ef4444';
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{r.date}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color }}>{r.score}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{r.max_score}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color }}>{pct}%</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '0.2rem 0.55rem', borderRadius: '0.375rem', fontSize: '0.8rem' }}>#{r.rank}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{r.class_avg}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
