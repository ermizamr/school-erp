// ─────────────────────────────────────────────────────────────
// Mock data for Student Management Module
// Used as fallback when Supabase tables don't exist yet.
// ─────────────────────────────────────────────────────────────

export const ACADEMIC_YEARS = [
  { id: 'ay1', name: '2025–2026', is_active: true },
  { id: 'ay2', name: '2024–2025', is_active: false },
  { id: 'ay3', name: '2023–2024', is_active: false },
];

export const GRADES = [
  { id: 'g9', name: 'Grade 9' },
  { id: 'g10', name: 'Grade 10' },
  { id: 'g11', name: 'Grade 11' },
  { id: 'g12', name: 'Grade 12' },
];

export const SECTIONS = [
  { id: 's9a', grade_id: 'g9', name: 'A', grade_name: 'Grade 9' },
  { id: 's9b', grade_id: 'g9', name: 'B', grade_name: 'Grade 9' },
  { id: 's10a', grade_id: 'g10', name: 'A', grade_name: 'Grade 10' },
  { id: 's10b', grade_id: 'g10', name: 'B', grade_name: 'Grade 10' },
  { id: 's11a', grade_id: 'g11', name: 'A', grade_name: 'Grade 11' },
  { id: 's11b', grade_id: 'g11', name: 'B', grade_name: 'Grade 11' },
  { id: 's12a', grade_id: 'g12', name: 'A', grade_name: 'Grade 12' },
  { id: 's12b', grade_id: 'g12', name: 'B', grade_name: 'Grade 12' },
];

export const HOUSES = ['Red House', 'Blue House', 'Green House', 'Yellow House'];

export const BUSES = [
  { id: 'b1', number: 'BUS-01', route: 'Route A – Bole', driver: 'Tesfaye Haile', capacity: 45 },
  { id: 'b2', number: 'BUS-02', route: 'Route B – Megenagna', driver: 'Girma Kebede', capacity: 40 },
  { id: 'b3', number: 'BUS-03', route: 'Route C – Piassa', driver: 'Abebe Lemma', capacity: 50 },
];

export const HOSTELS = [
  { id: 'h1', building: 'Block A', warden: 'Selamawit Tadesse', capacity: 80 },
  { id: 'h2', building: 'Block B', warden: 'Yonas Bekele', capacity: 60 },
];

export const SUBJECTS = [
  'Mathematics', 'English', 'Amharic', 'Physics', 'Chemistry',
  'Biology', 'History', 'Geography', 'Physical Education', 'ICT',
];

