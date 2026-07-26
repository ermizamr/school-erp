import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../components/Toast';
import {
  MessageSquare, Send, Search, User, Check, CheckCheck,
  ChevronDown, Users, AlertCircle, ArrowLeft
} from 'lucide-react';

// ─── Shared style tokens ──────────────────────────────────────────────────────

const PARENT_COLOR  = '#f59e0b';  // amber  — parent role colour
const TEACHER_COLOR = '#3b82f6';  // blue   — teacher role colour

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)   return 'Just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
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

/** Returns true if two timestamps are on different calendar days */
function isDifferentDay(a, b) {
  if (!a || !b) return true;
  return new Date(a).toDateString() !== new Date(b).toDateString();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Avatar circle with initials */
function Avatar({ name, color, size = 36 }) {
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

/** Left-panel teacher list item */
function TeacherListItem({ teacher, isActive, unreadCount, lastMessage, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
        padding: '0.85rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        backgroundColor: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
        borderLeft: isActive ? `3px solid ${TEACHER_COLOR}` : '3px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ position: 'relative' }}>
        <Avatar name={`${teacher.first_name} ${teacher.last_name}`} color={TEACHER_COLOR} size={42} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -3, right: -3,
            width: 18, height: 18, borderRadius: '50%',
            backgroundColor: '#ef4444', border: '2px solid var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', fontWeight: 800, color: 'white',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
          <p style={{
            fontWeight: unreadCount > 0 ? 700 : 600,
            fontSize: '0.9rem', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: isActive ? TEACHER_COLOR : 'var(--text-primary)',
          }}>
            {teacher.first_name} {teacher.last_name}
          </p>
          {lastMessage && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', flexShrink: 0, marginLeft: '0.35rem' }}>
              {timeAgo(lastMessage.created_at)}
            </span>
          )}
        </div>
        
        {/* Subject Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', margin: '0.2rem 0' }}>
          {teacher.subjects && teacher.subjects.length > 0 ? (
            teacher.subjects.map((sub, i) => (
              <span key={i} style={{
                fontSize: '0.68rem', fontWeight: 600,
                backgroundColor: 'rgba(59,130,246,0.12)',
                color: '#3b82f6',
                border: '1px solid rgba(59,130,246,0.22)',
                padding: '0.12rem 0.45rem',
                borderRadius: '0.4rem',
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
              }}>
                📚 {sub}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Teacher</span>
          )}
        </div>

        {lastMessage && (
          <p style={{
            fontSize: '0.75rem', margin: '0.15rem 0 0',
            color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}

/** Single chat bubble */
function ChatBubble({ message, isMine }) {
  const color = isMine ? PARENT_COLOR : TEACHER_COLOR;
  return (
    <div style={{
      display: 'flex',
      flexDirection: isMine ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: '0.5rem',
      marginBottom: '0.5rem',
    }}>
      <div style={{
        maxWidth: '72%',
        padding: '0.65rem 0.9rem',
        borderRadius: isMine ? '1.1rem 1.1rem 0.2rem 1.1rem' : '1.1rem 1.1rem 1.1rem 0.2rem',
        backgroundColor: isMine ? `${PARENT_COLOR}18` : 'var(--bg-surface-hover)',
        border: `1px solid ${isMine ? `${PARENT_COLOR}30` : 'var(--border-color)'}`,
        position: 'relative',
      }}>
        <p style={{
          margin: 0, fontSize: '0.9rem', lineHeight: 1.55,
          color: 'var(--text-primary)', wordBreak: 'break-word',
        }}>
          {message.content}
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          justifyContent: 'flex-end', marginTop: '0.3rem',
        }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            {formatTime(message.created_at)}
          </span>
          {isMine && (
            message.is_read
              ? <CheckCheck size={11} color={TEACHER_COLOR} />
              : <Check      size={11} color="var(--text-secondary)" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ParentMessages
 *
 * Props:
 *   child          — currently selected child { id, first_name, last_name }
 *   children       — full list of the parent's linked children
 *   onSelectChild  — callback(child) to switch the selected child
 */
export default function ParentMessages({ child, children: allChildren = [], onSelectChild }) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Auth state
  const [parentId,      setParentId]      = useState(null);

  // Teacher list (left panel)
  const [teachers,      setTeachers]      = useState([]);  // [{ id, first_name, last_name, subjects:[...] }]
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [activeTeacher, setActiveTeacher] = useState(null);

  // Conversation (right panel)
  const [messages,      setMessages]      = useState([]);
  const [msgsLoading,   setMsgsLoading]   = useState(false);
  const [msgsError,     setMsgsError]     = useState(null);
  const [unreadMap,     setUnreadMap]     = useState({});  // { teacherId: count }
  const [lastMsgMap,    setLastMsgMap]    = useState({});  // { teacherId: message }

  // Compose
  const [draft,         setDraft]         = useState('');
  const [sending,       setSending]       = useState(false);

  // Refs
  const channelRef     = useRef(null);   // realtime channel
  const bottomRef      = useRef(null);   // scroll anchor
  const textareaRef    = useRef(null);

  // ── On mount: get the logged-in parent's own user id ─────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setParentId(user?.id ?? null);
    });
  }, []);

  // Auto-select teacher & pre-fill inquiry when navigated from Grade Viewer or Absence Alert
  useEffect(() => {
    if (!teachers || teachers.length === 0) return;
    const teacherIdParam = searchParams.get('teacherId');
    const subjectIdParam = searchParams.get('subjectId');
    const inquiryParam   = searchParams.get('inquiry');

    let target = null;
    if (teacherIdParam) {
      target = teachers.find(t => t.id === teacherIdParam);
    }
    if (!target && subjectIdParam) {
      target = teachers.find(t => t.subjectIds && t.subjectIds.includes(subjectIdParam));
    }
    if (!target && teachers.length > 0) {
      target = teachers[0];
    }

    if (target) {
      openConversation(target);
    }
    if (inquiryParam) {
      setDraft(decodeURIComponent(inquiryParam));
    }
  }, [teachers, searchParams]);

  // ── Fetch teachers whenever child changes ─────────────────────────────────
  useEffect(() => {
    if (child?.id) {
      fetchTeachers(child.id);
      setActiveTeacher(null);
      setMessages([]);
    } else {
      setTeachers([]);
      setTeachersLoading(false);
    }
  }, [child?.id]);

  /**
   * Loads the unique teachers assigned to the sections in which the child is enrolled.
   * Also pre-loads unread counts and last messages per teacher for the sidebar.
   */
  const fetchTeachers = useCallback(async (studentId) => {
    setTeachersLoading(true);
    try {
      // 1. Get the child's section(s) via enrollments
      const { data: enrollments, error: enrErr } = await supabase
        .from('enrollments')
        .select('section_id')
        .eq('student_id', studentId);
      if (enrErr) throw enrErr;

      const sectionIds = (enrollments || []).map(e => e.section_id);
      if (sectionIds.length === 0) { setTeachers([]); return; }

      // 2. Get all teacher_assignments for those sections
      const { data: assignments, error: asgErr } = await supabase
        .from('teacher_assignments')
        .select('teacher_id, subject_id, subjects(name)')
        .in('section_id', sectionIds);
      if (asgErr) throw asgErr;

      // 3. Collect unique teacher ids + their subjects
      const teacherSubjectMap = {};
      const teacherSubjectIdsMap = {};
      (assignments || []).forEach(a => {
        if (!teacherSubjectMap[a.teacher_id]) teacherSubjectMap[a.teacher_id] = [];
        if (!teacherSubjectIdsMap[a.teacher_id]) teacherSubjectIdsMap[a.teacher_id] = [];
        if (a.subjects?.name) teacherSubjectMap[a.teacher_id].push(a.subjects.name);
        if (a.subject_id) teacherSubjectIdsMap[a.teacher_id].push(a.subject_id);
      });

      const teacherIds = Object.keys(teacherSubjectMap);
      if (teacherIds.length === 0) { setTeachers([]); return; }

      // 4. Fetch teacher profiles
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', teacherIds);
      if (profErr) throw profErr;

      const enriched = (profiles || []).map(p => ({
        ...p,
        subjects: [...new Set(teacherSubjectMap[p.id] || [])],
        subjectIds: [...new Set(teacherSubjectIdsMap[p.id] || [])],
      }));

      setTeachers(enriched);

      // 5. Pre-load unread counts + last message per teacher (non-blocking)
      fetchSidebarMeta(enriched);
    } catch (err) {
      console.error('ParentMessages fetchTeachers error', err);
      toast.error('Failed to load teachers.');
    } finally {
      setTeachersLoading(false);
    }
  }, [toast]);

  /**
   * For each teacher, counts unread messages sent TO the parent
   * and finds the most recent message in either direction.
   * Runs in parallel for speed.
   */
  const fetchSidebarMeta = useCallback(async (teacherList) => {
    if (!parentId) return; // parentId might not be set yet — will re-run if needed
    await Promise.all(teacherList.map(async (teacher) => {
      const [{ count: unread }, { data: recent }] = await Promise.all([
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', teacher.id)
          .eq('receiver_id', parentId)
          .eq('is_read', false),
        supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .or(`and(sender_id.eq.${parentId},receiver_id.eq.${teacher.id}),and(sender_id.eq.${teacher.id},receiver_id.eq.${parentId})`)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);
      setUnreadMap(prev => ({ ...prev, [teacher.id]: unread || 0 }));
      setLastMsgMap(prev => ({ ...prev, [teacher.id]: recent?.[0] ?? null }));
    }));
  }, [parentId]);

  // Re-run sidebar meta once parentId is available
  useEffect(() => {
    if (parentId && teachers.length > 0) {
      fetchSidebarMeta(teachers);
    }
  }, [parentId, teachers, fetchSidebarMeta]);

  // ── Open a conversation ──────────────────────────────────────────────────
  const openConversation = useCallback(async (teacher) => {
    setActiveTeacher(teacher);
    setMessages([]);
    setDraft('');
    setMsgsError(null);

    // Tear down any previous realtime channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    await loadHistory(teacher.id);
    subscribeRealtime(teacher.id);

    // Mark all messages from this teacher as read
    if (parentId) {
      supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', teacher.id)
        .eq('receiver_id', parentId)
        .eq('is_read', false)
        .then(() => {
          setUnreadMap(prev => ({ ...prev, [teacher.id]: 0 }));
        });
    }
  }, [parentId]);

  // ── Load historical messages ─────────────────────────────────────────────
  const loadHistory = useCallback(async (teacherId) => {
    if (!parentId) return;
    setMsgsLoading(true);
    setMsgsError(null);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${parentId},receiver_id.eq.${teacherId}),` +
          `and(sender_id.eq.${teacherId},receiver_id.eq.${parentId})`
        )
        .order('created_at', { ascending: true })
        .limit(200);
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('loadHistory error', err);
      setMsgsError('Failed to load messages. Please try again.');
    } finally {
      setMsgsLoading(false);
    }
  }, [parentId]);

  // ── Supabase Realtime subscription ──────────────────────────────────────
  const subscribeRealtime = useCallback((teacherId) => {
    if (!parentId) return;

    const channelName = `messages_${parentId}_${teacherId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          // Postgres filter: messages where the parent is sender or recipient
          // We receive ALL inserts and filter client-side for safety
        },
        (payload) => {
          const msg = payload.new;
          const isRelevant =
            (msg.sender_id === parentId    && msg.receiver_id === teacherId) ||
            (msg.sender_id === teacherId   && msg.receiver_id === parentId);
          if (!isRelevant) return;

          setMessages(prev => {
            // Deduplicate (the optimistic message we inserted will already be present)
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });

          // If the incoming message is from the teacher, mark it read immediately
          if (msg.sender_id === teacherId && msg.receiver_id === parentId) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', msg.id);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug(`[Realtime] subscribed to ${channelName}`);
        }
      });

    channelRef.current = channel;
  }, [parentId]);

  // ── Cleanup realtime on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // ── Scroll to bottom whenever messages change ────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send a message ───────────────────────────────────────────────────────
  const handleSend = useCallback(async (e) => {
    e?.preventDefault();
    const content = draft.trim();
    if (!content || !parentId || !activeTeacher || sending) return;

    setSending(true);
    setDraft('');

    // Optimistic insert (shown immediately, replaced by realtime event)
    const optimisticId = `opt_${Date.now()}`;
    const optimistic = {
      id:           optimisticId,
      sender_id:    parentId,
      receiver_id: activeTeacher.id,
      student_id:   child?.id ?? null,
      content,
      is_read:      false,
      created_at:   new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id:    parentId,
          receiver_id: activeTeacher.id,
          student_id:   child?.id ?? null,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace the optimistic row with the real one from the DB
      setMessages(prev =>
        prev.map(m => m.id === optimisticId ? data : m)
      );

      // Update sidebar last message
      setLastMsgMap(prev => ({ ...prev, [activeTeacher.id]: data }));

    } catch (err) {
      console.error('handleSend error', err);
      // Roll back the optimistic message and restore the draft
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setDraft(content);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [draft, parentId, activeTeacher, child, sending, toast]);

  // Allow Enter (without shift) or Ctrl/Cmd + Enter to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Quick Action Template preset messages
  const applyTemplate = (text) => {
    setDraft(text);
    textareaRef.current?.focus();
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const filteredTeachers = teachers.filter(t =>
    `${t.first_name} ${t.last_name} ${(t.subjects || []).join(' ')}`
      .toLowerCase()
      .includes(teacherSearch.toLowerCase())
  );

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  // ── No child selected ────────────────────────────────────────────────────
  if (!child?.id) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <MessageSquare size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>No child selected</h2>
        <p>Select a child from the sidebar to start messaging their teachers.</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ animation: 'fadeSlideIn 0.3s ease-out', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.2rem', fontSize: '1.4rem' }}>Direct Messaging — {child.first_name}</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Connect with {child.first_name}'s subject teachers in real-time.
            {totalUnread > 0 && (
              <span style={{ marginLeft: '0.6rem', backgroundColor: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
                {totalUnread} unread
              </span>
            )}
          </p>
        </div>

        {/* Back to list button when a teacher is active */}
        {activeTeacher && (
          <button
            onClick={() => setActiveTeacher(null)}
            className="btn"
            style={{
              padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: 600,
              backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.65rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Back to Teachers List
          </button>
        )}
      </div>

      {/* Messaging Layout Container */}
      <div className="messages-layout-container" style={{ display: 'flex', flex: 1, gap: '0', overflow: 'hidden', borderRadius: '1rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>

        {/* ── TEACHER LIST PANEL (Visible when NO teacher is selected) ────────────────────────────────── */}
        {!activeTeacher ? (
          <div className="teacher-list-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Panel header & Subject-aware Search */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.015)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>
                  👨‍🏫 {child.first_name}'s Teachers ({teachers.length})
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Filter by teacher name or subject
                </span>
              </div>

              {/* Search bar */}
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search teacher name or subject (e.g. Math, Physics, English)..."
                  value={teacherSearch}
                  onChange={e => setTeacherSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    border: '1px solid var(--border-color)', borderRadius: '0.65rem',
                    backgroundColor: 'rgba(15,23,42,0.6)', color: 'white',
                    fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Teacher list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {teachersLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: TEACHER_COLOR, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading teachers list…</p>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                  <User size={36} style={{ color: 'var(--text-secondary)', opacity: 0.3, margin: '0 auto 0.6rem', display: 'block' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {teachers.length === 0 ? 'No teachers assigned to this student section yet.' : 'No teachers match your search term.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                  {filteredTeachers.map(teacher => (
                    <TeacherListItem
                      key={teacher.id}
                      teacher={teacher}
                      isActive={false}
                      unreadCount={unreadMap[teacher.id] || 0}
                      lastMessage={lastMsgMap[teacher.id] || null}
                      onClick={() => openConversation(teacher)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── ACTIVE CHAT THREAD PANEL (Takes 100% full width when active) ────────────────────────────────── */
          <div className="chat-thread-panel" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

            {/* Conversation header */}
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.02)' }}>
              {/* Back to Teachers List Button */}
              <button
                onClick={() => setActiveTeacher(null)}
                style={{
                  background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)',
                  cursor: 'pointer', padding: '0.45rem 0.75rem', borderRadius: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600,
                }}
                title="Return to teachers list"
              >
                <ArrowLeft size={16} /> Back to Teachers
              </button>

              <Avatar name={`${activeTeacher.first_name} ${activeTeacher.last_name}`} color={TEACHER_COLOR} size={42} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                    {activeTeacher.first_name} {activeTeacher.last_name}
                  </p>
                  {activeTeacher.subjects?.map((sub, i) => (
                    <span key={i} style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)', padding: '0.1rem 0.45rem', borderRadius: '0.4rem' }}>
                      📚 {sub}
                    </span>
                  ))}
                </div>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Homeroom / Subject Teacher for {child.first_name}
                </p>
              </div>

              <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981', padding: '0.25rem 0.65rem', borderRadius: '1rem', border: '1px solid rgba(16,185,129,0.25)', fontWeight: 600, flexShrink: 0 }}>
                🟢 Online
              </span>
            </div>

            {/* Message thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              {msgsLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: TEACHER_COLOR, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading conversation history…</p>
                </div>
              ) : msgsError ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 1.25rem', backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.65rem' }}>
                    <AlertCircle size={18} color="#ef4444" />
                    <p style={{ color: '#ef4444', margin: 0, fontSize: '0.875rem' }}>{msgsError}</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', padding: '2rem' }}>
                  <MessageSquare size={44} style={{ color: 'var(--text-secondary)', opacity: 0.25 }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>No messages exchanged yet</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '360px' }}>
                      Start a conversation with {activeTeacher.first_name} regarding {child.first_name}'s academic progress.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isMine      = msg.sender_id === parentId;
                    const showDivider = isDifferentDay(messages[idx - 1]?.created_at, msg.created_at);

                    return (
                      <React.Fragment key={msg.id}>
                        {showDivider && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0 0.75rem' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', padding: '0.2rem 0.65rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '1rem' }}>
                              {formatDateDivider(msg.created_at)}
                            </span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
                          </div>
                        )}
                        <ChatBubble message={msg} isMine={isMine} />
                      </React.Fragment>
                    );
                  })}
                  {/* Scroll anchor */}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Compose bar */}
            <div style={{ padding: '0.75rem 1rem 0.85rem', flexShrink: 0, backgroundColor: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid var(--border-color)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={`Type a message to ${activeTeacher.first_name}…`}
                    value={draft}
                    onChange={e => {
                      setDraft(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '1.25rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white', fontFamily: 'Outfit, sans-serif',
                      fontSize: '0.9rem', lineHeight: '1.4',
                      outline: 'none', resize: 'none',
                      transition: 'border-color 0.2s',
                      maxHeight: '120px', overflowY: 'auto',
                    }}
                    onFocus={e  => { e.target.style.borderColor = PARENT_COLOR; }}
                    onBlur={e   => { e.target.style.borderColor = 'var(--border-color)'; }}
                  />
                </div>

                {/* Touch-Friendly Send Button */}
                <button
                  type="submit"
                  disabled={!draft.trim() || sending || draft.length > 2000}
                  style={{
                    width: '44px', height: '44px',
                    borderRadius: '50%', border: 'none',
                    backgroundColor: draft.trim() && !sending ? PARENT_COLOR : 'rgba(255,255,255,0.1)',
                    color: draft.trim() && !sending ? 'white' : 'var(--text-secondary)',
                    cursor: draft.trim() && !sending ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', flexShrink: 0,
                    boxShadow: draft.trim() && !sending ? '0 4px 14px rgba(245,158,11,0.35)' : 'none'
                  }}
                  title="Send Message"
                >
                  <Send size={18} style={{ marginLeft: '2px' }} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
