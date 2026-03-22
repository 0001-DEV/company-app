import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const ManagePermissions = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/admin-login'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/admin/staff-with-permissions', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStaff(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const togglePermission = async (staffId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/toggle-view-permission/${staffId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setToast({ message: data.message, type: 'success' });
        setStaff(prev => prev.map(s => s._id === staffId ? { ...s, canViewOthersWork: !s.canViewOthersWork } : s));
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) { setToast({ message: 'Error updating permission', type: 'error' }); }
  };

  const granted = staff.filter(s => s.canViewOthersWork).length;

  return (
    <div style={s.page}>
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <TopBar
        title="🔑 Manage Permissions"
        subtitle="Control staff access to others' uploaded work"
        backPath="/home"
      />

      {/* Stats bar */}
      <div style={s.statsBar}>
        <div style={s.statChip}>👥 Total Staff: <b>{staff.length}</b></div>
        <div style={{ ...s.statChip, color: '#16a34a' }}>✅ Access Granted: <b>{granted}</b></div>
        <div style={{ ...s.statChip, color: '#dc2626' }}>🚫 No Access: <b>{staff.length - granted}</b></div>
      </div>

      {/* Info */}
      <div style={s.infoBox}>
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <span>Toggle the switch on each staff card to grant or revoke their ability to view other staff members' uploaded work files.</span>
      </div>

      {loading ? (
        <div style={s.loading}><div style={s.spinner} /> Loading staff...</div>
      ) : (
        <div style={s.grid} className="info-grid-3">
          {staff.map((member, i) => {
            const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899'];
            const color = colors[i % colors.length];
            const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div key={member._id} style={{ ...s.card, borderTop: `4px solid ${color}` }}>
                <div style={s.cardTop}>
                  <div style={{ ...s.avatar, background: color }}>{initials}</div>
                  <div style={s.cardInfo}>
                    <div style={s.cardName}>{member.name}</div>
                    <div style={s.cardEmail}>{member.email}</div>
                    <div style={{ ...s.deptBadge, background: color + '22', color }}>{member.department?.name || 'No Dept'}</div>
                  </div>
                </div>
                <div style={s.cardBottom}>
                  <div style={{ ...s.permStatus, color: member.canViewOthersWork ? '#16a34a' : '#94a3b8' }}>
                    {member.canViewOthersWork ? '✅ Can view others\' work' : '🚫 No access to others\' work'}
                  </div>
                  <label style={s.toggle}>
                    <input type="checkbox" checked={member.canViewOthersWork} onChange={() => togglePermission(member._id)} style={{ display: 'none' }} />
                    <div style={{ ...s.toggleTrack, background: member.canViewOthersWork ? '#10b981' : '#e2e8f0' }}>
                      <div style={{ ...s.toggleThumb, transform: member.canViewOthersWork ? 'translateX(22px)' : 'translateX(2px)' }} />
                    </div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  toast: { position: 'fixed', top: '20px', right: '20px', zIndex: 9999, padding: '14px 22px', borderRadius: '10px', color: 'white', fontWeight: '600', fontSize: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' },
  header: { background: 'linear-gradient(135deg,#0f172a,#1e40af)', color: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '28px', fontWeight: '800' },
  headerSub: { margin: '4px 0 0', opacity: 0.8, fontSize: '14px' },
  backBtn: { padding: '10px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  statsBar: { display: 'flex', gap: '12px', padding: '14px 32px', background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' },
  statChip: { background: 'var(--bg-card, white)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', color: 'var(--text-muted, #475569)', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  infoBox: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 32px', padding: '14px 18px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '14px' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '60px', fontSize: '16px', color: 'var(--text-muted, #64748b)' },
  spinner: { width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px', padding: '24px 32px' },
  card: { background: 'var(--bg-card, white)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 20px 14px' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px', flexShrink: 0 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontWeight: '700', fontSize: '15px', color: 'var(--text-main, #0f172a)', marginBottom: '2px' },
  cardEmail: { fontSize: '12px', color: 'var(--text-muted, #64748b)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  deptBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f1f5f9', background: 'var(--bg-light, #f8fafc)' },
  permStatus: { fontSize: '13px', fontWeight: '600' },
  toggle: { cursor: 'pointer' },
  toggleTrack: { width: '46px', height: '24px', borderRadius: '12px', position: 'relative', transition: 'background 0.3s' },
  toggleThumb: { position: 'absolute', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-card, white)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'transform 0.3s' },
};

export default ManagePermissions;
