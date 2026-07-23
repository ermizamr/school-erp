import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit',
  marginBottom: '1rem', boxSizing: 'border-box'
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 50
};

const modalContentStyle = {
  backgroundColor: 'var(--bg-surface)', padding: '2rem',
  borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px',
  border: '1px solid var(--border-color)', color: 'var(--text-primary)'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'
};

const columnStyle = {
  flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem'
};

export default function Academics() {
  const { addToast } = useToast();
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  const [gradeForm, setGradeForm] = useState({ name: '', level: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', grade_id: '', academic_year_id: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gradesRes, sectionsRes, subjectsRes, yearsRes] = await Promise.all([
        api.getGrades(),
        api.getSections(),
        api.getSubjects(),
        api.getAcademicYears()
      ]);
      setGrades(gradesRes.data || []);
      setSections(sectionsRes.data || []);
      setSubjects(subjectsRes.data || []);
      setAcademicYears(yearsRes.data || []);
    } catch (error) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    try {
      await api.addGrade({ name: gradeForm.name, level: parseInt(gradeForm.level, 10) });
      addToast('Grade added successfully', 'success');
      setShowGradeModal(false);
      fetchData();
    } catch (error) {
      addToast('Failed to add grade', 'error');
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      await api.addSection({
        name: sectionForm.name,
        grade_id: parseInt(sectionForm.grade_id, 10),
        academic_year_id: parseInt(sectionForm.academic_year_id, 10)
      });
      addToast('Section added successfully', 'success');
      setShowSectionModal(false);
      fetchData();
    } catch (error) {
      addToast('Failed to add section', 'error');
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await api.addSubject({ name: subjectForm.name });
      addToast('Subject added successfully', 'success');
      setShowSubjectModal(false);
      fetchData();
    } catch (error) {
      addToast('Failed to add subject', 'error');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-primary)', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Academics Configuration</h1>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Grades Column */}
        <div className="glass-card" style={columnStyle}>
          <div style={headerStyle}>
            <h2 style={{ margin: 0 }}>Grades</h2>
            <button className="btn btn-primary" onClick={() => setShowGradeModal(true)}>Add</button>
          </div>
          {grades.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No grades found.</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {grades.map(g => (
                <li key={g.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  {g.name} (Level {g.level})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sections Column */}
        <div className="glass-card" style={columnStyle}>
          <div style={headerStyle}>
            <h2 style={{ margin: 0 }}>Sections</h2>
            <button className="btn btn-primary" onClick={() => setShowSectionModal(true)}>Add</button>
          </div>
          {sections.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No sections found.</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sections.map(s => (
                <li key={s.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  {s.name} - Grade {s.grade_id}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Subjects Column */}
        <div className="glass-card" style={columnStyle}>
          <div style={headerStyle}>
            <h2 style={{ margin: 0 }}>Subjects</h2>
            <button className="btn btn-primary" onClick={() => setShowSubjectModal(true)}>Add</button>
          </div>
          {subjects.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No subjects found.</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {subjects.map(s => (
                <li key={s.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Grade Modal */}
      {showGradeModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Add Grade</h2>
            <form onSubmit={handleAddGrade}>
              <input style={inputStyle} type="text" placeholder="Grade Name" value={gradeForm.name} onChange={e => setGradeForm({...gradeForm, name: e.target.value})} required />
              <input style={inputStyle} type="number" placeholder="Level" value={gradeForm.level} onChange={e => setGradeForm({...gradeForm, level: e.target.value})} required />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowGradeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Add Section</h2>
            <form onSubmit={handleAddSection}>
              <input style={inputStyle} type="text" placeholder="Section Name (e.g. A, B)" value={sectionForm.name} onChange={e => setSectionForm({...sectionForm, name: e.target.value})} required />
              <select style={inputStyle} value={sectionForm.grade_id} onChange={e => setSectionForm({...sectionForm, grade_id: e.target.value})} required>
                <option value="">Select Grade</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <select style={inputStyle} value={sectionForm.academic_year_id} onChange={e => setSectionForm({...sectionForm, academic_year_id: e.target.value})} required>
                <option value="">Select Academic Year</option>
                {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowSectionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Add Subject</h2>
            <form onSubmit={handleAddSubject}>
              <input style={inputStyle} type="text" placeholder="Subject Name" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} required />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
