const url = 'https://exqutqyzqlzstsgpiypp.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cXV0cXl6cWx6c3RzZ3BpeXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjA2MTUsImV4cCI6MjEwMDIzNjYxNX0.olPIeuysJzOcz0hMuNARbpiH8mvijKtVfLgYVo4PMqk';

async function test() {
  const res = await fetch(`${url}/rest/v1/rpc/get_my_role`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log('Result:', data);
}

test();