// ─── Students ────────────────────────────────────────────────
export const MOCK_STUDENTS = [
  {
    id: 'stu-001', student_id: 'SID-2024-001',
    first_name: 'Amara', middle_name: 'Grace', last_name: 'Tesfaye',
    photo_url: null, date_of_birth: '2009-03-15', gender: 'female',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'A+',
    birth_certificate_number: 'BC-2010-12345',
    admission_number: 'ADM-2024-001', admission_date: '2024-09-01',
    grade_id: 'g10', grade_name: 'Grade 10', section_id: 's10a', section_name: 'A',
    roll_number: '01', academic_year: '2025–2026',
    previous_school: 'Addis Ababa Elementary', scholarship: 'Merit Scholarship',
    enrollment_status: 'active', house: 'Green House',
    guardian_name: 'Solomon Tesfaye', guardian_phone: '+251-911-234567',
    guardian_email: 'solomon.t@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mrs. Sara Mulugeta',
    attendance_percentage: 94.5, average_grade: 87.3, gpa: 3.7,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: true, bus_id: 'b1', pickup_point: 'Bole Medhanealem', dropoff_point: 'School Gate',
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-002', student_id: 'SID-2024-002',
    first_name: 'Biruk', middle_name: 'Samuel', last_name: 'Alemu',
    photo_url: null, date_of_birth: '2008-07-22', gender: 'male',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'O+',
    birth_certificate_number: 'BC-2008-78901',
    admission_number: 'ADM-2024-002', admission_date: '2024-09-01',
    grade_id: 'g11', grade_name: 'Grade 11', section_id: 's11a', section_name: 'A',
    roll_number: '02', academic_year: '2025–2026',
    previous_school: 'Lideta Elementary School', scholarship: null,
    enrollment_status: 'active', house: 'Blue House',
    guardian_name: 'Mekdes Alemu', guardian_phone: '+251-922-345678',
    guardian_email: 'mekdes.a@email.com', guardian_relationship: 'Mother',
    class_teacher: 'Mr. Daniel Wolde',
    attendance_percentage: 88.0, average_grade: 79.5, gpa: 3.2,
    fee_status: 'pending', outstanding_balance: 4500,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: true, hostel_id: 'h1', room_number: '104', bed_number: '2',
    created_at: '2024-09-01',
  },
  {
    id: 'stu-003', student_id: 'SID-2024-003',
    first_name: 'Chaltu', middle_name: '', last_name: 'Bekele',
    photo_url: null, date_of_birth: '2009-11-05', gender: 'female',
    nationality: 'Ethiopian', religion: 'Muslim', blood_group: 'B+',
    birth_certificate_number: 'BC-2009-23456',
    admission_number: 'ADM-2024-003', admission_date: '2024-09-01',
    grade_id: 'g10', grade_name: 'Grade 10', section_id: 's10b', section_name: 'B',
    roll_number: '03', academic_year: '2025–2026',
    previous_school: 'Bole Elementary', scholarship: 'Need-Based Scholarship',
    enrollment_status: 'active', house: 'Red House',
    guardian_name: 'Hassan Bekele', guardian_phone: '+251-933-456789',
    guardian_email: 'hassan.b@email.com', guardian_relationship: 'Father',
    class_teacher: 'Ms. Tigist Amare',
    attendance_percentage: 72.3, average_grade: 65.8, gpa: 2.5,
    fee_status: 'overdue', outstanding_balance: 12000,
    has_transport: true, bus_id: 'b2', pickup_point: 'Megenagna Square', dropoff_point: 'School Gate',
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-004', student_id: 'SID-2024-004',
    first_name: 'Dawit', middle_name: 'Haile', last_name: 'Girma',
    photo_url: null, date_of_birth: '2008-02-18', gender: 'male',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'AB+',
    birth_certificate_number: 'BC-2008-34567',
    admission_number: 'ADM-2024-004', admission_date: '2024-09-01',
    grade_id: 'g11', grade_name: 'Grade 11', section_id: 's11b', section_name: 'B',
    roll_number: '04', academic_year: '2025–2026',
    previous_school: 'Kotebe Elementary', scholarship: null,
    enrollment_status: 'active', house: 'Yellow House',
    guardian_name: 'Haile Girma', guardian_phone: '+251-944-567890',
    guardian_email: 'haile.g@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mr. Daniel Wolde',
    attendance_percentage: 97.8, average_grade: 93.1, gpa: 4.0,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-005', student_id: 'SID-2024-005',
    first_name: 'Eyerusalem', middle_name: 'Yonas', last_name: 'Tadesse',
    photo_url: null, date_of_birth: '2010-06-30', gender: 'female',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'O-',
    birth_certificate_number: 'BC-2010-45678',
    admission_number: 'ADM-2024-005', admission_date: '2024-09-01',
    grade_id: 'g9', grade_name: 'Grade 9', section_id: 's9a', section_name: 'A',
    roll_number: '05', academic_year: '2025–2026',
    previous_school: 'Summit International', scholarship: null,
    enrollment_status: 'active', house: 'Green House',
    guardian_name: 'Yonas Tadesse', guardian_phone: '+251-955-678901',
    guardian_email: 'yonas.t@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mrs. Hiwot Tesfaye',
    attendance_percentage: 91.2, average_grade: 84.6, gpa: 3.5,
    fee_status: 'partial', outstanding_balance: 2500,
    has_transport: true, bus_id: 'b3', pickup_point: 'Piassa', dropoff_point: 'School Gate',
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-006', student_id: 'SID-2024-006',
    first_name: 'Fikadu', middle_name: '', last_name: 'Wolde',
    photo_url: null, date_of_birth: '2007-09-14', gender: 'male',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'A-',
    birth_certificate_number: 'BC-2007-56789',
    admission_number: 'ADM-2023-006', admission_date: '2023-09-01',
    grade_id: 'g12', grade_name: 'Grade 12', section_id: 's12a', section_name: 'A',
    roll_number: '06', academic_year: '2025–2026',
    previous_school: 'Megenagna Primary', scholarship: 'Sports Scholarship',
    enrollment_status: 'active', house: 'Blue House',
    guardian_name: 'Wolde Hailu', guardian_phone: '+251-966-789012',
    guardian_email: 'wolde.h@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mr. Ashenafi Lemma',
    attendance_percentage: 85.6, average_grade: 76.2, gpa: 3.0,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: true, hostel_id: 'h2', room_number: '205', bed_number: '1',
    created_at: '2023-09-01',
  },
  {
    id: 'stu-007', student_id: 'SID-2024-007',
    first_name: 'Genet', middle_name: 'Kebede', last_name: 'Hailu',
    photo_url: null, date_of_birth: '2009-01-25', gender: 'female',
    nationality: 'Ethiopian', religion: 'Muslim', blood_group: 'B-',
    birth_certificate_number: 'BC-2009-67890',
    admission_number: 'ADM-2024-007', admission_date: '2024-09-01',
    grade_id: 'g10', grade_name: 'Grade 10', section_id: 's10a', section_name: 'A',
    roll_number: '07', academic_year: '2025–2026',
    previous_school: 'Ferensay Legasion', scholarship: null,
    enrollment_status: 'suspended', house: 'Yellow House',
    guardian_name: 'Kebede Hailu', guardian_phone: '+251-977-890123',
    guardian_email: 'kebede.h@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mrs. Sara Mulugeta',
    attendance_percentage: 55.0, average_grade: 52.4, gpa: 1.9,
    fee_status: 'overdue', outstanding_balance: 18000,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-008', student_id: 'SID-2024-008',
    first_name: 'Henok', middle_name: 'Amare', last_name: 'Mulugeta',
    photo_url: null, date_of_birth: '2009-08-11', gender: 'male',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'O+',
    birth_certificate_number: 'BC-2009-78901',
    admission_number: 'ADM-2024-008', admission_date: '2024-09-01',
    grade_id: 'g9', grade_name: 'Grade 9', section_id: 's9b', section_name: 'B',
    roll_number: '08', academic_year: '2025–2026',
    previous_school: 'Kirkos Primary School', scholarship: null,
    enrollment_status: 'active', house: 'Red House',
    guardian_name: 'Amare Mulugeta', guardian_phone: '+251-988-901234',
    guardian_email: 'amare.m@email.com', guardian_relationship: 'Father',
    class_teacher: 'Ms. Hiwot Tesfaye',
    attendance_percentage: 96.4, average_grade: 90.7, gpa: 3.9,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: true, bus_id: 'b1', pickup_point: 'Bole Airport Road', dropoff_point: 'School Gate',
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-009', student_id: 'SID-2024-009',
    first_name: 'Iyasu', middle_name: '', last_name: 'Lemma',
    photo_url: null, date_of_birth: '2008-04-03', gender: 'male',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'A+',
    birth_certificate_number: 'BC-2008-89012',
    admission_number: 'ADM-2024-009', admission_date: '2024-09-01',
    grade_id: 'g11', grade_name: 'Grade 11', section_id: 's11a', section_name: 'A',
    roll_number: '09', academic_year: '2025–2026',
    previous_school: 'Bole Primary', scholarship: 'Merit Scholarship',
    enrollment_status: 'active', house: 'Green House',
    guardian_name: 'Selamawit Lemma', guardian_phone: '+251-911-012345',
    guardian_email: 'selamawit.l@email.com', guardian_relationship: 'Mother',
    class_teacher: 'Mr. Daniel Wolde',
    attendance_percentage: 99.1, average_grade: 95.8, gpa: 4.0,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-010', student_id: 'SID-2024-010',
    first_name: 'Jalene', middle_name: 'Tesfaye', last_name: 'Kebede',
    photo_url: null, date_of_birth: '2010-12-20', gender: 'female',
    nationality: 'Ethiopian', religion: 'Muslim', blood_group: 'B+',
    birth_certificate_number: 'BC-2010-90123',
    admission_number: 'ADM-2024-010', admission_date: '2024-09-01',
    grade_id: 'g9', grade_name: 'Grade 9', section_id: 's9a', section_name: 'A',
    roll_number: '10', academic_year: '2025–2026',
    previous_school: 'Gullele Primary', scholarship: null,
    enrollment_status: 'active', house: 'Blue House',
    guardian_name: 'Tesfaye Kebede', guardian_phone: '+251-922-123456',
    guardian_email: 'tesfaye.k@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mrs. Hiwot Tesfaye',
    attendance_percentage: 83.7, average_grade: 74.2, gpa: 2.9,
    fee_status: 'partial', outstanding_balance: 6000,
    has_transport: true, bus_id: 'b2', pickup_point: 'Megenagna', dropoff_point: 'School Gate',
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-011', student_id: 'SID-2023-011',
    first_name: 'Kidus', middle_name: 'Haile', last_name: 'Girma',
    photo_url: null, date_of_birth: '2007-05-08', gender: 'male',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'O+',
    birth_certificate_number: 'BC-2007-01234',
    admission_number: 'ADM-2023-011', admission_date: '2023-09-01',
    grade_id: 'g12', grade_name: 'Grade 12', section_id: 's12b', section_name: 'B',
    roll_number: '11', academic_year: '2025–2026',
    previous_school: 'Yeka Primary', scholarship: null,
    enrollment_status: 'active', house: 'Yellow House',
    guardian_name: 'Haile Girma', guardian_phone: '+251-933-234567',
    guardian_email: 'haile2.g@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mr. Ashenafi Lemma',
    attendance_percentage: 90.3, average_grade: 81.9, gpa: 3.3,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: true, hostel_id: 'h1', room_number: '112', bed_number: '3',
    created_at: '2023-09-01',
  },
  {
    id: 'stu-012', student_id: 'SID-2024-012',
    first_name: 'Liya', middle_name: '', last_name: 'Asnake',
    photo_url: null, date_of_birth: '2009-09-17', gender: 'female',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'AB-',
    birth_certificate_number: 'BC-2009-12345',
    admission_number: 'ADM-2024-012', admission_date: '2024-09-01',
    grade_id: 'g10', grade_name: 'Grade 10', section_id: 's10b', section_name: 'B',
    roll_number: '12', academic_year: '2025–2026',
    previous_school: 'Bethel Primary', scholarship: 'Arts Scholarship',
    enrollment_status: 'active', house: 'Red House',
    guardian_name: 'Asnake Tadesse', guardian_phone: '+251-944-345678',
    guardian_email: 'asnake.t@email.com', guardian_relationship: 'Father',
    class_teacher: 'Ms. Tigist Amare',
    attendance_percentage: 93.6, average_grade: 88.4, gpa: 3.7,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: true, bus_id: 'b3', pickup_point: 'Piassa Church', dropoff_point: 'School Gate',
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-013', student_id: 'SID-2023-013',
    first_name: 'Meron', middle_name: 'Solomon', last_name: 'Bekele',
    photo_url: null, date_of_birth: '2007-11-29', gender: 'female',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'A+',
    birth_certificate_number: 'BC-2007-23456',
    admission_number: 'ADM-2022-013', admission_date: '2022-09-01',
    grade_id: 'g12', grade_name: 'Grade 12', section_id: 's12a', section_name: 'A',
    roll_number: '13', academic_year: '2025–2026',
    previous_school: 'Ras Desta Primary', scholarship: null,
    enrollment_status: 'transferred', house: 'Green House',
    guardian_name: 'Solomon Bekele', guardian_phone: '+251-955-456789',
    guardian_email: 'solomon.b@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mr. Ashenafi Lemma',
    attendance_percentage: 78.5, average_grade: 70.1, gpa: 2.8,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: false,
    created_at: '2022-09-01',
  },
  {
    id: 'stu-014', student_id: 'SID-2024-014',
    first_name: 'Natnael', middle_name: 'Yonas', last_name: 'Tekle',
    photo_url: null, date_of_birth: '2008-03-07', gender: 'male',
    nationality: 'Eritrean', religion: 'Orthodox', blood_group: 'O-',
    birth_certificate_number: 'BC-2008-34568',
    admission_number: 'ADM-2024-014', admission_date: '2024-09-01',
    grade_id: 'g11', grade_name: 'Grade 11', section_id: 's11b', section_name: 'B',
    roll_number: '14', academic_year: '2025–2026',
    previous_school: 'Eritrea International School', scholarship: null,
    enrollment_status: 'active', house: 'Blue House',
    guardian_name: 'Yonas Tekle', guardian_phone: '+251-966-567890',
    guardian_email: 'yonas.tek@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mr. Daniel Wolde',
    attendance_percentage: 95.2, average_grade: 85.9, gpa: 3.6,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: true, bus_id: 'b1', pickup_point: 'CMC Road', dropoff_point: 'School Gate',
    has_hostel: true, hostel_id: 'h2', room_number: '210', bed_number: '2',
    created_at: '2024-09-01',
  },
  {
    id: 'stu-015', student_id: 'SID-2024-015',
    first_name: 'Rahel', middle_name: '', last_name: 'Hailu',
    photo_url: null, date_of_birth: '2009-07-14', gender: 'female',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'B+',
    birth_certificate_number: 'BC-2009-45679',
    admission_number: 'ADM-2024-015', admission_date: '2024-09-01',
    grade_id: 'g10', grade_name: 'Grade 10', section_id: 's10a', section_name: 'A',
    roll_number: '15', academic_year: '2025–2026',
    previous_school: 'Addis Kidane Mehret', scholarship: null,
    enrollment_status: 'active', house: 'Red House',
    guardian_name: 'Hailu Mekonen', guardian_phone: '+251-977-678901',
    guardian_email: 'hailu.m@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mrs. Sara Mulugeta',
    attendance_percentage: 89.4, average_grade: 82.7, gpa: 3.4,
    fee_status: 'pending', outstanding_balance: 3200,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-016', student_id: 'SID-2024-016',
    first_name: 'Samuel', middle_name: 'Bekele', last_name: 'Negash',
    photo_url: null, date_of_birth: '2009-05-22', gender: 'male',
    nationality: 'Ethiopian', religion: 'Protestant', blood_group: 'A+',
    birth_certificate_number: 'BC-2009-56780',
    admission_number: 'ADM-2024-016', admission_date: '2024-09-01',
    grade_id: 'g9', grade_name: 'Grade 9', section_id: 's9b', section_name: 'B',
    roll_number: '16', academic_year: '2025–2026',
    previous_school: 'Nefas Silk Primary', scholarship: 'Need-Based Scholarship',
    enrollment_status: 'active', house: 'Yellow House',
    guardian_name: 'Bekele Negash', guardian_phone: '+251-988-789012',
    guardian_email: 'bekele.n@email.com', guardian_relationship: 'Father',
    class_teacher: 'Ms. Hiwot Tesfaye',
    attendance_percentage: 79.8, average_grade: 68.3, gpa: 2.6,
    fee_status: 'overdue', outstanding_balance: 9000,
    has_transport: true, bus_id: 'b2', pickup_point: 'Nefas Silk Market', dropoff_point: 'School Gate',
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-017', student_id: 'SID-2022-017',
    first_name: 'Tigist', middle_name: 'Abebe', last_name: 'Demeke',
    photo_url: null, date_of_birth: '2006-10-09', gender: 'female',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'O+',
    birth_certificate_number: 'BC-2006-67891',
    admission_number: 'ADM-2022-017', admission_date: '2022-09-01',
    grade_id: 'g12', grade_name: 'Grade 12', section_id: 's12b', section_name: 'B',
    roll_number: '17', academic_year: '2025–2026',
    previous_school: 'Akaki Primary School', scholarship: null,
    enrollment_status: 'graduated', house: 'Blue House',
    guardian_name: 'Abebe Demeke', guardian_phone: '+251-911-890123',
    guardian_email: 'abebe.d@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mr. Ashenafi Lemma',
    attendance_percentage: 98.2, average_grade: 92.6, gpa: 3.9,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: false,
    created_at: '2022-09-01',
  },
  {
    id: 'stu-018', student_id: 'SID-2024-018',
    first_name: 'Wondwossen', middle_name: '', last_name: 'Alemu',
    photo_url: null, date_of_birth: '2008-12-31', gender: 'male',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'AB+',
    birth_certificate_number: 'BC-2008-78902',
    admission_number: 'ADM-2024-018', admission_date: '2024-09-01',
    grade_id: 'g11', grade_name: 'Grade 11', section_id: 's11a', section_name: 'A',
    roll_number: '18', academic_year: '2025–2026',
    previous_school: 'Lafto Primary', scholarship: null,
    enrollment_status: 'active', house: 'Green House',
    guardian_name: 'Tigist Alemu', guardian_phone: '+251-922-901234',
    guardian_email: 'tigist.a@email.com', guardian_relationship: 'Mother',
    class_teacher: 'Mr. Daniel Wolde',
    attendance_percentage: 86.9, average_grade: 78.4, gpa: 3.1,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-019', student_id: 'SID-2024-019',
    first_name: 'Yordanos', middle_name: 'Haile', last_name: 'Woldemariam',
    photo_url: null, date_of_birth: '2009-02-14', gender: 'female',
    nationality: 'Ethiopian', religion: 'Christian', blood_group: 'A-',
    birth_certificate_number: 'BC-2009-89013',
    admission_number: 'ADM-2024-019', admission_date: '2024-09-01',
    grade_id: 'g10', grade_name: 'Grade 10', section_id: 's10b', section_name: 'B',
    roll_number: '19', academic_year: '2025–2026',
    previous_school: 'Kolfe Primary', scholarship: 'Music Scholarship',
    enrollment_status: 'active', house: 'Yellow House',
    guardian_name: 'Haile Woldemariam', guardian_phone: '+251-933-012345',
    guardian_email: 'haile.w@email.com', guardian_relationship: 'Father',
    class_teacher: 'Ms. Tigist Amare',
    attendance_percentage: 92.8, average_grade: 86.1, gpa: 3.6,
    fee_status: 'paid', outstanding_balance: 0,
    has_transport: true, bus_id: 'b3', pickup_point: 'Kolfe Roundabout', dropoff_point: 'School Gate',
    has_hostel: false,
    created_at: '2024-09-01',
  },
  {
    id: 'stu-020', student_id: 'SID-2024-020',
    first_name: 'Zewdu', middle_name: 'Kebede', last_name: 'Tadesse',
    photo_url: null, date_of_birth: '2008-06-05', gender: 'male',
    nationality: 'Ethiopian', religion: 'Muslim', blood_group: 'B+',
    birth_certificate_number: 'BC-2008-90124',
    admission_number: 'ADM-2024-020', admission_date: '2024-09-01',
    grade_id: 'g11', grade_name: 'Grade 11', section_id: 's11b', section_name: 'B',
    roll_number: '20', academic_year: '2025–2026',
    previous_school: 'Arada Primary', scholarship: null,
    enrollment_status: 'active', house: 'Red House',
    guardian_name: 'Kebede Tadesse', guardian_phone: '+251-944-123456',
    guardian_email: 'kebede.ta@email.com', guardian_relationship: 'Father',
    class_teacher: 'Mr. Daniel Wolde',
    attendance_percentage: 77.4, average_grade: 71.8, gpa: 2.7,
    fee_status: 'pending', outstanding_balance: 5500,
    has_transport: false, bus_id: null, pickup_point: null, dropoff_point: null,
    has_hostel: true, hostel_id: 'h1', room_number: '108', bed_number: '4',
    created_at: '2024-09-01',
  },
];

