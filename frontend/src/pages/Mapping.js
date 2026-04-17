import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import * as XLSX from 'xlsx';

const Toast = ({ message, type = 'success', onClose }) => (
  <div style={{
    position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
    padding: '16px 24px', borderRadius: '16px',
    background: type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
    backdropFilter: 'blur(8px)',
    color: 'white', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.3)',
    display: 'flex', alignItems: 'center', gap: '14px', fontWeight: '600', fontSize: '15px',
    border: '1px solid rgba(255,255,255,0.1)',
    animation: 'slideIn 0.3s ease-out'
  }}>
    <span style={{ fontSize: '18px' }}>{type === 'success' ? '✨' : '⚠️'}</span>
    {message}
    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>✕</button>
  </div>
);

const StaffAssignmentModal = ({ onClose, onSubmit, staffList }) => {
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentAccess = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/mapping/access/get', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedStaff(data.staffIds || []);
        }
      } catch (err) {
        console.error('Error fetching access:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentAccess();
  }, []);

  const toggleStaff = (id) => {
    setSelectedStaff(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    onSubmit(selectedStaff);
  };

  if (loading) {
    return (
      <div style={mStyles.overlay}>
        <div style={mStyles.modal}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={mStyles.overlay}>
      <div style={mStyles.modal}>
        <div style={mStyles.modalHeader}>
          <h2 style={mStyles.modalTitle}>👥 Manage Mapping Page Access</h2>
          <button type="button" onClick={onClose} style={mStyles.modalClose}>✕</button>
        </div>

        <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
          Select staff members who can access and manage the Mapping page:
        </p>

        <div style={mStyles.field}>
          <label style={mStyles.label}>Staff Members</label>
          <div style={mStyles.staffList}>
            {staffList.map(staff => (
              <label key={staff._id} style={{
                ...mStyles.staffItem,
                background: selectedStaff.includes(staff._id) ? '#1e293b' : '#334155',
                borderColor: selectedStaff.includes(staff._id) ? '#3b82f6' : 'transparent',
              }}>
                <input type="checkbox" checked={selectedStaff.includes(staff._id)} onChange={() => toggleStaff(staff._id)} style={{ display: 'none' }} />
                <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid', borderColor: selectedStaff.includes(staff._id) ? '#3b82f6' : '#94a3b8', background: selectedStaff.includes(staff._id) ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                  {selectedStaff.includes(staff._id) && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: selectedStaff.includes(staff._id) ? '#f8fafc' : '#cbd5e1' }}>{staff.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{staff.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={mStyles.modalFooter}>
          <button type="button" onClick={onClose} style={mStyles.cancelBtn}>Cancel</button>
          <button type="button" onClick={handleSubmit} style={mStyles.submitBtn}>Save Access</button>
        </div>
      </div>
    </div>
  );
};

const Mapping = () => {
  const [mappings, setMappings] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Fetch mappings
  const fetchMappings = async () => {
    const token = localStorage.getItem('token');
    try {
      // Check if user has mapping page access
      const accessRes = await fetch('/api/mapping/access/check', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (accessRes.ok) {
        const accessData = await accessRes.json();
        if (!accessData.hasAccess && user?.role !== 'admin') {
          setToast({ message: 'You do not have access to this page', type: 'error' });
          navigate('/staff-dashboard');
          return;
        }
      }
      
      // Fetch mappings
      const endpoint = user?.role === 'admin' ? '/api/mapping' : '/api/mapping';
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMappings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff list
  const fetchStaff = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/all-staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStaffList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Initialize user and fetch data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    const fetchMe = async () => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUser(payload);

        const res = await fetch('/api/chat/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(prev => ({ ...prev, ...data, role: data.role || prev.role }));
        }
      } catch (e) {
        console.error("Auth error:", e);
      }
    };

    fetchMe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchMappings();
      if (user.role === 'admin') fetchStaff();
    }
  }, [user]);

  // Handle staff assignment
  const handleStaffAssignment = async (selectedStaffIds) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/mapping/access/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staffIds: selectedStaffIds })
      });
      
      if (res.ok) {
        setToast({ message: 'Page access updated!', type: 'success' });
        setShowStaffModal(false);
      } else {
        const text = await res.text();
        console.error('Response:', text);
        try {
          const err = JSON.parse(text);
          setToast({ message: err.message || 'Failed to update access', type: 'error' });
        } catch (e) {
          setToast({ message: 'Server error: ' + text.substring(0, 100), type: 'error' });
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setToast({ message: 'Error updating access: ' + err.message, type: 'error' });
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');

    try {
      setLoading(true);
      const res = await fetch('/api/mapping/bulk-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        setToast({ message: result.message, type: 'success' });
        fetchMappings();
      } else {
        const err = await res.json();
        setToast({ message: err.message || 'Bulk upload failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Error during bulk upload', type: 'error' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        { 'MAPPED CLIENT': 'MTN', 'ID Card Types': 'Classic Lustre', 'Card Number': 100, 'Business Card Type': 'Classic Lustre', 'Business Card No': 100, 'Card Holder type': 'Silver Cut-out Card Holder', 'Card Holder number': 100, 'Lanyard': 'Red Lanyard with Plastic Hook', 'Date sent': '2025-02-02', 'Delivered': 'Yes', 'Reached out': 'Yes, We sent Invoice' },
        { 'MAPPED CLIENT': '', 'ID Card Types': 'Egg Shell', 'Card Number': 50, 'Business Card Type': 'Egg Shell', 'Business Card No': 50, 'Card Holder type': '', 'Card Holder number': '', 'Lanyard': '', 'Date sent': '', 'Delivered': '', 'Reached out': '' },
        { 'MAPPED CLIENT': '', 'ID Card Types': 'Translux Matte Finish', 'Card Number': 75, 'Business Card Type': 'Translux', 'Business Card No': 75, 'Card Holder type': '', 'Card Holder number': '', 'Lanyard': '', 'Date sent': '', 'Delivered': '', 'Reached out': '' },
        { 'MAPPED CLIENT': '', 'ID Card Types': 'Nubis', 'Card Number': 25, 'Business Card Type': 'Nubis', 'Business Card No': 25, 'Card Holder type': '', 'Card Holder number': '', 'Lanyard': '', 'Date sent': '', 'Delivered': '', 'Reached out': '' },
        { 'MAPPED CLIENT': 'ABC Motors', 'ID Card Types': 'Classic Lustre', 'Card Number': 200, 'Business Card Type': 'Classic Lustre', 'Business Card No': 200, 'Card Holder type': 'Gold Card Holder', 'Card Holder number': 200, 'Lanyard': 'Blue Lanyard', 'Date sent': '2025-02-05', 'Delivered': 'No', 'Reached out': 'Pending' },
        { 'MAPPED CLIENT': '', 'ID Card Types': 'Egg Shell', 'Card Number': 150, 'Business Card Type': 'Egg Shell', 'Business Card No': 150, 'Card Holder type': '', 'Card Holder number': '', 'Lanyard': '', 'Date sent': '', 'Delivered': '', 'Reached out': '' }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Company Mapping');

      worksheet['!cols'] = [
        { wch: 20 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 16 },
        { wch: 26 }, { wch: 18 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 22 }
      ];

      XLSX.writeFile(workbook, 'Company_Mapping_Template.xlsx');
      setToast({ message: 'Template downloaded!', type: 'success' });
    } catch (err) {
      console.error('Template download error:', err);
      setToast({ message: 'Failed to download template', type: 'error' });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const dataToExport = [];
      
      mappings.forEach(m => {
        let cardTypes = [];
        let businessCardTypes = [];
        
        try {
          cardTypes = m.cardType ? JSON.parse(m.cardType) : [];
        } catch (e) {
          cardTypes = m.cardType ? [{ type: m.cardType, quantity: m.cardsProduced || 0 }] : [];
        }
        
        try {
          businessCardTypes = m.businessCardType ? JSON.parse(m.businessCardType) : [];
        } catch (e) {
          businessCardTypes = m.businessCardType ? [{ type: m.businessCardType, quantity: m.businessCardNo || 0 }] : [];
        }
        
        // Get the maximum number of card types to create rows
        const maxTypes = Math.max(cardTypes.length, businessCardTypes.length, 1);
        
        for (let i = 0; i < maxTypes; i++) {
          const cardType = cardTypes[i] || { type: '', quantity: 0 };
          const bizCardType = businessCardTypes[i] || { type: '', quantity: 0 };
          
          dataToExport.push({
            'MAPPED CLIENT': i === 0 ? m.companyName : '', // Company name only on first row
            'ID Card Types': cardType.type || '',
            'Card Number': cardType.quantity || 0,
            'Business Card Type': bizCardType.type || '',
            'Business Card No': bizCardType.quantity || 0,
            'Card Holder type': i === 0 ? (m.cardHolderType || '') : '',
            'Card Holder number': i === 0 ? (m.cardHolderNumber || 0) : 0,
            'Lanyard': i === 0 ? (m.lanyard || '') : '',
            'Date sent': i === 0 ? (m.dateSent ? new Date(m.dateSent).toLocaleDateString() : '') : '',
            'Delivered': i === 0 ? (m.delivered ? 'Yes' : 'No') : '',
            'Reached out': i === 0 ? (m.reachedOut || '') : ''
          });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Company Mapping");

      worksheet['!cols'] = [
        { wch: 20 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 16 },
        { wch: 26 }, { wch: 18 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 22 }
      ];

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Company_Mapping_Report_${dateStr}.xlsx`);
      setToast({ message: 'Export completed! Check your Downloads folder.', type: 'success' });
    } catch (err) {
      console.error('Export error:', err);
      setToast({ message: 'Export failed: ' + err.message, type: 'error' });
    }
  };

  // Update mapping field
  const handleUpdateField = async (id, field, value) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/mapping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        const updated = await res.json();
        setMappings(prev => prev.map(m => m._id === id ? updated : m));
        setToast({ message: 'Updated!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Update failed', type: 'error' });
    }
  };

  // Delete mapping
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/mapping/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMappings(mappings.filter(m => m._id !== id));
        setToast({ message: 'Company deleted successfully!', type: 'success' });
      } else {
        const err = await res.json();
        setToast({ message: err.message || 'Delete failed', type: 'error' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ message: 'Delete failed: ' + err.message, type: 'error' });
    }
  };

  // Toggle company selection
  const toggleSelection = (id) => {
    const newSelected = new Set(selectedCompanies);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCompanies(newSelected);
  };

  // Select all visible companies
  const toggleSelectAll = () => {
    if (selectedCompanies.size === filteredMappings.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(filteredMappings.map(m => m._id)));
    }
  };

  // Bulk delete selected companies
  const handleBulkDelete = async () => {
    if (selectedCompanies.size === 0) {
      setToast({ message: 'Please select companies to delete', type: 'error' });
      return;
    }
    
    if (!window.confirm(`Delete ${selectedCompanies.size} selected companies?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      let deletedCount = 0;
      for (const id of selectedCompanies) {
        try {
          const res = await fetch(`/api/mapping/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) deletedCount++;
        } catch (err) {
          console.error(`Failed to delete ${id}:`, err);
        }
      }
      
      setMappings(mappings.filter(m => !selectedCompanies.has(m._id)));
      setSelectedCompanies(new Set());
      setToast({ message: `${deletedCount} companies deleted successfully!`, type: 'success' });
    } catch (err) {
      console.error('Bulk delete error:', err);
      setToast({ message: 'Bulk delete failed: ' + err.message, type: 'error' });
    }
  };

  // Filter mappings
  const filteredMappings = mappings.filter(m =>
    m.companyName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={styles.loading}><div style={styles.spinner} /></div>;

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .table-scroll { overflow-x: auto; overflow-y: visible; border-radius: 12px; background: #1e293b; border: 1px solid #334155; }
        .table-scroll::-webkit-scrollbar { height: 8px; }
        .table-scroll::-webkit-scrollbar-track { background: #0f172a; }
        .table-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .table-scroll::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>

      <TopBar backPath="/staff-dashboard" />

      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>📍 Company Mapping</h1>
          <p style={styles.subtitle}>Track card production and delivery status</p>
        </div>

        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="🔍 Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          {selectedCompanies.size > 0 && (
            <button onClick={handleBulkDelete} style={{ ...styles.btn, background: '#dc2626', color: 'white' }}>
              🗑️ Delete {selectedCompanies.size}
            </button>
          )}

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              ...styles.btn,
              background: isEditMode ? '#ef4444' : '#3b82f6',
              color: 'white'
            }}
          >
            {isEditMode ? '✓ Editing' : '✏️ Edit Mode'}
          </button>

          <button onClick={() => setShowStaffModal(true)} style={{ ...styles.btn, background: '#8b5cf6', color: 'white' }}>
            👥 Manage Staff
          </button>

          <button onClick={handleDownloadTemplate} style={{ ...styles.btn, background: '#06b6d4', color: 'white' }}>
            📋 Template
          </button>

          <button onClick={handleExportExcel} style={{ ...styles.btn, background: '#10b981', color: 'white' }}>
            📊 Export
          </button>

          <label style={{ ...styles.btn, background: '#f59e0b', color: 'white', cursor: 'pointer', margin: 0 }}>
            📤 Import
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={styles.tableWrapper} className="table-scroll">
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={{ ...styles.th, width: '40px', minWidth: '40px', maxWidth: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedCompanies.size === filteredMappings.length && filteredMappings.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
              </th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>ID Card Types & Qty</th>
              <th style={styles.th}>Total ID Qty</th>
              <th style={styles.th}>Business Card Types & Qty</th>
              <th style={styles.th}>Total Biz Qty</th>
              <th style={styles.th}>Card Holder Type</th>
              <th style={styles.th}>Holder Qty</th>
              <th style={styles.th}>Lanyard</th>
              <th style={styles.th}>Date Sent</th>
              <th style={styles.th}>Delivered</th>
              <th style={styles.th}>Reached Out</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMappings.map(mapping => {
              let cardTypes = [];
              let businessCardTypes = [];
              
              try {
                cardTypes = mapping.cardType ? JSON.parse(mapping.cardType) : [];
              } catch (e) {
                // Handle old format (string like "BOTH")
                cardTypes = mapping.cardType ? [{ type: mapping.cardType, quantity: mapping.cardsProduced || 0 }] : [];
              }
              
              try {
                businessCardTypes = mapping.businessCardType ? JSON.parse(mapping.businessCardType) : [];
              } catch (e) {
                // Handle old format
                businessCardTypes = mapping.businessCardType ? [{ type: mapping.businessCardType, quantity: mapping.businessCardNo || 0 }] : [];
              }
              
              return (
                <tr key={mapping._id} style={styles.row}>
                  <td style={{ ...styles.td, width: '40px', minWidth: '40px', maxWidth: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedCompanies.has(mapping._id)}
                      onChange={() => toggleSelection(mapping._id)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  </td>
                  <td style={styles.td}>{mapping.companyName}</td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <input
                        type="text"
                        key={`ct-${mapping._id}`}
                        defaultValue={cardTypes.map(ct => `${ct.type}:${ct.quantity}`).join(', ')}
                        onBlur={e => {
                          const types = e.target.value.split(',').map(t => {
                            const [type, qty] = t.trim().split(':');
                            return { type: type.trim(), quantity: parseInt(qty) || 1 };
                          }).filter(t => t.type);
                          handleUpdateField(mapping._id, 'cardType', JSON.stringify(types));
                        }}
                        placeholder="e.g. Classic Lustre:100, Egg Shell:50"
                        style={styles.input}
                      />
                    ) : (
                      cardTypes.map(ct => `${ct.type}: ${ct.quantity}`).join(', ') || 'N/A'
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>See Type column</span>
                    ) : (
                      cardTypes.reduce((sum, ct) => sum + (ct.quantity || 0), 0)
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <input
                        type="text"
                        key={`bct-${mapping._id}`}
                        defaultValue={businessCardTypes.map(bct => `${bct.type}:${bct.quantity}`).join(', ')}
                        onBlur={e => {
                          const types = e.target.value.split(',').map(t => {
                            const [type, qty] = t.trim().split(':');
                            return { type: type.trim(), quantity: parseInt(qty) || 1 };
                          }).filter(t => t.type);
                          handleUpdateField(mapping._id, 'businessCardType', JSON.stringify(types));
                        }}
                        placeholder="e.g. Classic Lustre:100, Egg Shell:50"
                        style={styles.input}
                      />
                    ) : (
                      businessCardTypes.map(bct => `${bct.type}: ${bct.quantity}`).join(', ') || 'N/A'
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>See Type column</span>
                    ) : (
                      businessCardTypes.reduce((sum, bct) => sum + (bct.quantity || 0), 0)
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <input
                        type="text"
                        defaultValue={mapping.cardHolderType || ''}
                        onBlur={e => handleUpdateField(mapping._id, 'cardHolderType', e.target.value)}
                        placeholder="e.g. Silver Cut-out"
                        style={styles.input}
                      />
                    ) : (
                      mapping.cardHolderType || 'N/A'
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <input
                        type="number"
                        defaultValue={mapping.cardHolderNumber || 0}
                        onBlur={e => handleUpdateField(mapping._id, 'cardHolderNumber', parseInt(e.target.value) || 0)}
                        style={styles.input}
                      />
                    ) : (
                      mapping.cardHolderNumber || 0
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <input
                        type="text"
                        defaultValue={mapping.lanyard || ''}
                        onBlur={e => handleUpdateField(mapping._id, 'lanyard', e.target.value)}
                        placeholder="e.g. Red Lanyard"
                        style={styles.input}
                      />
                    ) : (
                      mapping.lanyard || 'N/A'
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <input
                        type="date"
                        defaultValue={mapping.dateSent ? new Date(mapping.dateSent).toISOString().split('T')[0] : ''}
                        onBlur={e => handleUpdateField(mapping._id, 'dateSent', e.target.value ? new Date(e.target.value) : null)}
                        style={styles.input}
                      />
                    ) : (
                      mapping.dateSent ? new Date(mapping.dateSent).toLocaleDateString() : 'N/A'
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <select
                        defaultValue={mapping.delivered ? 'Yes' : 'No'}
                        onChange={e => handleUpdateField(mapping._id, 'delivered', e.target.value === 'Yes')}
                        style={styles.input}
                      >
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    ) : (
                      mapping.delivered ? 'Yes' : 'No'
                    )}
                  </td>
                  <td style={styles.td}>
                    {isEditMode ? (
                      <input
                        type="text"
                        defaultValue={mapping.reachedOut || ''}
                        onBlur={e => handleUpdateField(mapping._id, 'reachedOut', e.target.value)}
                        placeholder="e.g. Yes, Invoice sent"
                        style={styles.input}
                      />
                    ) : (
                      mapping.reachedOut || 'N/A'
                    )}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(mapping._id)} style={{ ...styles.btn, background: '#ef4444', color: 'white', padding: '6px 12px', fontSize: '12px' }}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showStaffModal && <StaffAssignmentModal onClose={() => setShowStaffModal(false)} onSubmit={handleStaffAssignment} staffList={staffList} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Mapping;

const styles = {
  container: {
    background: '#0f172a',
    minHeight: '100vh',
    padding: '24px',
    color: '#f8fafc'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0f172a'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #334155',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    marginBottom: '32px'
  },
  titleSection: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#f8fafc'
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  },
  toolbar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none'
  },
  btn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: '0.2s',
    whiteSpace: 'nowrap'
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #334155',
    background: '#1e293b'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '2000px'
  },
  headerRow: {
    background: '#0f172a',
    borderBottom: '2px solid #334155'
  },
  th: {
    padding: '14px 8px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#cbd5e1',
    whiteSpace: 'nowrap',
    borderRight: '1px solid #334155',
    minWidth: '120px',
    maxWidth: '180px'
  },
  row: {
    borderBottom: '1px solid #334155',
    transition: '0.2s'
  },
  td: {
    padding: '12px 8px',
    fontSize: '12px',
    color: '#cbd5e1',
    borderRight: '1px solid #334155',
    minWidth: '120px',
    maxWidth: '180px'
  },
  input: {
    width: '100%',
    padding: '8px 6px',
    borderRadius: '6px',
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#f8fafc',
    fontSize: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  }
};

const mStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: '#1e293b',
    borderRadius: '16px',
    border: '1px solid #334155',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    color: '#f8fafc'
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '24px',
    cursor: 'pointer',
    padding: 0,
    transition: '0.2s'
  },
  field: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '8px'
  },
  staffList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  staffItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: '#334155',
    cursor: 'pointer',
    transition: '0.2s',
    alignItems: 'center'
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px'
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: 'transparent',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: '0.2s'
  },
  submitBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: '0.2s'
  }
};
