import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ToastProvider } from '../../components/Toast';
import {
  LayoutDashboard, BarChart2, CalendarCheck, MessageSquare,
  LogOut, School, ChevronDown, User, Users
} from 'lucide-react';

import ParentHome       from './ParentHome';
import ParentGrades     from './ParentGrades';
import ParentAttendance from './ParentAttendance';
import ParentMessages   from './ParentMessages';

const NAV_ITEMS = [
  { key:'home',       label:'Overview',    icon:LayoutDashboard },
  { key:'grades',     label:'Grades',      icon:BarChart2       },
  { key:'attendance', label:'Attendance',  icon:CalendarCheck   },
  { key:'messages',   label:'Messages',    icon:MessageSquare   },
];

export default function ParentLayout() {
  const [activeTab, setActiveTab]     = useState('home');
  const navigate = useNavigate();

  // Parent profile & their linked children
  const [parentProfile, setParentProfile] = useState(null);
  const [children, setChildren]           = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [enrollment, setEnrollment]       = useState(null);
  const [childMenuOpen, setChildMenuOpen] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [unreadMap, setUnreadMap]         = useState({}); // { studentId: count }

  useEffect(() => { initParent(); }, []);

  async function initParent() {
    setLoading(true);
    try {
      const { data:{ user } } = await supabase.auth.getUser();

      let linkedChildren = [];

      if (user) {
        // Fetch parent profile
        const { data:prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setParentProfile(prof);

        // Fetch linked children via parent_children table
        const { data:links } = await supabase
          .from('parent_children')
          .select('student_id, relationship, profiles!parent_children_student_id_fkey(id, first_name, last_name)')
          .eq('parent_id', user.id);

        linkedChildren = (links || []).map(l => l.profiles).filter(Boolean);
      }

      // Demo fallback: if no real auth or no children linked, load all students
      if (linkedChildren.length === 0) {
        const { data:allStudents } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'student')
          .limit(6);
        linkedChildren = allStudents || [];
      }

      setChildren(linkedChildren);

      if (linkedChildren.length > 0) {
        await selectChild(linkedChildren[0]);
      }

      // Unread notifications per child
      if (linkedChildren.length > 0) {
        const results = await Promise.all(
          linkedChildren.map(c =>
            supabase.from('notifications')
              .select('*', { count:'exact', head:true })
              .eq('recipient_id', c.id)
              .eq('is_read', false)
              .then(({ count }) => [c.id, count || 0])
          )
        );
        const map = Object.fromEntries(results);
        setUnreadMap(map);
      }
    } catch(err) {
      console.error('ParentLayout init error', err);
    } finally {
      setLoading(false);
    }
  }

  async function selectChild(child) {
    setSelectedChild(child);
    setChildMenuOpen(false);
    // Fetch their enrollment
    const { data } = await supabase
      .from('enrollments')
      .select('*, sections(id, name, grades(name))')
      .eq('student_id', child.id)
      .limit(1)
      .maybeSingle();
    setEnrollment(data || null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  function renderContent() {
    if (loading) return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:'1rem' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid var(--border-color)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:'var(--text-secondary)' }}>Loading parent portal…</p>
      </div>
    );
    switch (activeTab) {
      case 'home':       return <ParentHome       child={selectedChild} enrollment={enrollment} setActiveTab={setActiveTab}/>;
      case 'grades':     return <ParentGrades     child={selectedChild} enrollment={enrollment}/>;
      case 'attendance': return <ParentAttendance child={selectedChild}/>;
      case 'messages':   return <ParentMessages   child={selectedChild}/>;
      default:           return <ParentHome       child={selectedChild} enrollment={enrollment} setActiveTab={setActiveTab}/>;
    }
  }

  const totalUnread = Object.values(unreadMap).reduce((a,b)=>a+b,0);

  return (
    <ToastProvider>
      <div className="app-layout">

        {/* Sidebar */}
        <aside className="sidebar" onClick={()=>childMenuOpen && setChildMenuOpen(false)}>

          {/* Brand */}
          <div className="sidebar-brand">
            <School size={22}/>
            <span>EthioSchool</span>
          </div>

          {/* Role badge */}
          <div style={{ padding:'0.75rem 1.5rem 0', borderBottom:'none' }}>
            <span style={{ fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'#f59e0b', backgroundColor:'rgba(245,158,11,0.12)', padding:'0.3rem 0.75rem', borderRadius:'1rem', display:'inline-block' }}>
              👨‍👩‍👧 Parent Portal
            </span>
          </div>

          {/* ─── Multi-child switcher ─── */}
          <div style={{ padding:'0.9rem 1.25rem', borderBottom:'1px solid var(--border-color)', position:'relative' }}>
            {children.length === 0 ? (
              <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', padding:'0.5rem 0.25rem', color:'var(--text-secondary)', fontSize:'0.875rem' }}>
                <User size={18}/> No children linked
              </div>
            ) : (
              <>
                {/* Selected child button */}
                <button
                  onClick={e=>{ e.stopPropagation(); setChildMenuOpen(o=>!o); }}
                  style={{ width:'100%', background:'none', border:'1px solid var(--border-color)', borderRadius:'0.6rem', padding:'0.65rem 0.9rem', cursor:'pointer', fontFamily:'inherit', textAlign:'left', display:'flex', alignItems:'center', gap:'0.75rem', backgroundColor:'rgba(255,255,255,0.03)' }}
                >
                  {/* Avatar */}
                  <div style={{ width:'34px', height:'34px', borderRadius:'50%', backgroundColor:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#f59e0b', fontSize:'0.85rem', flexShrink:0 }}>
                    {selectedChild ? `${selectedChild.first_name[0]}${selectedChild.last_name?.[0]||''}` : '?'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:'0.875rem', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-primary)' }}>
                      {selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name}` : 'Select child'}
                    </p>
                    {enrollment && (
                      <p style={{ fontSize:'0.7rem', color:'var(--text-secondary)', margin:0 }}>
                        {enrollment.sections?.grades?.name} · Sec. {enrollment.sections?.name}
                      </p>
                    )}
                  </div>
                  <ChevronDown size={15} style={{ color:'var(--text-secondary)', flexShrink:0, transform:childMenuOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}/>
                </button>

                {/* Dropdown */}
                {childMenuOpen && children.length > 1 && (
                  <div
                    onClick={e=>e.stopPropagation()}
                    style={{ position:'absolute', top:'100%', left:'1.25rem', right:'1.25rem', zIndex:100, backgroundColor:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:'0.65rem', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', marginTop:'0.25rem' }}
                  >
                    {children.map(c=>{
                      const isSelected = selectedChild?.id === c.id;
                      const unread     = unreadMap[c.id] || 0;
                      return (
                        <button
                          key={c.id}
                          onClick={()=>selectChild(c)}
                          style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:'0.7rem', backgroundColor:isSelected?'rgba(245,158,11,0.08)':'transparent', transition:'background 0.15s' }}
                        >
                          <div style={{ width:'30px', height:'30px', borderRadius:'50%', backgroundColor:isSelected?'rgba(245,158,11,0.2)':'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:isSelected?'#f59e0b':'var(--text-secondary)', fontSize:'0.8rem', flexShrink:0 }}>
                            {c.first_name[0]}{c.last_name?.[0]||''}
                          </div>
                          <span style={{ flex:1, fontSize:'0.875rem', fontWeight:isSelected?600:400, color:isSelected?'var(--text-primary)':'var(--text-secondary)' }}>
                            {c.first_name} {c.last_name}
                          </span>
                          {unread > 0 && (
                            <span style={{ backgroundColor:'#ef4444', color:'white', fontSize:'0.65rem', fontWeight:700, padding:'0.1rem 0.4rem', borderRadius:'1rem' }}>{unread}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:'0.75rem 0', overflowY:'auto' }}>
            {NAV_ITEMS.map(({key, label, icon:Icon})=>(
              <button
                key={key}
                onClick={()=>{ setActiveTab(key); if(key==='messages') setUnreadMap(prev=>({...prev,[selectedChild?.id]:0})); }}
                className={`nav-link ${activeTab===key?'active':''}`}
                style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', position:'relative' }}
              >
                <Icon size={19}/>
                <span>{label}</span>
                {key==='messages' && totalUnread > 0 && (
                  <span style={{ marginLeft:'auto', backgroundColor:'#ef4444', color:'white', fontSize:'0.65rem', fontWeight:700, padding:'0.1rem 0.45rem', borderRadius:'1rem', lineHeight:1.5 }}>
                    {totalUnread}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Parent profile + logout */}
          <div style={{ padding:'1rem', borderTop:'1px solid var(--border-color)' }}>
            {parentProfile && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.5rem 0', marginBottom:'0.75rem' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', backgroundColor:'rgba(245,158,11,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#f59e0b', fontSize:'0.8rem', flexShrink:0 }}>
                  {parentProfile.first_name?.[0]}{parentProfile.last_name?.[0]||''}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:'0.8rem', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {parentProfile.first_name} {parentProfile.last_name}
                  </p>
                  <p style={{ fontSize:'0.68rem', color:'var(--text-secondary)', margin:0 }}>Parent</p>
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="btn" style={{ width:'100%', display:'flex', gap:'0.5rem', justifyContent:'center', backgroundColor:'transparent', color:'var(--text-secondary)', border:'1px solid var(--border-color)' }}>
              <LogOut size={17}/><span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content" style={{ flex:1, minWidth:0 }}>
          {renderContent()}
        </main>
      </div>
    </ToastProvider>
  );
}