// ─── Per-student detailed data generators ────────────────────

export function getMockAttendance(studentId) {
  const seed = studentId.charCodeAt(studentId.length - 1);
  const base = 85 + (seed % 15);
  return [
    { month: 'Feb', present: Math.floor(base / 100 * 20), absent: Math.floor((1 - base / 100) * 20 * 0.7), late: 1 },
    { month: 'Mar', present: Math.floor(base / 100 * 23), absent: Math.floor((1 - base / 100) * 23 * 0.7), late: 1 },
    { month: 'Apr', present: Math.floor(base / 100 * 21), absent: Math.floor((1 - base / 100) * 21 * 0.7), late: 2 },
    { month: 'May', present: Math.floor(base / 100 * 22), absent: Math.floor((1 - base / 100) * 22 * 0.7), late: 1 },
    { month: 'Jun', present: Math.floor(base / 100 * 18), absent: Math.floor((1 - base / 100) * 18 * 0.7), late: 0 },
    { month: 'Jul', present: Math.floor(base / 100 * 19), absent: Math.floor((1 - base / 100) * 19 * 0.7), late: 2 },
  ];
}

export function getMockGrades(studentId) {
  const s = MOCK_STUDENTS.find(st => st.id === studentId);
  const base = s ? s.average_grade : 75;
  const variance = () => Math.floor((Math.random() - 0.5) * 20);
  const score = (offset = 0) => Math.min(100, Math.max(40, Math.floor(base + variance() + offset)));
  const letter = (sc) => sc >= 90 ? 'A' : sc >= 80 ? 'B+' : sc >= 70 ? 'B' : sc >= 60 ? 'C' : 'D';
  return SUBJECTS.map((subject, i) => ({
    subject,
    score: score(i % 3 === 0 ? 5 : -3),
    grade: letter(score()),
    teacher: ['Mr. Ahmed', 'Ms. Sara', 'Mr. Daniel', 'Mrs. Tigist', 'Ms. Hiwot'][i % 5],
    trend: i % 3 === 0 ? 'up' : i % 5 === 0 ? 'down' : 'stable',
  }));
}

