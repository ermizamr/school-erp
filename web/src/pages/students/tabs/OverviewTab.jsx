import React from 'react';
import AvatarCell from '../../../components/students/AvatarCell';
import StatusBadge from '../../../components/students/StatusBadge';
import { GraduationCap, Calendar, Home, BookOpen, User, Phone, Mail } from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ color: 'var(--primary)', flexShrink: 0 }}><Icon size={15} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.1rem' }}>{value || '—'}</div>
      </div>
    </div>
  );
}

function StatMini({ label, value, color = 'var(--primary)' }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.75rem' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function OverviewTab({ student }) {
  if (!student) return null;

  const dob = student.date_of_birth ? new Date(student.date_of_birth) : null;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : '—';

  const attColor = student.attendance_percentage >= 90 ? '#10B981' : student.attendance_percentage >= 75 ? '#f59e0b' : '#ef4444';
  const gpaColor = student.gpa >= 3.5 ? '#10B981' : student.gpa >= 2.5 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

      {/* ── Quick Stats ─────────────────────────────────── */}
      <div className="glass-card" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        <StatMini label="Attendance" value={`${student.attendance_percentage?.toFixed(0) ?? '—'}%`} color={attColor} />
        <StatMini label="Avg Grade" value={`${student.average_grade?.toFixed(1) ?? '—'}`} color="#3b82f6" />
        <StatMini label="GPA" value={student.gpa?.toFixed(1) ?? '—'} color={gpaColor} />
        <StatMini label="Outstanding" value={student.outstanding_balance > 0 ? `ETB ${student.outstanding_balance?.toLocaleString()}` : 'Paid'} color={student.outstanding_balance > 0 ? '#ef4444' : '#10B981'} />
      </div>

      {/* ── Student Info ─────────────────────────────────── */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Student Information</h3>
        <InfoRow icon={User}         label="Full Name"      value={`${student.first_name} ${student.middle_name || ''} ${student.last_name}`.trim()} />
        <InfoRow icon={Calendar}     label="Date of Birth"  value={student.date_of_birth} />
        <InfoRow icon={User}         label="Age"            value={`${age} years`} />
        <InfoRow icon={User}         label="Gender"         value={student.gender?.charAt(0).toUpperCase() + student.gender?.slice(1)} />
        <InfoRow icon={User}         label="Blood Group"    value={student.blood_group} />
        <InfoRow icon={User}         label="Nationality"    value={student.nationality} />
        <InfoRow icon={User}         label="Religion"       value={student.religion} />
        <InfoRow icon={Calendar}     label="Admission Date" value={student.admission_date} />
        <InfoRow icon={User}         label="Admission No."  value={student.admission_number} />
      </div>

      {/* ── Academic Info ────────────────────────────────── */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Academic Details</h3>
        <InfoRow icon={GraduationCap} label="Grade"        value={student.grade_name} />
        <InfoRow icon={BookOpen}      label="Section"      value={`Section ${student.section_name || '—'}`} />
        <InfoRow icon={User}          label="Roll Number"  value={student.roll_number} />
        <InfoRow icon={Calendar}      label="Academic Year" value={student.academic_year} />
        <InfoRow icon={BookOpen}      label="Class Teacher" value={student.class_teacher} />
        <InfoRow icon={Home}          label="House"        value={student.house} />
        <InfoRow icon={GraduationCap} label="Scholarship"  value={student.scholarship || 'None'} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0' }}>
          <div style={{ color: 'var(--primary)', flexShrink: 0 }}><User size={15} /></div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
            <div style={{ marginTop: '0.1rem' }}><StatusBadge status={student.enrollment_status} /></div>
          </div>
        </div>
      </div>

      {/* ── Guardian Info ────────────────────────────────── */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Guardian</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <AvatarCell firstName={student.guardian_name?.split(' ')[0]} lastName={student.guardian_name?.split(' ')[1]} size={44} />
          <div>
            <div style={{ fontWeight: 700 }}>{student.guardian_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.guardian_relationship}</div>
          </div>
        </div>
        <InfoRow icon={Phone} label="Phone" value={student.guardian_phone} />
        <InfoRow icon={Mail}  label="Email" value={student.guardian_email} />
      </div>

      {/* ── Transport & Hostel ───────────────────────────── */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Transport & Hostel</h3>
        <InfoRow icon={Home} label="Transport" value={student.has_transport ? `Bus · Pickup: ${student.pickup_point}` : 'Day Scholar'} />
        <InfoRow icon={Home} label="Hostel"    value={student.has_hostel ? `${student.hostel_building || 'Block'} · Room ${student.room_number}` : 'Day Scholar'} />
      </div>
    </div>
  );
}
