import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useToast } from './components/Toast';
import { School, LogIn } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem',
  border: '1px solid var(--border-color)', backgroundColor: 'rgba(15, 23, 42, 0.5)',
  color: 'white', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
  fontSize: '1rem'
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDemoLogin = async (demoEmail, roleRoute) => {
    setLoading(true);
    try {
      // Attempt sign in with specified demo credentials
      let { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: 'password123'
      });

      // If primary email fails, try fallback emails for that role
      if (error || !data?.user) {
        const fallbacksMap = {
          '/parent': ['parent@demo.com', 'parent2@demo.com'],
          '/teacher': ['teacher@demo.com', 'science@demo.com', 'arts@demo.com'],
          '/student': ['student@demo.com', 'student2@demo.com'],
          '/dashboard': ['admin@demo.com']
        };

        const list = fallbacksMap[roleRoute] || [];
        for (const altEmail of list) {
          if (altEmail === demoEmail) continue;
          const altRes = await supabase.auth.signInWithPassword({
            email: altEmail,
            password: 'password123'
          });
          if (!altRes.error && altRes.data?.user) {
            data = altRes.data;
            error = null;
            break;
          }
        }
      }

      if (error || !data?.user) {
        toast.error('Demo authentication failed. Please verify Supabase Auth seed data.');
        navigate(roleRoute); // Fallback navigation
      } else {
        const roleName = roleRoute.replace('/', '') || 'Admin';
        toast.success(`Signed in as Demo ${roleName.charAt(0).toUpperCase() + roleName.slice(1)}!`);
        navigate(roleRoute);
      }
    } catch (err) {
      console.error('handleDemoLogin error:', err);
      toast.error('Failed to sign in via demo button.');
      navigate(roleRoute);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const user = data.user;
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      
      toast.success('Login successful!');
      if (profile?.role === 'admin') navigate('/dashboard');
      else if (profile?.role === 'student') navigate('/student');
      else if (profile?.role === 'teacher') navigate('/teacher');
      else if (profile?.role === 'parent') navigate('/parent');
      else navigate('/dashboard'); // fallback
    } catch (error) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', overflow: 'hidden', position: 'relative' }}>
      {/* Ambient gradients */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(15,23,42,0) 70%)', zIndex: 0, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(15,23,42,0) 70%)', zIndex: 0, borderRadius: '50%' }} />

      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '3rem', zIndex: 1, margin: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <School size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>EthioSchool ERP</h1>
          <p>Welcome back! Sign in to manage your school.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input type="email" required placeholder="admin@school.edu.et" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.875rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('admin@demo.com', '/dashboard')} 
              className="btn" 
              style={{ padding: '0.6rem', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              🛡️ Admin
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('teacher@demo.com', '/teacher')} 
              className="btn" 
              style={{ padding: '0.6rem', backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              👨‍🏫 Teacher
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('student@demo.com', '/student')} 
              className="btn" 
              style={{ padding: '0.6rem', backgroundColor: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              🎓 Student
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('parent@demo.com', '/parent')} 
              className="btn" 
              style={{ padding: '0.6rem', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              👨‍👩‍👧 Parent
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Forgot your password?</a>
        </div>
      </div>
    </div>
  );
}
