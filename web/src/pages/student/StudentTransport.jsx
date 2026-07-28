import React from 'react';
import { Bus, MapPin, User, Phone, Clock, Navigation, CheckCircle } from 'lucide-react';
import { MOCK_TRANSPORT } from './mock/studentMockData';

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ color: 'var(--primary)', flexShrink: 0 }}><Icon size={16} /></div>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '0.1rem' }}>{value}</div>
      </div>
    </div>
  );
}

export default function StudentTransport({ student }) {
  const t = MOCK_TRANSPORT;

  if (!t.has_transport) {
    return (
      <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚌</div>
        <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>No Transport Assigned</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You are registered as a day scholar. Contact administration to enquire about school transport.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="mobile-wrap"  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(16,185,129,0.08))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '1rem', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '1rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bus size={32} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Assigned Bus</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{t.bus_number}</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.route}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', padding: '0.375rem 1rem', borderRadius: '1rem', fontWeight: 700, fontSize: '0.82rem' }}>
            ● Active
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Bus Info */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bus size={16} color="var(--primary)" /> Bus Details
          </h3>
          <InfoRow icon={Bus}        label="Bus Number"       value={t.bus_number} />
          <InfoRow icon={Navigation} label="Route"            value={t.route} />
          <InfoRow icon={User}       label="Driver Name"      value={t.driver_name} />
          <InfoRow icon={Phone}      label="Driver Contact"   value={t.driver_phone} />
          <InfoRow icon={Bus}        label="Bus Capacity"     value={`${t.capacity} seats`} />
        </div>

        {/* Schedule */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="var(--primary)" /> Daily Schedule
          </h3>
          <InfoRow icon={MapPin} label="Pickup Point"   value={t.pickup_point} />
          <InfoRow icon={Clock}  label="Pickup Time"    value={t.pickup_time} />
          <InfoRow icon={Clock}  label="School Arrival" value={t.school_arrival} />
          <InfoRow icon={Clock}  label="Departure Time" value={t.dropoff_time} />
          <InfoRow icon={Clock}  label="Home Arrival"   value={t.home_arrival} />
        </div>
      </div>

      {/* Route Stops */}
      <div className="glass-card">
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={16} color="var(--primary)" /> Route Stops
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: '1.5rem' }}>
          <div style={{ position: 'absolute', left: '0.5rem', top: 12, bottom: 12, width: 2, background: 'linear-gradient(to bottom, var(--primary), #3b82f6)', borderRadius: 2 }} />
          {t.stops.map((stop, i) => (
            <div className="mobile-wrap"  key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', position: 'relative' }}>
              <div style={{ position: 'absolute', left: -9, width: 14, height: 14, borderRadius: '50%', background: stop.type === 'school' ? 'var(--primary)' : 'var(--bg-surface)', border: `2px solid ${stop.type === 'school' ? 'var(--primary)' : '#3b82f6'}`, zIndex: 1, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: stop.type === 'school' ? 800 : 600, fontSize: '0.875rem', color: stop.type === 'school' ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {stop.name} {stop.type === 'school' && '🏫'}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{stop.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <CheckCircle size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Transport Note:</strong> Please be at your pickup point 5 minutes before scheduled time. Contact the driver or school administration for any transport issues.
        </div>
      </div>
    </div>
  );
}
