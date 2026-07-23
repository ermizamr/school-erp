const url = 'https://exqutqyzqlzstsgpiypp.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cXV0cXl6cWx6c3RzZ3BpeXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjA2MTUsImV4cCI6MjEwMDIzNjYxNX0.olPIeuysJzOcz0hMuNARbpiH8mvijKtVfLgYVo4PMqk';

async function test() {
  const authRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@demo.com',
      password: 'password123'
    })
  });
  
  const authData = await authRes.json();
  if (authData.error) {
    console.error('Auth Error:', authData);
    return;
  }
  
  console.log('Auth data keys:', Object.keys(authData));
  const token = authData.access_token;
  
  const profilesRes = await fetch(`${url}/rest/v1/profiles?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${token}`
    }
  });
  
  const profiles = await profilesRes.json();
  console.log('Profiles returned:', profiles.length);
  if (profiles.length > 0) {
    console.log('First profile:', profiles[0]);
  }
}

test();
