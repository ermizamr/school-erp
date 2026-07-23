import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Bell, Users, BookOpen, Check, Megaphone } from 'lucide-react';

const TYPE_CFG = {
  general:    { label:'General',    color:'#3b82f6', bg:'rgba(59,130,246,0.12)',  icon:Bell     },
  attendance: { label:'Attendance', color:'#f59e0b', bg:'rgba(245,158,11,0.12)', icon:Users    },
  grade:      { label:'Grade',      color:'#10B981', bg:'rgba(16,185,129,0.12)',  icon:BookOpen },
};

export default function ParentMessages({ child }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('all');

  useEffect(() => {
    if (child?.id) load(child.id);
    else setLoading(false);
  }, [child]);

  async function load(studentId) {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications').select('*')
        .eq('recipient_id', studentId)
        .order('created_at', { ascending:false });
      setNotifications(data || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function markRead(id) {
    await supabase.from('notifications').update({ is_read:true }).eq('id',id);
    setNotifications(prev => prev.map(n => n.id===id ? {...n,is_read:true} : n));
  }

  async function markAllRead() {
    const ids = notifications.filter(n=>!n.is_read).map(n=>n.id);
    if (!ids.length) return;
    await supabase.from('notifications').update({ is_read:true }).in('id',ids);
    setNotifications(prev => prev.map(n => ({...n,is_read:true})));
  }

  const filtered = filter==='all' ? notifications : notifications.filter(n=>n.type===filter);
  const unread   = notifications.filter(n=>!n.is_read).length;

  function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff/60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  }

  if (loading) return <div style={{ padding:'2rem', color:'var(--text-secondary)' }}>Loading messages…</div>;

  if (!child?.id) return (
    <div className="glass-card" style={{ textAlign:'center', padding:'5rem 2rem' }}>
      <p>Select a child from the sidebar.</p>
    </div>
  );

  return (
    <div style={{ animation:'fadeSlideIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.25rem' }}>
            <h1 style={{ margin:0 }}>Messages for {child.first_name}</h1>
            {unread > 0 && (
              <span style={{ backgroundColor:'#ef4444', color:'white', fontSize:'0.72rem', fontWeight:700, padding:'0.2rem 0.55rem', borderRadius:'1rem' }}>{unread} new</span>
            )}
          </div>
          <p>Teacher announcements and school notices addressed to your child.</p>
        </div>
        {unread > 0 && (
          <button className="btn" onClick={markAllRead} style={{ border:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.875rem' }}>
            <Check size={15}/> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {[{ key:'all', label:'All' }, ...Object.entries(TYPE_CFG).map(([k,v])=>({key:k,label:v.label}))].map(({key,label})=>(
          <button key={key} onClick={()=>setFilter(key)} style={{ padding:'0.4rem 0.9rem', borderRadius:'1rem', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:500, fontSize:'0.85rem', backgroundColor:filter===key?'var(--primary)':'rgba(255,255,255,0.06)', color:filter===key?'white':'var(--text-secondary)', transition:'all 0.2s' }}>
            {label}
            {key==='all' && notifications.length>0 && <span style={{ marginLeft:'0.35rem', opacity:0.7 }}>({notifications.length})</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign:'center', padding:'5rem 2rem' }}>
          <Megaphone size={48} style={{ color:'var(--text-secondary)', opacity:0.3, margin:'0 auto 1rem', display:'block' }}/>
          <h2 style={{ fontSize:'1.25rem', marginBottom:'0.5rem' }}>No messages yet</h2>
          <p>Teacher announcements for {child.first_name} will appear here.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
          {filtered.map(n=>{
            const cfg  = TYPE_CFG[n.type] || TYPE_CFG.general;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className="glass-card"
                onClick={()=>!n.is_read && markRead(n.id)}
                style={{ padding:'1.1rem 1.35rem', display:'flex', gap:'1rem', alignItems:'flex-start', borderLeft:`3px solid ${n.is_read?'var(--border-color)':cfg.color}`, opacity:n.is_read?0.75:1, cursor:n.is_read?'default':'pointer', transition:'opacity 0.2s', position:'relative' }}
              >
                <div style={{ width:'38px', height:'38px', borderRadius:'50%', backgroundColor:n.is_read?'rgba(255,255,255,0.05)':cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={17} color={n.is_read?'var(--text-secondary)':cfg.color}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.75rem', marginBottom:'0.3rem' }}>
                    <h3 style={{ margin:0, fontSize:'0.95rem', fontWeight:n.is_read?500:700 }}>{n.title}</h3>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                      <span className="badge" style={{ backgroundColor:n.is_read?'rgba(255,255,255,0.05)':cfg.bg, color:n.is_read?'var(--text-secondary)':cfg.color, fontSize:'0.65rem' }}>{cfg.label}</span>
                      <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  <p style={{ margin:0, fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:'1.5' }}>{n.message}</p>
                </div>
                {!n.is_read && (
                  <div style={{ position:'absolute', top:'1rem', right:'1rem', width:'8px', height:'8px', borderRadius:'50%', backgroundColor:cfg.color }}/>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
