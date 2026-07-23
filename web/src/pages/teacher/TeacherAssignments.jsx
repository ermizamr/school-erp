import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getTeacherIdFallback } from '../../utils/demoHelpers';
import { PlusCircle, FileText, CheckCircle, Search, Calendar, ChevronRight, X } from 'lucide-react';
import { useToast } from '../../components/Toast';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

export default function TeacherAssignments() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherId, setTeacherId] = useState(null);
  
  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', section_id: '', subject_id: '', due_date: '', status: 'draft' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    setLoading(true);
    try {
      const tid = await getTeacherIdFallback();
    setTeacherId(tid);

      const [asgnRes, secRes, subRes] = await Promise.all([
        supabase.from('assignments').select('*, subjects(name), sections(name, grades(name))').eq('teacher_id', tid).order('due_date', { ascending: false }),
        supabase.from('sections').select('*, grades(name)'),
        supabase.from('subjects').select('*')
      ]);

      if (asgnRes.error) throw asgnRes.error;
      setAssignments(asgnRes.data || []);
      setSections(secRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    if (!teacherId) return;
    setSaving(true);
    try {
      const payload = { ...form, teacher_id: teacherId };
      const { error } = await supabase.from('assignments').insert([payload]);
      if (error) throw error;
      toast.success('Assignment created!');
      setShowModal(false);
      setForm({ title: '', description: '', section_id: '', subject_id: '', due_date: '', status: 'draft' });
      loadAssignments();
    } catch (err) {
      toast.error('Failed to create assignment');
    } finally {
      setSaving(false);
    }
  }

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.subjects?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out', paddingBottom: '2rem' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Assignments</h1>
          <p className="text-sm text-muted">Manage homework, projects, and grading</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setShowModal(true)}>
          <PlusCircle size={18} /> Create Assignment
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="flex-row gap-4">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search assignments by title or subject..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
            />
          </div>
          <select className="btn" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.75rem 1rem' }}>
            <option>All Statuses</option>
            <option>Published</option>
            <option>Grading</option>
            <option>Draft</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-col justify-center" style={{ alignItems: 'center', height: '30vh' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="dashboard-grid grid-cols-3" style={{ gap: '1.5rem' }}>
          {filteredAssignments.map((a, i) => (
            <div key={i} className="glass-card hover-card flex-col justify-between" style={{ padding: '1.5rem', borderTop: a.status === 'grading' ? '3px solid #f59e0b' : '3px solid var(--primary)' }}>
              <div>
                <div className="flex-row justify-between" style={{ marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                  <span className={`badge ${a.status === 'grading' ? 'badge-yellow' : a.status === 'published' ? 'badge-green' : 'badge-blue'}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                  <div className="flex-row gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar size={14} />
                    <span className="text-xs">Due {new Date(a.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold" style={{ marginBottom: '0.25rem' }}>{a.title}</h3>
                <p className="text-sm font-semibold" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
                  {a.subjects?.name} • {a.sections?.grades?.name} Sec {a.sections?.name}
                </p>
                <p className="text-sm text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.description}
                </p>
              </div>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                {a.status === 'grading' ? (
                  <button className="btn w-full flex-row justify-center gap-2" style={{ background: '#f59e0b', color: 'white' }}>
                    <CheckCircle size={16} /> Grade Submissions
                  </button>
                ) : (
                  <button className="btn w-full flex-row justify-center gap-2" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <FileText size={16} /> View Details
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredAssignments.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No assignments found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Create Assignment</h2>
            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Title *</label>
                <input required style={inputStyle} placeholder="e.g. Chapter 4 Exercises" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Instructions</label>
                <textarea style={{...inputStyle, height: '80px', resize: 'none'}} placeholder="What should students do?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Section *</label>
                  <select required style={inputStyle} value={form.section_id} onChange={e => setForm({ ...form, section_id: e.target.value })}>
                    <option value="">Select section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.grades?.name} – {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Subject *</label>
                  <select required style={inputStyle} value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Due Date *</label>
                  <input required type="date" style={inputStyle} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Status *</label>
                  <select required style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Assignment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
