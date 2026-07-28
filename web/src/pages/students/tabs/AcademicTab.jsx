import React from 'react';
import { BookOpen, GraduationCap, User, Calendar, TrendingUp } from 'lucide-react';

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  );
}

export default function AcademicTab({ student }) {
  if (!student) return null;

  const subjects = ['Mathematics', 'English', 'Amharic', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Physical Education', 'ICT'];

  const promotionHistory = [
    { year: '2022–2023', grade: 'Grade 8', section: 'B', result: 'Promoted', gpa: '3.2' },
    { year: '2023–2024', grade: 'Grade 9', section: 'A', result: 'Promoted', gpa: '3.5' },
    { year: '2024–2025', grade: 'Grade 10', section: 'A', result: 'Current', gpa: `${student.gpa?.toFixed(1) ?? '—'}` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Current Academic Info */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
            <GraduationCap size={16} color="var(--primary)" /> Current Enrollment
          </div>
          <Row label="Grade"         value={student.grade_name} />
          <Row label="Section"       value={`Section ${student.section_name || '—'}`} />
          <Row label="Roll Number"   value={student.roll_number} />
          <Row label="Academic Year" value={student.academic_year} />
          <Row label="Class Teacher" value={student.class_teacher} />
          <Row label="House"         value={student.house} />
          <Row label="Admission No." value={student.admission_number} />
          <Row label="Admission Date" value={student.admission_date} />
          <Row label="Previous School" value={student.previous_school} />
          <Row label="Scholarship"   value={student.scholarship || 'None'} />
        </div>

        {/* Subjects */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>
            <BookOpen size={16} color="var(--primary)" /> Enrolled Subjects
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {subjects.map(s => (
              <span key={s} style={{ padding: '0.3rem 0.75rem', borderRadius: '1rem', background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(16,185,129,0.2)' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Promotion History */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <TrendingUp size={16} color="var(--primary)" /> Promotion History
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Academic Year', 'Grade', 'Section', 'GPA', 'Result'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {promotionHistory.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{p.year}</td>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{p.grade}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>Section {p.section}</td>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>{p.gpa}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.78rem', fontWeight: 700, background: p.result === 'Promoted' ? 'rgba(16,185,129,0.1)' : p.result === 'Current' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)', color: p.result === 'Promoted' ? '#10B981' : p.result === 'Current' ? '#3b82f6' : '#ef4444' }}>
                    {p.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
