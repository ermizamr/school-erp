import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays, BookOpen,
  AlertCircle, Palmtree, Star, Clock
} from 'lucide-react';
import { MOCK_EVENTS } from './mock/studentMockData';

const EVENT_CONFIG = {
  exam:     { color: '#ef4444', label: 'Exam',     bg: 'rgba(239,68,68,0.15)'   },
  deadline: { color: '#f59e0b', label: 'Deadline', bg: 'rgba(245,158,11,0.15)'  },
  holiday:  { color: '#10B981', label: 'Holiday',  bg: 'rgba(16,185,129,0.15)'  },
  event:    { color: '#3b82f6', label: 'Event',    bg: 'rgba(59,130,246,0.15)'   },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getEventIcon(type) {
  if (type === 'exam')     return <BookOpen size={12} />;
  if (type === 'deadline') return <Clock size={12} />;
  if (type === 'holiday')  return <Palmtree size={12} />;
  return <Star size={12} />;
}

function buildCalendarDays(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  // JS: 0=Sun → convert to Mon-based (0=Mon)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatDate(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function LegendChip({ type }) {
  const cfg = EVENT_CONFIG[type];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0,
      }} />
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cfg.label}</span>
    </div>
  );
}

export default function StudentCalendar() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  // Map events by date string
  const eventMap = useMemo(() => {
    const map = {};
    MOCK_EVENTS.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, []);

  // Events for current month
  const monthEvents = useMemo(() => {
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    const evs = MOCK_EVENTS.filter(ev => ev.date.startsWith(prefix));
    // Sort by date
    return evs.sort((a, b) => a.date.localeCompare(b.date));
  }, [viewYear, viewMonth]);

  const calDays = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  const isToday = (day) =>
    day && viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() && day === today.getDate();

  const isWeekend = (idx) => idx % 7 >= 5; // Sat=5, Sun=6

  // Events for selected day (sidebar list) — if none selected show all month
  const sidebarEvents = useMemo(() => {
    if (selectedDay) {
      const key = formatDate(viewYear, viewMonth, selectedDay);
      return eventMap[key] || [];
    }
    return monthEvents;
  }, [selectedDay, viewYear, viewMonth, eventMap, monthEvents]);

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <CalendarDays size={22} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Academic Calendar
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Exams, deadlines & school events
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* ─── Calendar panel ─── */}
        <div className="glass-card" style={{
          borderRadius: 18, overflow: 'hidden',
          border: '1px solid var(--border-color)',
        }}>
          {/* Nav */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={prevMonth} style={navBtnStyle()}>
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', minWidth: 160, textAlign: 'center' }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} style={navBtnStyle()}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {Object.keys(EVENT_CONFIG).map(t => <LegendChip key={t} type={t} />)}
              </div>
              <button onClick={goToday} style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid var(--primary)',
                background: 'rgba(16,185,129,0.1)', color: 'var(--primary)',
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>Today</button>
            </div>
          </div>

          {/* Day headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            background: 'rgba(16,185,129,0.05)',
          }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{
                textAlign: 'center', padding: '10px 0', fontSize: 12,
                fontWeight: 700, color: i >= 5 ? '#f97316' : 'var(--text-secondary)',
                letterSpacing: '0.5px',
              }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          }}>
            {calDays.map((day, idx) => {
              const dateKey = day ? formatDate(viewYear, viewMonth, day) : null;
              const dayEvents = dateKey ? (eventMap[dateKey] || []) : [];
              const todayCell = isToday(day);
              const selected = day && selectedDay === day;
              const wkend = isWeekend(idx);

              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDay(selected ? null : day)}
                  style={{
                    minHeight: 82, padding: '6px 6px 4px',
                    borderTop: '1px solid var(--border-color)',
                    borderRight: idx % 7 !== 6 ? '1px solid var(--border-color)' : 'none',
                    background: selected
                      ? 'rgba(16,185,129,0.1)'
                      : todayCell
                      ? 'rgba(16,185,129,0.06)'
                      : wkend
                      ? 'rgba(255,255,255,0.01)'
                      : 'transparent',
                    cursor: day ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (day && !selected) e.currentTarget.style.background = 'rgba(16,185,129,0.04)'; }}
                  onMouseLeave={e => {
                    if (day && !selected) e.currentTarget.style.background = todayCell ? 'rgba(16,185,129,0.06)' : wkend ? 'rgba(255,255,255,0.01)' : 'transparent';
                  }}
                >
                  {day && (
                    <>
                      {/* Day number */}
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: todayCell ? 800 : 500,
                        fontSize: 13,
                        color: todayCell ? '#fff' : wkend ? '#f97316' : 'var(--text-primary)',
                        background: todayCell ? 'var(--primary)' : 'transparent',
                        border: selected && !todayCell ? '2px solid var(--primary)' : 'none',
                        marginBottom: 3,
                      }}>{day}</div>

                      {/* Event dots/labels (max 3) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {dayEvents.slice(0, 3).map((ev, i) => {
                          const cfg = EVENT_CONFIG[ev.type] || EVENT_CONFIG.event;
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 3,
                              background: cfg.bg, borderRadius: 4,
                              padding: '1px 4px',
                              overflow: 'hidden',
                            }}>
                              <span style={{ color: cfg.color, flexShrink: 0, display: 'flex' }}>
                                {getEventIcon(ev.type)}
                              </span>
                              <span style={{
                                fontSize: 10, color: cfg.color, fontWeight: 600,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>{ev.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)', paddingLeft: 4 }}>
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Sidebar: event list ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
            paddingBottom: 8, borderBottom: '1px solid var(--border-color)',
          }}>
            {selectedDay
              ? `Events on ${MONTHS[viewMonth]} ${selectedDay}`
              : `${MONTHS[viewMonth]} Events (${monthEvents.length})`}
          </div>

          {sidebarEvents.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 16px',
              color: 'var(--text-secondary)', fontSize: 13,
            }}>
              <CalendarDays size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              No events {selectedDay ? 'on this day' : 'this month'}
            </div>
          ) : (
            sidebarEvents.map((ev, i) => {
              const cfg = EVENT_CONFIG[ev.type] || EVENT_CONFIG.event;
              return (
                <div key={i} className="glass-card" style={{
                  borderRadius: 12, padding: '12px 14px',
                  border: `1px solid ${cfg.color}33`,
                  borderLeft: `4px solid ${cfg.color}`,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: cfg.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.color,
                  }}>
                    {getEventIcon(ev.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 13, color: 'var(--text-primary)',
                      marginBottom: 3,
                    }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      📅 {ev.date}
                    </div>
                    <span style={{
                      display: 'inline-block', background: cfg.bg, color: cfg.color,
                      borderRadius: 5, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.4px',
                    }}>{cfg.label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function navBtnStyle() {
  return {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-primary)',
    transition: 'background 0.15s',
  };
}
