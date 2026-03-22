import React, { useState, useEffect } from 'react';

const priorityConfig = {
  urgent:    { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: '🚨 Urgent',    icon: '🚨' },
  important: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: '⚠️ Important', icon: '⚠️' },
  normal:    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: '📢 Notice',    icon: '📢' },
};

function NoticeBoard({ isAdmin }) {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchNotices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotices(await res.json());
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, body, priority })
      });
      if (res.ok) {
        const newNotice = await res.json();
        setNotices(prev => [newNotice, ...prev]);
        setTitle(''); setBody(''); setPriority('normal'); setShowForm(false);
      }
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await fetch(`http://localhost:5000/api/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch (err) {}
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerIcon}>📋</span>
          <div>
            <div style={s.headerTitle}>Notice Board</div>
            <div style={s.headerSub}>{notices.length} active notice{notices.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        {isAdmin && (
          <button style={s.postBtn} onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Cancel' : '+ Post Notice'}
          </button>
        )}
      </div>

      {/* Post form */}
      {isAdmin && showForm && (
        <form onSubmit={handlePost} style={s.form}>
          <input
            style={s.input}
            placeholder="Notice title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            style={{ ...s.input, minHeight: '80px', resize: 'vertical' }}
            placeholder="Write your announcement here..."
            value={body}
            onChange={e => setBody(e.target.value)}
            required
          />
          <div style={s.formRow}>
            <select style={{ ...s.input, flex: 1 }} value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="normal">📢 Normal</option>
              <option value="important">⚠️ Important</option>
              <option value="urgent">🚨 Urgent</option>
            </select>
            <button type="submit" style={s.submitBtn}>Post Notice</button>
          </div>
        </form>
      )}

      {/* Notices list */}
      <div style={s.list}>
        {loading && <div style={s.empty}>Loading notices...</div>}
        {!loading && notices.length === 0 && (
          <div style={s.empty}>No notices yet{isAdmin ? ' — post one above' : ''}.</div>
        )}
        {notices.map(n => {
          const cfg = priorityConfig[n.priority] || priorityConfig.normal;
          return (
            <div key={n._id} style={{ ...s.card, background: cfg.bg, borderLeft: `4px solid ${cfg.color}`, border: `1px solid ${cfg.border}`, borderLeftWidth: '4px' }}>
              <div style={s.cardTop}>
                <span style={{ ...s.badge, background: cfg.color }}>{cfg.icon} {cfg.label}</span>
                <span style={s.date}>{new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {isAdmin && (
                  <button style={s.delBtn} onClick={() => handleDelete(n._id)} title="Delete notice">🗑️</button>
                )}
              </div>
              <div style={{ ...s.cardTitle, color: cfg.color }}>{n.title}</div>
              <div style={s.cardBody}>{n.body}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: { background: 'var(--bg-card, white)', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid var(--border-light, #f1f5f9)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border-light, #f1f5f9)', background: 'linear-gradient(135deg,#0f172a,#1e293b)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: { fontSize: '24px' },
  headerTitle: { fontSize: '15px', fontWeight: '700', color: 'white' },
  headerSub: { fontSize: '12px', color: 'var(--text-lighter, #94a3b8)', marginTop: '2px' },
  postBtn: { padding: '8px 16px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' },
  form: { padding: '16px 22px', borderBottom: '1px solid var(--border-light, #f1f5f9)', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-light, #f8fafc)' },
  formRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-color, #e2e8f0)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  submitBtn: { padding: '10px 20px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' },
  list: { padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' },
  empty: { textAlign: 'center', color: 'var(--text-lighter, #94a3b8)', padding: '24px', fontSize: '14px' },
  card: { borderRadius: '10px', padding: '14px 16px' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' },
  badge: { color: 'white', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  date: { fontSize: '11px', color: 'var(--text-lighter, #94a3b8)', marginLeft: 'auto' },
  delBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px 6px', borderRadius: '6px' },
  cardTitle: { fontWeight: '700', fontSize: '14px', marginBottom: '6px' },
  cardBody: { fontSize: '13px', color: 'var(--text-muted, #475569)', lineHeight: '1.6' },
};

export default NoticeBoard;
