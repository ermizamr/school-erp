import { useState, useRef, useEffect } from 'react';
import { Search, Send, MessageSquare, Plus } from 'lucide-react';
import { MOCK_CONVERSATIONS } from './mock/studentMockData';

const AVATAR_COLORS = [
  '#10B981','#3b82f6','#a855f7','#f97316','#ef4444','#06b6d4','#eab308',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, size = 38 }) {
  const color = getAvatarColor(name);
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '33', border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontWeight: 700, fontSize: size * 0.36,
      color: color, letterSpacing: '0.5px',
    }}>{initials}</div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function StudentMessages() {
  const [conversations, setConversations] = useState(
    MOCK_CONVERSATIONS.map(c => ({ ...c, messages: [...c.messages] }))
  );
  const [activeCid, setActiveCid] = useState(null);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const activeConvo = conversations.find(c => c.id === activeCid) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages?.length]);

  const filteredConvos = conversations.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !activeCid) return;
    const msg = {
      id: Date.now(),
      sender: 'me',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setConversations(prev =>
      prev.map(c => c.id === activeCid
        ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastTime: 'Now' }
        : c
      )
    );
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="messages-container" style={{
      display: 'flex', height: 'calc(100vh - 56px)',
      background: 'var(--bg-color)', overflow: 'hidden',
    }}>
      {/* ─── Left: conversation list ─── */}
      <div className={`messages-left ${activeCid ? 'hidden-on-mobile' : ''}`} style={{
        width: 320, flexShrink: 0,
        borderRight: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-surface)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 18px 12px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MessageSquare size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Messages
            </span>
            <span style={{
              marginLeft: 'auto', background: 'var(--primary)',
              color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700,
              padding: '1px 8px',
            }}>
              {conversations.reduce((s, c) => s + (c.unread || 0), 0)}
            </span>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 12,
                paddingTop: 8, paddingBottom: 8,
                background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                borderRadius: 9, color: 'var(--text-primary)', fontSize: 12,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Convo list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvos.map(c => {
            const active = c.id === activeCid;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setActiveCid(c.id);
                  // Clear unread
                  setConversations(prev =>
                    prev.map(x => x.id === c.id ? { ...x, unread: 0 } : x)
                  );
                }}
                style={{
                  display: 'flex', gap: 10, padding: '12px 16px',
                  cursor: 'pointer', alignItems: 'flex-start',
                  borderBottom: '1px solid var(--border-color)',
                  borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                  background: active ? 'rgba(16,185,129,0.06)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Avatar name={c.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mobile-wrap"  style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: 2,
                  }}>
                    <span style={{
                      fontWeight: c.unread ? 700 : 600,
                      fontSize: 13, color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxWidth: 130,
                    }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {c.lastTime}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-secondary)',
                    marginBottom: 3,
                  }}>{c.role}</div>
                  <div className="mobile-wrap"  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: 12, color: c.unread ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: c.unread ? 600 : 400,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxWidth: 150,
                    }}>{c.lastMessage}</span>
                    {c.unread > 0 && (
                      <span style={{
                        background: 'var(--primary)', color: '#fff',
                        borderRadius: 20, fontSize: 10, fontWeight: 700,
                        padding: '0 6px', minWidth: 18, textAlign: 'center', lineHeight: '18px',
                      }}>{c.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Right: message thread ─── */}
      {!activeConvo ? (
        <div className={`messages-right ${!activeCid ? 'hidden-on-mobile' : ''}`} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, color: 'var(--text-secondary)',
        }}>
          <MessageSquare size={56} style={{ opacity: 0.18 }} />
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
            Select a conversation
          </div>
          <div style={{ fontSize: 13 }}>
            Choose a conversation from the left to start messaging
          </div>
        </div>
      ) : (
        <div className={`messages-right ${!activeCid ? 'hidden-on-mobile' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Thread header */}
          <div className="mobile-wrap"  style={{
            padding: '14px 24px', borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-surface)',
          }}>
            <button
              className="mobile-back-btn"
              onClick={() => setActiveCid(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', display: 'none',
                padding: '4px', marginRight: '4px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <Avatar name={activeConvo.name} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                {activeConvo.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {activeConvo.role}
              </div>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: 'var(--primary)', border: 'none',
              color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
            }}>
              <Plus size={13} /> New Message
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {activeConvo.messages.map((msg, i) => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id || i} style={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end', gap: 8,
                }}>
                  {!isMe && <Avatar name={activeConvo.name} size={30} />}
                  <div style={{
                    maxWidth: '62%',
                    background: isMe ? 'var(--primary)' : 'var(--bg-surface)',
                    color: isMe ? '#fff' : 'var(--text-primary)',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    border: isMe ? 'none' : '1px solid var(--border-color)',
                  }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{msg.content}</div>
                    <div style={{
                      fontSize: 10, marginTop: 4, opacity: 0.65,
                      textAlign: isMe ? 'right' : 'left',
                    }}>{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)', display: 'flex', gap: 10, alignItems: 'flex-end',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              style={{
                flex: 1, resize: 'none', background: 'var(--bg-color)',
                border: '1px solid var(--border-color)', borderRadius: 10,
                padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13,
                outline: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                fontFamily: 'inherit',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: input.trim() ? 'var(--primary)' : 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                color: input.trim() ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
