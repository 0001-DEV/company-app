import React, { useEffect, useState } from 'react';
import { getToken } from '../auth';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const Toast = ({ message, type = 'success', onClose }) => (
  <div style={{
    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
    padding: '14px 22px', borderRadius: '10px',
    background: type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
    color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', fontSize: '14px'
  }}>
    <span>{type === 'success' ? '✅' : '❌'}</span>
    {message}
    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '22px', height: '22px', fontWeight: 'bold', fontSize: '14px' }}>×</button>
  </div>
);

const StaffModal = ({ onClose, onSubmit, departments, initialData, viewOnly }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [department, setDepartment] = useState(initialData?.department?._id || initialData?.department || '');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState(
    initialData?.birthday ? initialData.birthday.split('T')[0] : ''
  );
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.profilePicture || '');
  const [showPictureModal, setShowPictureModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePicture = () => {
    if (window.confirm('Are you sure you want to delete this profile picture?')) {
      setProfilePicture(null);
      setPreviewUrl('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!viewOnly) {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('departmentId', department);
      formData.append('birthday', birthday);
      if (password) formData.append('password', password);
      if (profilePicture) formData.append('profilePicture', profilePicture);
      // If picture was removed (previewUrl is empty but initialData had a picture), send flag
      if (!previewUrl && initialData?.profilePicture) {
        formData.append('removePicture', 'true');
      }
      
      onSubmit(formData); 
    }
  };

  return (
    <>
      {/* Picture View Modal */}
      {showPictureModal && previewUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={previewUrl} alt={name} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px' }} />
            <button 
              onClick={() => setShowPictureModal(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div style={mStyles.overlay}>
        <form onSubmit={handleSubmit} style={mStyles.modal}>
        <div style={mStyles.modalHeader}>
          <h2 style={mStyles.modalTitle}>
            {viewOnly ? '👤 Staff Details' : (initialData ? '✏️ Edit Staff' : '➕ Add New Staff')}
          </h2>
          <button type="button" onClick={onClose} style={mStyles.modalClose}>✕</button>
        </div>

        <div style={{ padding: '24px 32px 0', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {previewUrl ? (
              <img 
                src={previewUrl.startsWith('blob:') ? previewUrl : previewUrl} 
                alt="Profile Preview" 
                onClick={() => setShowPictureModal(true)}
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6', cursor: 'pointer' }} 
                title="Click to view full picture"
              />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '3px solid #e5e7eb' }}>
                👤
              </div>
            )}
            {!viewOnly && (
              <>
                <label style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                  📷
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {previewUrl && (
                  <button 
                    type="button"
                    onClick={handleRemovePicture}
                    style={{ position: 'absolute', top: '0', right: '0', background: '#ef4444', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white', fontSize: '14px', fontWeight: 'bold', padding: 0 }}
                    title="Remove picture"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '0 32px' }}>
          <div style={mStyles.field}>
            <label style={mStyles.label}>Full Name</label>
            {viewOnly ? <div style={mStyles.viewValue}>{name}</div> :
              <input type="text" value={name} required onChange={e => setName(e.target.value)} style={mStyles.input} placeholder="Enter full name" />}
          </div>

          <div style={mStyles.field}>
            <label style={mStyles.label}>Email Address</label>
            {viewOnly ? <div style={mStyles.viewValue}>{email}</div> :
              <input type="email" value={email} required onChange={e => setEmail(e.target.value)} style={mStyles.input} placeholder="Enter email" />}
          </div>

          <div style={mStyles.field}>
            <label style={mStyles.label}>Phone Number</label>
            {viewOnly ? <div style={mStyles.viewValue}>{phone || 'Not provided'}</div> :
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={mStyles.input} placeholder="Enter phone number" />}
          </div>

          <div style={mStyles.field}>
            <label style={mStyles.label}>Department</label>
            {viewOnly ? <div style={mStyles.viewValue}>{initialData?.department?.name || '—'}</div> :
              <select value={department} onChange={e => setDepartment(e.target.value)} required style={mStyles.input}>
                <option value="" disabled hidden>Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>}
          </div>

          {viewOnly && (
            <div style={mStyles.field}>
              <label style={mStyles.label}>Assigned Jobs</label>
              <div style={mStyles.viewValue}>
                {initialData?.assignedJobs?.length > 0
                  ? initialData.assignedJobs.map(j => j.name).join(', ')
                  : 'None assigned'}
              </div>
            </div>
          )}

          {!initialData && !viewOnly && (
            <div style={mStyles.field}>
              <label style={mStyles.label}>Password</label>
              <input type="password" value={password} required onChange={e => setPassword(e.target.value)} style={mStyles.input} placeholder="Set password" />
            </div>
          )}

          <div style={mStyles.field}>
            <label style={mStyles.label}>Date of Birth</label>
            {viewOnly ? (
              <div style={mStyles.viewValue}>{birthday ? new Date(birthday).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}</div>
            ) : (
              <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} style={mStyles.input} />
            )}
          </div>
        </div>

        <div style={mStyles.modalFooter}>
          {!viewOnly && <button type="submit" style={mStyles.saveBtn}>💾 Save</button>}
          <button type="button" onClick={onClose} style={mStyles.cancelBtn}>Close</button>
        </div>
      </form>
        </div>
    </>
  );
};

const DepartmentModal = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ name, _id: initialData?._id }); setName(''); };
  return (
    <div style={mStyles.overlay}>
      <form onSubmit={handleSubmit} style={{ ...mStyles.modal, maxWidth: '400px' }}>
        <div style={mStyles.modalHeader}>
          <h2 style={mStyles.modalTitle}>{initialData ? '✏️ Edit Department' : '🏢 Create Department'}</h2>
          <button type="button" onClick={onClose} style={mStyles.modalClose}>✕</button>
        </div>
        <div style={mStyles.field}>
          <label style={mStyles.label}>Department Name</label>
          <input type="text" value={name} required onChange={e => setName(e.target.value)} style={mStyles.input} placeholder="Enter department name" />
        </div>
        <div style={mStyles.modalFooter}>
          <button type="submit" style={mStyles.saveBtn}>💾 Save</button>
          <button type="button" onClick={onClose} style={mStyles.cancelBtn}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

function AllStaff() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [toast, setToast] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const navigate = useNavigate();

  const fetchStaff = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setToast({ message: 'Not logged in!', type: 'error' }); setLoading(false); return; }
    try {
      const res = await fetch('/api/admin/all-staff', { headers: { Authorization: `Bearer ${token}` } });
      setStaff(await res.json());
      setLoading(false);
    } catch (err) { setError('Failed to connect'); setLoading(false); }
  };

  const refreshDepartments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } });
      setDepartments(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchStaff(); refreshDepartments(); }, []);
  useEffect(() => { if (!showDeptModal) refreshDepartments(); }, [showDeptModal]);

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filteredStaff.length / perPage);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Delete this staff member?')) return;
    try {
      const res = await fetch(`/api/admin/delete-staff/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Delete failed');
      setStaff(prev => prev.filter(s => s._id !== id));
      setToast({ message: 'Staff deleted!', type: 'success' });
    } catch (err) { setToast({ message: 'Failed to delete', type: 'error' }); }
  };

  const handleAddOrEdit = async (formData) => {
    const token = localStorage.getItem('token');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    try {
      const url = editingData
        ? `/api/admin/edit-staff/${editingData._id}`
        : '/api/admin/create-staff';

      let fetchOptions;
      if (isLocalhost) {
        fetchOptions = {
          method: editingData ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        };
      } else {
        const plain = {};
        formData.forEach((value, key) => {
          if (key === 'profilePicture') return;
          plain[key] = value;
        });
        fetchOptions = {
          method: editingData ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(plain)
        };
      }

      const res = await fetch(url, fetchOptions);
      const text = await res.text();
      if (!text) {
        throw new Error('Server returned empty response');
      }
      let resData;
      try {
        resData = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Server did not return valid JSON');
      }

      if (!res.ok) throw new Error(resData.message || 'Operation failed');
      
      if (editingData) {
        setStaff(prev => prev.map(s => s._id === editingData._id ? resData.staff || resData : s));
        setToast({ message: 'Staff updated!', type: 'success' });
      } else {
        setStaff(prev => [...prev, resData]);
        setToast({ message: 'Staff added!', type: 'success' });
      }
      setShowStaffModal(false); setEditingData(null); setViewOnly(false);
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
  };

  const handleAddOrEditDept = async (data) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/create-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: data.name })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed');
      setDepartments(prev => [...prev, resData]);
      setShowDeptModal(false);
      setToast({ message: 'Department created!', type: 'success' });
    } catch (err) { console.error(err); }
  };

  const handleBulkUpload = async (file) => {
    if (!file) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ message: 'Not logged in!', type: 'error' });
      return;
    }

    setBulkUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/bulk-upload-staff', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Bulk upload failed');
      setStaff(prev => [...prev, ...(data.staff || [])]);
      setToast({ message: data.message || 'Bulk upload complete!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setBulkUploading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = staff.map(s => ({
        'Name': s.name,
        'Email': s.email,
        'Phone': s.phone || 'N/A',
        'Department': s.department?.name || 'Unassigned',
        'Date of Birth': s.birthday ? new Date(s.birthday).toLocaleDateString('en-GB') : 'N/A'
      }));

      const XLSX = require('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Staff List");
      XLSX.writeFile(workbook, `Staff_Directory_${new Date().toISOString().split('T')[0]}.xlsx`);
      setToast({ message: 'Export successful!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Export failed', type: 'error' });
    }
  };

  const downloadExcelTemplate = () => {
    try {
      const templateData = [
        {
          'Name': 'John Doe',
          'Email': 'john@example.com',
          'Phone': '+234 123 456 7890',
          'Password': '123456',
          'Department': 'ICT Department',
          'Birthday': '1990-01-15',
          'Picture': '(Leave blank - upload via UI)'
        },
        {
          'Name': 'Jane Smith',
          'Email': 'jane@example.com',
          'Phone': '+234 987 654 3210',
          'Password': '123456',
          'Department': 'Design Department',
          'Birthday': '1992-05-20',
          'Picture': '(Leave blank - upload via UI)'
        }
      ];

      const XLSX = require('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 },
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 30 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      XLSX.writeFile(workbook, 'Staff_Import_Template.xlsx');
      setToast({ message: 'Template downloaded! Fill it and upload. Pictures can be added via the Edit button after import.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to download template', type: 'error' });
    }
  };

  const avatarColors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899'];

  return (
    <div style={s.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <TopBar
        title="🆔 Staff Directory"
        subtitle={`${staff.length} total staff members`}
        backPath="/home"
        actions={[
          { label: '➕ Add Staff', onClick: () => { refreshDepartments(); setEditingData(null); setShowStaffModal(true); setViewOnly(false); } },
          { label: '🏢 Add Department', onClick: () => { setEditingDept(null); setShowDeptModal(true); }, style: { background: 'linear-gradient(135deg,#10b981,#059669)' } },
          {
            label: bulkUploading ? '⏳ Importing...' : '📥 Bulk Upload (CSV/Excel)',
            onClick: () => document.getElementById('bulk-upload-excel-input')?.click(),
            style: { background: 'linear-gradient(135deg,#f59e0b,#f97316)' },
          },
          { label: '📋 Download Template', onClick: downloadExcelTemplate, style: { background: 'linear-gradient(135deg,#06b6d4,#0891b2)' } },
          { label: '📋 Departments', onClick: () => navigate('/department'), style: { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' } }
        ]}
      />
      <input
        id="bulk-upload-excel-input"
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleBulkUpload(file);
          e.target.value = '';
        }}
      />

      {/* Toolbar */}
      <div style={s.toolbar} className="toolbar-wrap">
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            style={s.searchInput}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div style={s.statsBar}>
        <div style={s.statChip}>👥 Total: <b>{staff.length}</b></div>
        <div style={s.statChip}>🔍 Showing: <b>{filteredStaff.length}</b></div>
        <div style={s.statChip}>📄 Page: <b>{currentPage}/{totalPages || 1}</b></div>
      </div>

      {loading && <div style={s.loading}><div style={s.spinner} />Loading staff...</div>}
      {error && <div style={s.errorMsg}>{error}</div>}

      {!loading && (
        <>
          {/* Cards Grid */}
          <div style={s.grid} className="info-grid-3">
            {paginatedStaff.map((member, i) => {
              const color = avatarColors[i % avatarColors.length];
              const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              return (
                <div key={member._id} style={s.card}>
                  <div style={{ ...s.cardTop, background: `linear-gradient(135deg, ${color}22, ${color}11)`, borderTop: `4px solid ${color}` }}>
                    {member.profilePicture && member.profilePicture.trim() ? (
                      <img 
                        src={`${member.profilePicture}?t=${Date.now()}`} 
                        alt={member.name} 
                        onClick={() => { refreshDepartments(); setEditingData(member); setShowStaffModal(true); setViewOnly(true); }}
                        style={{ ...s.avatar, objectFit: 'cover', border: `2px solid ${color}`, cursor: 'pointer' }} 
                        title="Click to view profile"
                      />
                    ) : (
                      <div style={{ ...s.avatar, background: color }}>{initials}</div>
                    )}
                    <div style={s.cardName}>{member.name}</div>
                    <div style={s.cardEmail}>{member.email}</div>
                    {member.phone && <div style={s.cardPhone}>📞 {member.phone}</div>}
                    <div style={{ ...s.deptBadge, background: color + '22', color }}>{member.department?.name || 'No Dept'}</div>
                  </div>
                  <div style={s.cardBottom}>
                    <div style={s.jobCount}>📋 {member.assignedJobs?.length || 0} jobs</div>
                    <div style={s.cardActions}>
                      <button style={s.viewBtn} onClick={() => { refreshDepartments(); setEditingData(member); setShowStaffModal(true); setViewOnly(true); }}>👁</button>
                      <button style={s.editBtn} onClick={() => { refreshDepartments(); setEditingData(member); setShowStaffModal(true); setViewOnly(false); }}>✏️</button>
                      <button style={s.delBtn} onClick={() => handleDelete(member._id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={s.pagination}>
              <button style={{ ...s.pageBtn, ...(currentPage === 1 ? s.pageBtnDisabled : {}) }} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} style={{ ...s.pageBtn, ...(p === currentPage ? s.pageBtnActive : {}) }}>{p}</button>
              ))}
              <button style={{ ...s.pageBtn, ...(currentPage === totalPages ? s.pageBtnDisabled : {}) }} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}

      {showStaffModal && <StaffModal onClose={() => { setShowStaffModal(false); setEditingData(null); setViewOnly(false); }} onSubmit={handleAddOrEdit} departments={departments} initialData={editingData} viewOnly={viewOnly} />}
      {showDeptModal && <DepartmentModal onClose={() => setShowDeptModal(false)} onSubmit={handleAddOrEditDept} initialData={editingDept} />}
    </div>
  );
}

/* ── Styles ── */
const s = {
  page: { minHeight: '100vh', background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  header: { background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)', color: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '28px', fontWeight: '800' },
  headerSub: { margin: '4px 0 0', opacity: 0.8, fontSize: '14px' },
  backBtn: { padding: '10px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: 'var(--bg-card, white)', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '12px' },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '240px', maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '14px', fontSize: '16px' },
  searchInput: { width: '100%', padding: '11px 16px 11px 42px', borderRadius: '50px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', background: 'var(--bg-light, #f8fafc)' },
  toolbarBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  btnPrimary: { padding: '10px 18px', background: 'linear-gradient(135deg,#3b82f6,#1e40af)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnGreen: { padding: '10px 18px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnLink: { padding: '10px 18px', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' },
  statsBar: { display: 'flex', gap: '12px', padding: '14px 32px', background: 'var(--bg-light, #f8fafc)', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' },
  statChip: { background: 'var(--bg-card, white)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', color: 'var(--text-muted, #475569)', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '60px', fontSize: '16px', color: 'var(--text-muted, #64748b)' },
  spinner: { width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errorMsg: { margin: '20px 32px', padding: '14px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', padding: '24px 32px' },
  card: { background: 'var(--bg-card, white)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'transform 0.2s, box-shadow 0.2s' },
  cardTop: { padding: '24px 16px 16px', textAlign: 'center' },
  avatar: { width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '20px', margin: '0 auto 12px' },
  cardName: { fontWeight: '700', fontSize: '15px', color: 'var(--text-main, #0f172a)', marginBottom: '4px' },
  cardEmail: { fontSize: '12px', color: 'var(--text-muted, #64748b)', marginBottom: '4px', wordBreak: 'break-all' },
  cardPhone: { fontSize: '12px', color: 'var(--text-muted, #64748b)', marginBottom: '10px' },
  deptBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginTop: '6px' },
  cardBottom: { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' },
  jobCount: { fontSize: '12px', color: 'var(--text-muted, #64748b)' },
  cardActions: { display: 'flex', gap: '6px' },
  viewBtn: { padding: '6px 10px', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  editBtn: { padding: '6px 10px', background: '#fef9c3', color: '#ca8a04', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  delBtn: { padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '24px', flexWrap: 'wrap' },
  pageBtn: { padding: '9px 16px', background: 'var(--bg-card, white)', color: 'var(--text-muted, #475569)', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  pageBtnActive: { background: '#3b82f6', color: 'white', border: '1px solid #3b82f6' },
  pageBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
};

const mStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--bg-card, white)', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflowY: 'auto', maxHeight: '90vh' },
  modalHeader: { background: 'linear-gradient(135deg,#1e40af,#3b82f6)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  modalTitle: { margin: 0, color: 'white', fontSize: '18px', fontWeight: '700' },
  modalClose: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  field: { padding: '16px 0 0' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  viewValue: { padding: '12px 16px', background: 'var(--bg-light, #f8fafc)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-main, #0f172a)', border: '1px solid #e5e7eb' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '24px 32px', position: 'sticky', bottom: 0, background: 'var(--bg-card, white)', borderTop: '1px solid #f1f5f9', zIndex: 10 },
  saveBtn: { padding: '10px 22px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
  cancelBtn: { padding: '10px 22px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
};

export default AllStaff;
