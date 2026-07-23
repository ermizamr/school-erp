import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getTeacherIdFallback } from '../../utils/demoHelpers';
import { BookOpen, Plus, Search, FileText, ChevronRight, X } from 'lucide-react';
import { useToast } from '../../components/Toast';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

export default function TeacherLessonPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherId, setTeacherId] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', section_id: '', subject_id: '', date: '', status: 'Draft' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const tid = await getTeacherIdFallback();
    setTeacherId(tid);

      const [plansRes, secRes, subRes] = await Promise.all([
        supabase.from('lesson_plans').select('*, subjects(name), sections(name, grades(name))').eq('teacher_id', tid).order('date', { ascending: false }),
        supabase.from('sections').select('*, grades(name)'),
        supabase.from('subjects').select('*')
      ]);

      if (plansRes.error) throw plansRes.error;
      setPlans(plansRes.data || []);
      setSections(secRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      console.error('Error loading lesson plans:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePlan(e) {
    e.preventDefault();
    if (!teacherId) return;
    setSaving(true);
    try {
      const payload = { ...form, teacher_id: teacherId, section_id: form.section_id || null };
      const { error } = await supabase.from('lesson_plans').insert([payload]);
      if (error) throw error;
      toast.success('Lesson Plan created!');
      setShowModal(false);
      setForm({ title: '', content: '', section_id: '', subject_id: '', date: '', status: 'Draft' });
      loadPlans();
    } catch (err) {
      toast.error(err.message || 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  }

  const filteredPlans = plans.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.subjects?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out', paddingBottom: '2rem' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Lesson Plans</h1>
          <p className="text-sm text-muted">Create, organize, and submit your daily lesson plans</p>
        </div>
        <button className="btn btn-primary gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create Plan
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search lesson plans..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }} 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-col justify-center" style={{ alignItems: 'center', height: '30vh' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="dashboard-grid grid-cols-3" style={{ gap: '1.5rem' }}>
          {filteredPlans.map((p, i) => (
            <div key={p.id || i} className="glass-card hover-card flex-col" style={{ padding: '1.5rem' }}>
              <div className="flex-row justify-between" style={{ marginBottom: '1rem' }}>
                <div style={{ color: 'var(--primary)', backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <BookOpen size={20} />
                </div>
                <span className={`badge ${p.status === 'Approved' ? 'badge-green' : p.status === 'Draft' ? 'badge-blue' : 'badge-yellow'}`}>
                  {p.status}
                </span>
              </div>
              <h3 className="text-lg font-bold" style={{ marginBottom: '0.25rem' }}>{p.title}</h3>
              <p className="text-sm font-semibold text-muted" style={{ marginBottom: '1rem' }}>
                {p.subjects?.name} • {p.sections?.grades?.name}
              </p>
              <p className="text-sm text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                {p.content}
              </p>
              <div className="flex-row justify-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                <span className="text-xs text-muted flex-row gap-1"><FileText size={14}/> {new Date(p.date).toLocaleDateString()}</span>
                <button className="btn" style={{ background: 'transparent', padding: 0, color: 'var(--primary)' }}>
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          ))}
          {filteredPlans.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No lesson plans found.
            </div>
          )}
        </div>
      )}

      {/* Create Plan Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Create Lesson Plan</h2>
            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Title *</label>
                <input required style={inputStyle} placeholder="e.g. Introduction to Algebra" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Content</label>
                <textarea style={{...inputStyle, height: '80px', resize: 'none'}} placeholder="Plan details..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Section</label>
                  <select style={inputStyle} value={form.section_id} onChange={e => setForm({ ...form, section_id: e.target.value })}>
                    <option value="">Any Section</option>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date *</label>
                  <input required type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Status *</label>
                  <select required style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Draft">Draft</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
