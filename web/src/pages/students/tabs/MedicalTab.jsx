import React, { useEffect, useState } from 'react';
import { getStudentMedical } from '../../../lib/studentApi';
import { Heart, AlertTriangle, Pill, Phone, CheckCircle } from 'lucide-react';

function InfoSection({ title, icon: Icon, iconColor, items }) {
  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>
        <Icon size={16} color={iconColor} /> {title}
      </div>
      {items.map(item => (
        <div key={item.label} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.label}</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{item.value || '—'}</span>
        </div>
      ))}
    </div>
  );
}

export default function MedicalTab({ student }) {
  const [medical, setMedical] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentMedical(student.id).then(setMedical).finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;
  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading medical records…</div>;
  if (!medical) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No medical data available.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Emergency Banner */}
      {medical.emergency_notes && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.25rem' }}>Emergency Notes</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{medical.emergency_notes}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <InfoSection title="Basic Health Info" icon={Heart} iconColor="#ef4444" items={[
          { label: 'Blood Group', value: medical.blood_group },
          { label: 'Medical Conditions', value: Array.isArray(medical.conditions) ? medical.conditions.join(', ') : medical.conditions },
          { label: 'Allergies', value: Array.isArray(medical.allergies) ? medical.allergies.join(', ') : medical.allergies },
          { label: 'Medications', value: Array.isArray(medical.medications) && medical.medications.length ? medical.medications.join(', ') : 'None' },
          { label: 'Last Check-up', value: medical.last_checkup },
        ]} />

        <InfoSection title="Doctor & Hospital" icon={Phone} iconColor="#3b82f6" items={[
          { label: 'Doctor', value: medical.doctor_name },
          { label: 'Doctor Phone', value: medical.doctor_phone },
          { label: 'Hospital', value: medical.hospital },
        ]} />
      </div>

      {/* Vaccination Records */}
      {medical.vaccination_records?.length > 0 && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
            <Pill size={16} color="#10B981" /> Vaccination Records
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Vaccine', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medical.vaccination_records.map((v, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{v.vaccine}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{v.date}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10B981', fontSize: '0.82rem', fontWeight: 600 }}>
                      <CheckCircle size={13} /> {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
