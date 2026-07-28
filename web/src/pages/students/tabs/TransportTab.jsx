import React from 'react';
import { Bus, MapPin, User, Navigation } from 'lucide-react';
import { BUSES } from '../../../lib/mockData';

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

export default function TransportTab({ student }) {
  if (!student) return null;

  if (!student.has_transport) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚌</div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Day Scholar</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          This student does not use school transport. They are a day scholar.
        </div>
      </div>
    );
  }

  const bus = BUSES.find(b => b.id === student.bus_id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Bus Card */}
      <div className="glass-card" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: '0.875rem', background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bus size={26} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{bus?.number || 'Assigned Bus'}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{bus?.route || 'School Transport'}</div>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '1rem', fontSize: '0.78rem', fontWeight: 700 }}>
            Active
          </div>
        </div>

        <InfoRow icon={Bus}        label="Bus Number"    value={bus?.number} />
        <InfoRow icon={Navigation} label="Route"         value={bus?.route} />
        <InfoRow icon={User}       label="Driver"        value={bus?.driver} />
        <InfoRow icon={MapPin}     label="Pickup Point"  value={student.pickup_point} />
        <InfoRow icon={MapPin}     label="Dropoff Point" value={student.dropoff_point} />
        {bus?.capacity && (
          <InfoRow icon={Bus}      label="Bus Capacity"  value={`${bus.capacity} seats`} />
        )}
      </div>

      {/* Route visual */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>Route Overview</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} /> {student.pickup_point || 'Pickup Point'}
          </div>
          <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, var(--primary), #3b82f6)', borderRadius: 2, minWidth: 40 }} />
          <div style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bus size={14} /> {bus?.number || 'Bus'}
          </div>
          <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #3b82f6, #a78bfa)', borderRadius: 2, minWidth: 40 }} />
          <div style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', padding: '0.5rem 1rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} /> {student.dropoff_point || 'School Gate'}
          </div>
        </div>
      </div>
    </div>
  );
}
