import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exqutqyzqlzstsgpiypp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cXV0cXl6cWx6c3RzZ3BpeXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjA2MTUsImV4cCI6MjEwMDIzNjYxNX0.olPIeuysJzOcz0hMuNARbpiH8mvijKtVfLgYVo4PMqk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@demo.com',
    password: 'password123'
  });

  if (authError) {
    console.error('Auth Error:', authError.message, authError.status, authError.name);
    return;
  }
  
  console.log('Logged in as:', authData.user.email);
  console.log('User ID:', authData.user.id);
  
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  console.log('My profile:', profile, pError);
  
  const { data: allProfiles, error: allError } = await supabase
    .from('profiles')
    .select('*');
    
  console.log('All profiles count:', allProfiles?.length, allError);
}

test();
