import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useToast } from '../../components/Toast';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

export default function TeacherCalendar() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', type: 'academic' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  async function loadEvents() {
    setLoading(true);
    try {
      // Get the start of the current week (Monday)
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay() || 7; 
      startOfWeek.setDate(startOfWeek.getDate() - day + 1);
      startOfWeek.setHours(0,0,0,0);

      // Get end of month or a reasonable window
      const endWindow = new Date(startOfWeek);
      endWindow.setDate(endWindow.getDate() + 30);

      const { data, error } = await supabase.from('events')
        .select('*')
        .gte('event_date', startOfWeek.toISOString().split('T')[0])
        .lte('event_date', endWindow.toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('events').insert([form]);
      if (error) throw error;
      toast.success('Event created!');
      setShowModal(false);
      setForm({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', type: 'academic' });
      loadEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  }

  function getWeekDays(date) {
    const days = [];
    const d = new Date(date);
    const day = d.getDay() || 7; 
    d.setDate(d.getDate() - day + 1);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  const weekDays = getWeekDays(currentDate);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Calendar</h1>
          <p className="text-sm text-muted">Schedule, events, and important dates</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Event
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="flex-row justify-between">
          <div className="flex-row gap-4">
            <h2 className="text-lg font-bold m-0" style={{ minWidth: '150px' }}>
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </h2>
            <div className="flex-row gap-2">
              <button className="btn hover-card" onClick={handlePrevWeek} style={{ padding: '0.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><ChevronLeft size={16}/></button>
              <button className="btn hover-card" onClick={handleToday} style={{ padding: '0.5rem 1rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Today</button>
              <button className="btn hover-card" onClick={handleNextWeek} style={{ padding: '0.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><ChevronRight size={16}/></button>
            </div>
          </div>
          <div className="flex-row gap-2">
            <select className="btn" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem 1rem' }}>
              <option>Week View</option>
              <option>Month View</option>
              <option>Agenda</option>
            </select>
            <div style={{ position: 'relative' }}>
              <button className="btn hover-card" style={{ padding: '0.5rem 1rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={() => setShowFilterDropdown(!showFilterDropdown)}><Filter size={16}/></button>
              {showFilterDropdown && (
                <div className="glass-card" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', padding: '0.5rem', width: '200px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="flex-row gap-2" style={{ alignItems: 'center', fontSize: '0.85rem' }}><input type="checkbox" defaultChecked /> Academic Events</label>
                  <label className="flex-row gap-2" style={{ alignItems: 'center', fontSize: '0.85rem' }}><input type="checkbox" defaultChecked /> Holidays</label>
                  <label className="flex-row gap-2" style={{ alignItems: 'center', fontSize: '0.85rem' }}><input type="checkbox" defaultChecked /> Meetings</label>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Dynamic Week Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
          {weekDays.map((d, i) => {
            const today = isToday(d);
            return (
              <div key={i} style={{ textAlign: 'center', padding: '1rem', borderRadius: '0.5rem', backgroundColor: today ? 'var(--primary)' : 'var(--bg-color)', color: today ? 'white' : 'var(--text-primary)', border: !today ? '1px solid var(--border-color)' : 'none', transition: 'all 0.2s' }}>
                <p className="text-xs font-semibold m-0" style={{ opacity: 0.8, textTransform: 'uppercase' }}>{dayNames[i]}</p>
                <p className="text-xl font-bold m-0">{d.getDate()}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 className="text-lg font-bold mb-4" style={{ marginBottom: '1rem' }}>Upcoming Events</h3>
          {loading ? (
            <p className="text-muted">Loading agenda...</p>
          ) : events.length === 0 ? (
            <p className="text-muted">No upcoming events scheduled for this period.</p>
          ) : (
            <div className="flex-col gap-4">
              {events.map((ev, i) => {
                const isMeeting = ev.type === 'meeting';
                const isHoliday = ev.type === 'holiday';
                const color = isHoliday ? '#10b981' : isMeeting ? '#f59e0b' : '#3b82f6';
                const bg = isHoliday ? 'rgba(16, 185, 129, 0.1)' : isMeeting ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';

                return (
                  <div key={ev.id || i} className="hover-card flex-row gap-4" style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                    <div style={{ paddingRight: '1rem', borderRight: '1px solid var(--border-color)', minWidth: '80px', textAlign: 'center' }}>
                      <p className="text-sm font-bold m-0" style={{ color: 'var(--primary)' }}>
                        {ev.start_time ? ev.start_time.substring(0, 5) : 'All Day'}
                      </p>
                      <p className="text-xs text-muted m-0">
                        {new Date(ev.event_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 className="font-bold text-base m-0" style={{ marginBottom: '0.25rem' }}>{ev.title}</h4>
                      <p className="text-sm text-muted m-0" style={{ marginBottom: '0.5rem' }}>{ev.description}</p>
                      <div className="flex-row gap-3" style={{ alignItems: 'center' }}>
                        <span className="badge" style={{ backgroundColor: bg, color, fontSize: '0.65rem' }}>
                          {(ev.type || 'event').toUpperCase()}
                        </span>
                        {ev.location && (
                          <span className="flex-row gap-1 text-xs text-muted">
                            <MapPin size={12} /> {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-col gap-4">
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 className="text-base font-bold m-0 mb-4" style={{ marginBottom: '1rem' }}>Filter Calendars</h3>
            <div className="flex-col gap-3">
              <label className="flex-row gap-2" style={{ fontSize: '0.875rem', cursor: 'pointer' }}><input type="checkbox" defaultChecked /> My Classes</label>
              <label className="flex-row gap-2" style={{ fontSize: '0.875rem', cursor: 'pointer' }}><input type="checkbox" defaultChecked /> School Events</label>
              <label className="flex-row gap-2" style={{ fontSize: '0.875rem', cursor: 'pointer' }}><input type="checkbox" defaultChecked /> Exams</label>
              <label className="flex-row gap-2" style={{ fontSize: '0.875rem', cursor: 'pointer' }}><input type="checkbox" defaultChecked /> Holidays</label>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>New Event</h2>
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Event Title *</label>
                <input required style={inputStyle} placeholder="e.g. Department Meeting" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Description</label>
                <textarea style={{...inputStyle, height: '80px', resize: 'none'}} placeholder="Event details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date *</label>
                  <input required type="date" style={inputStyle} value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Type *</label>
                  <select required style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="academic">Academic</option>
                    <option value="meeting">Meeting</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Start Time</label>
                  <input type="time" style={inputStyle} value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>End Time</label>
                  <input type="time" style={inputStyle} value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Location</label>
                <input style={inputStyle} placeholder="e.g. Room 101" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
