const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exqutqyzqlzstsgpiypp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cXV0cXl6cWx6c3RzZ3BpeXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjA2MTUsImV4cCI6MjEwMDIzNjYxNX0.olPIeuysJzOcz0hMuNARbpiH8mvijKtVfLgYVo4PMqk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Login as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@demo.com',
    password: 'password123'
  });

  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }

  console.log('Logged in as:', authData.user.email);
  
  // Test query
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*');
    
  if (profileError) {
    console.error('Profile Error:', profileError.message);
  } else {
    console.log('Profiles fetched:', profiles.length);
    console.log('First profile:', profiles[0]);
  }
}

test();
