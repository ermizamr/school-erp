import React, { useState } from 'react';
import { Bell, Moon, Globe, Lock, Shield, Eye, EyeOff, Check } from 'lucide-react';

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Icon size={16} /></div>
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{title}</h3>
    </div>
  );
}

export default function StudentSettings({ student }) {
  const [notifSettings, setNotifSettings] = useState({
    new_assignment: true, graded: true, exam_schedule: true, messages: true,
    announcements: true, library_reminder: true, fee_reminder: true, attendance: false,
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState('');

  function toggle(key) { setNotifSettings(s => ({ ...s, [key]: !s[key] })); }
  function save(section) { setSaved(section); setTimeout(() => setSaved(''), 2500); }

  const notifItems = [
    { key: 'new_assignment',  label: 'New Assignment Posted',   sub: 'When a teacher posts a new assignment' },
    { key: 'graded',          label: 'Assignment Graded',        sub: 'When your assignment receives marks' },
    { key: 'exam_schedule',   label: 'Exam Scheduled',           sub: 'When a new exam is added' },
    { key: 'messages',        label: 'New Message',              sub: 'Direct messages from teachers' },
    { key: 'announcements',   label: 'Announcements',            sub: 'School and teacher announcements' },
    { key: 'library_reminder',label: 'Library Reminders',        sub: 'Book due date reminders' },
    { key: 'fee_reminder',    label: 'Fee Reminders',            sub: 'Payment due date reminders' },
    { key: 'attendance',      label: 'Daily Attendance Alert',   sub: 'When attendance is marked' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 720, margin: '0 auto', width: '100%' }}>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} /> {saved} settings saved successfully!
        </div>
      )}

      {/* Notifications */}
      <div className="glass-card">
        <SectionHeader icon={Bell} title="Notification Preferences" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {notifItems.map((item, i) => (
            <div className="mobile-wrap"  key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 0', borderBottom: i < notifItems.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{item.sub}</div>
              </div>
              <Toggle checked={notifSettings[item.key]} onChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
        <button onClick={() => save('Notification')} style={{ marginTop: '1rem', background: 'var(--primary)', border: 'none', borderRadius: '0.5rem', color: '#000', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}>
          Save Notification Settings
        </button>
      </div>

      {/* Password */}
      <div className="glass-card">
        <SectionHeader icon={Lock} title="Change Password" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { label: 'Current Password', show: showOldPass, toggle: () => setShowOldPass(v => !v) },
            { label: 'New Password',     show: showNewPass, toggle: () => setShowNewPass(v => !v) },
            { label: 'Confirm New Password', show: showNewPass, toggle: () => setShowNewPass(v => !v) },
          ].map(field => (
            <div key={field.label}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{field.label}</label>
              <div style={{ position: 'relative' }}>
                <input type={field.show ? 'text' : 'password'} placeholder="••••••••••"
                  style={{ width: '100%', padding: '0.625rem 2.5rem 0.625rem 0.875rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button onClick={field.toggle} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Password must be at least 8 characters, include uppercase, lowercase, and a number.
          </div>
        </div>
        <button onClick={() => save('Password')} style={{ marginTop: '1rem', background: 'var(--primary)', border: 'none', borderRadius: '0.5rem', color: '#000', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}>
          Update Password
        </button>
      </div>

      {/* Appearance */}
      <div className="glass-card">
        <SectionHeader icon={Moon} title="Appearance" />
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {['dark', 'light', 'system'].map(t => (
            <button key={t} onClick={() => setTheme(t)} style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: `1px solid ${theme === t ? 'var(--primary)' : 'var(--border-color)'}`,
              background: theme === t ? 'rgba(16,185,129,0.12)' : 'transparent', color: theme === t ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: theme === t ? 700 : 500, fontSize: '0.875rem', textTransform: 'capitalize',
            }}>
              {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '⚙️'} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Theme preference will be applied across all pages.</div>
      </div>

      {/* Language */}
      <div className="glass-card">
        <SectionHeader icon={Globe} title="Language & Region" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Interface Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}>
              <option value="en">🇬🇧 English</option>
              <option value="am">🇪🇹 Amharic (አማርኛ)</option>
              <option value="or">🇪🇹 Oromiffa</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Timezone</label>
            <select style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}>
              <option>Africa/Addis_Ababa (EAT +3)</option>
            </select>
          </div>
        </div>
        <button onClick={() => save('Language')} style={{ marginTop: '1rem', background: 'var(--primary)', border: 'none', borderRadius: '0.5rem', color: '#000', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}>
          Save Preferences
        </button>
      </div>

      {/* Privacy */}
      <div className="glass-card" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
        <SectionHeader icon={Shield} title="Privacy & Security" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="mobile-wrap"  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.625rem', padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Add an extra layer of security to your account</div>
            </div>
            <button style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', padding: '0.375rem 0.875rem' }}>Enable</button>
          </div>
          <div className="mobile-wrap"  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Show my profile to other students</div>
              <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>Allow classmates to see your name and grade</div>
            </div>
            <Toggle checked={true} onChange={() => {}} />
          </div>
          <div className="mobile-wrap"  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Email activity digest</div>
              <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>Receive a weekly summary of your activity</div>
            </div>
            <Toggle checked={false} onChange={() => {}} />
          </div>
        </div>
      </div>

    </div>
  );
}
