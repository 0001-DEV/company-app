import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const avatarColors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316'];
const deptIcons   = ['🏢','💼','🔬','🎨','⚙️','📊','🚀','🌐','🏗️','📡'];

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const StatCard = ({ icon, value, label, color }) => (
  <div style={{ ...S.statCard, borderTop: `3px solid ${color}` }}>
    <div style={{ ...S.statIcon, background: color + '18', color }}>{icon}</div>
    <div>
      <div style={S.statVal}>{value}</div>
      <div style={S.statLbl}>{label}</div>
    </div>
  </div>
);

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState(null);
  const [staff, setStaff] = useState([]);
  const [allDepts, setAllDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        const [deptRes, staffRes, allDeptsRes] = await Promise.all([
          fetch(`/api/admin/departments`, { headers }),
          fetch(`/api/admin/all-staff`, { headers }),
          fetch(`/api/admin/departments`, { headers }),
        ]);
        const depts = deptRes.ok ? await deptRes.json() : [];
        const allStaff = staffRes.ok ? await staffRes.json() : [];
        const found = depts.find(d => d._id === id);
        setDept(found || null);
        setAllDepts(depts);
        // Filter staff belonging to this department
        setStaff(allStaff.filter(s => {
          const dId = s.department?._id || s.department;
          return dId === id;
        }));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [id]);

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const deptIndex = allDepts.findIndex(d => d._id === id);
  const color = avatarColors[deptIndex % avatarColors.length] || '#3b82f6';
  const icon  = deptIcons[deptIndex % deptIcons.length] || '🏢';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main, #f0f4f8)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: `4px solid ${color}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-muted, #64748b)' }}>Loading department...</p>
      </div>
    </div>
  );

  if (!dept) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main, #f0f4f8)' }}>
      <TopBar title="Department Not Found" backPath="/department" backLabel="← Departments" />
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏢</div>
        <p>This department could not be found.</p>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <TopBar
        title={dept.name}
        subtitle={`Departments / ${dept.name}`}
        backPath="/department"
        backLabel="← Departments"
        actions={[{ label: '👥 All Staff', onClick: () => navigate('/all-staff') }]}
      />

      <div style={S.content}>

        {/* Department Hero */}
        <div style={{ ...S.hero, background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
          <div style={S.heroLeft}>
            <div style={S.heroIconWrap}>{icon}</div>
            <div>
              <div style={S.heroName}>{dept.name}</div>
              <div style={S.heroSub}>Department · {staff.length} staff member{staff.length !== 1 ? 's' : ''}</div>
              {dept.description && (
                <div style={S.heroDesc}>{dept.description}</div>
              )}
            </div>
          </div>
          <div style={S.heroBadge}>Active</div>
        </div>

        {/* Stats row */}
        <div style={S.statsRow}>
          <StatCard icon="👥" value={staff.length} label="Total Staff" color={color} />
          <StatCard icon="📋" value={staff.reduce((a, s) => a + (s.assignedJobs?.length || 0), 0)} label="Assigned Jobs" color="#10b981" />
          <StatCard icon="📁" value={staff.reduce((a, s) => a + (s.uploadedFiles?.length || 0), 0)} label="Files Uploaded" color="#f59e0b" />
          <StatCard icon="🔑" value={staff.filter(s => s.canViewOthersWork).length} label="With View Permission" color="#8b5cf6" />
        </div>

        {/* Staff section */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionTitle}>Staff Members</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={S.searchInput}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>👥</div>
              <div style={{ color: 'var(--text-muted, #64748b)', fontSize: 15 }}>
                {staff.length === 0 ? 'No staff assigned to this department yet.' : 'No staff match your search.'}
              </div>
            </div>
          ) : (
            <div style={S.staffGrid}>
              {filtered.map((member, i) => {
                const c = avatarColors[i % avatarColors.length];
                return (
                  <div key={member._id} style={S.staffCard}
                    onClick={() => navigate(`/admin/staff/${member._id}`)}
                  >
                    {member.profilePicture && member.profilePicture.trim() ? (
                      <img 
                        src={`${member.profilePicture}?t=${Date.now()}`} 
                        alt={member.name} 
                        style={{ ...S.staffAvatar, objectFit: 'cover', border: `2px solid ${c}` }} 
                      />
                    ) : (
                      <div style={{ ...S.staffAvatar, background: c }}>{getInitials(member.name)}</div>
                    )}
                    <div style={S.staffName}>{member.name}</div>
                    <div style={S.staffEmail}>{member.email}</div>
                    <div style={S.staffMeta}>
                      <span style={{ ...S.metaChip, background: c + '18', color: c }}>
                        📋 {member.assignedJobs?.length || 0} jobs
                      </span>
                      {member.canViewOthersWork && (
                        <span style={{ ...S.metaChip, background: '#8b5cf618', color: '#8b5cf6' }}>🔑 View access</span>
                      )}
                    </div>
                    <div style={S.viewHint}>View Profile →</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  content: { padding: '24px 32px', maxWidth: 1200, margin: '0 auto' },

  hero: { borderRadius: 18, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
  heroLeft: { display: 'flex', alignItems: 'center', gap: 20 },
  heroIconWrap: { width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, backdropFilter: 'blur(4px)' },
  heroName: { color: 'white', fontWeight: 800, fontSize: 26, marginBottom: 4 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 8, maxWidth: 480, lineHeight: 1.6 },
  heroBadge: { background: 'rgba(255,255,255,0.25)', color: 'white', padding: '6px 18px', borderRadius: 20, fontWeight: 700, fontSize: 13, backdropFilter: 'blur(4px)' },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 },
  statCard: { background: 'var(--bg-card, white)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  statVal: { fontSize: 24, fontWeight: 800, color: 'var(--text-main, #0f172a)' },
  statLbl: { fontSize: 12, color: 'var(--text-muted, #64748b)', marginTop: 2 },

  section: { background: 'var(--bg-card, white)', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-light, #f1f5f9)' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-main, #0f172a)' },
  searchInput: { padding: '9px 14px 9px 36px', borderRadius: 50, border: '2px solid #e5e7eb', fontSize: 13, outline: 'none', background: 'var(--bg-light, #f8fafc)', width: 220 },

  empty: { padding: '60px 20px', textAlign: 'center' },

  staffGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, padding: 20 },
  staffCard: { background: 'var(--bg-light, #f8fafc)', borderRadius: 14, padding: '20px 16px', textAlign: 'center', border: '1px solid var(--border-light, #f1f5f9)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' },
  staffAvatar: { width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, margin: '0 auto 12px' },
  staffName: { fontWeight: 700, fontSize: 14, color: 'var(--text-main, #0f172a)', marginBottom: 4 },
  staffEmail: { fontSize: 11, color: 'var(--text-muted, #64748b)', marginBottom: 10, wordBreak: 'break-all' },
  staffMeta: { display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 },
  metaChip: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  viewHint: { fontSize: 11, color: '#3b82f6', fontWeight: 600 },
};
