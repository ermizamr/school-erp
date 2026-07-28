import React, { useEffect, useState } from 'react';
import { getStudentDocuments } from '../../../lib/studentApi';
import { Download, Eye, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const TYPE_LABELS = {
  birth_certificate: 'Birth Certificate',
  photo: 'Student Photo',
  report_card: 'Report Card',
  transfer_certificate: 'Transfer Certificate',
  national_id: 'National ID',
};

function DocRow({ doc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <FileText size={18} color="var(--primary)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {TYPE_LABELS[doc.type] || doc.type} · {doc.size} · Uploaded {doc.uploaded_at}
        </div>
      </div>
      {doc.verified ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
          <CheckCircle size={13} /> Verified
        </span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
          <AlertCircle size={13} /> Pending
        </span>
      )}
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <button title="Preview" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.375rem', color: '#3b82f6', cursor: 'pointer', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 600 }}>
          <Eye size={13} /> View
        </button>
        <button title="Download" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.375rem', color: 'var(--primary)', cursor: 'pointer', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 600 }}>
          <Download size={13} /> Download
        </button>
      </div>
    </div>
  );
}

export default function DocumentsTab({ student }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    getStudentDocuments(student.id).then(setDocs).finally(() => setLoading(false));
  }, [student?.id]);

  if (!student) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Upload new */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer',
          padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--primary)',
        }}>
          <Upload size={15} /> Upload Document
          <input type="file" style={{ display: 'none' }} multiple />
        </label>
      </div>

      {/* Document list */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} color="var(--primary)" /> Student Documents
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{docs.length} files</span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Loading documents…</div>
        ) : docs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📁</div>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Documents</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Upload the student's required documents above.</div>
          </div>
        ) : (
          docs.map(doc => <DocRow key={doc.id} doc={doc} />)
        )}
      </div>
    </div>
  );
}
