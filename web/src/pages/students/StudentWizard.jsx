import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { createStudent } from '../../lib/studentApi';
import { GRADES, SECTIONS, BUSES, HOSTELS } from '../../lib/mockData';

// ─────────────────────────────────────────────────────────────
// Step definitions
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Personal',    desc: 'Basic information' },
  { id: 2, title: 'Academic',    desc: 'Enrollment details' },
  { id: 3, title: 'Guardian',    desc: 'Parent & guardian' },
  { id: 4, title: 'Medical',     desc: 'Health information' },
  { id: 5, title: 'Transport',   desc: 'Bus & route' },
  { id: 6, title: 'Hostel',      desc: 'Boarding details' },
  { id: 7, title: 'Documents',   desc: 'File uploads' },
  { id: 8, title: 'Review',      desc: 'Confirm & submit' },
];

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const RELIGIONS    = ['Christian','Muslim','Orthodox','Protestant','Catholic','Hindu','Other'];
const NATIONALITIES = ['Ethiopian','Eritrean','Kenyan','Somali','Other'];
const RELATIONSHIPS = ['Father','Mother','Guardian','Uncle','Aunt','Grandparent','Other'];

// ─────────────────────────────────────────────────────────────
// Shared input styles
// ─────────────────────────────────────────────────────────────
const inp = {
  width: '100%', padding: '0.625rem 0.875rem',
  borderRadius: '0.5rem', border: '1px solid var(--border-color)',
  background: 'rgba(15,23,42,0.5)', color: 'var(--text-primary)',
  fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none',
  transition: 'border-color 0.2s',
};
const lbl = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: '0.35rem',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

