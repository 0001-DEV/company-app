import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import * as XLSX from 'xlsx';

const NumericStepper = ({ value, onChange, onFinalSync, style = {} }) => {
  const [localValue, setLocalValue] = useState(value || 0);
  const valueRef = useRef(value || 0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Keep local value and ref in sync with prop
  useEffect(() => {
    setLocalValue(value || 0);
    valueRef.current = value || 0;
  }, [value]);

  const updateValue = (delta) => {
    const next = Math.max(0, valueRef.current + delta);
    valueRef.current = next;
    setLocalValue(next);
    onChange(next);
  };

  const startCounter = (delta) => {
    updateValue(delta);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        updateValue(delta);
      }, 60); // 60ms for smooth rapid fire
    }, 400);
  };

  const stopCounter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (onFinalSync) onFinalSync(valueRef.current);
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    // Allow empty string while typing to avoid leading zero issues
    if (rawValue === '') {
      setLocalValue('');
      return;
    }
    const val = parseInt(rawValue) || 0;
    valueRef.current = val;
    setLocalValue(val);
    onChange(val);
  };

  return (
    <div style={{ ...styles.rowStepper, ...style }}>
      <button 
        onMouseDown={(e) => { e.preventDefault(); startCounter(-1); }} 
        onMouseUp={stopCounter} 
        onMouseLeave={stopCounter}
        onTouchStart={(e) => { e.preventDefault(); startCounter(-1); }}
        onTouchEnd={stopCounter}
        style={styles.rowStepBtn}
      >▼</button>
      <input 
        type="number" 
        value={localValue} 
        onChange={handleInputChange}
        onFocus={(e) => e.target.select()} // Auto-select text on click to make typing easier
        onBlur={() => {
          const finalVal = localValue === '' ? 0 : localValue;
          setLocalValue(finalVal);
          if (onFinalSync) onFinalSync(finalVal);
        }}
        style={{ 
          ...styles.rowStepVal, 
          border: 'none', 
          background: 'transparent', 
          outline: 'none', 
          width: '100%', 
          padding: 0,
          textAlign: 'center',
          appearance: 'textfield', // Hide default arrows
          margin: 0
        }}
      />
      <button 
        onMouseDown={(e) => { e.preventDefault(); startCounter(1); }} 
        onMouseUp={stopCounter} 
        onMouseLeave={stopCounter}
        onTouchStart={(e) => { e.preventDefault(); startCounter(1); }}
        onTouchEnd={stopCounter}
        style={styles.rowStepBtn}
      >▲</button>
    </div>
  );
};

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

