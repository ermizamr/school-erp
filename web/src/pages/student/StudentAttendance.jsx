import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

const STATUS_CONFIG = {
  present: { color: '#10B981', bg: 'rgba(16,185,129,0.18)', label: 'Present'  },
  absent:  { color: '#ef4444', bg: 'rgba(239,68,68,0.18)',  label: 'Absent'   },
  late:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.18)', label: 'Late'     },
  excused: { color: '#3b82f6', bg: 'rgba(59,130,246,0.18)', label: 'Excused'  },
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = [];
  let week = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { grid.push(week); week = []; }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }
  return grid;
}

export default function StudentAttendance({ profile, enrollment }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [allRecords, setAllRecords] = useState([]); // [{date, status}]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) load();
    else setLoading(false);
  }, [profile]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('student_id', profile.id)
        .order('date', { ascending: true });
      setAllRecords(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Build lookup map: date string → status
  const attMap = {};
  allRecords.forEach(r => { attMap[r.date] = r.status; });

  // Stats for viewed month
  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthRecords = allRecords.filter(r => r.date.startsWith(monthStr));
  const monthStats = { present: 0, absent: 0, late: 0, excused: 0 };
  monthRecords.forEach(r => { monthStats[r.status] = (monthStats[r.status] || 0) + 1; });
  const monthTotal = monthRecords.length;
  const monthRate = monthTotal > 0
    ? Math.round(((monthStats.present + monthStats.late) / monthTotal) * 100)
    : null;

  // Overall stats
  const totalAll = allRecords.length;
  const presentAll = allRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const overallRate = totalAll > 0 ? Math.round((presentAll / totalAll) * 100) : null;

  // Current streak of consecutive present/late days (backwards from today)
  let streak = 0;
  const todayStr = now.toISOString().split('T')[0];
  const sorted = [...allRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const r of sorted) {
    if (r.date > todayStr) continue;
    if (r.status === 'present' || r.status === 'late') streak++;
    else break;
  }

  const grid = buildCalendarGrid(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const canGoNext = viewYear < now.getFullYear() || (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading attendance…</div>;

  return (
    <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Attendance</h1>
        <p>Your attendance record for the current academic period.</p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Overall rate */}
        <div className="glass-card" style={{ textAlign: 'center', borderTop: `3px solid ${overallRate >= 80 ? '#10B981' : overallRate >= 60 ? '#f59e0b' : '#ef4444'}` }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Overall Rate</p>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: overallRate >= 80 ? '#10B981' : overallRate >= 60 ? '#f59e0b' : '#ef4444', lineHeight: 1 }}>
            {overallRate !== null ? `${overallRate}%` : '—'}
          </div>
          <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>{presentAll}/{totalAll} days</p>
        </div>

        {/* Streak */}
        <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid #f97316' }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Current Streak</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Flame size={24} color="#f97316" />
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f97316', lineHeight: 1 }}>{streak}</span>
          </div>
          <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>consecutive days</p>
        </div>

        {/* This month */}
        <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid #a78bfa' }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>This Month</p>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>
            {monthRate !== null ? `${monthRate}%` : '—'}
          </div>
          <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>{MONTH_NAMES[viewMonth]}</p>
        </div>

        {/* Absences total */}
        <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid #ef4444' }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Total Absences</p>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>
            {allRecords.filter(r => r.status === 'absent').length}
          </div>
          <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>all time</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="glass-card">
        {/* Calendar header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.4rem 0.7rem', color: 'white', cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button onClick={nextMonth} disabled={!canGoNext} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.4rem 0.7rem', color: canGoNext ? 'white' : 'var(--text-secondary)', cursor: canGoNext ? 'pointer' : 'default', opacity: canGoNext ? 1 : 0.4 }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Month summary strip */}
        {monthTotal > 0 && (
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              monthStats[key] > 0 && (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: cfg.color }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {cfg.label}: <strong style={{ color: cfg.color }}>{monthStats[key]}</strong>
                  </span>
                </div>
              )
            ))}
          </div>
        )}

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0.3rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {grid.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {week.map((day, di) => {
                if (!day) return <div key={di} />;
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const status = attMap[dateStr];
                const cfg = status ? STATUS_CONFIG[status] : null;
                const isToday = dateStr === now.toISOString().split('T')[0];
                const isFuture = dateStr > now.toISOString().split('T')[0];
                return (
                  <div
                    key={di}
                    title={status ? `${STATUS_CONFIG[status].label}` : 'No record'}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '0.4rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: isToday ? 800 : status ? 600 : 400,
                      backgroundColor: cfg ? cfg.bg : isFuture ? 'transparent' : 'rgba(255,255,255,0.03)',
                      color: cfg ? cfg.color : isFuture ? 'rgba(255,255,255,0.2)' : 'var(--text-secondary)',
                      border: isToday ? '2px solid var(--primary)' : '1px solid transparent',
                      cursor: 'default',
                      transition: 'background-color 0.15s',
                      minWidth: 0,
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: cfg.bg, border: `1px solid ${cfg.color}` }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{cfg.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>No record</span>
          </div>
        </div>
      </div>
    </div>
  );
}
