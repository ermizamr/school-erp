import React from 'react';
import { Home, Key, User, Phone, AlertCircle } from 'lucide-react';
import { MOCK_HOSTEL } from './mock/studentMockData';

export default function StudentHostel({ student }) {
  const h = MOCK_HOSTEL;

  if (!h.has_hostel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
          <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Day Scholar</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto' }}>
            You are registered as a day scholar and do not reside in the school hostel. Contact administration if you require boarding accommodation.
          </p>
        </div>

        {/* Hostel info card */}
        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} color="var(--primary)" /> Hostel Information
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            EthioSchool provides separate boarding facilities for boys and girls. Each block has a dedicated warden available 24/7. For enquiries about hostel accommodation, please contact the school administration office or call <strong>+251-111-222-333</strong>.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
            {[
              { building: 'Block A (Boys)', warden: 'Mr. Yonas Bekele', phone: '+251-911-000-001', capacity: '80 beds' },
              { building: 'Block B (Girls)', warden: 'Ms. Selamawit Tadesse', phone: '+251-911-000-002', capacity: '60 beds' },
            ].map(block => (
              <div key={block.building} style={{ background: 'var(--bg-color)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>{block.building}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <div>Warden: {block.warden}</div>
                  <div>Phone: {block.phone}</div>
                  <div>Capacity: {block.capacity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Room card */}
      <div className="mobile-wrap"  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '1rem', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '1rem', background: 'rgba(16,185,129,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Home size={32} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Your Room</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem' }}>{h.building} · Room {h.room_number}</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Bed {h.bed_number}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', padding: '0.375rem 1rem', borderRadius: '1rem', fontWeight: 700, fontSize: '0.82rem' }}>Resident</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Room Details</h3>
          {[
            { icon: Home, label: 'Building', value: h.building },
            { icon: Key,  label: 'Room',     value: h.room_number },
            { icon: Key,  label: 'Bed',      value: h.bed_number },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <r.icon size={15} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>{r.label}</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div className="glass-card">
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Warden Info</h3>
          {[
            { icon: User,  label: 'Warden', value: h.warden },
            { icon: Phone, label: 'Phone',  value: h.warden_phone },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <r.icon size={15} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>{r.label}</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '0.75rem', padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        ℹ️ Hostel fees are managed through the Finance section. For maintenance requests or room issues, contact your warden directly.
      </div>
    </div>
  );
}
