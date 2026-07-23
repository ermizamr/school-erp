import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../components/Toast';
import { Settings, User, Bell, Shield, Mail, Smartphone, MapPin, Camera, Save, Lock, Monitor, CheckCircle, X, QrCode } from 'lucide-react';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

export default function TeacherSettings() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  
  const fileInputRef = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || DEMO_TEACHER_ID;
      
      if (user) setEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || DEMO_TEACHER_ID;

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const tabs = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'account', label: 'Account Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
  ];

  const handleUploadPicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      showToast('Profile picture updated temporarily.', 'success');
    }
  };

  const handleRemovePicture = () => {
    setAvatar(null);
    showToast('Profile picture removed.', 'success');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setShowPasswordModal(false);
      showToast('Password updated securely.', 'success');
    }, 1000);
  };

  const handleEnable2FA = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setShow2FAModal(false);
      showToast('Two-Factor Authentication enabled!', 'success');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex-col justify-center" style={{ alignItems: 'center', height: '60vh', gap: '1.5rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p className="text-muted">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="text-3xl font-bold" style={{ marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Settings & Profile</h1>
        <p className="text-muted">Manage your personal information, security, and notification preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2.5rem' }}>
        {/* Settings Sidebar */}
        <div className="flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn flex-row gap-3 ${activeTab === tab.id ? 'btn-primary' : ''}`}
              style={{
                justifyContent: 'flex-start',
                padding: '0.875rem 1rem',
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                transition: 'all 0.2s ease'
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          
          {activeTab === 'profile' && (
            <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
              <div className="flex-row justify-between" style={{ marginBottom: '2rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 className="text-xl font-bold">Public Profile</h2>
                  <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>This information will be displayed to students and administrators.</p>
                </div>
              </div>

              <div className="flex-row gap-6" style={{ marginBottom: '2.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div className="avatar" style={{ width: '96px', height: '96px', fontSize: '2.5rem', backgroundColor: 'var(--primary)', color: 'white', border: '4px solid var(--bg-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    {avatar ? <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.first_name?.[0] || 'T') + (profile.last_name?.[0] || '')}
                  </div>
                  <button type="button" className="btn" style={{ position: 'absolute', bottom: 0, right: 0, padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={() => fileInputRef.current?.click()}>
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <div className="flex-row gap-3" style={{ marginBottom: '0.5rem' }}>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleUploadPicture} />
                    <button type="button" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => fileInputRef.current?.click()}>Upload new picture</button>
                    <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem' }} onClick={handleRemovePicture}>Remove</button>
                  </div>
                  <p className="text-xs text-muted">Recommended size 256x256px. JPG, GIF or PNG up to 2MB.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="flex-col gap-5">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="flex-col gap-2">
                    <label className="text-sm font-semibold text-muted">First Name</label>
                    <input type="text" name="first_name" value={profile.first_name} onChange={handleChange} className="input" placeholder="Enter your first name" required style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }} />
                  </div>
                  <div className="flex-col gap-2">
                    <label className="text-sm font-semibold text-muted">Last Name</label>
                    <input type="text" name="last_name" value={profile.last_name} onChange={handleChange} className="input" placeholder="Enter your last name" required style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }} />
                  </div>
                </div>

                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Smartphone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="input" placeholder="+1 (555) 000-0000" style={{ padding: '0.75rem 0.75rem 0.75rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', width: '100%' }} />
                  </div>
                </div>

                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Contact Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }} />
                    <textarea name="address" value={profile.address} onChange={handleChange} className="input" placeholder="Enter your full address" rows={3} style={{ padding: '0.875rem 0.75rem 0.75rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', width: '100%', resize: 'vertical' }} />
                  </div>
                </div>

                <div className="flex-row justify-end" style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button type="submit" className="btn btn-primary flex-row gap-2" disabled={saving}>
                    {saving ? <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
              <div className="flex-row justify-between" style={{ marginBottom: '2rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 className="text-xl font-bold">Account Security</h2>
                  <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Manage your password and security settings.</p>
                </div>
              </div>

              <div className="flex-col gap-6">
                <div className="flex-col gap-2">
                  <label className="text-sm font-semibold text-muted">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input type="email" value={email || 'teacher@demo.com'} disabled className="input" style={{ padding: '0.75rem 0.75rem 0.75rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)', width: '100%', opacity: 0.7 }} />
                  </div>
                  <p className="text-xs text-muted">Your email address is managed by the school administrator.</p>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1.5rem' }}>
                  <h3 className="font-semibold" style={{ marginBottom: '0.5rem' }}>Change Password</h3>
                  <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>Ensure your account is using a long, random password to stay secure.</p>
                  
                  <div className="flex-col gap-4">
                    <input type="password" required placeholder="Current password" className="input" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }} />
                    <input type="password" required placeholder="New password" className="input" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }} />
                    <input type="password" required placeholder="Confirm new password" className="input" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }} />
                    <button className="btn" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', alignSelf: 'flex-start', marginTop: '0.5rem' }} onClick={() => setShowPasswordModal(true)}>Update Password</button>
                  </div>
                </div>

                <div className="flex-row justify-between" style={{ border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <h3 className="font-semibold flex-row gap-2" style={{ alignItems: 'center' }}><Lock size={16} className="text-primary" /> Two-Factor Authentication</h3>
                    <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Add an extra layer of security to your account.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setShow2FAModal(true)}>Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
               <div className="flex-row justify-between" style={{ marginBottom: '2rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 className="text-xl font-bold">Notification Preferences</h2>
                  <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Choose how you want to be notified about activity.</p>
                </div>
              </div>

              <div className="flex-col gap-4">
                {[
                  { title: 'Assignment Submissions', desc: 'Receive an email when a student submits an assignment late.', active: true },
                  { title: 'Direct Messages', desc: 'Notify me when I receive a message from parents or staff.', active: true },
                  { title: 'System Announcements', desc: 'Important updates about the school portal.', active: true },
                  { title: 'Daily Digest', desc: 'A daily summary of upcoming classes and schedule changes.', active: false }
                ].map((notif, i) => (
                  <div key={i} className="flex-row justify-between" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', alignItems: 'center' }}>
                    <div>
                      <h3 className="font-semibold text-sm">{notif.title}</h3>
                      <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>{notif.desc}</p>
                    </div>
                    {/* Fake Toggle Switch */}
                    <div style={{ width: '44px', height: '24px', backgroundColor: notif.active ? 'var(--primary)' : 'var(--border-color)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                      <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: notif.active ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
               <div className="flex-row justify-between" style={{ marginBottom: '2rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 className="text-xl font-bold">Display Preferences</h2>
                  <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Customize your portal experience.</p>
                </div>
              </div>

              <div className="flex-col gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Theme Selection</h3>
                  <div className="dashboard-grid grid-cols-3" style={{ gap: '1rem' }}>
                    <div className="hover-card flex-col gap-3" style={{ padding: '1rem', border: '2px solid var(--primary)', borderRadius: '0.75rem', cursor: 'pointer', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: '60px', borderRadius: '0.25rem', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px' }}>
                        <div style={{ height: '8px', width: '30%', backgroundColor: '#334155', borderRadius: '2px' }} />
                        <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '2px' }} />
                      </div>
                      <span className="text-sm font-semibold flex-row gap-2"><CheckCircle size={16} className="text-primary"/> Dark Mode</span>
                    </div>
                    <div className="hover-card flex-col gap-3" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem', cursor: 'pointer', alignItems: 'center', opacity: 0.6 }}>
                      <div style={{ width: '100%', height: '60px', borderRadius: '0.25rem', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ height: '8px', width: '30%', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
                        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '2px' }} />
                      </div>
                      <span className="text-sm font-semibold text-muted">Light Mode</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-semibold mb-2 block text-sm">Language</label>
                  <select className="input" style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                    <option>English (United States)</option>
                    <option>Amharic</option>
                    <option>French</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-surface)', position: 'relative' }}>
            <button onClick={() => setShowPasswordModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>Update Password</h2>
            <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>Please re-enter your current password to authorize this change.</p>
            <form onSubmit={handleUpdatePassword} className="flex-col gap-4">
              <input type="password" required placeholder="Current password" className="input" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }} />
              <input type="password" required placeholder="New password" className="input" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }} />
              <div className="flex-row justify-end gap-3" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowPasswordModal(false)} style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={simulating}>{simulating ? 'Updating...' : 'Save Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-surface)', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setShow2FAModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1rem' }}>Enable 2FA</h2>
            <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>Scan this QR code with your Authenticator app (like Google Authenticator or Authy).</p>
            
            <div style={{ margin: '0 auto 2rem auto', width: '200px', height: '200px', background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              {/* Fake QR Code */}
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={150} color="#0f172a" />
              </div>
            </div>

            <div className="flex-row justify-center gap-3">
              <button type="button" className="btn" onClick={() => setShow2FAModal(false)} style={{ border: '1px solid var(--border-color)' }}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleEnable2FA} disabled={simulating}>{simulating ? 'Verifying...' : 'I have scanned it'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