export function getMockExamResults(studentId) {
  const s = MOCK_STUDENTS.find(st => st.id === studentId);
  const base = s ? s.average_grade : 75;
  return [
    { id: 'ex1', name: 'Mid-Term Examination 1', date: '2025-11-15', score: Math.min(100, Math.floor(base + 3)), max_score: 100, rank: 5, class_avg: 72 },
    { id: 'ex2', name: 'Unit Test – Mathematics', date: '2025-10-20', score: Math.min(100, Math.floor(base - 5)), max_score: 100, rank: 8, class_avg: 68 },
    { id: 'ex3', name: 'Chapter Assessment – English', date: '2025-10-05', score: Math.min(100, Math.floor(base + 7)), max_score: 100, rank: 3, class_avg: 70 },
    { id: 'ex4', name: 'First Semester Final', date: '2025-12-20', score: Math.min(100, Math.floor(base)), max_score: 100, rank: 6, class_avg: 71 },
  ];
}

export function getMockFinance(studentId) {
  const s = MOCK_STUDENTS.find(st => st.id === studentId);
  const balance = s ? s.outstanding_balance : 0;
  return {
    outstanding_balance: balance,
    scholarship_amount: s?.scholarship ? 15000 : 0,
    scholarship_name: s?.scholarship || null,
    invoices: [
      { id: 'inv1', description: 'Tuition Fee – Semester 1', amount: 25000, due_date: '2025-10-01', status: 'paid', paid_date: '2025-09-28' },
      { id: 'inv2', description: 'Tuition Fee – Semester 2', amount: 25000, due_date: '2026-02-01', status: balance > 0 ? 'pending' : 'paid', paid_date: balance > 0 ? null : '2026-01-30' },
      { id: 'inv3', description: 'Activity Fee', amount: 3000, due_date: '2025-10-01', status: 'paid', paid_date: '2025-09-25' },
      { id: 'inv4', description: 'Library Fee', amount: 1500, due_date: '2025-10-01', status: 'paid', paid_date: '2025-09-25' },
    ],
    payments: [
      { id: 'pay1', amount: 25000, date: '2025-09-28', method: 'Bank Transfer', reference: 'TXN-001234' },
      { id: 'pay2', amount: 3000, date: '2025-09-25', method: 'Cash', reference: 'RCPT-005678' },
      { id: 'pay3', amount: 1500, date: '2025-09-25', method: 'Cash', reference: 'RCPT-005679' },
    ],
  };
}

