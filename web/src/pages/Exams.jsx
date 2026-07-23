import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', marginBottom: '1rem', boxSizing: 'border-box'
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

const thStyle = {
  textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--border-color)',
  color: 'var(--text-secondary)', fontWeight: 'normal'
};

const tdStyle = {
  padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)'
};

export default function Exams() {
  const { addToast } = useToast();
  
  // Views: 'list' | 'score'
  const [view, setView] = useState('list');
  
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', subject_id: '', section_id: '', date: '' });
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    fetchExamsData();
  }, []);

  const fetchExamsData = async () => {
    setLoading(true);
    try {
      const [examsRes, sectionsRes, subjectsRes] = await Promise.all([
        api.getExams(),
        api.getSections(),
        api.getSubjects()
      ]);
      setExams(examsRes.data || []);
      setSections(sectionsRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      addToast('Failed to load exams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.addExam({
        title: examForm.title,
        subject_id: parseInt(examForm.subject_id, 10),
        section_id: parseInt(examForm.section_id, 10),
        date: examForm.date
      });
      addToast('Exam created successfully', 'success');
      setShowExamModal(false);
      fetchExamsData();
    } catch (error) {
      addToast('Failed to create exam', 'error');
    }
  };

  const openScoreEntry = async (exam) => {
    setSelectedExam(exam);
    setView('score');
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        api.getStudentsBySection(exam.section_id),
        api.getExamResults(exam.id)
      ]);
      setStudents(studentsRes.data || []);
      
      const scoresMap = {};
      if (resultsRes.data) {
        resultsRes.data.forEach(res => {
          scoresMap[res.student_id] = res.score;
        });
      }
      setScores(scoresMap);
    } catch (error) {
      addToast('Failed to load score data', 'error');
    }
  };

  const handleScoreChange = (studentId, val) => {
    let score = parseInt(val, 10);
    if (isNaN(score)) score = '';
    else if (score < 0) score = 0;
    else if (score > 100) score = 100;
    
    setScores(prev => ({
      ...prev,
      [studentId]: score
    }));
  };

  const handleSaveScores = async () => {
    try {
      const results = Object.keys(scores).map(studentId => ({
        student_id: parseInt(studentId, 10),
        score: scores[studentId] === '' ? null : scores[studentId]
      })).filter(r => r.score !== null);
      
      await api.saveExamResults({
        exam_id: selectedExam.id,
        results
      });
      addToast('Scores saved successfully', 'success');
      setView('list');
    } catch (error) {
      addToast('Failed to save scores', 'error');
    }
  };

  if (loading && view === 'list') {
    return <div style={{ color: 'var(--text-primary)', padding: '2rem' }}>Loading exams...</div>;
  }

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      {view === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Exams & Grading</h1>
            <button className="btn btn-primary" onClick={() => setShowExamModal(true)}>Create Exam</button>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
            {exams.length === 0 ? (
              <p style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No exams found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Title</th>
                    <th style={thStyle}>Subject</th>
                    <th style={thStyle}>Section</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map(exam => {
                    const subject = subjects.find(s => s.id === exam.subject_id);
                    const section = sections.find(s => s.id === exam.section_id);
                    return (
                      <tr key={exam.id} style={{ backgroundColor: 'var(--bg-surface)' }}>
                        <td style={tdStyle}>{exam.title}</td>
                        <td style={tdStyle}>{subject?.name || exam.subject_id}</td>
                        <td style={tdStyle}>{section?.name || exam.section_id}</td>
                        <td style={tdStyle}>{exam.date}</td>
                        <td style={tdStyle}>
                          <button className="btn btn-primary" onClick={() => openScoreEntry(exam)}>Enter Scores</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Exam Modal */}
          {showExamModal && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Create Exam</h2>
                <form onSubmit={handleCreateExam}>
                  <input style={inputStyle} type="text" placeholder="Exam Title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} required />
                  <select style={inputStyle} value={examForm.subject_id} onChange={e => setExamForm({...examForm, subject_id: e.target.value})} required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select style={inputStyle} value={examForm.section_id} onChange={e => setExamForm({...examForm, section_id: e.target.value})} required>
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input style={inputStyle} type="date" value={examForm.date} onChange={e => setExamForm({...examForm, date: e.target.value})} required />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn" onClick={() => setShowExamModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'score' && selectedExam && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <button className="btn" onClick={() => setView('list')} style={{ marginBottom: '1rem' }}>&larr; Back to List</button>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>{selectedExam.title} - Scores</h1>
            </div>
            <button className="btn btn-primary" onClick={handleSaveScores}>Save Scores</button>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            {students.length === 0 ? (
              <p style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No students found in this section.</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {students.map((student, idx) => (
                  <li key={student.id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.5rem', borderBottom: idx < students.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{student.first_name} {student.last_name}</span>
                    <input 
                      type="number" 
                      min="0" max="100"
                      style={{ ...inputStyle, width: '100px', marginBottom: 0 }}
                      value={scores[student.id] !== undefined ? scores[student.id] : ''}
                      onChange={e => handleScoreChange(student.id, e.target.value)}
                      placeholder="Score"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
