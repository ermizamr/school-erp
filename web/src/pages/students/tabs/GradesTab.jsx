import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { getStudentGrades } from '../../../lib/studentApi';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

function GradeRow({ subject, score, grade, teacher, trend }) {
  const color = score >= 85 ? '#10B981' : score >= 70 ? '#f59e0b' : '#ef4444';
  const TIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const tColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#ef4444' : '#94a3b8';

  return (
    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{subject}</td>
      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{teacher}</td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 80, height: 5, background: 'var(--bg-surface-hover)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{score}</span>
        </div>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{ fontWeight: 700, color, background: `${color}18`, padding: '0.2rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.8rem' }}>{grade}</span>
      </td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <TIcon size={15} color={tColor} />
      </td>
    </tr>
  );
}

export default function GradesTab({ student }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentGrades(student.id).then(setGrades).finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;

  const avg = grades.length ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : '—';
  const highest = grades.length ? Math.max(...grades.map(g => g.score)) : '—';
  const lowest  = grades.length ? Math.min(...grades.map(g => g.score)) : '—';
  const avgColor = Number(avg) >= 85 ? '#10B981' : Number(avg) >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* KPI Row */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'GPA',       value: student.gpa?.toFixed(2) ?? '—',    color: avgColor },
          { label: 'Average',   value: `${avg}%`,                          color: '#3b82f6' },
          { label: 'Highest',   value: `${highest}%`,                      color: '#10B981' },
          { label: 'Lowest',    value: `${lowest}%`,                       color: '#ef4444' },
        ].map(k => (
          <div key={k.label} style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: k.color, letterSpacing: '-0.03em' }}>{k.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem', fontWeight: 600 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>Subject Scores</h3>
          {loading ? (
            <div style={{ height: 220, background: 'var(--bg-surface-hover)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={grades} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="subject" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="Score" radius={[0,3,3,0]}
                  fill="url(#gradeGrad)"
                  label={{ position: 'right', fill: '#94a3b8', fontSize: 11, formatter: v => `${v}%` }}
                />
                <defs>
                  <linearGradient id="gradeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>Radar View</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={grades.map(g => ({ subject: g.subject.slice(0, 6), score: g.score }))}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.18} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.9rem' }}>
          Subject Performance
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Subject', 'Teacher', 'Score', 'Grade', 'Trend'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => <GradeRow key={i} {...g} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
