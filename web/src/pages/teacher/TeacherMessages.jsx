import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Send, Search, Check, CheckCheck, MessageSquare } from 'lucide-react';

const DEMO_TEACHER_ID = 'b0000000-0000-0000-0000-000000000001';

export default function TeacherMessages() {
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [teacherId, setTeacherId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      markAsRead(selectedChat.id);
      scrollToBottom();
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function loadMessages() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const tId = user?.id || DEMO_TEACHER_ID;
      setTeacherId(tId);

      // Fetch all messages where teacher is sender OR receiver
      const { data: msgs, error } = await supabase.from('messages')
        .select('*')
        .or(`sender_id.eq.${tId},receiver_id.eq.${tId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Find all unique user IDs involved in chats (excluding the teacher themselves)
      const otherUserIds = new Set();
      (msgs || []).forEach(msg => {
        if (msg.sender_id !== tId) otherUserIds.add(msg.sender_id);
        if (msg.receiver_id !== tId) otherUserIds.add(msg.receiver_id);
      });

      // Fetch profiles for those users
      let profilesMap = {};
      if (otherUserIds.size > 0) {
        const { data: profs } = await supabase.from('profiles')
          .select('id, first_name, last_name, role')
          .in('id', Array.from(otherUserIds));
        (profs || []).forEach(p => { profilesMap[p.id] = p; });
      }

      // Group messages by chat (the other user's ID)
      const chatMap = {};
      (msgs || []).forEach(msg => {
        const otherId = msg.sender_id === tId ? msg.receiver_id : msg.sender_id;
        
        if (!chatMap[otherId]) {
          chatMap[otherId] = {
            id: otherId,
            profile: profilesMap[otherId] || { first_name: 'Unknown', last_name: 'User', role: 'unknown' },
            messages: [],
            unread: 0,
            lastMessageAt: msg.created_at
          };
        }
        chatMap[otherId].messages.push(msg);
        
        // Count unread if the teacher is the receiver and it's not read
        if (msg.receiver_id === tId && !msg.is_read) {
          chatMap[otherId].unread++;
        }
      });

      const chatList = Object.values(chatMap).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      setChats(chatList);
      
      if (chatList.length > 0) {
        // If no chat selected, select the first one. Otherwise keep current selection updated.
        setSelectedChat(prev => prev ? chatList.find(c => c.id === prev.id) || chatList[0] : chatList[0]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(otherUserId) {
    if (!teacherId) return;
    
    // Find unread messages from this user to the teacher
    const unreadMsgs = selectedChat?.messages.filter(m => m.receiver_id === teacherId && !m.is_read) || [];
    if (unreadMsgs.length === 0) return;

    try {
      const { error } = await supabase.from('messages')
        .update({ is_read: true })
        .eq('receiver_id', teacherId)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);

      if (!error) {
        // Update local state to reflect read status without full reload
        setChats(prev => prev.map(chat => {
          if (chat.id === otherUserId) {
            const updatedMessages = chat.messages.map(m => 
              (m.receiver_id === teacherId && !m.is_read) ? { ...m, is_read: true } : m
            );
            return { ...chat, messages: updatedMessages, unread: 0 };
          }
          return chat;
        }));
        
        if (selectedChat && selectedChat.id === otherUserId) {
          setSelectedChat(prev => ({
            ...prev,
            messages: prev.messages.map(m => (m.receiver_id === teacherId && !m.is_read) ? { ...m, is_read: true } : m),
            unread: 0
          }));
        }
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  }

  async function handleSendMessage() {
    if (!replyText.trim() || !selectedChat || !teacherId) return;

    const newMsg = {
      sender_id: teacherId,
      receiver_id: selectedChat.id,
      content: replyText.trim(),
      is_read: false
    };

    setReplyText(''); // clear input immediately

    try {
      const { data, error } = await supabase.from('messages').insert([newMsg]).select();
      if (error) throw error;
      
      // Reload to get exact timestamps and refresh list order
      loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>Messages</h1>
        <p className="text-sm text-muted">Communicate with parents, students, and administration</p>
      </div>

      <div className="glass-card" style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', padding: 0, overflow: 'hidden', height: '100%' }}>
        
        {/* Left Side: Chat List */}
        <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Search messages..." style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: 'rgba(15,23,42,0.5)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }} />
            </div>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && chats.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: '2rem' }}>Loading...</p>
            ) : chats.length === 0 ? (
              <p className="text-center text-muted" style={{ padding: '2rem' }}>No messages yet.</p>
            ) : chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                className="hover-card"
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--border-color)', 
                  cursor: 'pointer',
                  backgroundColor: selectedChat?.id === chat.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderLeft: selectedChat?.id === chat.id ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div className="flex-row justify-between" style={{ marginBottom: '0.25rem' }}>
                  <p className="font-semibold text-sm m-0" style={{ color: selectedChat?.id === chat.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {chat.profile?.first_name} {chat.profile?.last_name}
                  </p>
                  <p className="text-xs text-muted">
                    {chat.messages[0] && new Date(chat.messages[0].created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="flex-row justify-between" style={{ alignItems: 'center' }}>
                  <p className={`text-xs ${chat.unread > 0 ? 'text-primary font-semibold' : 'text-muted'}`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px', margin: 0 }}>
                    {chat.messages[0]?.sender_id === teacherId ? 'You: ' : ''}{chat.messages[0]?.content}
                  </p>
                  {chat.unread > 0 && (
                    <span className="badge badge-blue" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Chat View */}
        {selectedChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(15,23,42,0.3)' }}>
            
            {/* Chat Header */}
            <div className="flex-row gap-3" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              <div className="avatar" style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
                {(selectedChat.profile?.first_name || 'U')[0]}{(selectedChat.profile?.last_name || '')[0]}
              </div>
              <div>
                <h3 className="font-semibold text-base m-0">{selectedChat.profile?.first_name} {selectedChat.profile?.last_name}</h3>
                <p className="text-xs text-muted m-0" style={{ textTransform: 'capitalize' }}>{selectedChat.profile?.role}</p>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '1.25rem' }}>
              <div ref={messagesEndRef} />
              {selectedChat.messages.map((msg, i) => {
                const isMine = msg.sender_id === teacherId;
                return (
                  <div key={msg.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      backgroundColor: isMine ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                      color: isMine ? 'white' : 'var(--text-primary)',
                      border: isMine ? 'none' : '1px solid var(--border-color)', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '1rem', 
                      borderTopLeftRadius: isMine ? '1rem' : 0,
                      borderTopRightRadius: isMine ? 0 : '1rem',
                      maxWidth: '70%',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                      <p className="text-sm m-0" style={{ lineHeight: 1.5 }}>{msg.content}</p>
                    </div>
                    <div className="flex-row gap-1" style={{ marginTop: '0.35rem', opacity: 0.7, alignItems: 'center' }}>
                      <p className="text-xs">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      {isMine && (
                        msg.is_read ? <CheckCheck size={14} color="#3b82f6" /> : <Check size={14} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              <div className="flex-row gap-2">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message here..." 
                  style={{ flex: 1, padding: '0.875rem 1.25rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: 'rgba(15,23,42,0.5)', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleSendMessage}
                  disabled={!replyText.trim()}
                  style={{ padding: '0.875rem', borderRadius: '50%', opacity: replyText.trim() ? 1 : 0.5, cursor: replyText.trim() ? 'pointer' : 'default' }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-col justify-center" style={{ alignItems: 'center', height: '100%', color: 'var(--text-muted)', background: 'rgba(15,23,42,0.3)' }}>
            <MessageSquare size={56} style={{ opacity: 0.15, marginBottom: '1.5rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Your Messages</p>
            <p className="text-sm" style={{ opacity: 0.7 }}>Select a conversation from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

