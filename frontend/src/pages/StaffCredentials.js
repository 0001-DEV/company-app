import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

// ── Password gate modal ───────────────────────────────────────────────────────
const PasswordGate = ({ onSuccess, onCancel }) => {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const verify = async (e) => {
    e.preventDefault();
    if (!pw || checking) return;
    setChecking(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: pw })
      });
      if (res.ok) { onSuccess(); }
      else {
        setError('Incorrect password. Try again.');
        setPw('');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        inputRef.current?.focus();
      }
    } catch { setError('Connection error. Try again.'); }
    setChecking(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(12px)' }}>
      <style>{`
        @keyframes gateIn { from { opacity:0; transform:scale(0.88) translateY(24px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes floatLock { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .gate-shake { animation: shake 0.5s ease; }
        .gate-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        .gate-input::placeholder { color: #9ca3af; letter-spacing: normal; }
        .unlock-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(99,102,241,0.5) !important; }
        .unlock-btn:active:not(:disabled) { transform: translateY(0); }
        .back-btn:hover { color: #6366f1 !important; }
      `}</style>

      <div style={{ background: 'var(--bg-card, white)', borderRadius: '28px', width: '90%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)', animation: 'gateIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* Hero top */}
        <div style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)', padding: '40px 32px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'floatLock 3s ease-in-out infinite', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: 34 }}>🔐</span>
          </div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px', marginBottom: 6 }}>Secure Access</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13.5, lineHeight: 1.6 }}>Verify your identity to view<br />staff credentials</div>
        </div>

        {/* Form */}
        <form onSubmit={verify} style={{ padding: '32px 32px 28px', background: 'var(--bg-card, white)' }}>
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Admin Password</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e => { setPw(e.target.value); setError(''); }}
                placeholder="Enter your password"
                className={`gate-input${shake ? ' gate-shake' : ''}`}
                style={{ width: '100%', padding: '13px 48px 13px 16px', borderRadius: '12px', border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`, fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#f9fafb', transition: 'border-color 0.2s, box-shadow 0.2s', letterSpacing: showPw ? 'normal' : '3px' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, color: '#9ca3af', padding: 4, lineHeight: 1 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {error && (
              <div style={{ color: '#ef4444', fontSize: 12.5, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                <span>⚠️</span> {error}
              </div>
            )}
          </div>

          <button type="submit" disabled={checking || !pw} className="unlock-btn"
            style={{ width: '100%', padding: '14px', background: checking || !pw ? '#e5e7eb' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: checking || !pw ? '#9ca3af' : 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: 15, cursor: checking || !pw ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: checking || !pw ? 'none' : '0 4px 20px rgba(99,102,241,0.35)', letterSpacing: '0.2px' }}>
            {checking ? '⏳ Verifying...' : '🔓 Unlock Access'}
          </button>

          <button type="button" onClick={onCancel} className="back-btn"
            style={{ width: '100%', padding: '11px', background: 'none', color: '#9ca3af', border: 'none', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', marginTop: 10, borderRadius: 10, transition: 'color 0.2s' }}>
            ← Go back
          </button>
        </form>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
    padding: '14px 22px', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '14px',
    background: type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px'
  }}>
    {type === 'success' ? '✅' : '❌'} {message}
    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
  </div>
);

const EditModal = ({ staff, onClose, onSave }) => {
  const [email, setEmail] = useState(staff.email);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(staff._id, { email, password });
  };

  return (
    <div style={m.overlay}>
      <form onSubmit={handleSubmit} style={m.modal}>
        <div style={m.header}>
          <h2 style={m.title}>✏️ Edit Credentials</h2>
          <button type="button" onClick={onClose} style={m.closeBtn}>✕</button>
        </div>
        <div style={m.body}>
          <div style={m.staffInfo}>
            {staff.profilePicture && staff.profilePicture.trim() ? (
              <img 
                src={`${staff.profilePicture}?t=${Date.now()}`} 
                alt={staff.name} 
                style={{ ...m.staffAvatar, objectFit: 'cover' }} 
              />
            ) : (
              <div style={m.staffAvatar}>{staff.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}</div>
            )}
            <div>
              <div style={m.staffName}>{staff.name}</div>
              <div style={m.staffDept}>{staff.department?.name || 'No Department'}</div>
            </div>
          </div>
          <div style={m.field}>
            <label style={m.label}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={m.input} />
          </div>
          <div style={m.field}>
            <label style={m.label}>New Password <span style={{ color: 'var(--text-lighter, #94a3b8)', fontWeight: '400' }}>(leave blank to keep current)</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password..." style={m.input} autoComplete="new-password" />
          </div>
        </div>
        <div style={m.footer}>
          <button type="submit" style={m.saveBtn}>💾 Save Changes</button>
          <button type="button" onClick={onClose} style={m.cancelBtn}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

function StaffCredentials() {
  const [verified, setVerified] = useState(false);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (verified) fetchCredentials();
  }, [verified]);

  // Show gate until verified
  if (!verified) return <PasswordGate onSuccess={() => setVerified(true)} onCancel={() => navigate('/home')} />;

  const fetchCredentials = async () => {
    setLoading(true);
    setFetchError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setFetchError('Not logged in. Please log in as admin first.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/staff-credentials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      } else {
        const d = await res.json().catch(() => ({}));
        setFetchError(`Server error: ${d.message || res.status}`);
      }
    } catch (err) {
      setFetchError(`Connection error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleSave = async (id, data) => {
    const token = localStorage.getItem('token');
    try {
      const body = { email: data.email };
      if (data.password) body.password = data.password;

      const res = await fetch(`/api/admin/staff-credentials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setToast({ message: 'Credentials updated!', type: 'success' });
        setEditingStaff(null);
        fetchCredentials();
      } else {
        const d = await res.json();
        setToast({ message: d.message || 'Update failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error updating credentials', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete staff member "${name}"? This cannot be undone.`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/delete-staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStaff(prev => prev.filter(s => s._id !== id));
        setToast({ message: `${name} deleted.`, type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.department?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pagedStaff = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const avatarColors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899'];

  return (
    <div style={s.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {editingStaff && <EditModal staff={editingStaff} onClose={() => setEditingStaff(null)} onSave={handleSave} />}

      <TopBar title="🔒 Staff Credentials" subtitle="Manage login emails and passwords" backPath="/home" />

      {/* Stats bar */}
      <div style={s.statsBar}>
        <div style={s.statChip}>👥 Total Staff: <b>{staff.length}</b></div>
        <div style={s.statChip}>🔍 Showing: <b>{filtered.length}</b></div>
      </div>

      {/* Warning */}
      <div style={s.warningBox}>
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <span>This page contains sensitive login credentials. Keep this information confidential and only share passwords directly with the respective staff member.</span>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input type="text" placeholder="Search by name, email or department..."
            value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput} />
          {search && <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {loading ? (
        <div style={s.loading}><div style={s.spinner} /> Loading credentials...</div>
      ) : fetchError ? (
        <div style={{ margin: '32px', padding: '20px 24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '15px', fontWeight: '600' }}>
          ❌ {fetchError}
          <button onClick={fetchCredentials} style={{ marginLeft: 16, padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Retry</button>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>#</th>
                <th style={s.th}>Staff Member</th>
                <th style={s.th}>Department</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Password</th>
                <th style={s.th}>Joined</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedStaff.map((member, i) => {
                const color = avatarColors[i % avatarColors.length];
                const initials = member.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                return (
                  <tr key={member._id} style={{ ...s.tr, ...(i % 2 === 0 ? s.trEven : {}) }}>
                    <td style={s.td}><span style={s.rowNum}>{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</span></td>
                    <td style={s.td}>
                      <div style={s.staffCell}>
                        {member.profilePicture && member.profilePicture.trim() ? (
                          <img 
                            src={`${member.profilePicture}?t=${Date.now()}`} 
                            alt={member.name} 
                            style={{ ...s.avatar, objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ ...s.avatar, background: color }}>{initials}</div>
                        )}
                        <span style={s.staffName}>{member.name}</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.deptBadge, background: color + '22', color }}>{member.department?.name || '—'}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.emailText}>{member.email}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.passText}>••••••••</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.dateText}>{new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.editBtn} onClick={() => setEditingStaff(member)}>✏️ Edit</button>
                        <button style={s.delBtn} onClick={() => handleDelete(member._id, member.name)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-lighter, #94a3b8)' }}>No staff found</td></tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '20px 0', flexWrap: 'wrap' }}>
              <button style={{ ...s.pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }}
                onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  style={{ ...s.pageBtn, ...(p === currentPage ? s.pageBtnActive : {}) }}>{p}</button>
              ))}
              <button style={{ ...s.pageBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}
                onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Styles ── */
const s = {
  page: { minHeight: '100vh', background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  header: { background: 'linear-gradient(135deg,#0f172a,#1e40af)', color: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '28px', fontWeight: '800' },
  headerSub: { margin: '4px 0 0', opacity: 0.8, fontSize: '14px' },
  backBtn: { padding: '10px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  statsBar: { display: 'flex', gap: '12px', padding: '14px 32px', background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' },
  statChip: { background: 'var(--bg-card, white)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', color: 'var(--text-muted, #475569)', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  warningBox: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 32px 0', padding: '14px 18px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', color: '#92400e', fontSize: '14px' },
  toolbar: { display: 'flex', padding: '16px 32px', background: 'var(--bg-card, white)', borderBottom: '1px solid #e5e7eb', marginTop: '16px' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: '440px' },
  searchIcon: { position: 'absolute', left: '14px', fontSize: '15px' },
  searchInput: { width: '100%', padding: '10px 40px 10px 42px', borderRadius: '50px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', background: 'var(--bg-light, #f8fafc)', boxSizing: 'border-box' },
  clearBtn: { position: 'absolute', right: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '11px' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '60px', fontSize: '16px', color: 'var(--text-muted, #64748b)' },
  spinner: { width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  tableWrap: { padding: '24px 32px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card, white)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  thead: { background: 'linear-gradient(135deg,#0f172a,#1e293b)' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-lighter, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid var(--border-light, #f1f5f9)', transition: 'background 0.15s' },
  trEven: { background: 'var(--bg-light, #f8fafc)' },
  td: { padding: '14px 16px', fontSize: '14px', color: 'var(--text-main, #0f172a)', verticalAlign: 'middle' },
  rowNum: { width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted, #64748b)' },
  staffCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '13px', flexShrink: 0 },
  staffName: { fontWeight: '600', color: 'var(--text-main, #0f172a)' },
  deptBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  emailText: { color: '#2563eb', fontWeight: '500', fontSize: '13px' },
  passText: { fontSize: '13px', color: 'var(--text-muted, #64748b)', fontFamily: 'monospace', letterSpacing: '2px' },
  dateText: { fontSize: '12px', color: 'var(--text-lighter, #94a3b8)' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  editBtn: { padding: '7px 14px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', boxShadow: '0 4px 12px rgba(29,78,216,0.4)' },
  delBtn: { padding: '7px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(220,38,38,0.4)' },
  pageBtn: { padding: '8px 16px', background: 'var(--bg-card, white)', color: 'var(--text-muted, #475569)', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  pageBtnActive: { background: '#1d4ed8', color: 'white', border: '1px solid #1d4ed8' },
};

const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--bg-card, white)', borderRadius: '16px', width: '90%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' },
  header: { background: 'linear-gradient(135deg,#1e40af,#3b82f6)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, color: 'white', fontSize: '18px', fontWeight: '700' },
  closeBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  body: { padding: '24px' },
  staffInfo: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--bg-light, #f8fafc)', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-color, #e2e8f0)' },
  staffAvatar: { width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '16px', flexShrink: 0 },
  staffName: { fontWeight: '700', fontSize: '15px', color: 'var(--text-main, #0f172a)' },
  staffDept: { fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '2px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 24px 24px' },
  saveBtn: { padding: '10px 22px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' },
  cancelBtn: { padding: '10px 22px', background: '#f1f5f9', color: 'var(--text-muted, #475569)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
};

export default StaffCredentials;
