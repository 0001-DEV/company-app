import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DepartmentDetail = () => {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [members, setMembers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedStaffToAdd, setSelectedStaffToAdd] = useState('');
  const [onlyAdminsCanSend, setOnlyAdminsCanSend] = useState(false);
  const [disappearAfterDays, setDisappearAfterDays] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [deptId]);

  const fetchDepartmentData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [deptRes, staffRes] = await Promise.all([
        fetch(`/api/admin/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/all-staff`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const depts = await deptRes.json();
      const dept = depts.find(d => d._id === deptId);
      setDepartment(dept);

      if (staffRes.ok) {
        const staff = await staffRes.json();
        setAllStaff(staff);
        
        // Get department members
        if (dept?.members) {
          const deptMembers = staff.filter(s => dept.members.includes(s._id));
          setMembers(deptMembers);
        }

        // Get department admins
        if (dept?.groupAdmins) {
          const deptAdmins = staff.filter(s => dept.groupAdmins.includes(s._id));
          setAdmins(deptAdmins);
        }

        setOnlyAdminsCanSend(dept?.onlyAdminsCanSend || false);
        setDisappearAfterDays(dept?.disappearAfterDays || 0);
      }
    } catch (err) {
      showToast('Failed to load department', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedStaffToAdd) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/department/${deptId}/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staffId: selectedStaffToAdd })
      });
      if (!res.ok) throw new Error('Failed to add member');
      showToast('Member added!');
      setShowAddMemberModal(false);
      setSelectedStaffToAdd('');
      fetchDepartmentData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveMember = async (staffId) => {
    if (!window.confirm('Remove this member from the department?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/department/${deptId}/remove-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staffId })
      });
      if (!res.ok) throw new Error('Failed to remove member');
      showToast('Member removed!');
      fetchDepartmentData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMakeAdmin = async (staffId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/department/${deptId}/make-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staffId })
      });
      if (!res.ok) throw new Error('Failed to make admin');
      showToast('Member promoted to admin!');
      fetchDepartmentData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveAdmin = async (staffId) => {
    if (!window.confirm('Remove admin role from this member?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/department/${deptId}/remove-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staffId })
      });
      if (!res.ok) throw new Error('Failed to remove admin');
      showToast('Admin role removed!');
      fetchDepartmentData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateSettings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/department/${deptId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ onlyAdminsCanSend, disappearAfterDays })
      });
      if (!res.ok) throw new Error('Failed to update settings');
      showToast('Settings updated!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div style={s.page}><div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>Loading...</div></div>;
  }

  if (!department) {
    return <div style={s.page}><div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>Department not found</div></div>;
  }

  const availableStaff = allStaff.filter(s => !members.some(m => m._id === s._id));

  return (
    <div style={s.page}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .toast { animation: slideIn 0.25s ease; }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
          .member-card { padding: 12px !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, padding:'12px 20px', borderRadius:10,
          background: toast.type==='success' ? '#0f172a' : '#dc2626',
          color:'white', boxShadow:'0 8px 28px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', gap:10,
          fontWeight:600, fontSize:14 }} className="toast">
          {toast.type==='success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* Topbar */}
      <div style={s.topbar}>
        <div style={s.topbarInner}>
          <button onClick={() => navigate('/department')} style={s.backBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div>
            <div style={s.topbarTitle}>{department.name}</div>
            <div style={s.topbarSub}>{members.length} members · {admins.length} admins</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        
        {/* Department Info */}
        <div style={s.infoCard}>
          <div style={s.infoTitle}>Department Information</div>
          <div style={s.infoDesc}>{department.description || 'No description'}</div>
        </div>

        {/* Settings */}
        <div style={s.section}>
          <div style={s.sectionTitle}>⚙️ Department Settings</div>
          <div style={s.settingsGrid}>
            <div style={s.settingItem}>
              <label style={s.settingLabel}>
                <input type="checkbox" checked={onlyAdminsCanSend} onChange={e => setOnlyAdminsCanSend(e.target.checked)} style={{ marginRight: 8 }} />
                Only admins can send messages
              </label>
              <div style={s.settingDesc}>Restrict message sending to department admins only</div>
            </div>
            <div style={s.settingItem}>
              <label style={s.settingLabel}>Messages disappear after (days)</label>
              <input type="number" min="0" value={disappearAfterDays} onChange={e => setDisappearAfterDays(parseInt(e.target.value) || 0)} style={s.settingInput} placeholder="0 = never" />
              <div style={s.settingDesc}>Set to 0 to disable auto-delete</div>
            </div>
          </div>
          <button onClick={handleUpdateSettings} style={s.saveBtn}>Save Settings</button>
        </div>

        {/* Admins Section */}
        <div style={s.section}>
          <div style={s.sectionTitle}>👑 Department Admins ({admins.length})</div>
          {admins.length === 0 ? (
            <div style={s.empty}>No admins yet. Promote members to admin to manage the department.</div>
          ) : (
            <div style={s.membersList}>
              {admins.map(admin => (
                <div key={admin._id} style={s.memberCard}>
                  <div style={s.memberInfo}>
                    <div style={s.memberAvatar}>👑</div>
                    <div>
                      <div style={s.memberName}>{admin.name}</div>
                      <div style={s.memberRole}>Department Admin</div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveAdmin(admin._id)} style={s.removeAdminBtn}>Remove Admin</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members Section */}
        <div style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={s.sectionTitle}>👥 Department Members ({members.length})</div>
            <button onClick={() => setShowAddMemberModal(true)} style={s.addMemberBtn}>+ Add Member</button>
          </div>
          {members.length === 0 ? (
            <div style={s.empty}>No members in this department yet.</div>
          ) : (
            <div style={s.membersList}>
              {members.map(member => {
                const isAdmin = admins.some(a => a._id === member._id);
                return (
                  <div key={member._id} style={s.memberCard} className="member-card">
                    <div style={s.memberInfo}>
                      <div style={s.memberAvatar}>{member.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={s.memberName}>{member.name}</div>
                        <div style={s.memberRole}>{isAdmin ? '👑 Admin' : 'Member'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!isAdmin ? (
                        <button onClick={() => handleMakeAdmin(member._id)} style={s.promoteBtn}>Make Admin</button>
                      ) : null}
                      <button onClick={() => handleRemoveMember(member._id)} style={s.removeBtn}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div style={s.overlay} onClick={() => setShowAddMemberModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>Add Member to {department.name}</div>
              <button onClick={() => setShowAddMemberModal(false)} style={s.closeBtn}>✕</button>
            </div>
            <div style={s.modalBody}>
              <label style={s.label}>Select Staff Member</label>
              <select value={selectedStaffToAdd} onChange={e => setSelectedStaffToAdd(e.target.value)} style={s.select}>
                <option value="">-- Choose a staff member --</option>
                {availableStaff.map(staff => (
                  <option key={staff._id} value={staff._id}>{staff.name}</option>
                ))}
              </select>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setShowAddMemberModal(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={handleAddMember} style={s.confirmBtn}>Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', background: '#111827', fontFamily: "'Segoe UI', system-ui, Arial, sans-serif", paddingBottom: 40 },

  topbar: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(31, 41, 55, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
  topbarInner: { maxWidth: 1000, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', gap: 16 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8, transition: 'all 0.15s' },
  topbarTitle: { fontSize: 16, fontWeight: 800, color: '#f9fafb' },
  topbarSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  body: { maxWidth: 1000, margin: '0 auto', padding: '28px' },

  infoCard: { background: 'rgba(31, 41, 55, 0.6)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '20px', marginBottom: 28, border: '1px solid rgba(255, 255, 255, 0.1)' },
  infoTitle: { fontSize: 14, fontWeight: 800, color: '#f9fafb', marginBottom: 8 },
  infoDesc: { fontSize: 13, color: '#9ca3af', lineHeight: 1.6 },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: 800, color: '#f9fafb', marginBottom: 16 },

  settingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16 },
  settingItem: { background: 'rgba(31, 41, 55, 0.6)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' },
  settingLabel: { display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#f9fafb', cursor: 'pointer' },
  settingDesc: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  settingInput: { width: '100%', padding: '8px 12px', marginTop: 8, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', color: '#f9fafb', fontSize: 13, boxSizing: 'border-box' },

  membersList: { display: 'flex', flexDirection: 'column', gap: 12 },
  memberCard: { background: 'rgba(31, 41, 55, 0.6)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  memberInfo: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  memberAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 },
  memberName: { fontSize: 13, fontWeight: 700, color: '#f9fafb' },
  memberRole: { fontSize: 11, color: '#6b7280', marginTop: 2 },

  promoteBtn: { padding: '6px 12px', background: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc', border: '1px solid rgba(79, 70, 229, 0.4)', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 11, transition: 'all 0.15s' },
  removeBtn: { padding: '6px 12px', background: 'rgba(220, 38, 38, 0.2)', color: '#f87171', border: '1px solid rgba(220, 38, 38, 0.4)', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 11 },
  removeAdminBtn: { padding: '6px 12px', background: 'rgba(220, 38, 38, 0.2)', color: '#f87171', border: '1px solid rgba(220, 38, 38, 0.4)', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 11 },

  addMemberBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, boxShadow: '0 4px 15px rgba(79,70,229,0.4)' },
  saveBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 15px rgba(79,70,229,0.4)' },

  empty: { textAlign: 'center', padding: '40px 20px', color: '#6b7280', fontSize: 13 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'rgba(31, 41, 55, 0.8)', backdropFilter: 'blur(10px)', borderRadius: 14, width: '90%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.15)' },
  modalHeader: { background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(8px)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
  modalTitle: { fontSize: 15, fontWeight: 800, color: '#f9fafb' },
  closeBtn: { background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#9ca3af', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modalBody: { padding: '24px' },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  select: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', color: '#f9fafb', fontSize: 13, boxSizing: 'border-box', cursor: 'pointer' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '0 24px 24px' },
  cancelBtn: { padding: '10px 20px', background: 'rgba(255, 255, 255, 0.1)', color: '#9ca3af', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  confirmBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 15px rgba(79,70,229,0.4)' },
};

export default DepartmentDetail;
