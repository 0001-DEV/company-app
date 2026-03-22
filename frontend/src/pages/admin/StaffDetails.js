import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';

const avatarColors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316'];

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const fileIcon = (name = '') => {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️';
  if (ext === 'pdf') return '📕';
  if (['doc','docx'].includes(ext)) return '📝';
  if (['xls','xlsx'].includes(ext)) return '📊';
  if (['mp4','mov','avi'].includes(ext)) return '🎬';
  return '📄';
};

const InfoRow = ({ icon, label, value }) => (
  <div style={S.infoRow}>
    <span style={S.infoIcon}>{icon}</span>
    <div>
      <div style={S.infoLabel}>{label}</div>
      <div style={S.infoValue}>{value || '—'}</div>
    </div>
  </div>
);

const StatCard = ({ icon, value, label, color }) => (
  <div style={{ ...S.statCard, borderTop: `3px solid ${color}` }}>
    <div style={{ ...S.statIcon, background: color + '18', color }}>{icon}</div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStaff = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/admin/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch staff');
        const data = await res.json();
        setStaff(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main, #f0f4f8)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-muted, #64748b)' }}>Loading profile...</p>
      </div>
    </div>
  );

  if (error || !staff) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main, #f0f4f8)' }}>
      <TopBar title="Staff Not Found" backPath="/department" backLabel="← Departments" />
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>👤</div>
        <p>{error || 'Staff member could not be found.'}</p>
      </div>
    </div>
  );

  const color = getAvatarColor(staff.name);
  const initials = getInitials(staff.name);
  const joinDate = staff.createdAt ? new Date(staff.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const birthday = staff.birthday ? staff.birthday.split('T')[0] : null;
  const birthdayFormatted = birthday ? new Date(birthday + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  const tabs = [
    { id: 'overview', label: '👤 Overview' },
    { id: 'files', label: `📁 Files (${staff.uploadedFiles?.length || 0})` },
  ];

  return (
    <div style={S.page}>
      <TopBar
        title={staff.name}
        subtitle={`${staff.department?.name || 'No Department'} · Staff Profile`}
        backPath={`/department/${staff.department?._id}`}
        backLabel="← Department"
        actions={[{ label: '🏢 All Departments', onClick: () => navigate('/department') }]}
      />

      <div style={S.content}>

        {/* ── Hero Card ── */}
        <div style={{ ...S.hero, background: `linear-gradient(135deg, ${color}ee 0%, ${color}99 100%)` }}>
          <div style={S.heroLeft}>
            <div style={{ ...S.avatar, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', border: '3px solid rgba(255,255,255,0.5)', overflow: 'hidden' }}>
              {staff.profilePicture ? (
                <img src={staff.profilePicture} alt={staff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : initials}
            </div>
            <div>
              <div style={S.heroName}>{staff.name}</div>
              <div style={S.heroDept}>{staff.department?.name || 'No Department'}</div>
              <div style={S.heroRole}>
                <span style={S.roleBadge}>{staff.role === 'admin' ? '🛡️ Admin' : '👤 Staff'}</span>
                {staff.canViewOthersWork && <span style={S.permBadge}>🔑 View Access</span>}
              </div>
            </div>
          </div>
          <div style={S.heroRight}>
            <div style={S.joinedBadge}>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Member since</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{joinDate}</div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={S.statsRow}>
          <StatCard icon="📁" value={staff.uploadedFiles?.length || 0} label="Files Uploaded" color={color} />
          <StatCard icon="📋" value={staff.assignedJobs?.length || 0} label="Assigned Jobs" color="#10b981" />
          <StatCard icon="💬" value={staff.uploadedFiles?.filter(f => f.comment).length || 0} label="Files with Comments" color="#f59e0b" />
          <StatCard icon="🗑️" value={staff.recycleBin?.length || 0} label="In Recycle Bin" color="#94a3b8" />
        </div>

        {/* ── Tabs ── */}
        <div style={S.tabBar}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ ...S.tab, ...(activeTab === t.id ? { ...S.tabActive, borderBottom: `3px solid ${color}`, color } : {}) }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div style={S.twoCol}>
            {/* Personal Info */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={{ ...S.cardHeaderDot, background: color }} />
                Personal Information
              </div>
              <div style={S.cardBody}>
                <InfoRow icon="👤" label="Full Name" value={staff.name} />
                <InfoRow icon="📧" label="Email Address" value={staff.email} />
                <InfoRow icon="🎂" label="Birthday" value={birthdayFormatted} />
                <InfoRow icon="📅" label="Date Joined" value={joinDate} />
              </div>
            </div>

            {/* Work Info */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={{ ...S.cardHeaderDot, background: '#10b981' }} />
                Work Information
              </div>
              <div style={S.cardBody}>
                <InfoRow icon="🏢" label="Department" value={staff.department?.name} />
                <InfoRow icon="🎭" label="Role" value={staff.role?.charAt(0).toUpperCase() + staff.role?.slice(1)} />
                <InfoRow icon="🔑" label="View Others' Work" value={staff.canViewOthersWork ? 'Permitted' : 'Not permitted'} />
                <InfoRow icon="📋" label="Assigned Jobs" value={`${staff.assignedJobs?.length || 0} job(s)`} />
              </div>
            </div>
          </div>
        )}

        {/* ── Files Tab ── */}
        {activeTab === 'files' && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <span style={{ ...S.cardHeaderDot, background: '#f59e0b' }} />
              Uploaded Files
            </div>
            {!staff.uploadedFiles?.length ? (
              <div style={S.empty}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📂</div>
                <div style={{ color: 'var(--text-muted, #64748b)' }}>No files uploaded yet</div>
              </div>
            ) : (
              <div style={S.filesGrid}>
                {staff.uploadedFiles.map((file, i) => {
                  const name = file.originalName || file.path?.split('/').pop() || 'File';
                  const icon = fileIcon(name);
                  const date = new Date(file.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  return (
                    <a key={i} href={`http://localhost:5000/${file.path}`} target="_blank" rel="noopener noreferrer" style={S.fileCard}>
                      <div style={S.fileIconWrap}>{icon}</div>
                      <div style={S.fileName}>{name.length > 26 ? name.substring(0, 26) + '…' : name}</div>
                      <div style={S.fileDate}>{date}</div>
                      {file.comment && <div style={S.fileComment}>💬 {file.comment}</div>}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

const S = {
  page: { minHeight: '100vh', background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  content: { padding: '24px 32px', maxWidth: 1100, margin: '0 auto' },

  /* Hero */
  hero: { borderRadius: 20, padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', flexWrap: 'wrap', gap: 20 },
  heroLeft: { display: 'flex', alignItems: 'center', gap: 24 },
  avatar: { width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white', flexShrink: 0 },
  heroName: { color: 'white', fontWeight: 800, fontSize: 26, marginBottom: 4 },
  heroDept: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 10 },
  heroRole: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  roleBadge: { background: 'rgba(255,255,255,0.25)', color: 'white', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, backdropFilter: 'blur(4px)' },
  permBadge: { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, backdropFilter: 'blur(4px)' },
  heroRight: {},
  joinedBadge: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '12px 20px', borderRadius: 14, color: 'white', textAlign: 'center' },

  /* Stats */
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: 'var(--bg-card, white)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },

  /* Tabs */
  tabBar: { display: 'flex', gap: 4, background: 'var(--bg-card, white)', borderRadius: '14px 14px 0 0', padding: '0 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: 2, borderBottom: '1px solid var(--border-light, #f1f5f9)' },
  tab: { padding: '14px 20px', border: 'none', borderBottom: '3px solid transparent', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted, #64748b)', transition: 'all 0.2s' },
  tabActive: { background: 'none' },

  /* Cards */
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: 'var(--bg-card, white)', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 20 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderBottom: '1px solid var(--border-light, #f1f5f9)', fontSize: 14, fontWeight: 700, color: 'var(--text-main, #0f172a)' },
  cardHeaderDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  cardBody: { padding: '8px 0' },

  /* Info rows */
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 24px', borderBottom: '1px solid #f8fafc' },
  infoIcon: { fontSize: 18, marginTop: 2, flexShrink: 0 },
  infoLabel: { fontSize: 11, color: 'var(--text-lighter, #94a3b8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 },
  infoValue: { fontSize: 14, color: 'var(--text-main, #0f172a)', fontWeight: 500 },

  /* Files */
  filesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, padding: 20 },
  fileCard: { background: 'var(--bg-light, #f8fafc)', borderRadius: 14, padding: '18px 14px', textAlign: 'center', border: '1px solid var(--border-light, #f1f5f9)', textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s', display: 'block' },
  fileIconWrap: { fontSize: 40, marginBottom: 10 },
  fileName: { fontSize: 12, fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: 6, wordBreak: 'break-word' },
  fileDate: { fontSize: 11, color: 'var(--text-lighter, #94a3b8)', marginBottom: 6 },
  fileComment: { fontSize: 11, color: 'var(--text-muted, #64748b)', background: '#f1f5f9', borderRadius: 8, padding: '4px 8px', marginTop: 6 },

  empty: { padding: '50px 20px', textAlign: 'center' },
};

export default StaffDetails;
