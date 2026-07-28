import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getStudentAttendance } from '../../../lib/studentApi';

const PIE_COLORS = ['#10B981', '#ef4444', '#f59e0b'];

function SectionTitle({ children }) {
  return <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{children}</h3>;
}

function KpiBox({ label, value, color = 'var(--primary)', sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '0.75rem' }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AttendanceTab({ student }) {
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentAttendance(student.id)
      .then(data => setMonthly(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;

  const totalDays   = monthly.reduce((s, m) => s + (m.present || 0) + (m.absent || 0) + (m.late || 0), 0);
  const totalPresent = monthly.reduce((s, m) => s + (m.present || 0), 0);
  const totalAbsent  = monthly.reduce((s, m) => s + (m.absent || 0), 0);
  const totalLate    = monthly.reduce((s, m) => s + (m.late || 0), 0);
  const overallPct   = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : student.attendance_percentage?.toFixed(1);

  const pieData = [
    { name: 'Present', value: totalPresent },
    { name: 'Absent',  value: totalAbsent },
    { name: 'Late',    value: totalLate },
  ];

  const attColor = Number(overallPct) >= 90 ? '#10B981' : Number(overallPct) >= 75 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* KPI Row */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        <KpiBox label="Overall Attendance" value={`${overallPct}%`} color={attColor} />
        <KpiBox label="Days Present" value={totalPresent} color="#10B981" />
        <KpiBox label="Days Absent" value={totalAbsent} color="#ef4444" />
        <KpiBox label="Late Arrivals" value={totalLate} color="#f59e0b" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>

        {/* Monthly Bar Chart */}
        <div className="glass-card">
          <SectionTitle>Monthly Attendance Breakdown</SectionTitle>
          {loading ? (
            <div style={{ height: 200, background: 'var(--bg-surface-hover)', borderRadius: '0.5rem', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '1rem' }} />
                <Bar dataKey="present" name="Present" fill="#10B981" radius={[3,3,0,0]} />
                <Bar dataKey="absent"  name="Absent"  fill="#ef4444" radius={[3,3,0,0]} />
                <Bar dataKey="late"    name="Late"    fill="#f59e0b" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass-card">
          <SectionTitle>Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="glass-card">
        <SectionTitle>Monthly Attendance Rate (%)</SectionTitle>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={monthly.map(m => {
            const d = (m.present || 0) + (m.absent || 0) + (m.late || 0);
            return { month: m.month, rate: d > 0 ? +((m.present / d) * 100).toFixed(1) : 0 };
          })}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} formatter={v => [`${v}%`, 'Attendance Rate']} />
            <Line type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
