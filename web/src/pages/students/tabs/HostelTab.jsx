import React from 'react';
import { Home, User, Key, Calendar } from 'lucide-react';
import { HOSTELS } from '../../../lib/mockData';

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

export default function HostelTab({ student }) {
  if (!student) return null;

  if (!student.has_hostel) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏠</div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Day Scholar</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          This student is a day scholar and does not reside in school hostel.
        </div>
      </div>
    );
  }

  const hostel = HOSTELS.find(h => h.id === student.hostel_id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Hostel Assignment Card */}
      <div className="glass-card" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: '0.875rem', background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={26} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{hostel?.building || 'Hostel Block'}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Room {student.room_number}, Bed {student.bed_number}</div>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '1rem', fontSize: '0.78rem', fontWeight: 700 }}>
            Resident
          </div>
        </div>

        <InfoRow icon={Home}     label="Building"     value={hostel?.building} />
        <InfoRow icon={Key}      label="Room Number"  value={student.room_number} />
        <InfoRow icon={Key}      label="Bed Number"   value={student.bed_number} />
        <InfoRow icon={User}     label="Warden"       value={hostel?.warden} />
        <InfoRow icon={User}     label="Capacity"     value={hostel?.capacity ? `${hostel.capacity} beds` : null} />
      </div>

      {/* Hostel fee note */}
      <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        ℹ️ Hostel fees are included in the student's financial ledger. Visit the <strong>Finance</strong> tab to view hostel charge breakdowns.
      </div>
    </div>
  );
}
