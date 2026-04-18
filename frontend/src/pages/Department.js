import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const deptDescriptionHints = {
  'ict': "Manages all ICT infrastructure, software systems, network security, and digital tools.",
  'it': "Manages all ICT infrastructure, software systems, network security, and digital tools.",
  'information technology': "Manages all ICT infrastructure, software systems, network security, and digital tools.",
  'marketing': "Drives brand awareness, customer acquisition, and market growth through strategic campaigns.",
  'sales': "Handles client outreach, lead conversion, revenue generation, and customer relationships.",
  'design': "Creates visually compelling graphics, card layouts, branding materials, and digital assets.",
  'finance': "Oversees budgeting, financial reporting, payroll, invoicing, and fiscal health.",
  'hr': "Manages staff recruitment, onboarding, welfare, performance reviews, and work environment.",
  'human resources': "Manages staff recruitment, onboarding, welfare, performance reviews, and work environment.",
  'operations': "Coordinates day-to-day business activities, production workflows, and department efficiency.",
  'production': "Handles end-to-end production of cards — from design handoff to quality control and delivery.",
  'customer service': "Frontline for client communication, handling inquiries, feedback, and seamless experience.",
  'admin': "Provides administrative support, managing records, scheduling, and internal operations.",
  'administration': "Provides administrative support, managing records, scheduling, and internal operations.",
  'logistics': "Manages movement, storage, and delivery of products, ensuring timely dispatch and tracking.",
};

// Single refined accent per card — muted, professional
const ACCENTS = ["#4f46e5","#0369a1","#047857","#b45309","#7c3aed","#0e7490","#be185d","#15803d","#1d4ed8","#9333ea"];

