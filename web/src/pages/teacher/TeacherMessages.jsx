import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../components/Toast';
import {
  MessageSquare, Send, Search, Check, CheckCheck,
  Users, AlertCircle, User, PlusCircle, X,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const TEACHER_COLOR = '#3b82f6';
const PARENT_COLOR  = '#f59e0b';
const ADMIN_COLOR   = '#a78bfa';

const ROLE_META = {
  parent:  { label: 'Parent',  color: PARENT_COLOR },
  admin:   { label: 'Admin',   color: ADMIN_COLOR  },
  teacher: { label: 'Teacher', color: TEACHER_COLOR },
  student: { label: 'Student', color: '#10B981'    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(ts) {
  const d = new Date(ts);
  const today     = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function isDifferentDay(a, b) {
  if (!a || !b) return true;
  return new Date(a).toDateString() !== new Date(b).toDateString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, color = TEACHER_COLOR, size = 36 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      backgroundColor: `${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, color, fontSize: size * 0.38,
    }}>
      {initials}
    </div>
  );
}

function RoleChip({ role }) {
  const meta = ROLE_META[role] || { label: role, color: 'var(--text-secondary)' };
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: meta.color, backgroundColor: `${meta.color}18`,
      padding: '0.15rem 0.45rem', borderRadius: '0.35rem',
    }}>
      {meta.label}
    </span>
  );
}

function ChatListItem({ chat, teacherId, isActive, onClick }) {
  const lastMsg  = chat.messages[chat.messages.length - 1];
  const roleMeta = ROLE_META[chat.profile?.role] || { color: TEACHER_COLOR };
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
        padding: '0.85rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        backgroundColor: isActive ? `${TEACHER_COLOR}12` : 'transparent',
        borderLeft: isActive ? `3px solid ${TEACHER_COLOR}` : '3px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ position: 'relative' }}>
        <Avatar
          name={`${chat.profile?.first_name} ${chat.profile?.last_name}`}
          color={roleMeta.color}
          size={40}
        />
        {chat.unread > 0 && (
          <div style={{
            position: 'absolute', top: -3, right: -3,
            width: 17, height: 17, borderRadius: '50%',
            backgroundColor: '#ef4444', border: '2px solid var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', fontWeight: 800, color: 'white',
          }}>
            {chat.unread > 9 ? '9+' : chat.unread}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15rem' }}>
          <p style={{
            fontWeight: chat.unread > 0 ? 700 : 500,
            fontSize: '0.875rem', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: 'var(--text-primary)',
          }}>
            {chat.profile?.first_name} {chat.profile?.last_name}
          </p>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', flexShrink: 0, marginLeft: '0.5rem' }}>
            {lastMsg ? timeAgo(lastMsg.created_at) : ''}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{
            fontSize: '0.78rem',
            color: chat.unread > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: chat.unread > 0 ? 600 : 400,
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px',
          }}>
            {lastMsg
              ? `${lastMsg.sender_id === teacherId ? 'You: ' : ''}${lastMsg.content}`
              : 'No messages yet'}
          </p>
          <RoleChip role={chat.profile?.role} />
        </div>
      </div>
    </button>
  );
}

// ─── New Conversation Picker ──────────────────────────────────────────────────

function NewConversationPicker({ teacherId, existingChatIds, onSelect, onClose }) {
  const [search, setSearch]     = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Load parents and admins (not self)
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('role', ['parent', 'admin', 'teacher'])
        .neq('id', teacherId)
        .order('first_name');
      setContacts(data || []);
      setLoading(false);
    }
    load();
  }, [teacherId]);

  const filtered = contacts.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '440px',
        backgroundColor: 'var(--bg-surface)', position: 'relative',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>New Message</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              autoFocus
              type="text"
              placeholder="Search parents, admins…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: 'rgba(15,23,42,0.5)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No contacts found</p>
          ) : filtered.map(c => {
            const roleMeta = ROLE_META[c.role] || { color: TEACHER_COLOR };
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                  padding: '0.85rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  transition: 'background 0.15s',
                }}
                className="hover-card"
              >
                <Avatar name={`${c.first_name} ${c.last_name}`} color={roleMeta.color} size={36} />
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>{c.first_name} {c.last_name}</p>
                  <RoleChip role={c.role} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeacherMessages({ onMessageRead, initialRecipientId = null }) {
  const { toast } = useToast();
  const [teacherId, setTeacherId]       = useState(null);
  const [chats, setChats]               = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newText, setNewText]           = useState('');
  const [searchTerm, setSearchTerm]     = useState('');
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [showPicker, setShowPicker]     = useState(false);
  const messagesEndRef                  = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load teacher id + all chats
  useEffect(() => {
    init();
  }, []);

  // Scroll to bottom when chat changes or new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages?.length, scrollToBottom]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (selectedChat && teacherId) {
      markRead(selectedChat.id);
    }
  }, [selectedChat?.id, teacherId]);

  // If a recipient was pre-selected (e.g. from TeacherParents), open that chat
  useEffect(() => {
    if (!initialRecipientId || !chats.length) return;
    const target = chats.find(c => c.id === initialRecipientId);
    if (target) setSelectedChat(target);
  }, [initialRecipientId, chats]);

  async function init() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const tId = user?.id || 'b0000000-0000-0000-0000-000000000001';
      setTeacherId(tId);
      await loadChats(tId);
    } catch (err) {
      console.error('TeacherMessages init error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadChats(tId) {
    const id = tId || teacherId;
    if (!id) return;

    const { data: msgs, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
      .order('created_at', { ascending: true });

    if (error) { console.error(error); return; }

    // Collect all unique other-side user IDs
    const otherIds = new Set();
    (msgs || []).forEach(m => {
      if (m.sender_id !== id)   otherIds.add(m.sender_id);
      if (m.receiver_id !== id) otherIds.add(m.receiver_id);
    });

    // Fetch profiles for those users
    let profilesMap = {};
    if (otherIds.size > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', Array.from(otherIds));
      (profs || []).forEach(p => { profilesMap[p.id] = p; });
    }

    // Group by conversation partner
    const chatMap = {};
    (msgs || []).forEach(m => {
      const otherId = m.sender_id === id ? m.receiver_id : m.sender_id;
      if (!chatMap[otherId]) {
        chatMap[otherId] = {
          id: otherId,
          profile: profilesMap[otherId] || { first_name: 'Unknown', last_name: 'User', role: 'unknown' },
          messages: [],
          unread: 0,
          lastMessageAt: m.created_at,
        };
      }
      chatMap[otherId].messages.push(m);
      if (m.created_at > chatMap[otherId].lastMessageAt) {
        chatMap[otherId].lastMessageAt = m.created_at;
      }
      if (m.receiver_id === id && !m.is_read) {
        chatMap[otherId].unread++;
      }
    });

    const chatList = Object.values(chatMap).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    setChats(chatList);

    // Update selected chat if open
    setSelectedChat(prev => {
      if (!prev) return prev;
      return chatList.find(c => c.id === prev.id) || prev;
    });
  }

  async function markRead(otherId) {
    const tId = teacherId;
    if (!tId) return;
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', tId)
        .eq('sender_id', otherId)
        .eq('is_read', false);

      setChats(prev => prev.map(c => {
        if (c.id !== otherId) return c;
        return {
          ...c,
          unread: 0,
          messages: c.messages.map(m =>
            m.receiver_id === tId && !m.is_read ? { ...m, is_read: true } : m
          ),
        };
      }));

      onMessageRead?.();
    } catch (err) {
      console.error('markRead error:', err);
    }
  }

  async function handleSend() {
    if (!newText.trim() || !selectedChat || !teacherId) return;
    setSending(true);
    const content = newText.trim();
    setNewText('');
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ sender_id: teacherId, receiver_id: selectedChat.id, content, is_read: false }])
        .select()
        .single();
      if (error) throw error;

      // Optimistically append
      setChats(prev => prev.map(c => {
        if (c.id !== selectedChat.id) return c;
        return { ...c, messages: [...c.messages, data], lastMessageAt: data.created_at };
      }));
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, data],
        lastMessageAt: data.created_at,
      }));
    } catch (err) {
      console.error('Send error:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Open a conversation with a new contact (from picker)
  function openChat(profile) {
    setShowPicker(false);
    const existing = chats.find(c => c.id === profile.id);
    if (existing) {
      setSelectedChat(existing);
    } else {
      const stub = { id: profile.id, profile, messages: [], unread: 0, lastMessageAt: new Date().toISOString() };
      setChats(prev => [stub, ...prev]);
      setSelectedChat(stub);
    }
  }

  const filteredChats = chats.filter(c =>
    `${c.profile?.first_name} ${c.profile?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ animation: 'fadeSlideIn 0.4s ease-out', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Messages
            {totalUnread > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
                {totalUnread}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted">Communicate with parents, students, and administration</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowPicker(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem' }}
        >
          <PlusCircle size={17} />
          <span>New Message</span>
        </button>
      </div>

      {/* Chat UI */}
      <div className="glass-card" style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', padding: 0, overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left Panel: Chat List ── */}
        <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          {/* Search */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search messages…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem', borderRadius: '2rem', border: '1px solid var(--border-color)', background: 'rgba(15,23,42,0.5)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <p className="text-center text-muted" style={{ padding: '2rem' }}>Loading…</p>
            ) : filteredChats.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <MessageSquare size={36} style={{ opacity: 0.2, margin: '0 auto 0.75rem' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {searchTerm ? 'No chats match your search.' : 'No messages yet.'}
                </p>
                {!searchTerm && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowPicker(true)}
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    Start a conversation
                  </button>
                )}
              </div>
            ) : filteredChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                teacherId={teacherId}
                isActive={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
              />
            ))}
          </div>
        </div>

        {/* ── Right Panel: Conversation ── */}
        {selectedChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(15,23,42,0.3)', overflow: 'hidden' }}>

            {/* Chat header */}
            <div style={{
              padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <Avatar
                name={`${selectedChat.profile?.first_name} ${selectedChat.profile?.last_name}`}
                color={(ROLE_META[selectedChat.profile?.role] || { color: TEACHER_COLOR }).color}
                size={40}
              />
              <div>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
                  {selectedChat.profile?.first_name} {selectedChat.profile?.last_name}
                </h3>
                <RoleChip role={selectedChat.profile?.role} />
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {selectedChat.messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                  <MessageSquare size={40} style={{ marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.9rem' }}>No messages yet. Say hello!</p>
                </div>
              ) : selectedChat.messages.map((msg, i) => {
                const isMine  = msg.sender_id === teacherId;
                const prev    = selectedChat.messages[i - 1];
                const showDivider = isDifferentDay(prev?.created_at, msg.created_at);

                return (
                  <React.Fragment key={msg.id || i}>
                    {/* Date divider */}
                    {showDivider && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {formatDateDivider(msg.created_at)}
                        </span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
                      </div>
                    )}

                    {/* Bubble */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{
                        backgroundColor: isMine ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                        color: isMine ? 'white' : 'var(--text-primary)',
                        border: isMine ? 'none' : '1px solid var(--border-color)',
                        padding: '0.7rem 1rem',
                        borderRadius: '1rem',
                        borderTopLeftRadius: isMine ? '1rem' : '0.25rem',
                        borderTopRightRadius: isMine ? '0.25rem' : '1rem',
                        maxWidth: '68%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55 }}>{msg.content}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem', opacity: 0.65 }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{formatTime(msg.created_at)}</span>
                        {isMine && (msg.is_read
                          ? <CheckCheck size={13} color={TEACHER_COLOR} />
                          : <Check size={13} color="var(--text-secondary)" />
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <textarea
                  rows={1}
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  style={{
                    flex: 1, padding: '0.875rem 1.25rem', borderRadius: '1.5rem',
                    border: '1px solid var(--border-color)', background: 'rgba(15,23,42,0.5)',
                    color: 'white', outline: 'none', fontSize: '0.9rem',
                    resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                    maxHeight: '120px', overflowY: 'auto',
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={!newText.trim() || sending}
                  style={{
                    padding: '0.875rem', borderRadius: '50%', flexShrink: 0,
                    opacity: newText.trim() && !sending ? 1 : 0.45,
                    cursor: newText.trim() && !sending ? 'pointer' : 'default',
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', background: 'rgba(15,23,42,0.3)' }}>
            <MessageSquare size={56} style={{ opacity: 0.12, marginBottom: '1.5rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Select a conversation</p>
            <p className="text-sm" style={{ opacity: 0.7, marginTop: '0.5rem' }}>or start a new one with the button above</p>
          </div>
        )}
      </div>

      {/* New message picker modal */}
      {showPicker && teacherId && (
        <NewConversationPicker
          teacherId={teacherId}
          existingChatIds={chats.map(c => c.id)}
          onSelect={openChat}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
