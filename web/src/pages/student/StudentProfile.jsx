import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Edit2, Save, X, Camera } from 'lucide-react';
import { MOCK_STUDENT } from './mock/studentMockData';

function Avatar({ name, size = 96 }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.33, border: '3px solid rgba(16,185,129,0.3)', position: 'relative' }}>
      {initials}
      <button style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-surface)', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Camera size={13} />
      </button>
    </div>
  );
}

function Field({ label, value, editable, onEdit, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{label}</label>
      {editable ? (
        <input type={type} defaultValue={value}
          style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--bg-color)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none' }} />
      ) : (
        <div style={{ padding: '0.625rem 0.875rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.875rem', color: value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {value || '—'}
        </div>
      )}
    </div>
  );
}

export default function StudentProfile({ student = MOCK_STUDENT, setStudent }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const s = student;

  function handleSave() {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 860, margin: '0 auto', width: '100%' }}>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
          ✅ Profile updated successfully!
        </div>
      )}

      {/* Profile header */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Avatar name={`${s.first_name} ${s.last_name}`} size={88} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{s.first_name} {s.middle_name} {s.last_name}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.625rem' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>{s.student_id}</span> · {s.grade_name} · Section {s.section_name}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { label: s.enrollment_status, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
                { label: s.scholarship || 'No Scholarship', color: s.scholarship ? '#a78bfa' : '#6b7280', bg: s.scholarship ? 'rgba(167,139,250,0.12)' : 'rgba(107,114,128,0.12)' },
                { label: s.house, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
              ].map(b => (
                <span key={b.label} style={{ padding: '0.2rem 0.625rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, color: b.color, background: b.bg }}>{b.label}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editing ? (
              <>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'var(--primary)', border: 'none', borderRadius: '0.5rem', color: '#000', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', padding: '0.5rem 1rem' }}><Save size={14} /> Save</button>
                <button onClick={() => setEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', padding: '0.5rem 1rem' }}><X size={14} /> Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.5rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', padding: '0.5rem 1rem' }}><Edit2 size={14} /> Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} color="var(--primary)" /> Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="First Name"    value={s.first_name}    editable={editing} />
          <Field label="Last Name"     value={s.last_name}     editable={editing} />
          <Field label="Middle Name"   value={s.middle_name}   editable={editing} />
          <Field label="Date of Birth" value={s.date_of_birth} editable={false} type="date" />
          <Field label="Gender"        value={s.gender}        editable={false} />
          <Field label="Blood Group"   value={s.blood_group}   editable={false} />
          <Field label="Nationality"   value={s.nationality}   editable={false} />
          <Field label="Religion"      value={s.religion}      editable={false} />
        </div>
      </div>

      {/* Contact */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} color="var(--primary)" /> Contact Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Email"   value={s.email}   editable={editing} type="email" />
          <Field label="Phone"   value={s.phone}   editable={editing} type="tel" />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Address" value={s.address} editable={editing} />
          </div>
        </div>
      </div>

      {/* Academic */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎓 Academic Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Grade"           value={s.grade_name}       editable={false} />
          <Field label="Section"         value={s.section_name}     editable={false} />
          <Field label="Roll Number"     value={s.roll_number}      editable={false} />
          <Field label="Admission No."   value={s.admission_number} editable={false} />
          <Field label="Academic Year"   value={s.academic_year}    editable={false} />
          <Field label="Class Teacher"   value={s.class_teacher}    editable={false} />
          <Field label="Admission Date"  value={s.admission_date}   editable={false} />
          <Field label="House"           value={s.house}            editable={false} />
        </div>
      </div>

      {/* Guardian */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>👨‍👩‍👧 Guardian Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Guardian Name"     value={s.guardian_name}         editable={editing} />
          <Field label="Relationship"      value={s.guardian_relationship} editable={false} />
          <Field label="Guardian Phone"    value={s.guardian_phone}        editable={editing} type="tel" />
          <Field label="Guardian Email"    value={s.guardian_email}        editable={editing} type="email" />
          <Field label="Occupation"        value={s.guardian_occupation}   editable={false} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Guardian Address" value={s.guardian_address}    editable={editing} />
          </div>
        </div>
      </div>

      {/* Emergency */}
      <div className="glass-card" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={16} color="#ef4444" /> Emergency Contact</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Contact Name"     value={s.emergency_contact_name}     editable={editing} />
          <Field label="Contact Phone"    value={s.emergency_contact_phone}    editable={editing} type="tel" />
          <Field label="Relationship"     value={s.emergency_contact_relation} editable={false} />
        </div>
      </div>

    </div>
  );
}
