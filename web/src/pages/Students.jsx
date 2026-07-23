import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', section_id: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [studentsData, sectionsData] = await Promise.all([
        api.getStudents(),
        api.getSections()
      ]);
      setStudents(studentsData);
      setSections(sectionsData);
    } catch (err) {
      toast({ title: 'Error', message: 'Failed to load students', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.addStudent(formData);
      toast({ title: 'Success', message: 'Student added successfully', type: 'success' });
      setShowModal(false);
      setFormData({ first_name: '', last_name: '', email: '', section_id: '' });
      loadData();
    } catch (err) {
      toast({ title: 'Error', message: 'Failed to add student', type: 'error' });
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Students</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Student</button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search students..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Grade/Section</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>{student.first_name} {student.last_name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{student.email}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{student.section?.name || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-surface)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Student</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input 
                  required
                  placeholder="First Name" 
                  value={formData.first_name}
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
                />
                <input 
                  required
                  placeholder="Last Name" 
                  value={formData.last_name}
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <input 
                required type="email"
                placeholder="Email Address" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
              />
              <select 
                required
                value={formData.section_id}
                onChange={e => setFormData({...formData, section_id: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
              >
                <option value="">Select Section</option>
                {sections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
