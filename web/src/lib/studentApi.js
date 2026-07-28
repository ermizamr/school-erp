import { supabase } from '../supabaseClient';
import {
  MOCK_STUDENTS, getMockStats, getMockAttendance, getMockGrades,
  getMockExamResults, getMockFinance, getMockLibrary, getMockBehavior,
  getMockMedical, getMockDocuments, getMockTimeline, GRADES, SECTIONS,
} from './mockData';

// ─────────────────────────────────────────────────────────────
// Student API — wraps Supabase with mock-data fallbacks.
// Real queries run first; on any error, mock data is returned.
// ─────────────────────────────────────────────────────────────

// ── List & Search ─────────────────────────────────────────────

export async function getStudents({ search = '', filters = {}, sort = 'first_name', order = 'asc', page = 1, pageSize = 20 } = {}) {
  try {
    let query = supabase
      .from('profiles')
      .select('*, enrollments(sections(id, name, grades(id, name)))', { count: 'exact' })
      .eq('role', 'student');

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (filters.gender) query = query.eq('gender', filters.gender);
    if (filters.enrollment_status) query = query.eq('enrollment_status', filters.enrollment_status);

    const from = (page - 1) * pageSize;
    query = query.order(sort, { ascending: order === 'asc' }).range(from, from + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { students: data || [], total: count || 0 };
  } catch {
    // Fallback: apply filters to mock data in-memory
    let list = [...MOCK_STUDENTS];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        `${s.first_name} ${s.last_name} ${s.student_id} ${s.admission_number} ${s.guardian_name} ${s.guardian_phone}`
          .toLowerCase().includes(q)
      );
    }
    if (filters.grade_id) list = list.filter(s => s.grade_id === filters.grade_id);
    if (filters.section_id) list = list.filter(s => s.section_id === filters.section_id);
    if (filters.gender) list = list.filter(s => s.gender === filters.gender);
    if (filters.enrollment_status) list = list.filter(s => s.enrollment_status === filters.enrollment_status);
    if (filters.fee_status) list = list.filter(s => s.fee_status === filters.fee_status);
    if (filters.house) list = list.filter(s => s.house === filters.house);
    if (filters.has_transport !== undefined) list = list.filter(s => s.has_transport === filters.has_transport);
    if (filters.has_hostel !== undefined) list = list.filter(s => s.has_hostel === filters.has_hostel);
    if (filters.min_attendance) list = list.filter(s => s.attendance_percentage >= filters.min_attendance);
    if (filters.scholarship !== undefined) {
      if (filters.scholarship) list = list.filter(s => s.scholarship);
      else list = list.filter(s => !s.scholarship);
    }

    // Sort
    list.sort((a, b) => {
      const av = a[sort] ?? '';
      const bv = b[sort] ?? '';
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return order === 'asc' ? cmp : -cmp;
    });

    const total = list.length;
    const from = (page - 1) * pageSize;
    return { students: list.slice(from, from + pageSize), total };
  }
}

// ── Single student ─────────────────────────────────────────────

export async function getStudentById(id) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, enrollments(sections(id, name, grades(id, name)))')
      .eq('id', id)
      .eq('role', 'student')
      .single();
    if (error) throw error;
    return data;
  } catch {
    return MOCK_STUDENTS.find(s => s.id === id) || null;
  }
}

// ── Stats ──────────────────────────────────────────────────────

export async function getStudentStats() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('enrollment_status, gender, admission_date')
      .eq('role', 'student');
    if (error) throw error;
    const s = data || [];
    const currentYear = new Date().getFullYear();
    return {
      total: s.length,
      active: s.filter(x => x.enrollment_status === 'active').length,
      new_admissions: s.filter(x => x.admission_date?.startsWith(String(currentYear))).length,
      graduated: s.filter(x => x.enrollment_status === 'graduated').length,
      transferred: s.filter(x => x.enrollment_status === 'transferred').length,
      suspended: s.filter(x => x.enrollment_status === 'suspended').length,
      male: s.filter(x => x.gender === 'male').length,
      female: s.filter(x => x.gender === 'female').length,
    };
  } catch {
    return getMockStats();
  }
}

// ── Create ────────────────────────────────────────────────────

export async function createStudent(formData) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        role: 'student',
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        nationality: formData.nationality,
        religion: formData.religion,
        blood_group: formData.blood_group,
        birth_certificate_number: formData.birth_certificate_number,
        admission_number: formData.admission_number,
        admission_date: formData.admission_date,
        scholarship: formData.scholarship,
        enrollment_status: 'active',
        house: formData.house,
      }])
      .select()
      .single();
    if (profileError) throw profileError;

    if (formData.section_id) {
      await supabase.from('enrollments').insert([{ student_id: profile.id, section_id: formData.section_id }]);
    }
    if (formData.guardian_name) {
      await supabase.from('student_guardians').insert([{
        student_id: profile.id,
        name: formData.guardian_name,
        relationship: formData.guardian_relationship,
        phone: formData.guardian_phone,
        email: formData.guardian_email,
        occupation: formData.guardian_occupation,
        is_emergency_contact: true,
      }]);
    }
    if (formData.medical_conditions) {
      await supabase.from('student_medical').insert([{
        student_id: profile.id,
        conditions: formData.medical_conditions,
        allergies: formData.allergies,
        medications: formData.medications,
        doctor_name: formData.doctor_name,
        emergency_notes: formData.emergency_notes,
      }]);
    }
    return profile;
  } catch (err) {
    // In mock mode: return a synthetic new student
    console.warn('createStudent fell back to mock:', err.message);
    const newStudent = { ...formData, id: `stu-${Date.now()}`, student_id: `SID-${Date.now()}`, enrollment_status: 'active', created_at: new Date().toISOString() };
    MOCK_STUDENTS.push(newStudent);
    return newStudent;
  }
}

