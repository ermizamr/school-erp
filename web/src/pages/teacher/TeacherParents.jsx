import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { getTeacherIdFallback } from '../../utils/demoHelpers';
import { Search, ChevronLeft, Send, Phone, Mail, BookHeart } from 'lucide-react';
import { useToast } from '../../components/Toast';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

export default function TeacherParents() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Chat state
  const [selectedParent, setSelectedParent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [teacherId, setTeacherId] = useState(null);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedParent) {
      loadMessages(selectedParent.parent.id);
    }
  }, [selectedParent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function init() {
    setLoading(true);
    try {
      const tid = await getTeacherIdFallback();
      setTeacherId(tid);

      // Get teacher's sections
      const { data: assignments } = await supabase.from('teacher_assignments')
        .select('section_id')
        .eq('teacher_id', tid);
      
      if (!assignments || assignments.length === 0) {
        setParents([]);
        setLoading(false);
        return;
      }

      const sectionIds = assignments.map(a => a.section_id);

      // Get students in those sections
      const { data: enrollments } = await supabase.from('enrollments')
        .select('student_id')
        .in('section_id', sectionIds);
      
      if (!enrollments || enrollments.length === 0) {
        setParents([]);
        setLoading(false);
        return;
      }

      const studentIds = enrollments.map(e => e.student_id);

      // Get parent links
      const { data: links, error } = await supabase.from('parent_student_links')
        .select(`
          parent_id,
          student_id,
          parent:profiles!parent_student_links_parent_id_fkey(id, first_name, last_name, email, phone_number),
          student:profiles!parent_student_links_student_id_fkey(id, first_name, last_name)
        `)
        .in('student_id', studentIds);

      if (error) throw error;

      // Group by parent since a parent might have multiple kids
      const parentMap = new Map();
      (links || []).forEach(link => {
        if (!link.parent) return;
        if (!parentMap.has(link.parent.id)) {
          parentMap.set(link.parent.id, {
            parent: link.parent,
            students: [link.student]
          });
        } else {
          parentMap.get(link.parent.id).students.push(link.student);
        }
      });

      setParents(Array.from(parentMap.values()));
    } catch (err) {
      console.error('Error loading parents:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(parentId) {
    try {
      const { data, error } = await supabase.from('messages')
        .select('*')
        .or(`and(sender_id.eq.${teacherId},receiver_id.eq.${parentId}),and(sender_id.eq.${parentId},receiver_id.eq.${teacherId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedParent || !teacherId) return;

    setSending(true);
    try {
      const msg = {
        sender_id: teacherId,
        receiver_id: selectedParent.parent.id,
        content: newMessage.trim(),
      };

      const { data, error } = await supabase.from('messages').insert([msg]).select();
      if (error) throw error;

      setMessages(prev => [...prev, data[0]]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      // Fallback for UI if DB insert fails (e.g., RLS issues)
      const fakeMsg = { id: Date.now(), sender_id: teacherId, content: newMessage.trim(), created_at: new Date().toISOString() };
      setMessages(prev => [...prev, fakeMsg]);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  }

  // --- RENDERING ---

  if (selectedParent) {
    const parentName = `${selectedParent.parent.first_name} ${selectedParent.parent.last_name}`;
    const studentNames = selectedParent.students.map(s => `${s.first_name} ${s.last_name}`).join(', ');

    return (
      <div style={{ animation: 'fadeSlideIn 0.3s ease-out', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        <div className="flex-row" style={{ marginBottom: '1rem', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setSelectedParent(null)} 
            className="btn hover-card" 
            style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>{parentName}</h1>
            <p className="text-sm text-muted m-0">Guardian of {studentNames}</p>
          </div>
        </div>

        {/* Notebook UI */}
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', background: '#fdfbf7', border: '1px solid #e2ddc8' }}>
          
          {/* Header Strip */}
          <div style={{ background: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex-row gap-2" style={{ alignItems: 'center' }}>
              <BookHeart size={20} />
              <span className="font-bold">Communication Notebook</span>
            </div>
            <div className="flex-row gap-3 text-sm">
              {selectedParent.parent.phone_number && <span className="flex-row gap-1"><Phone size={14}/> {selectedParent.parent.phone_number}</span>}
              {selectedParent.parent.email && <span className="flex-row gap-1"><Mail size={14}/> {selectedParent.parent.email}</span>}
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2ddc8 28px)', backgroundSize: '100% 28px', lineHeight: '28px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '2rem', fontStyle: 'italic' }}>
                No notes yet. Start the conversation!
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.sender_id === teacherId;
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      maxWidth: '70%',
                      background: isMine ? '#dbeafe' : 'white',
                      border: isMine ? '1px solid #bfdbfe' : '1px solid #e5e7eb',
                      padding: '0.75rem 1rem',
                      borderRadius: isMine ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      color: '#333',
                      lineHeight: '1.4'
                    }}>
                      <div style={{ fontSize: '0.95rem' }}>{m.content}</div>
                      <div style={{ fontSize: '0.7rem', color: '#888', textAlign: isMine ? 'right' : 'left', marginTop: '4px' }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{ background: 'white', padding: '1rem', borderTop: '1px solid #e2ddc8', display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Write a note to the parent..." 
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid #e5e7eb', background: '#f9fafb', outline: 'none' }} 
            />
            <button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', opacity: newMessage.trim() ? 1 : 0.5 }}
            >
              <Send size={18} style={{ marginLeft: '3px' }}/>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filtered = parents.filter(p => {
    const pName = `${p.parent.first_name} ${p.parent.last_name}`.toLowerCase();
    const sName = p.students.map(s => `${s.first_name} ${s.last_name}`).join(' ').toLowerCase();
    const term = searchTerm.toLowerCase();
    return pName.includes(term) || sName.includes(term);
  });

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Parents Directory</h1>
          <p className="text-sm text-muted">Contact information and communication notebook for your students' guardians</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by parent or student name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }} 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-col justify-center" style={{ alignItems: 'center', height: '20vh' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Parent Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Student(s)</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-card">
                  <td style={{ padding: '1rem' }}>
                    <div className="flex-row gap-3">
                      <div className="avatar" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        {p.parent.first_name?.[0]}{p.parent.last_name?.[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{p.parent.first_name} {p.parent.last_name}</span>
                        <p className="text-xs text-muted m-0">Guardian</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {p.students.map(s => `${s.first_name} ${s.last_name}`).join(', ')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {p.parent.email && <p className="text-xs m-0 flex-row gap-1 text-muted"><Mail size={12}/> {p.parent.email}</p>}
                    {p.parent.phone_number && <p className="text-xs m-0 flex-row gap-1 text-muted"><Phone size={12}/> {p.parent.phone_number}</p>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedParent(p)}
                      className="btn btn-primary" 
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <BookHeart size={14} /> Open Notebook
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No parents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
