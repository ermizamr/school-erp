import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../components/Toast';
import { Megaphone, Plus, X, Bell, Users, BookOpen } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', fontFamily: 'Outfit, sans-serif'
};

const TYPE_CONFIG = {
  general:    { label: 'General',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   icon: Bell },
  attendance: { label: 'Attendance', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Users },
  grade:      { label: 'Grade',      color: '#10B981', bg: 'rgba(16,185,129,0.12)',   icon: BookOpen },
};

export default function TeacherNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sendingTo, setSendingTo] = useState('section'); // 'section' | 'individual'
  const [form, setForm] = useState({ title: '', message: '', type: 'general', section_id: '', recipient_id: '' });
  const [sending, setSending] = useState(false);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => { init(); }, []);

  async function init() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const tid = user?.id;
    setTeacherId(tid);

    let sectData = [];
    if (tid) {
      const { data: asgn } = await supabase.from('teacher_assignments').select('sections(id, name, grades(name))').eq('teacher_id', tid);
      const seen = new Set();
      (asgn || []).forEach(a => {
        if (a.sections && !seen.has(a.sections.id)) { seen.add(a.sections.id); sectData.push(a.sections); }
      });
    } else {
      const { data } = await supabase.from('sections').select('*, grades(name)');
      sectData = data || [];
    }
    setSections(sectData);

    // Load sent notifications (those sent by this teacher)
    if (tid) {
      // We'll show recently dispatched ones by querying where recorded_by would be — instead, let's
      // just show all notifications visible to teacher's students for context.
      // For demo, show all notifications ordered newest first.
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setNotifications(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (form.section_id) loadStudents(form.section_id);
    else setStudents([]);
  }, [form.section_id]);

  async function loadStudents(sectionId) {
    const { data } = await supabase.from('enrollments').select('profiles(id, first_name, last_name)').eq('section_id', sectionId);
    setStudents((data || []).map(e => e.profiles).filter(Boolean));
  }

  async function handleSend(e) {
    e.preventDefault();
    setSending(true);
    try {
      let recipients = [];

      if (sendingTo === 'section' && form.section_id) {
        // Notify all students in the section
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('student_id')
          .eq('section_id', form.section_id);
        recipients = (enrollments || []).map(e => e.student_id);
      } else if (sendingTo === 'individual' && form.recipient_id) {
        recipients = [form.recipient_id];
      }

      if (recipients.length === 0) {
        toast.error('No recipients found');
        setSending(false);
        return;
      }

      const inserts = recipients.map(rid => ({
        recipient_id: rid,
        title: form.title,
        message: form.message,
        type: form.type,
        is_read: false,
      }));

      const { error } = await supabase.from('notifications').insert(inserts);
      if (error) throw error;

      toast.success(`Notification sent to ${recipients.length} student${recipients.length > 1 ? 's' : ''}!`);
      setShowModal(false);
      setForm({ title: '', message: '', type: 'general', section_id: '', recipient_id: '' });
      init();
    } catch (err) {
      toast.error(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Announcements</h1>
          <p>Send notifications to your class or individual students.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '0.4rem' }} /> New Announcement
        </button>
      </div>

      {/* Quick-send strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            className="glass-card"
            onClick={() => { setForm(f => ({ ...f, type: key })); setShowModal(true); }}
            style={{ textAlign: 'left', cursor: 'pointer', borderLeft: `3px solid ${cfg.color}`, transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <cfg.icon size={20} color={cfg.color} />
            <span style={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading…</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <Megaphone size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No announcements yet</h2>
          <p>Send your first notification to a class or student.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowModal(true)}>
            Create Announcement
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
            const Icon = cfg.icon;
            return (
              <div key={n.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: `3px solid ${cfg.color}` }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{n.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span className="badge" style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: '0.7rem' }}>{cfg.label}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--bg-surface)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>New Announcement</h2>

            {/* Send to tabs */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', padding: '0.2rem', gap: '0.2rem', marginBottom: '1.25rem' }}>
              {[{ key: 'section', label: '🏫 Entire Section' }, { key: 'individual', label: '👤 Individual Student' }].map(({ key, label }) => (
                <button key={key} onClick={() => setSendingTo(key)} style={{ flex: 1, padding: '0.55rem', borderRadius: '0.35rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '0.85rem', backgroundColor: sendingTo === key ? 'var(--primary)' : 'transparent', color: sendingTo === key ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Section selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Section *</label>
                <select required style={inputStyle} value={form.section_id} onChange={e => setForm({ ...form, section_id: e.target.value, recipient_id: '' })}>
                  <option value="">Select section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.grades?.name} – {s.name}</option>)}
                </select>
              </div>

              {/* Individual student selector */}
              {sendingTo === 'individual' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Student *</label>
                  <select required style={inputStyle} value={form.recipient_id} onChange={e => setForm({ ...form, recipient_id: e.target.value })} disabled={!form.section_id}>
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                  </select>
                  {!form.section_id && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Select a section first</p>}
                </div>
              )}

              {/* Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setForm({ ...form, type: key })} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: `1px solid ${form.type === key ? cfg.color : 'var(--border-color)'}`, backgroundColor: form.type === key ? cfg.bg : 'transparent', color: form.type === key ? cfg.color : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '0.8rem', transition: 'all 0.15s' }}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Title *</label>
                <input required style={inputStyle} placeholder="Announcement title…" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your message here…"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? 'Sending…' : `📢 Send${sendingTo === 'section' ? ' to Class' : ' to Student'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
