import { supabase } from '../supabaseClient';

export const api = {
  // Students
  getStudents: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, enrollments(sections(id, name, grades(id, name)))')
      .eq('role', 'student');
    if (error) throw error;
    return data;
  },
  addStudent: async (data) => {
    // Note: Assuming auth signup is handled separately or server-side
    // Just inserting profile for now
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{ first_name: data.first_name, last_name: data.last_name, email: data.email, role: 'student' }])
      .select()
      .single();
    if (profileError) throw profileError;
    
    if (data.section_id) {
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([{ student_id: profile.id, section_id: data.section_id }]);
      if (enrollError) throw enrollError;
    }
    return profile;
  },

  // Teachers
  getTeachers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher');
    if (error) throw error;
    return data;
  },

  // Academics
  getAcademicYears: async () => {
    const { data, error } = await supabase.from('academic_years').select('*');
    if (error) throw error;
    return data;
  },
  getGrades: async () => {
    const { data, error } = await supabase.from('grades').select('*');
    if (error) throw error;
    return data;
  },
  getSections: async () => {
    const { data, error } = await supabase.from('sections').select('*, grades(name)');
    if (error) throw error;
    return data;
  },
  getSubjects: async () => {
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) throw error;
    return data;
  },
  addSection: async (data) => {
    const { data: res, error } = await supabase.from('sections').insert([data]).select();
    if (error) throw error;
    return res;
  },
  addGrade: async (data) => {
    const { data: res, error } = await supabase.from('grades').insert([data]).select();
    if (error) throw error;
    return res;
  },
  addSubject: async (data) => {
    const { data: res, error } = await supabase.from('subjects').insert([data]).select();
    if (error) throw error;
    return res;
  },

  // Attendance
  getStudentsBySection: async (sectionId, academicYearId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('profiles(*)')
      .eq('section_id', sectionId);
    if (error) throw error;
    return data.map(e => e.profiles);
  },
  getAttendance: async (sectionId, date) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('section_id', sectionId)
      .eq('date', date);
    if (error) throw error;
    return data;
  },
  upsertAttendance: async (records) => {
    const { data, error } = await supabase.from('attendance').upsert(records);
    if (error) throw error;
    return data;
  },

  // Exams
  getExams: async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*, subjects(name), sections(name)');
    if (error) throw error;
    return data;
  },
  addExam: async (data) => {
    const { data: res, error } = await supabase.from('exams').insert([data]).select();
    if (error) throw error;
    return res;
  },
  getExamResults: async (examId) => {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*, profiles(first_name, last_name)')
      .eq('exam_id', examId);
    if (error) throw error;
    return data;
  },
  saveExamResults: async (results) => {
    const { data, error } = await supabase.from('exam_results').upsert(results);
    if (error) throw error;
    return data;
  },

  // Payments
  getPayments: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles(first_name, last_name)');
    if (error) throw error;
    return data;
  },
  addPayment: async (data) => {
    const { data: res, error } = await supabase.from('payments').insert([data]).select();
    if (error) throw error;
    return res;
  },

  // Notifications
  getNotifications: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  markNotificationRead: async (id) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const { count: studentCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    const { count: teacherCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher');
      
    // Simple stub for attendance rate
    const today = new Date().toISOString().split('T')[0];
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today);
      
    let rate = 0;
    if (attendanceData && attendanceData.length > 0) {
      const presentCount = attendanceData.filter(a => a.status === 'present').length;
      rate = Math.round((presentCount / attendanceData.length) * 100);
    }

    return {
      totalStudents: studentCount || 0,
      totalTeachers: teacherCount || 0,
      todayAttendanceRate: rate,
      activeAcademicYear: '2023/2024' // Stub
    };
  }
};
