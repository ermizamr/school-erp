import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getTeacherIdFallback } from '../../utils/demoHelpers';
import { Folder, File, UploadCloud, Search, Download, X, Trash } from 'lucide-react';
import { useToast } from '../../components/Toast';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

export default function TeacherMaterials() {
  const { toast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherId, setTeacherId] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    setLoading(true);
    try {
      const tid = await getTeacherIdFallback();
    setTeacherId(tid);

      const { data, error } = await supabase
        .from('teaching_materials')
        .select('*')
        .eq('teacher_id', tid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      console.error('Error loading materials:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!teacherId || !uploadFile) return;
    
    setSaving(true);
    try {
      // Mock File Upload (Storing metadata only for prototype)
      const payload = {
        teacher_id: teacherId,
        name: uploadFile.name,
        size_bytes: uploadFile.size,
        file_type: uploadFile.type || 'document',
        file_url: 'mock_url'
      };

      const { error } = await supabase.from('teaching_materials').insert([payload]);
      if (error) throw error;

      toast.success('Material uploaded successfully!');
      setShowModal(false);
      setUploadFile(null);
      loadMaterials();
    } catch (err) {
      toast.error('Failed to upload material');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      const { error } = await supabase.from('teaching_materials').delete().eq('id', id);
      if (error) throw error;
      toast.success('Material deleted.');
      loadMaterials();
    } catch (err) {
      toast.error('Failed to delete material.');
    }
  }

  function handleDownload(m) {
    // Generate a simulated file download
    const content = `Mock content for file: ${m.name}\\nType: ${m.file_type}\\nSize: ${formatBytes(m.size_bytes)}`;
    const encodedUri = encodeURI("data:text/plain;charset=utf-8," + content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", m.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${m.name}...`);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Teaching Materials</h1>
          <p className="text-sm text-muted">Manage your shared resources and files</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setShowModal(true)}>
          <UploadCloud size={18} /> Upload Files
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search materials..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Size</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date Modified</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading materials...</td></tr>
            ) : filteredMaterials.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No materials found.</td></tr>
            ) : (
              filteredMaterials.map((m, i) => (
                <tr key={m.id || i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex-row gap-3">
                      <div style={{ color: 'var(--primary)' }}><File size={20} /></div>
                      <span className="font-semibold text-sm">{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{formatBytes(m.size_bytes)}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn" style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => handleDownload(m)} title="Download"><Download size={16}/></button>
                    <button className="btn" style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDelete(m.id)} title="Delete"><Trash size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Upload Material</h2>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Select File *</label>
                <input required type="file" style={{...inputStyle, padding: '0.5rem'}} onChange={e => setUploadFile(e.target.files[0])} />
                {uploadFile && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{uploadFile.name} ({formatBytes(uploadFile.size)})</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !uploadFile}>{saving ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