export function getMockLibrary(studentId) {
  return {
    books_borrowed: 3,
    books_returned: 12,
    overdue_count: 1,
    fines: 150,
    current_books: [
      { id: 'bk1', title: 'Advanced Mathematics for Grade 10', author: 'Dr. Alemu Tadesse', borrowed_date: '2026-06-15', due_date: '2026-07-15', status: 'overdue' },
      { id: 'bk2', title: 'English Grammar in Use', author: 'Raymond Murphy', borrowed_date: '2026-07-01', due_date: '2026-08-01', status: 'borrowed' },
      { id: 'bk3', title: 'Biology Essentials', author: 'Campbell', borrowed_date: '2026-07-10', due_date: '2026-08-10', status: 'borrowed' },
    ],
    history: [
      { id: 'bkh1', title: 'Ethiopian History', returned_date: '2026-05-20', fine: 0 },
      { id: 'bkh2', title: 'Chemistry Workbook', returned_date: '2026-04-10', fine: 50 },
    ],
  };
}

export function getMockBehavior(studentId) {
  return {
    rewards: [
      { id: 'rw1', title: 'Academic Excellence Award', date: '2025-12-20', given_by: 'Principal Abebe', description: 'Top scorer in Semester 1 examinations' },
      { id: 'rw2', title: 'Perfect Attendance Badge', date: '2025-11-30', given_by: 'Class Teacher', description: 'No absences for the full month of November' },
    ],
    warnings: [
      { id: 'wa1', title: 'Late Submission Warning', date: '2026-03-15', issued_by: 'Mr. Ahmed', description: 'Assignment submitted 3 days late without prior notice' },
    ],
    discipline_records: [
      { id: 'dr1', incident: 'Minor disruption in class', date: '2026-01-20', action_taken: 'Verbal warning', resolved: true },
    ],
    achievements: [
      { id: 'ach1', title: 'Science Fair – 2nd Place', date: '2026-02-14', category: 'Academic' },
      { id: 'ach2', title: 'School Football Team – Captain', date: '2025-10-01', category: 'Sports' },
    ],
  };
}

