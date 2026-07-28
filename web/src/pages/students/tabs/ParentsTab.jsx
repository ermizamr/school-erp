import React from 'react';
import AvatarCell from '../../../components/students/AvatarCell';
import { Phone, Mail, MapPin, Briefcase, User } from 'lucide-react';

function GuardianCard({ title, name, relationship, phone, email, occupation, address, isEmergency }) {
  if (!name) return null;
  return (
    <div className="glass-card" style={{ border: isEmergency ? '1px solid rgba(16,185,129,0.3)' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <AvatarCell firstName={name.split(' ')[0]} lastName={name.split(' ')[1]} size={48} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {relationship}
            {isEmergency && (
              <span style={{ marginLeft: '0.5rem', background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.3rem', fontWeight: 700 }}>
                Emergency Contact
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontStyle: 'italic' }}>{title}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem' }}>
            <Phone size={14} color="var(--primary)" />
            <a href={`tel:${phone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>{phone}</a>
          </div>
        )}
        {email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem' }}>
            <Mail size={14} color="var(--primary)" />
            <a href={`mailto:${email}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>{email}</a>
          </div>
        )}
        {occupation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <Briefcase size={14} color="var(--primary)" />
            {occupation}
          </div>
        )}
        {address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="var(--primary)" />
            {address}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentsTab({ student }) {
  if (!student) return null;

  // Build guardian data from student record
  const guardians = [
    {
      title: "Father",
      name: student.father_name || `${student.guardian_relationship === 'Father' ? student.guardian_name : ''}`,
      relationship: 'Father',
      phone: student.father_phone || (student.guardian_relationship === 'Father' ? student.guardian_phone : ''),
      email: student.father_email || (student.guardian_relationship === 'Father' ? student.guardian_email : ''),
      occupation: student.father_occupation || '',
      address: student.guardian_address,
      isEmergency: student.guardian_relationship === 'Father',
    },
    {
      title: "Mother",
      name: student.mother_name || (student.guardian_relationship === 'Mother' ? student.guardian_name : ''),
      relationship: 'Mother',
      phone: student.mother_phone || (student.guardian_relationship === 'Mother' ? student.guardian_phone : ''),
      email: student.mother_email || (student.guardian_relationship === 'Mother' ? student.guardian_email : ''),
      occupation: student.mother_occupation || '',
      address: student.guardian_address,
      isEmergency: student.guardian_relationship === 'Mother',
    },
  ];

  // If guardian is not father or mother, add as third card
  const isOtherGuardian = student.guardian_relationship && !['Father', 'Mother'].includes(student.guardian_relationship);
  if (isOtherGuardian && student.guardian_name) {
    guardians.push({
      title: "Legal Guardian",
      name: student.guardian_name,
      relationship: student.guardian_relationship,
      phone: student.guardian_phone,
      email: student.guardian_email,
      occupation: '',
      address: student.guardian_address,
      isEmergency: true,
    });
  }

  // Fallback: if no specific guardians found, show primary guardian
  const hasAnyGuardian = guardians.some(g => g.name);
  if (!hasAnyGuardian && student.guardian_name) {
    guardians.push({
      title: "Primary Guardian",
      name: student.guardian_name,
      relationship: student.guardian_relationship,
      phone: student.guardian_phone,
      email: student.guardian_email,
      occupation: '',
      address: student.guardian_address,
      isEmergency: true,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {guardians.filter(g => g.name).map((g, i) => (
          <GuardianCard key={i} {...g} />
        ))}
      </div>
      {!guardians.some(g => g.name) && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👨‍👩‍👧</div>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Guardian Information</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Guardian information has not been added for this student.</div>
        </div>
      )}
    </div>
  );
}
