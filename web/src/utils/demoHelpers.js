import { supabase } from '../supabaseClient';

export const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

export async function getTeacherIdFallback() {
  const { data: { user } } = await supabase.auth.getUser();
  let tid = user?.id;
  if (tid && tid !== DEMO_TEACHER_ID) {
    const { count } = await supabase.from('teacher_assignments').select('*', { count: 'exact', head: true }).eq('teacher_id', tid);
    if (count === 0) return DEMO_TEACHER_ID;
  }
  return tid || DEMO_TEACHER_ID;
}