export function getMockMedical(studentId) {
  return {
    blood_group: MOCK_STUDENTS.find(s => s.id === studentId)?.blood_group || 'O+',
    conditions: ['None reported'],
    allergies: ['Penicillin'],
    medications: [],
    doctor_name: 'Dr. Mekdes Haile',
    doctor_phone: '+251-911-555-000',
    hospital: 'Tikur Anbessa Specialized Hospital',
    emergency_notes: 'In case of allergic reaction, administer antihistamine and contact parents immediately.',
    vaccination_records: [
      { vaccine: 'COVID-19', date: '2022-06-15', status: 'complete' },
      { vaccine: 'Hepatitis B', date: '2021-03-01', status: 'complete' },
      { vaccine: 'Typhoid', date: '2023-08-10', status: 'complete' },
    ],
    last_checkup: '2025-09-01',
  };
}

export function getMockDocuments(studentId) {
  return [
    { id: 'doc1', name: 'Birth Certificate', type: 'birth_certificate', uploaded_at: '2024-09-01', size: '1.2 MB', verified: true },
    { id: 'doc2', name: 'Student Photo', type: 'photo', uploaded_at: '2024-09-01', size: '0.5 MB', verified: true },
    { id: 'doc3', name: 'Previous School Report Card', type: 'report_card', uploaded_at: '2024-09-01', size: '2.1 MB', verified: true },
    { id: 'doc4', name: 'Transfer Certificate', type: 'transfer_certificate', uploaded_at: '2024-09-01', size: '0.8 MB', verified: false },
  ];
}