const DepartmentModal = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!initialData && !description) {
      const hint = deptDescriptionHints[val.toLowerCase().trim()];
      if (hint) setDescription(hint);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, _id: initialData?._id });
  };

  return (
    <div style={m.overlay} onClick={onClose}>
      <form onSubmit={handleSubmit} style={m.modal} onClick={e => e.stopPropagation()}>
        <div style={m.header}>
          <div>
            <div style={m.headerTitle}>{initialData ? 'Edit Department' : 'New Department'}</div>
            <div style={m.headerSub}>{initialData ? 'Update department details' : 'Add a new department to the organisation'}</div>
          </div>
          <button type="button" onClick={onClose} style={m.closeBtn}>✕</button>
        </div>
        <div style={m.body}>
          <div style={m.fieldGroup}>
            <label style={m.label}>Department Name *</label>
            <input type="text" value={name} required onChange={handleNameChange} style={m.input}
              placeholder="e.g. Marketing, Engineering..." autoFocus />
          </div>
          <div style={m.fieldGroup}>
            <label style={m.label}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              style={m.textarea} placeholder="What does this department do?" />
          </div>
        </div>
        <div style={m.footer}>
          <button type="button" onClick={onClose} style={m.cancelBtn}>Cancel</button>
          <button type="submit" style={m.saveBtn}>Save Department</button>
        </div>
      </form>
    </div>
  );
};

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [staffCounts, setStaffCounts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    const token = localStorage.getItem('token');
    try {
      const [deptRes, staffRes] = await Promise.all([
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/all-staff', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const depts = await deptRes.json();
      setDepartments(depts);
      if (staffRes.ok) {
        const staff = await staffRes.json();
        const counts = {};
        staff.forEach(s => {
          const id = s.department?._id || s.department;
          if (id) counts[id] = (counts[id] || 0) + 1;
        });
        setStaffCounts(counts);
      }
    } catch (err) { showToast('Failed to load departments', 'error'); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddOrEditDept = async (data) => {
    const token = localStorage.getItem('token');
    try {
      const url = data._id
        ? `/api/admin/edit-department/${data._id}`
        : '/api/admin/create-department';
      const res = await fetch(url, {
        method: data._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: data.name, description: data.description })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Operation failed');
      if (data._id) {
        setDepartments(prev => prev.map(d => d._id === data._id ? { ...d, name: data.name, description: data.description } : d));
        showToast('Department updated!');
      } else {
        setDepartments(prev => [...prev, resData]);
        showToast('Department created!');
      }
      setShowModal(false); setEditingDept(null);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this department?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/delete-department/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Delete failed');
      setDepartments(prev => prev.filter(d => d._id !== id));
      showToast('Department deleted!');
    } catch (err) { showToast('Failed to delete', 'error'); }
  };

  const filtered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const totalStaff = Object.values(staffCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .dept-card { animation: fadeUp 0.3s ease both; }
        .dept-card:hover { box-shadow: 0 12px 36px rgba(0,0,0,0.13) !important; transform: translateY(-3px) !important; }
        .dept-card:hover .dept-actions { opacity:1 !important; }
        .search-input::placeholder { color: #94a3b8; }
        .search-input:focus { border-color: #4f46e5 !important; outline: none; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, padding:'12px 20px', borderRadius:10,
          background: toast.type==='success' ? '#0f172a' : '#dc2626',
          color:'white', boxShadow:'0 8px 28px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', gap:10,
          fontWeight:600, fontSize:14, animation:'slideIn 0.25s ease' }}>
          {toast.type==='success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* ── STICKY TOPBAR ── */}
      <div style={s.topbar}>
        <div style={s.topbarInner}>
          <div style={s.topbarLeft}>
            <button onClick={() => navigate('/home')} style={s.backBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Dashboard
            </button>
            <div style={s.topbarDivider} />
            <div>
              <div style={s.topbarTitle}>Departments</div>
            </div>
          </div>
          <div style={s.topbarRight}>
            <div style={s.topbarMeta}>{departments.length} depts · {totalStaff} staff</div>
            <button style={s.addBtn} onClick={() => { setEditingDept(null); setShowModal(true); }}>
              + New Department
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={s.body}>

        {/* Search + stats row */}
        <div style={s.controlRow}>
          <div style={s.searchWrap}>
            <svg style={s.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-input" type="text" placeholder="Search departments..."
              value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput} />
            {search && <button onClick={() => setSearch('')} style={s.clearBtn}>✕</button>}
          </div>
          <div style={s.statsRow}>
            {[
              { label: "Departments", value: departments.length },
              { label: "Staff Members", value: totalStaff },
              { label: "Avg. Team Size", value: departments.length ? Math.round(totalStaff / departments.length) : 0 },
            ].map((st, i) => (
              <div key={i} style={s.statChip}>
                <span style={s.statVal}>{st.value}</span>
                <span style={s.statLbl}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.3 }}>🏢</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#f9fafb', marginBottom: 6 }}>
              {search ? `No results for "${search}"` : 'No departments yet'}
            </div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              {!search && 'Click "+ New Department" to get started'}
            </div>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((dept, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              const count = staffCounts[dept._id] || 0;
              return (
                <div key={dept._id} className="dept-card"
                  style={{ ...s.card, animationDelay: `${i * 0.05}s` }}>

                  {/* Accent strip */}
                  <div style={{ ...s.accentStrip, background: accent }} />

                  {/* Clickable body */}
                  <div style={s.cardBody} onClick={() => navigate(`/department/${dept._id}`)}>
                    <div style={s.cardTop}>
                      <div style={{ ...s.cardInitial, background: accent + '18', color: accent }}>
                        {dept.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ ...s.memberBadge, color: accent, background: accent + '12' }}>
                        {count} {count === 1 ? 'member' : 'members'}
                      </div>
                    </div>
                    <div style={s.cardName}>{dept.name}</div>
                    <div style={s.cardDesc}>
                      {dept.description
                        ? (dept.description.length > 85 ? dept.description.substring(0, 85) + '…' : dept.description)
                        : <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No description</span>}
                    </div>
                    <div style={{ ...s.viewLink, color: accent }}>
                      View department →
                    </div>
                  </div>

                  {/* Actions — visible on hover */}
                  <div className="dept-actions" style={s.cardActions}>
                    <button style={s.editBtn}
                      onClick={e => { e.stopPropagation(); setEditingDept(dept); setShowModal(true); }}>
                      Edit
                    </button>
                    <button style={s.deleteBtn} onClick={e => handleDelete(dept._id, e)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <DepartmentModal
          onClose={() => { setShowModal(false); setEditingDept(null); }}
          onSubmit={handleAddOrEditDept}
          initialData={editingDept}
        />
      )}
    </div>
  );
};

const s = {
  page: { minHeight: '100vh', background: '#111827', fontFamily: "'Segoe UI', system-ui, Arial, sans-serif" },

  /* Sticky topbar */
  topbar: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(31, 41, 55, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  topbarInner: { maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8, transition: 'all 0.15s' },
  topbarDivider: { width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)' },
  topbarTitle: { fontSize: 16, fontWeight: 800, color: '#f9fafb' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 16 },
  topbarMeta: { fontSize: 13, color: '#6b7280', fontWeight: 500 },
  addBtn: { padding: '9px 20px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.2px', boxShadow: '0 4px 15px rgba(79,70,229,0.4)' },

  /* Body */
  body: { maxWidth: 1200, margin: '0 auto', padding: '28px 28px 60px' },

  /* Controls */
  controlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center', flex: '1', maxWidth: 360 },
  searchIcon: { position: 'absolute', left: 14, color: '#6b7280', pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '10px 14px 10px 40px', borderRadius: 12, border: '1.5px solid rgba(255, 255, 255, 0.2)', fontSize: 14, background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', color: '#f9fafb', transition: 'all 0.2s', boxSizing: 'border-box' },
  clearBtn: { position: 'absolute', right: 10, background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#9ca3af', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  /* Stats chips */
  statsRow: { display: 'flex', gap: 8 },
  statChip: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 18px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.15)', minWidth: 80 },
  statVal: { fontSize: 20, fontWeight: 900, color: '#f9fafb', lineHeight: 1 },
  statLbl: { fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },

  /* Grid */
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 },
  empty: { textAlign: 'center', padding: '80px 20px' },

  /* Mobile responsive */
  '@media (max-width: 768px)': {
    grid: { gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 },
    topbarInner: { padding: '0 16px', height: 56, flexDirection: 'column', gap: 8 },
    topbarRight: { width: '100%', justifyContent: 'space-between', gap: 8 },
    addBtn: { padding: '8px 12px', fontSize: 12 },
    controlRow: { flexDirection: 'column', gap: 12 },
    searchWrap: { maxWidth: '100%' },
    statsRow: { width: '100%', justifyContent: 'space-between', gap: 4 },
    statChip: { padding: '6px 10px', minWidth: 'auto', fontSize: 11 },
    statVal: { fontSize: 16 },
    statLbl: { fontSize: 9 }
  },

  /* Card */
  card: { background: 'rgba(31, 41, 55, 0.6)', backdropFilter: 'blur(10px)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.2s', cursor: 'default', position: 'relative' },
  accentStrip: { height: 3, width: '100%' },
  cardBody: { padding: '18px 20px 14px', cursor: 'pointer' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardInitial: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, flexShrink: 0 },
  memberBadge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
  cardName: { fontSize: 15, fontWeight: 800, color: '#f9fafb', marginBottom: 8, letterSpacing: '-0.2px' },
  cardDesc: { fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 14, minHeight: 38 },
  viewLink: { fontSize: 12, fontWeight: 700, letterSpacing: '0.2px' },

  /* Actions */
  cardActions: { display: 'flex', gap: 8, padding: '0 20px 16px', opacity: 0, transition: 'opacity 0.2s' },
  editBtn: { flex: 1, padding: '8px', background: 'rgba(255, 255, 255, 0.1)', color: '#e5e7eb', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, backdropFilter: 'blur(8px)' },
  deleteBtn: { flex: 1, padding: '8px', background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12 },
};

const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'rgba(31, 41, 55, 0.8)', backdropFilter: 'blur(10px)', borderRadius: 16, width: '90%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)' },
  header: { background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(8px)', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
  headerTitle: { fontSize: 16, fontWeight: 800, color: '#f9fafb', marginBottom: 3 },
  headerSub: { fontSize: 12, color: '#6b7280' },
  closeBtn: { background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#9ca3af', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(8px)' },
  body: { padding: '24px' },
  fieldGroup: { marginBottom: 18 },
  label: { display: 'block', fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 },
  input: { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(255, 255, 255, 0.2)', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#f9fafb', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', transition: 'all 0.2s' },
  textarea: { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(255, 255, 255, 0.2)', fontSize: 13, outline: 'none', minHeight: 90, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6, color: '#f9fafb', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', transition: 'all 0.2s' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '0 24px 24px' },
  cancelBtn: { padding: '10px 20px', background: 'rgba(255, 255, 255, 0.1)', color: '#9ca3af', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, backdropFilter: 'blur(8px)' },
  saveBtn: { padding: '10px 22px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 15px rgba(79,70,229,0.4)' },
};

export default Department;
