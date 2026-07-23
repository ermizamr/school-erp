// ─── Shared grade utilities used across student and parent portals ───────────

export const GRADE_BANDS = [
  { letter: 'A+', min: 95, color: '#10B981', gpa: 4.0 },
  { letter: 'A',  min: 90, color: '#10B981', gpa: 4.0 },
  { letter: 'A-', min: 85, color: '#34d399', gpa: 3.7 },
  { letter: 'B+', min: 80, color: '#3b82f6', gpa: 3.3 },
  { letter: 'B',  min: 75, color: '#3b82f6', gpa: 3.0 },
  { letter: 'B-', min: 70, color: '#60a5fa', gpa: 2.7 },
  { letter: 'C+', min: 65, color: '#f59e0b', gpa: 2.3 },
  { letter: 'C',  min: 60, color: '#f59e0b', gpa: 2.0 },
  { letter: 'C-', min: 55, color: '#fbbf24', gpa: 1.7 },
  { letter: 'D',  min: 50, color: '#f97316', gpa: 1.0 },
  { letter: 'F',  min: 0,  color: '#ef4444', gpa: 0.0 },
];

export function getLetterGrade(score) {
  if (score === null || score === undefined) return { letter: '—', color: 'var(--text-secondary)', gpa: null };
  const s = Number(score);
  return GRADE_BANDS.find(g => s >= g.min) || { letter: 'F', color: '#ef4444', gpa: 0.0 };
}

export function calcGPA(scores) {
  const valid = scores.filter(s => s !== null && s !== undefined);
  if (valid.length === 0) return null;
  const pts = valid.map(s => getLetterGrade(s).gpa);
  return (pts.reduce((a, b) => a + b, 0) / pts.length).toFixed(2);
}