export function getMockTimeline(studentId) {
  return [
    { id: 'tl1', type: 'admission', title: 'Student Admitted', description: 'Enrolled in Grade 10 – Section A', date: '2024-09-01', icon: 'graduation' },
    { id: 'tl2', type: 'attendance', title: 'Attendance Warning', description: 'Attendance dropped below 80% threshold', date: '2025-01-15', icon: 'alert' },
    { id: 'tl3', type: 'grade', title: 'Exam Result Posted', description: 'Mid-Term Exam: Score 87/100', date: '2025-11-20', icon: 'grade' },
    { id: 'tl4', type: 'behavior', title: 'Award Received', description: 'Academic Excellence Award – Semester 1', date: '2025-12-20', icon: 'award' },
    { id: 'tl5', type: 'payment', title: 'Fee Payment', description: 'Tuition Fee Semester 1 – ETB 25,000', date: '2025-09-28', icon: 'payment' },
    { id: 'tl6', type: 'grade', title: 'Report Card Issued', description: 'Semester 1 Final Report – GPA: 3.7', date: '2026-01-10', icon: 'grade' },
    { id: 'tl7', type: 'message', title: 'Parent Meeting', description: 'Guardian met with class teacher – Progress review', date: '2026-02-05', icon: 'message' },
    { id: 'tl8', type: 'payment', title: 'Fee Payment', description: 'Tuition Fee Semester 2 – ETB 25,000', date: '2026-01-30', icon: 'payment' },
  ];
}

// ─── Computed stats from mock students ───────────────────────
export function getMockStats() {
  const s = MOCK_STUDENTS;
  return {
    total: s.length,
    active: s.filter(x => x.enrollment_status === 'active').length,
    new_admissions: s.filter(x => x.admission_date?.startsWith('2024')).length,
    graduated: s.filter(x => x.enrollment_status === 'graduated').length,
    transferred: s.filter(x => x.enrollment_status === 'transferred').length,
    suspended: s.filter(x => x.enrollment_status === 'suspended').length,
    male: s.filter(x => x.gender === 'male').length,
    female: s.filter(x => x.gender === 'female').length,
  };
}
