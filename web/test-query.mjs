import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testQuery() {
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@demo.com',
    password: 'password123'
  });
  
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_role');
  console.log('RPC get_my_role:', rpcData, rpcError);
  
  const { count: studentCount, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student');
  console.log('Student count:', studentCount, countError);
}

testQuery();
