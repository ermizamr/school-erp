import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15,23,42,0.5)',
  color: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

export default function Attendance() {
  const { addToast } = useToast();
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [sectionsRes, yearsRes] = await Promise.all([
        api.getSections(),
        api.getAcademicYears()
      ]);
      setSections(sectionsRes.data || []);
      setAcademicYears(yearsRes.data || []);
    } catch (error) {
      addToast('Failed to load sections', 'error');
    }
  };

  useEffect(() => {
    if (selectedSection && selectedDate) {
      fetchStudentsAndAttendance();
    }
  }, [selectedSection, selectedDate]);

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        api.getStudentsBySection(selectedSection),
        api.getAttendance(selectedSection, selectedDate)
      ]);
      setStudents(studentsRes.data || []);
      
      const attMap = {};
      if (attendanceRes.data) {
        attendanceRes.data.forEach(record => {
          attMap[record.student_id] = record.status; // 'present', 'absent', 'late'
        });
      }
      setAttendance(attMap);
    } catch (error) {
      addToast('Failed to load attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    try {
      const records = Object.keys(attendance).map(studentId => ({
        student_id: parseInt(studentId, 10),
        status: attendance[studentId]
      }));
      await api.upsertAttendance({
        section_id: parseInt(selectedSection, 10),
        date: selectedDate,
        records
      });
      addToast('Attendance saved successfully', 'success');
    } catch (error) {
      addToast('Failed to save attendance', 'error');
    }
  };

  const getButtonStyle = (status, activeStatus) => {
    const isActive = status === activeStatus;
    let base = {
      padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer',
      border: '1px solid var(--border-color)', backgroundColor: 'transparent',
      color: 'white', fontWeight: 'bold'
    };

    if (isActive) {
      if (status === 'present') {
        base.backgroundColor = 'rgba(16,185,129,0.2)';
        base.borderColor = 'var(--primary)';
        base.color = 'var(--primary)';
      } else if (status === 'absent') {
        base.backgroundColor = 'rgba(239,68,68,0.2)';
        base.borderColor = '#ef4444';
        base.color = '#ef4444';
      } else if (status === 'late') {
        base.backgroundColor = 'rgba(245,158,11,0.2)';
        base.borderColor = '#f59e0b';
        base.color = '#f59e0b';
      }
    }

    return base;
  };

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Attendance Tracking</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={!selectedSection || students.length === 0}>
          Save Attendance
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Section</label>
          <select style={inputStyle} value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
            <option value="">Select Section</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date</label>
          <input style={inputStyle} type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div>Loading students...</div>
      ) : selectedSection ? (
        students.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No students in this section.</p>
        ) : (
          <div className="glass-card" style={{ padding: '0' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
              {students.map((student, idx) => (
                <li key={student.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem 1.5rem', borderBottom: idx < students.length - 1 ? '1px solid var(--border-color)' : 'none' 
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{student.first_name} {student.last_name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={getButtonStyle('present', attendance[student.id])} onClick={() => handleStatusChange(student.id, 'present')}>Present</button>
                    <button style={getButtonStyle('absent', attendance[student.id])} onClick={() => handleStatusChange(student.id, 'absent')}>Absent</button>
                    <button style={getButtonStyle('late', attendance[student.id])} onClick={() => handleStatusChange(student.id, 'late')}>Late</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>Please select a section to record attendance.</p>
      )}
    </div>
  );
}