function Field({ label, required, children }) {
  return (
    <div>
      <label style={lbl}>{label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}</label>
      {children}
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 1 — Personal Information
// ─────────────────────────────────────────────────────────────
function StepPersonal({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Photo Upload */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', border: '2px dashed var(--border-color)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: 'rgba(15,23,42,0.3)', gap: '0.4rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {data.photo_preview ? (
            <img src={data.photo_preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <Upload size={20} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>Upload<br/>Photo</span>
            </>
          )}
          <input
            type="file" accept="image/*"
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                set('photo_file', file);
                set('photo_preview', URL.createObjectURL(file));
              }
            }}
          />
        </div>
      </div>

      <Grid cols={3}>
        <Field label="First Name" required>
          <input style={inp} placeholder="e.g. Amara" value={data.first_name || ''} onChange={e => set('first_name', e.target.value)} />
        </Field>
        <Field label="Middle Name">
          <input style={inp} placeholder="e.g. Grace" value={data.middle_name || ''} onChange={e => set('middle_name', e.target.value)} />
        </Field>
        <Field label="Last Name" required>
          <input style={inp} placeholder="e.g. Tesfaye" value={data.last_name || ''} onChange={e => set('last_name', e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={2}>
        <Field label="Date of Birth" required>
          <input type="date" style={inp} value={data.date_of_birth || ''} onChange={e => set('date_of_birth', e.target.value)} />
        </Field>
        <Field label="Gender" required>
          <select style={inp} value={data.gender || ''} onChange={e => set('gender', e.target.value)}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
      </Grid>

      <Grid cols={3}>
        <Field label="Nationality">
          <select style={inp} value={data.nationality || ''} onChange={e => set('nationality', e.target.value)}>
            <option value="">Select</option>
            {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Religion">
          <select style={inp} value={data.religion || ''} onChange={e => set('religion', e.target.value)}>
            <option value="">Select</option>
            {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Blood Group">
          <select style={inp} value={data.blood_group || ''} onChange={e => set('blood_group', e.target.value)}>
            <option value="">Select</option>
            {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </Grid>

      <Field label="Birth Certificate Number">
        <input style={inp} placeholder="e.g. BC-2010-12345" value={data.birth_certificate_number || ''} onChange={e => set('birth_certificate_number', e.target.value)} />
      </Field>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 2 — Academic Information
// ─────────────────────────────────────────────────────────────
function StepAcademic({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const filteredSections = data.grade_id ? SECTIONS.filter(s => s.grade_id === data.grade_id) : SECTIONS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Grid cols={2}>
        <Field label="Admission Number" required>
          <input style={inp} placeholder="e.g. ADM-2024-001" value={data.admission_number || ''} onChange={e => set('admission_number', e.target.value)} />
        </Field>
        <Field label="Admission Date" required>
          <input type="date" style={inp} value={data.admission_date || ''} onChange={e => set('admission_date', e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={3}>
        <Field label="Grade" required>
          <select style={inp} value={data.grade_id || ''} onChange={e => { set('grade_id', e.target.value); set('section_id', ''); }}>
            <option value="">Select Grade</option>
            {GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
        <Field label="Section" required>
          <select style={inp} value={data.section_id || ''} onChange={e => set('section_id', e.target.value)}>
            <option value="">Select Section</option>
            {filteredSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
          </select>
        </Field>
        <Field label="Roll Number">
          <input style={inp} type="number" placeholder="e.g. 15" value={data.roll_number || ''} onChange={e => set('roll_number', e.target.value)} />
        </Field>
      </Grid>

      <Grid cols={2}>
        <Field label="Academic Year">
          <select style={inp} value={data.academic_year || ''} onChange={e => set('academic_year', e.target.value)}>
            <option value="">Select Year</option>
            <option value="2025–2026">2025–2026</option>
            <option value="2024–2025">2024–2025</option>
          </select>
        </Field>
        <Field label="House">
          <select style={inp} value={data.house || ''} onChange={e => set('house', e.target.value)}>
            <option value="">Select House</option>
            <option value="Red House">Red House</option>
            <option value="Blue House">Blue House</option>
            <option value="Green House">Green House</option>
            <option value="Yellow House">Yellow House</option>
          </select>
        </Field>
      </Grid>

      <Field label="Previous School">
        <input style={inp} placeholder="e.g. Addis Ababa Elementary School" value={data.previous_school || ''} onChange={e => set('previous_school', e.target.value)} />
      </Field>

      <Field label="Scholarship">
        <input style={inp} placeholder="e.g. Merit Scholarship (leave blank if none)" value={data.scholarship || ''} onChange={e => set('scholarship', e.target.value)} />
      </Field>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 3 — Guardian Information
// ─────────────────────────────────────────────────────────────
function StepGuardian({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Father */}
      <div>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>Father's Information</h4>
        <Grid cols={2}>
          <Field label="Full Name"><input style={inp} placeholder="Father's full name" value={data.father_name || ''} onChange={e => set('father_name', e.target.value)} /></Field>
          <Field label="Phone"><input style={inp} placeholder="+251-9XX-XXX-XXX" value={data.father_phone || ''} onChange={e => set('father_phone', e.target.value)} /></Field>
          <Field label="Occupation"><input style={inp} placeholder="e.g. Engineer" value={data.father_occupation || ''} onChange={e => set('father_occupation', e.target.value)} /></Field>
          <Field label="Email"><input type="email" style={inp} placeholder="father@email.com" value={data.father_email || ''} onChange={e => set('father_email', e.target.value)} /></Field>
        </Grid>
      </div>

      {/* Mother */}
      <div>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>Mother's Information</h4>
        <Grid cols={2}>
          <Field label="Full Name"><input style={inp} placeholder="Mother's full name" value={data.mother_name || ''} onChange={e => set('mother_name', e.target.value)} /></Field>
          <Field label="Phone"><input style={inp} placeholder="+251-9XX-XXX-XXX" value={data.mother_phone || ''} onChange={e => set('mother_phone', e.target.value)} /></Field>
          <Field label="Occupation"><input style={inp} placeholder="e.g. Doctor" value={data.mother_occupation || ''} onChange={e => set('mother_occupation', e.target.value)} /></Field>
          <Field label="Email"><input type="email" style={inp} placeholder="mother@email.com" value={data.mother_email || ''} onChange={e => set('mother_email', e.target.value)} /></Field>
        </Grid>
      </div>

      {/* Primary Guardian */}
      <div>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>Primary Guardian (Emergency Contact)</h4>
        <Grid cols={3}>
          <Field label="Name" required><input style={inp} placeholder="Guardian full name" value={data.guardian_name || ''} onChange={e => set('guardian_name', e.target.value)} /></Field>
          <Field label="Relationship" required>
            <select style={inp} value={data.guardian_relationship || ''} onChange={e => set('guardian_relationship', e.target.value)}>
              <option value="">Select</option>
              {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Phone" required><input style={inp} placeholder="+251-9XX-XXX-XXX" value={data.guardian_phone || ''} onChange={e => set('guardian_phone', e.target.value)} /></Field>
        </Grid>
        <div style={{ marginTop: '1rem' }}>
          <Field label="Address">
            <input style={inp} placeholder="Home address" value={data.guardian_address || ''} onChange={e => set('guardian_address', e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 4 — Medical Information
// ─────────────────────────────────────────────────────────────
function StepMedical({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Grid cols={2}>
        <Field label="Blood Group">
          <select style={inp} value={data.blood_group || ''} onChange={e => set('blood_group', e.target.value)}>
            <option value="">Select</option>
            {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Doctor's Name">
          <input style={inp} placeholder="Dr. Full Name" value={data.doctor_name || ''} onChange={e => set('doctor_name', e.target.value)} />
        </Field>
      </Grid>

      <Field label="Medical Conditions">
        <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="List any chronic conditions (e.g. Asthma, Diabetes). Write 'None' if none." value={data.medical_conditions || ''} onChange={e => set('medical_conditions', e.target.value)} />
      </Field>

      <Field label="Allergies">
        <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="List any known allergies (e.g. Penicillin, Peanuts). Write 'None' if none." value={data.allergies || ''} onChange={e => set('allergies', e.target.value)} />
      </Field>

      <Field label="Current Medications">
        <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="List any regular medications and dosage. Write 'None' if none." value={data.medications || ''} onChange={e => set('medications', e.target.value)} />
      </Field>

      <Field label="Emergency Notes">
        <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Any special instructions for medical emergencies." value={data.emergency_notes || ''} onChange={e => set('emergency_notes', e.target.value)} />
      </Field>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 5 — Transportation
// ─────────────────────────────────────────────────────────────
function StepTransport({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const selectedBus = BUSES.find(b => b.id === data.bus_id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid rgba(16,185,129,0.15)' }}>
        ℹ️ Transportation is optional. Leave blank if the student is a day scholar who doesn't use school transport.
      </div>

      <Field label="Assigned Bus">
        <select style={inp} value={data.bus_id || ''} onChange={e => set('bus_id', e.target.value)}>
          <option value="">No Bus / Day Scholar</option>
          {BUSES.map(b => <option key={b.id} value={b.id}>{b.number} – {b.route} (Driver: {b.driver})</option>)}
        </select>
      </Field>

      {selectedBus && (
        <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: '0.625rem', padding: '0.875rem 1rem', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ fontSize: '0.82rem', color: '#3b82f6', fontWeight: 600, marginBottom: '0.4rem' }}>Bus Details</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Route: {selectedBus.route} · Driver: {selectedBus.driver} · Capacity: {selectedBus.capacity}</div>
        </div>
      )}

      <Grid cols={2}>
        <Field label="Pickup Point">
          <input style={inp} placeholder="e.g. Bole Medhanealem" value={data.pickup_point || ''} onChange={e => set('pickup_point', e.target.value)} />
        </Field>
        <Field label="Dropoff Point">
          <input style={inp} placeholder="e.g. School Main Gate" value={data.dropoff_point || ''} onChange={e => set('dropoff_point', e.target.value)} />
        </Field>
      </Grid>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 6 — Hostel
// ─────────────────────────────────────────────────────────────
function StepHostel({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid rgba(16,185,129,0.15)' }}>
        ℹ️ Hostel assignment is optional. Leave blank if the student is a day scholar.
      </div>

      <Field label="Hostel Building">
        <select style={inp} value={data.hostel_id || ''} onChange={e => set('hostel_id', e.target.value)}>
          <option value="">Day Scholar (No Hostel)</option>
          {HOSTELS.map(h => <option key={h.id} value={h.id}>{h.building} (Warden: {h.warden}, Capacity: {h.capacity})</option>)}
        </select>
      </Field>

      <Grid cols={2}>
        <Field label="Room Number">
          <input style={inp} type="text" placeholder="e.g. 204" value={data.room_number || ''} onChange={e => set('room_number', e.target.value)} />
        </Field>
        <Field label="Bed Number">
          <input style={inp} type="text" placeholder="e.g. 3" value={data.bed_number || ''} onChange={e => set('bed_number', e.target.value)} />
        </Field>
      </Grid>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 7 — Documents
// ─────────────────────────────────────────────────────────────
const DOC_TYPES = [
  { key: 'birth_certificate', label: 'Birth Certificate', required: true },
  { key: 'student_photo',     label: 'Student Photo',     required: true },
  { key: 'transfer_cert',     label: 'Transfer Certificate', required: false },
  { key: 'national_id',       label: 'National ID / Passport', required: false },
  { key: 'report_card',       label: 'Previous Report Card', required: false },
];

function StepDocuments({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {DOC_TYPES.map(doc => {
        const file = data[doc.key];
        return (
          <div key={doc.key} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.875rem 1rem', borderRadius: '0.625rem',
            border: `1px solid ${file ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
            background: file ? 'rgba(16,185,129,0.04)' : 'rgba(15,23,42,0.3)',
            transition: 'all 0.2s',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.1rem' }}>
                {doc.label}
                {doc.required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
              </div>
              {file ? (
                <div style={{ fontSize: '0.78rem', color: '#10B981' }}>✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)</div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{doc.required ? 'Required' : 'Optional'}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {file && (
                <button
                  type="button"
                  onClick={() => set(doc.key, null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem' }}
                >
                  <X size={15} />
                </button>
              )}
              <label style={{
                padding: '0.4rem 0.875rem', borderRadius: '0.4rem',
                background: file ? 'rgba(16,185,129,0.1)' : 'var(--bg-surface-hover)',
                color: file ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                border: '1px solid var(--border-color)',
              }}>
                {file ? 'Replace' : 'Upload'}
                <input type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) set(doc.key, f); }} />
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 8 — Review & Submit
// ─────────────────────────────────────────────────────────────
function StepReview({ data }) {
  const grade = GRADES.find(g => g.id === data.grade_id);
  const section = SECTIONS.find(s => s.id === data.section_id);
  const bus = BUSES.find(b => b.id === data.bus_id);
  const hostel = HOSTELS.find(h => h.id === data.hostel_id);

  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{value || <span style={{ color: 'var(--text-secondary)' }}>—</span>}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{title}</h4>
      <div className="glass-card" style={{ padding: '0.25rem 1rem' }}>{children}</div>
    </div>
  );

  return (
    <div>
      <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--primary)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.25rem', fontWeight: 500 }}>
        ✓ Please review all information carefully before submitting. Once submitted, the student record will be created.
      </div>

      <Section title="Personal Information">
        <Row label="Full Name" value={`${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`.trim()} />
        <Row label="Date of Birth" value={data.date_of_birth} />
        <Row label="Gender" value={data.gender} />
        <Row label="Blood Group" value={data.blood_group} />
        <Row label="Nationality" value={data.nationality} />
        <Row label="Religion" value={data.religion} />
      </Section>

      <Section title="Academic Information">
        <Row label="Admission Number" value={data.admission_number} />
        <Row label="Admission Date" value={data.admission_date} />
        <Row label="Grade" value={grade?.name} />
        <Row label="Section" value={section ? `Section ${section.name}` : null} />
        <Row label="Academic Year" value={data.academic_year} />
        <Row label="House" value={data.house} />
        <Row label="Scholarship" value={data.scholarship} />
      </Section>

      <Section title="Guardian">
        <Row label="Name" value={data.guardian_name} />
        <Row label="Relationship" value={data.guardian_relationship} />
        <Row label="Phone" value={data.guardian_phone} />
        <Row label="Address" value={data.guardian_address} />
      </Section>

      <Section title="Transport & Hostel">
        <Row label="Bus" value={bus ? `${bus.number} – ${bus.route}` : 'Day Scholar (No Bus)'} />
        <Row label="Pickup Point" value={data.pickup_point} />
        <Row label="Hostel" value={hostel ? `${hostel.building}, Room ${data.room_number}, Bed ${data.bed_number}` : 'Day Scholar'} />
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Wizard Shell
// ─────────────────────────────────────────────────────────────
export default function StudentWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validateStep(s) {
    if (s === 1) return formData.first_name && formData.last_name && formData.date_of_birth && formData.gender;
    if (s === 2) return formData.admission_number && formData.grade_id && formData.section_id;
    if (s === 3) return formData.guardian_name && formData.guardian_phone;
    return true;
  }

  function next() {
    if (!validateStep(step)) {
      toast.error('Please fill in all required fields before continuing.');
      return;
    }
    if (step < 8) setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await createStudent(formData);
      toast.success('Student registered successfully!');
      navigate('/dashboard/students');
    } catch {
      toast.error('Failed to register student. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const stepComponents = {
    1: <StepPersonal    data={formData} onChange={setFormData} />,
    2: <StepAcademic    data={formData} onChange={setFormData} />,
    3: <StepGuardian    data={formData} onChange={setFormData} />,
    4: <StepMedical     data={formData} onChange={setFormData} />,
    5: <StepTransport   data={formData} onChange={setFormData} />,
    6: <StepHostel      data={formData} onChange={setFormData} />,
    7: <StepDocuments   data={formData} onChange={setFormData} />,
    8: <StepReview      data={formData} />,
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/dashboard/students')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 500 }}
        >
          <ChevronLeft size={16} /> Back to Students
        </button>
        <div style={{ height: 1, flex: 1, background: 'var(--border-color)' }} />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Step {step} of {STEPS.length}</span>
      </div>

      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>Register New Student</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.875rem' }}>
        Complete all steps to create a full student profile.
      </p>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const current = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div
                onClick={() => step > s.id && setStep(s.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                  cursor: done ? 'pointer' : 'default', flexShrink: 0,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                  background: done ? 'var(--primary)' : current ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface-hover)',
                  border: current ? '2px solid var(--primary)' : done ? 'none' : '1px solid var(--border-color)',
                  color: done ? '#fff' : current ? 'var(--primary)' : 'var(--text-secondary)',
                }}>
                  {done ? <Check size={15} /> : s.id}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: current ? 700 : 500, color: current ? 'var(--primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, alignSelf: 'flex-start', marginTop: 15, background: step > s.id ? 'var(--primary)' : 'var(--border-color)', transition: 'background 0.3s', minWidth: 12 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {STEPS[step - 1].title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{STEPS[step - 1].desc}</p>
        </div>
        {stepComponents[step]}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button
          className="btn"
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/dashboard/students')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.625rem 1.25rem' }}
        >
          <ChevronLeft size={16} /> {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 8 ? (
          <button
            className="btn btn-primary"
            onClick={next}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.5rem' }}
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.5rem', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Submitting…' : <><Check size={16} /> Submit Registration</>}
          </button>
        )}
      </div>
    </div>
  );
}