// ── Update ────────────────────────────────────────────────────

export async function updateStudent(id, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    const idx = MOCK_STUDENTS.findIndex(s => s.id === id);
    if (idx !== -1) Object.assign(MOCK_STUDENTS[idx], updates);
    return MOCK_STUDENTS[idx];
  }
}

// ── Delete / Archive ─────────────────────────────────────────

export async function archiveStudent(id) {
  return updateStudent(id, { enrollment_status: 'archived' });
}

export async function deleteStudent(id) {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch {
    const idx = MOCK_STUDENTS.findIndex(s => s.id === id);
    if (idx !== -1) MOCK_STUDENTS.splice(idx, 1);
    return { success: true };
  }
}

// ── Bulk actions ─────────────────────────────────────────────

export async function bulkAction(ids, action, payload = {}) {
  const statusMap = {
    archive: 'archived',
    graduate: 'graduated',
    transfer: 'transferred',
    suspend: 'suspended',
    activate: 'active',
  };

  if (action === 'delete') {
    for (const id of ids) await deleteStudent(id);
    return { success: true, count: ids.length };
  }

  if (statusMap[action]) {
    const updates = { enrollment_status: statusMap[action] };
    if (payload.section_id) updates.section_id = payload.section_id;
    if (payload.grade_id) updates.grade_id = payload.grade_id;
    if (payload.house) updates.house = payload.house;
    for (const id of ids) await updateStudent(id, updates);
    return { success: true, count: ids.length };
  }

  return { success: false, error: 'Unknown action' };
}

// ── Detail loaders (with mock fallbacks) ─────────────────────

export async function getStudentAttendance(studentId) {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  } catch {
    return getMockAttendance(studentId);
  }
}

export async function getStudentGrades(studentId) {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, exams(name, date, subjects(name))')
      .eq('student_id', studentId);
    if (error) throw error;
    return data;
  } catch {
    return getMockGrades(studentId);
  }
}

export async function getStudentExamResults(studentId) {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, exams(name, date, max_score, subjects(name))')
      .eq('student_id', studentId)
      .order('exams(date)', { ascending: false });
    if (error) throw error;
    return data;
  } catch {
    return getMockExamResults(studentId);
  }
}

export async function getStudentFinance(studentId) {
  try {
    const { data: payments, error: pe } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (pe) throw pe;
    return { payments, invoices: [], outstanding_balance: 0 };
  } catch {
    return getMockFinance(studentId);
  }
}

export async function getStudentLibrary(studentId) {
  try {
    const { data, error } = await supabase
      .from('library_loans')
      .select('*, books(title, author)')
      .eq('student_id', studentId);
    if (error) throw error;
    return data;
  } catch {
    return getMockLibrary(studentId);
  }
}

export async function getStudentBehavior(studentId) {
  try {
    const { data, error } = await supabase
      .from('behavior_records')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return data;
  } catch {
    return getMockBehavior(studentId);
  }
}

export async function getStudentMedical(studentId) {
  try {
    const { data, error } = await supabase
      .from('student_medical')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;
    return data;
  } catch {
    return getMockMedical(studentId);
  }
}

export async function getStudentDocuments(studentId) {
  try {
    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return data;
  } catch {
    return getMockDocuments(studentId);
  }
}

export async function getStudentTimeline(studentId) {
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch {
    return getMockTimeline(studentId);
  }
}

// ── Reference data ────────────────────────────────────────────

export async function getGrades() {
  try {
    const { data, error } = await supabase.from('grades').select('*').order('name');
    if (error) throw error;
    return data || [];
  } catch {
    return GRADES;
  }
}

export async function getSections(gradeId) {
  try {
    let q = supabase.from('sections').select('*, grades(name)');
    if (gradeId) q = q.eq('grade_id', gradeId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  } catch {
    return gradeId ? SECTIONS.filter(s => s.grade_id === gradeId) : SECTIONS;
  }
}

export async function exportStudentsCSV(filters = {}) {
  const { students } = await getStudents({ filters, pageSize: 9999 });
  const headers = ['Student ID', 'First Name', 'Last Name', 'Grade', 'Section', 'Gender', 'Admission Date', 'Status', 'Fee Status', 'Attendance %', 'Guardian', 'Phone'];
  const rows = students.map(s => [
    s.student_id, s.first_name, s.last_name, s.grade_name, s.section_name,
    s.gender, s.admission_date, s.enrollment_status, s.fee_status,
    s.attendance_percentage, s.guardian_name, s.guardian_phone,
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