const MappingModal = ({ onClose, onSubmit, initialData, staffList, userRole }) => {
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [companyType, setCompanyType] = useState(initialData?.companyType || '');
  const [cardType, setCardType] = useState(initialData?.cardType || '');
  const [cardsProduced, setCardsProduced] = useState(initialData?.cardsProduced || 0);
  const [assignedStaff, setAssignedStaff] = useState(initialData?.assignedStaff?.map(s => s._id || s) || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ companyName, companyType, cardType, cardsProduced, assignedStaff });
  };

  const toggleStaff = (id) => {
    setAssignedStaff(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div style={mStyles.overlay}>
      <form onSubmit={handleSubmit} style={mStyles.modal}>
        <div style={mStyles.modalHeader}>
          <div>
            <h2 style={mStyles.modalTitle}>{initialData ? 'Edit Company' : 'New Company Registration'}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Fill in the details to track progress.</p>
          </div>
          <button type="button" onClick={onClose} style={mStyles.modalClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="modal-grid">
          <div style={mStyles.field}>
            <label style={mStyles.label}>Company Name</label>
            <input type="text" value={companyName} required onChange={e => setCompanyName(e.target.value)} style={mStyles.input} placeholder="e.g. Xtreme Cr8ivity" />
          </div>

          <div style={mStyles.field}>
            <label style={mStyles.label}>Industry / Type</label>
            <input type="text" value={companyType} onChange={e => setCompanyType(e.target.value)} style={mStyles.input} placeholder="e.g. Technology..." />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="modal-grid">
          <div style={mStyles.field}>
            <label style={mStyles.label}>Card Type</label>
            <select value={cardType} onChange={e => setCardType(e.target.value)} style={mStyles.input}>
              <option value="">Select Type</option>
              <option value="NFC & QR CODE">NFC & QR CODE</option>
              <option value="QR CODE">QR CODE</option>
              <option value="BOTH">BOTH</option>
            </select>
          </div>

          <div style={mStyles.field}>
            <label style={mStyles.label}>Cards Produced</label>
            <NumericStepper 
              value={cardsProduced} 
              onChange={setCardsProduced}
              style={{ background: '#0f172a', borderRadius: '12px', height: '48px' }}
            />
          </div>
        </div>

        {userRole === 'admin' && (
          <div style={mStyles.field}>
            <label style={mStyles.label}>Assign Dedicated Staff</label>
            <div style={mStyles.staffList}>
              {staffList.map(staff => (
                <label key={staff._id} style={{
                  ...mStyles.staffItem,
                  background: assignedStaff.includes(staff._id) ? '#1e293b' : '#334155',
                  borderColor: assignedStaff.includes(staff._id) ? '#3b82f6' : 'transparent',
                }}>
                  <input type="checkbox" checked={assignedStaff.includes(staff._id)} onChange={() => toggleStaff(staff._id)} style={{ display: 'none' }} />
                  <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid', borderColor: assignedStaff.includes(staff._id) ? '#3b82f6' : '#94a3b8', background: assignedStaff.includes(staff._id) ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                    {assignedStaff.includes(staff._id) && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: assignedStaff.includes(staff._id) ? '#f8fafc' : '#cbd5e1' }}>{staff.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{staff.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={mStyles.modalFooter}>
          <button type="button" onClick={onClose} style={mStyles.cancelBtn}>Discard</button>
          <button type="submit" style={mStyles.submitBtn}>{initialData ? 'Save Changes' : 'Register Company'}</button>
        </div>
      </form>
    </div>
  );
};

const Mapping = () => {
  const [mappings, setMappings] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  const fetchMappings = async () => {
    const token = localStorage.getItem('token');
    try {
      const endpoint = user?.role === 'admin' ? '/api/mapping' : '/api/mapping/my-mappings';
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

  const fetchStaff = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/all-staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStaffList(await res.json());
    } catch (err) {}
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    
    const fetchMe = async () => {
      try {
        // First, try to parse token for immediate role check
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUser(payload);

        // Then, fetch from server to be 100% sure and get latest info
        const res = await fetch('/api/chat/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(prev => ({ ...prev, ...data, role: data.role || prev.role }));
        }
      } catch (e) {
        console.error("Auth error:", e);
        // If it's a genuine auth error, we might want to redirect, 
        // but if it's just a parsing error, we stay quiet.
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

  const handleCreateOrUpdate = async (data) => {
    const token = localStorage.getItem('token');
    const method = editingMapping ? 'PUT' : 'POST';
    const url = editingMapping 
      ? `/api/mapping/assign/${editingMapping._id}` 
      : '/api/mapping';
    
    try {
      const payload = editingMapping 
        ? { 
            staffIds: data.assignedStaff, 
            companyName: data.companyName, 
            companyType: data.companyType,
            cardType: data.cardType,
            cardsProduced: data.cardsProduced
          }
        : data;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setToast({ message: editingMapping ? 'Update successful!' : 'New company added!', type: 'success' });
        setShowModal(false);
        setEditingMapping(null);
        fetchMappings();
      } else {
        const err = await res.json();
        setToast({ message: err.message || 'Operation failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'A network error occurred', type: 'error' });
    }
  };

  const [localComments, setLocalComments] = useState({});

  const canSeeInteraction = (isTicked, tickedById) => {
    if (!isTicked) return true; // Everyone can see it to tick it
    return tickedById === user?.id; // ONLY original ticker can see it to untick
  };

  const handleUpdateStatus = async (id, updates) => {
    // Check untick rule locally first
    const mapping = mappings.find(m => m._id === id);
    if (updates.isDesigned === false && !canSeeInteraction(mapping.isDesigned, mapping.isDesignedById)) {
      setToast({ message: `Accountability Rule: Only ${mapping.isDesignedBy} can untick this.`, type: 'error' });
      return;
    }
    if (updates.isPackageSent === false && !canSeeInteraction(mapping.isPackageSent, mapping.isPackageSentById)) {
      setToast({ message: `Accountability Rule: Only ${mapping.isPackageSentBy} can untick this.`, type: 'error' });
      return;
    }
    if (updates.isPackageReceived === false && !canSeeInteraction(mapping.isPackageReceived, mapping.isPackageReceivedById)) {
      setToast({ message: `Accountability Rule: Only ${mapping.isPackageReceivedBy} can untick this.`, type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/mapping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setMappings(prev => prev.map(m => m._id === id ? updated : m));
        // Clear local comment for this id after sync if it was a comment update
        if (updates.clientComment !== undefined) {
          setLocalComments(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
        setToast({ message: 'Status synced!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Sync failed', type: 'error' });
    }
  };

  const handleLocalCommentChange = (id, value) => {
    setLocalComments(prev => ({ ...prev, [id]: value }));
  };

  const saveComment = (id) => {
    if (localComments[id] !== undefined) {
      handleUpdateStatus(id, { clientComment: localComments[id] });
    }
  };

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

  const handleExportExcel = () => {
    try {
      const dataToExport = mappings.map(m => ({
        'Company Name': m.companyName,
        'Industry/Type': m.companyType || 'N/A',
        'Card Type': m.cardType || 'N/A',
        'Cards Produced': m.cardsProduced || 0,
        'Designed Status': m.isDesigned ? 'DONE' : 'PENDING',
        'Designed Marked By': m.isDesignedBy || 'N/A',
        'Designed Date': m.isDesignedAt ? new Date(m.isDesignedAt).toLocaleDateString() : 'N/A',
        'Sent Status': m.isPackageSent ? 'SENT' : 'WAITING',
        'Sent Marked By': m.isPackageSentBy || 'N/A',
        'Sent Date': m.isPackageSentAt ? new Date(m.isPackageSentAt).toLocaleDateString() : 'N/A',
        'Received Status': m.isPackageReceived ? 'RECEIVED' : 'OPEN',
        'Received Marked By': m.isPackageReceivedBy || 'N/A',
        'Received Date': m.isPackageReceivedAt ? new Date(m.isPackageReceivedAt).toLocaleDateString() : 'N/A',
        'Client Feedback': m.clientComment || '',
        'Assigned Staff': m.assignedStaff?.map(s => s.name).join(', ') || 'Unassigned',
        'Upload Date': new Date(m.fullDateUploaded || m.createdAt).toLocaleDateString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Company Mappings");
      
      // Auto-size columns
      const max_width = dataToExport.reduce((w, r) => Math.max(w, r['Company Name'].length), 10);
      worksheet['!cols'] = [ { wch: max_width + 5 } ];

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Company_Mapping_Report_${dateStr}.xlsx`);
      setToast({ message: 'Download started! Check your Downloads folder.', type: 'success' });
    } catch (err) {
      console.error('Export error:', err);
      setToast({ message: 'Export failed', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('This will permanently remove this company. Proceed?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/mapping/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMappings(mappings.filter(m => m._id !== id));
        setToast({ message: 'Company removed', type: 'success' });
      }
    } catch (err) {}
  };

  const filteredMappings = mappings.filter(m => 
    m.companyName.toLowerCase().includes(search.toLowerCase()) ||
    (m.companyType || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'name') return a.companyName.localeCompare(b.companyName);
    if (sortBy === 'type') return (a.companyType || '').localeCompare(b.companyType || '');
    if (sortBy === 'year') return b.yearUploaded - a.yearUploaded;
    if (sortBy === 'month') {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return months.indexOf(b.monthUploaded) - months.indexOf(a.monthUploaded);
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredMappings.length / itemsPerPage);
  const paginatedMappings = filteredMappings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  if (loading) return <div style={styles.loading}><div style={styles.spinner} /></div>;

  return (
    <div style={styles.container} className="main-container">
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }

        .table-scroll {
          overflow-x: auto;
          border-radius: 24px;
          background: #1e293b;
          border: 1px solid #334155;
          -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
        }

        /* Custom Scrollbar for better visibility */
        .table-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .table-scroll::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 0 0 24px 24px;
        }
        .table-scroll::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .table-scroll::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }

        .responsive-table {
          min-width: 1400px; /* Slightly increased to ensure all columns fit well */
        }

        .mapping-row:hover {
          background: #1e293b !important;
        }
        
        @media (max-width: 1024px) {
          /* No longer needed here as it is always active */
        }

        @media (max-width: 768px) {
          .main-container {
            padding: 20px !important;
          }
          .hero-section {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 20px;
          }
          .toolbar-section {
            flex-direction: column;
            align-items: stretch !important;
          }
          .search-box {
            max-width: none !important;
          }
          .modal-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-scroll-hint {
            display: block !important;
          }
        }
      `}</style>
      <TopBar 
        title="Mapping Intelligence" 
        dark={true}
        actions={user ? [
          { label: '📤 Export Excel', onClick: handleExportExcel, style: { background: '#059669' } },
          { label: '📥 Import Excel', onClick: () => fileInputRef.current?.click(), style: { background: '#1e293b', border: '1px solid #334155' } },
          { label: '+ New Registration', onClick: () => { setEditingMapping(null); setShowModal(true); } }
        ] : []}
      />

      <div style={{ display: 'none', background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: '700', textAlign: 'center' }} className="mobile-scroll-hint">
        💡 Swipe table left/right to see all columns (Designed, Sent, etc.)
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleBulkUpload} 
        accept=".xlsx, .xls, .csv" 
        style={{ display: 'none' }} 
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.hero} className="hero-section">
        <div style={styles.heroLeft}>
          <h2 style={styles.title}>Company Mapping</h2>
          <p style={styles.subtitle}>Strategic tracking for business onboarding and package delivery.</p>
        </div>
      </div>

      <div style={styles.toolbar} className="toolbar-section">
        <div style={styles.searchBox} className="search-box">
          <span style={styles.searchIcon}>🔍</span>
          <input type="text" placeholder="Search by name or industry..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
        </div>

        <div style={styles.sortBox}>
          <span style={styles.sortLabel}>Sort View</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.sortSelect}>
            <option value="dateModified">Recently Updated</option>
            <option value="name">Company A-Z</option>
            <option value="type">Industry Type</option>
            <option value="year">Upload Year</option>
            <option value="month">Upload Month</option>
          </select>
        </div>
      </div>

      <div style={styles.tableWrapper} className="table-scroll">
        <div className="responsive-table">
          <div style={styles.tableHeader}>
            <div style={{ ...styles.col, flex: 2 }}>Company Details</div>
            <div style={{ ...styles.col, flex: 1 }}>Card Type</div>
            <div style={{ ...styles.col, flex: 1, textAlign: 'center' }}>Quantity</div>
            <div style={{ ...styles.col, textAlign: 'center' }}>Designed</div>
            <div style={{ ...styles.col, textAlign: 'center' }}>Sent</div>
            <div style={{ ...styles.col, textAlign: 'center' }}>Received</div>
            <div style={{ ...styles.col, flex: 1.2 }}>Client Feedback</div>
            <div style={{ ...styles.col, flex: 1.8 }}>Responsible</div>
            {user?.role === 'admin' && <div style={{ ...styles.col, flex: 0.5, textAlign: 'right' }}>Actions</div>}
          </div>

          {paginatedMappings.map(m => (
            <div key={m._id} style={styles.row} className="mapping-row">
              {/* Company Info */}
              <div style={{ ...styles.col, flex: 2, display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={styles.rowAvatar}>{m.companyName[0]}</div>
                <div>
                  <div style={styles.rowName}>{m.companyName}</div>
                  <div style={styles.rowMeta}>{m.companyType || 'N/A'} • {new Date(m.fullDateUploaded || m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>

              {/* Card Type Dropdown */}
              <div style={{ ...styles.col, flex: 1 }}>
                <select 
                  value={m.cardType || ''} 
                  onChange={e => handleUpdateStatus(m._id, { cardType: e.target.value })}
                  style={{ ...styles.rowSelect, width: '100%' }}
                >
                  <option value="">Select Type</option>
                  <option value="NFC & QR CODE">NFC & QR CODE</option>
                  <option value="QR CODE">QR CODE</option>
                  <option value="BOTH">BOTH</option>
                </select>
              </div>

              {/* Cards Produced Counter */}
              <div style={{ ...styles.col, flex: 1 }}>
                <NumericStepper 
                  value={m.cardsProduced} 
                  onChange={(val) => {
                    // Optimistic UI update
                    setMappings(prev => prev.map(mapping => 
                      mapping._id === m._id ? { ...mapping, cardsProduced: val } : mapping
                    ));
                  }}
                  onFinalSync={(val) => {
                    handleUpdateStatus(m._id, { cardsProduced: val });
                  }}
                />
              </div>

              {/* Checkboxes */}
              <div style={{ ...styles.col, textAlign: 'center' }}>
                {canSeeInteraction(m.isDesigned, m.isDesignedById) ? (
                  <label style={styles.checkLabel}>
                    <input 
                      type="checkbox" 
                      checked={m.isDesigned} 
                      onChange={e => handleUpdateStatus(m._id, { isDesigned: e.target.checked })} 
                      style={styles.checkbox}
                    />
                    <span style={{ color: m.isDesigned ? '#10b981' : '#94a3b8', fontSize: '10px', fontWeight: '800' }}>{m.isDesigned ? 'DONE' : 'PENDING'}</span>
                  </label>
                ) : (
                  <div style={styles.staticStatus}>
                    <span style={{ fontSize: '16px' }}>✅</span>
                    <span style={{ color: '#10b981', fontSize: '10px', fontWeight: '800' }}>DONE</span>
                  </div>
                )}
                {m.isDesigned && (
                  <div style={styles.trackInfo}>
                    <div>{m.isDesignedBy || 'SYSTEM'}</div>
                    <div>{m.isDesignedAt ? new Date(m.isDesignedAt).toLocaleDateString('en-GB') : 'EXISTING'}</div>
                  </div>
                )}
              </div>
              <div style={{ ...styles.col, textAlign: 'center' }}>
                {canSeeInteraction(m.isPackageSent, m.isPackageSentById) ? (
                  <label style={styles.checkLabel}>
                    <input 
                      type="checkbox" 
                      checked={m.isPackageSent} 
                      onChange={e => handleUpdateStatus(m._id, { isPackageSent: e.target.checked })} 
                      style={styles.checkbox}
                    />
                    <span style={{ color: m.isPackageSent ? '#10b981' : '#94a3b8', fontSize: '10px', fontWeight: '800' }}>{m.isPackageSent ? 'SENT' : 'WAITING'}</span>
                  </label>
                ) : (
                  <div style={styles.staticStatus}>
                    <span style={{ fontSize: '16px' }}>📩</span>
                    <span style={{ color: '#10b981', fontSize: '10px', fontWeight: '800' }}>SENT</span>
                  </div>
                )}
                {m.isPackageSent && (
                  <div style={styles.trackInfo}>
                    <div>{m.isPackageSentBy || 'SYSTEM'}</div>
                    <div>{m.isPackageSentAt ? new Date(m.isPackageSentAt).toLocaleDateString('en-GB') : 'EXISTING'}</div>
                  </div>
                )}
              </div>
              <div style={{ ...styles.col, textAlign: 'center' }}>
                {canSeeInteraction(m.isPackageReceived, m.isPackageReceivedById) ? (
                  <label style={styles.checkLabel}>
                    <input 
                      type="checkbox" 
                      checked={m.isPackageReceived} 
                      onChange={e => handleUpdateStatus(m._id, { isPackageReceived: e.target.checked })} 
                      style={styles.checkbox}
                    />
                    <span style={{ color: m.isPackageReceived ? '#10b981' : '#94a3b8', fontSize: '10px', fontWeight: '800' }}>{m.isPackageReceived ? 'RECVD' : 'OPEN'}</span>
                  </label>
                ) : (
                  <div style={styles.staticStatus}>
                    <span style={{ fontSize: '16px' }}>📦</span>
                    <span style={{ color: '#10b981', fontSize: '10px', fontWeight: '800' }}>RECVD</span>
                  </div>
                )}
                {m.isPackageReceived && (
                  <div style={styles.trackInfo}>
                    <div>{m.isPackageReceivedBy || 'SYSTEM'}</div>
                    <div>{m.isPackageReceivedAt ? new Date(m.isPackageReceivedAt).toLocaleDateString('en-GB') : 'EXISTING'}</div>
                  </div>
                )}
              </div>

              {/* Comment */}
              <div style={{ ...styles.col, flex: 1.2, position: 'relative' }}>
                <textarea 
                  value={localComments[m._id] !== undefined ? localComments[m._id] : m.clientComment} 
                  onChange={e => handleLocalCommentChange(m._id, e.target.value)}
                  onBlur={() => saveComment(m._id)}
                  placeholder="Add internal notes..."
                  style={styles.rowTextarea}
                />
                {localComments[m._id] !== undefined && (
                  <div style={styles.unsavedBadge}>Unsaved</div>
                )}
              </div>

              {/* Staff */}
              <div style={{ ...styles.col, flex: 1.8, display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {m.assignedStaff?.length > 0 ? m.assignedStaff.map(s => (
                  <div key={s._id} style={styles.staffTag} title={s.email}>{s.name}</div>
                )) : <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>Unassigned</span>}
              </div>

              {/* Actions */}
              {user?.role === 'admin' && (
                <div style={{ ...styles.col, flex: 0.5, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setEditingMapping(m); setShowModal(true); }} style={styles.actionBtn}>✏️</button>
                  <button onClick={() => handleDelete(m._id)} style={{ ...styles.actionBtn, color: '#ef4444' }}>🗑️</button>
                </div>
              )}
            </div>
          ))}

          {paginatedMappings.length === 0 && (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '32px' }}>📂</div>
              <div style={{ marginTop: '12px', fontWeight: '600' }}>No companies found</div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <div style={styles.pageInfo}>
            Page <span style={{ color: '#3b82f6' }}>{currentPage}</span> of {totalPages}
          </div>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <MappingModal 
          onClose={() => setShowModal(false)} 
          onSubmit={handleCreateOrUpdate} 
          initialData={editingMapping}
          staffList={staffList}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

const styles = {
  container: { padding: '40px', maxWidth: '1500px', margin: '0 auto', fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#0f172a', color: '#f8fafc' },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: '900', color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' },
  subtitle: { fontSize: '16px', color: '#94a3b8', margin: '8px 0 0 0' },
  addBtn: { background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', flexShrink: 0 },
  toolbar: { display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' },
  searchBox: { position: 'relative', flex: '1 1 250px', maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
  searchInput: { width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: 'white', outline: 'none', fontSize: '15px' },
  sortBox: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
  sortLabel: { fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  sortSelect: { padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: 'white', outline: 'none', fontWeight: '600', cursor: 'pointer' },
  
  tableWrapper: { background: '#1e293b', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' },
  tableHeader: { display: 'flex', padding: '20px 24px', background: '#0f172a', borderBottom: '1px solid #334155', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  row: { display: 'flex', padding: '20px 24px', borderBottom: '1px solid #334155', alignItems: 'center', transition: 'background 0.2s' },
  col: { flex: 1, padding: '0 8px', minWidth: 0 },
  rowAvatar: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: 0 },
  rowName: { fontSize: '16px', fontWeight: '700', color: '#f8fafc' },
  rowMeta: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  checkLabel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' },
  staticStatus: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  trackInfo: { fontSize: '9px', color: '#64748b', textAlign: 'center', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', lineHeight: '1.2' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3b82f6' },
  rowTextarea: { width: '100%', minHeight: '60px', padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
  rowSelect: { background: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px', padding: '4px 6px', fontSize: '10px', fontWeight: '600', outline: 'none', cursor: 'pointer' },
  rowStepper: { display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', height: '28px' },
  rowStepBtn: { background: '#334155', border: 'none', color: 'white', padding: '0 8px', cursor: 'pointer', fontSize: '10px', fontWeight: '800', transition: '0.2s', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ':hover': { background: '#475569' } },
  rowStepVal: { flex: 1, textAlign: 'center', fontSize: '11px', fontWeight: '800', color: '#3b82f6', minWidth: '25px' },
  unsavedBadge: { position: 'absolute', top: '4px', right: '16px', background: '#f59e0b', color: 'white', fontSize: '8px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' },
  staffTag: { background: '#334155', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', border: '1px solid #475569' },
  actionBtn: { background: 'transparent', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', color: '#94a3b8', transition: '0.2s', ':hover': { background: '#334155' } },
  emptyState: { padding: '60px', textAlign: 'center', color: '#64748b' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' },
  spinner: { width: '40px', height: '40px', border: '4px solid #334155', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '32px', padding: '20px 0' },
  pageBtn: { padding: '10px 20px', borderRadius: '10px', background: '#1e293b', color: 'white', border: '1px solid #334155', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: '0.2s' },
  pageInfo: { fontSize: '14px', fontWeight: '700', color: '#94a3b8' }
};

const mStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '20px' },
  modal: { background: '#1e293b', padding: '30px', borderRadius: '24px', width: '540px', maxWidth: '95%', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '85vh', overflowY: 'auto', position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', position: 'sticky', top: 0, background: '#1e293b', zIndex: 10, marginTop: '-30px', paddingTop: '30px' },
  modalTitle: { margin: 0, fontSize: '22px', fontWeight: '900', color: '#f8fafc' },
  modalClose: { background: '#334155', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' },
  input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none', fontSize: '14px' },
  staffList: { maxHeight: '150px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '12px', padding: '12px', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: '8px' },
  staffItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', transition: '0.2s' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '30px', position: 'sticky', bottom: 0, background: '#1e293b', zIndex: 10, marginBottom: '-30px', paddingBottom: '30px', borderTop: '1px solid #334155', paddingTop: '20px' },
  cancelBtn: { padding: '14px 24px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: '700', cursor: 'pointer' },
  submitBtn: { padding: '14px 28px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }
};

export default Mapping;
