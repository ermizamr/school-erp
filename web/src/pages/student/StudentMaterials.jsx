import { useState, useMemo } from 'react';
import {
  FileText, Play, Image, Search, Download, Eye,
  BookOpen, Filter, X, Presentation, FolderOpen
} from 'lucide-react';
import { MOCK_MATERIALS } from './mock/studentMockData';

const TYPE_CONFIG = {
  PDF: {
    icon: FileText,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    label: 'PDF',
  },
  Video: {
    icon: Play,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    label: 'Video',
  },
  Presentation: {
    icon: Presentation,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    label: 'Presentation',
  },
  Image: {
    icon: Image,
    color: '#eab308',
    bg: 'rgba(234,179,8,0.12)',
    label: 'Image',
  },
};

const SUBJECT_COLORS = [
  '#10B981','#3b82f6','#a855f7','#f97316','#ef4444','#06b6d4','#eab308','#ec4899',
];

function getSubjectColor(subject) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

function StatChip({ label, count, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: 10, padding: '8px 16px',
    }}>
      <span style={{
        width: 10, height: 10, borderRadius: '50%',
        background: color, flexShrink: 0,
      }} />
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15, marginLeft: 4 }}>{count}</span>
    </div>
  );
}

function ResourceCard({ material }) {
  const cfg = TYPE_CONFIG[material.type] || TYPE_CONFIG.PDF;
  const Icon = cfg.icon;
  const subjColor = getSubjectColor(material.subject);

  return (
    <div className="glass-card" style={{
      display: 'flex', flexDirection: 'column', gap: 0,
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--border-color)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.13)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Top banner */}
      <div className="mobile-wrap"  style={{
        background: cfg.bg, padding: '20px 20px 14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: cfg.color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} color={cfg.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 14, color: 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{material.title}</div>
          <span style={{
            display: 'inline-block', marginTop: 4,
            background: cfg.color + '22', color: cfg.color,
            borderRadius: 6, padding: '1px 8px', fontSize: 11, fontWeight: 600,
          }}>{cfg.label}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Subject */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: subjColor, flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: subjColor, fontWeight: 600 }}>{material.subject}</span>
        </div>

        {/* Teacher */}
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          👤 {material.teacher}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
          <span>📁 {material.size}</span>
          <span>•</span>
          <span>{material.uploadDate}</span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 12, color: 'var(--text-secondary)', margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          lineHeight: 1.5,
        }}>{material.description}</p>
      </div>

      {/* Actions */}
      <div style={{
        padding: '12px 20px', borderTop: '1px solid var(--border-color)',
        display: 'flex', gap: 8,
      }}>
        <button style={{
          flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
          background: 'var(--primary)', color: '#fff',
          fontWeight: 600, fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Download size={13} /> Download
        </button>
        <button style={{
          flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #3b82f6',
          background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
          fontWeight: 600, fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Eye size={13} /> Preview
        </button>
      </div>
    </div>
  );
}

export default function StudentMaterials() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const subjects = useMemo(() => {
    const s = new Set(MOCK_MATERIALS.map(m => m.subject));
    return ['All', ...Array.from(s)];
  }, []);

  const types = ['All', 'PDF', 'Video', 'Presentation', 'Image'];

  const filtered = useMemo(() => {
    return MOCK_MATERIALS.filter(m => {
      const matchSearch = !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.teacher.toLowerCase().includes(search.toLowerCase());
      const matchSubject = subjectFilter === 'All' || m.subject === subjectFilter;
      const matchType = typeFilter === 'All' || m.type === typeFilter;
      return matchSearch && matchSubject && matchType;
    });
  }, [search, subjectFilter, typeFilter]);

  const counts = useMemo(() => {
    const c = { PDF: 0, Video: 0, Presentation: 0, Image: 0 };
    MOCK_MATERIALS.forEach(m => { if (c[m.type] !== undefined) c[m.type]++; });
    return c;
  }, []);

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <BookOpen size={22} color="var(--primary)" />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Learning Materials
          </h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
          Access and download your course resources
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        <StatChip label="Total" count={MOCK_MATERIALS.length} color="var(--primary)" />
        <StatChip label="PDF" count={counts.PDF} color={TYPE_CONFIG.PDF.color} />
        <StatChip label="Video" count={counts.Video} color={TYPE_CONFIG.Video.color} />
        <StatChip label="Presentation" count={counts.Presentation} color={TYPE_CONFIG.Presentation.color} />
        <StatChip label="Image" count={counts.Image} color={TYPE_CONFIG.Image.color} />
      </div>

      {/* Search & Filters */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28,
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search materials…"
            style={{
              width: '100%', paddingLeft: 36, paddingRight: search ? 32 : 12,
              paddingTop: 9, paddingBottom: 9,
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 10, color: 'var(--text-primary)', fontSize: 13,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              color: 'var(--text-secondary)',
            }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Subject filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="var(--text-secondary)" />
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 10, padding: '9px 12px', color: 'var(--text-primary)',
              fontSize: 13, cursor: 'pointer', outline: 'none',
            }}
          >
            {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
          </select>
        </div>

        {/* Type tabs */}
        <div style={{
          display: 'flex', gap: 6, background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)', borderRadius: 10, padding: 4,
        }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: typeFilter === t ? 'var(--primary)' : 'transparent',
              color: typeFilter === t ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{MOCK_MATERIALS.length}</strong> materials
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          color: 'var(--text-secondary)',
        }}>
          <FolderOpen size={52} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
            No materials found
          </div>
          <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
          <button onClick={() => { setSearch(''); setSubjectFilter('All'); setTypeFilter('All'); }}
            style={{
              marginTop: 16, padding: '8px 20px', borderRadius: 8,
              background: 'var(--primary)', border: 'none', color: '#fff',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {filtered.map(m => <ResourceCard key={m.id} material={m} />)}
        </div>
      )}
    </div>
  );
}
