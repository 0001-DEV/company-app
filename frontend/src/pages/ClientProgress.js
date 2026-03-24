import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ProjectModal = ({ onClose, onSubmit, initialData, staffList }) => {
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [planType, setPlanType] = useState(initialData?.planType || 'Pay as you go');
  const [totalCardsPaid, setTotalCardsPaid] = useState(initialData?.totalCardsPaid || 0);
  const [dateReceived, setDateReceived] = useState(initialData?.dateReceived ? initialData.dateReceived.split('T')[0] : '');
  const [dateStarted, setDateStarted] = useState(initialData?.dateStarted ? initialData.dateStarted.split('T')[0] : '');
  const [status, setStatus] = useState(initialData?.status || 'Designed');
  const [monitors, setMonitors] = useState(initialData?.monitors?.map(m => m._id || m) || []);
  const [cardMaterials, setCardMaterials] = useState(initialData?.cardMaterials || []);

  const materialsOptions = ["Business cards", "Smart ID Card", "Du-plex Card", "De-Titan Card"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ companyName, planType, totalCardsPaid, dateReceived, dateStarted, status, monitors, cardMaterials });
  };

  const toggleMonitor = (id) => {
    setMonitors(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const toggleMaterial = (mat) => {
    setCardMaterials(prev => prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]);
  };

  return (
    <div style={mStyles.overlay}>
      <form onSubmit={handleSubmit} style={mStyles.modal}>
        <div style={mStyles.modalHeader}>
          <h2 style={mStyles.modalTitle}>{initialData ? '✏️ Edit Client Project' : '➕ Add Client Project'}</h2>
          <button type="button" onClick={onClose} style={mStyles.modalClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={mStyles.field}>
            <label style={mStyles.label}>Company Name</label>
            <input type="text" value={companyName} required onChange={e => setCompanyName(e.target.value)} style={mStyles.input} placeholder="Enter company name" />
          </div>

          <div style={mStyles.field}>
            <label style={mStyles.label}>Plan Type</label>
            <select value={planType} onChange={e => setPlanType(e.target.value)} style={mStyles.input}>
              <option value="Pay as you go">Pay as you go</option>
              <option value="Retainership">Retainership</option>
            </select>
          </div>
        </div>

        <div style={mStyles.field}>
          <label style={mStyles.label}>Card Materials (Select one or more)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', background: 'var(--bg-light)', borderRadius: '10px', border: '1.5px solid var(--border-color)' }}>
            {materialsOptions.map(mat => (
              <label key={mat} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', padding: '6px 12px', borderRadius: '20px', background: cardMaterials.includes(mat) ? '#3b82f622' : 'white', border: `1px solid ${cardMaterials.includes(mat) ? '#3b82f6' : '#e2e8f0'}`, color: cardMaterials.includes(mat) ? '#3b82f6' : '#64748b', fontWeight: '600' }}>
                <input type="checkbox" checked={cardMaterials.includes(mat)} onChange={() => toggleMaterial(mat)} style={{ display: 'none' }} />
                {mat}
              </label>
            ))}
          </div>
        </div>

        {planType === 'Retainership' && (
          <div style={mStyles.field}>
            <label style={mStyles.label}>Total Cards Paid For (Retainership)</label>
            <input type="number" min="0" value={totalCardsPaid} onChange={e => setTotalCardsPaid(e.target.value)} style={mStyles.input} placeholder="e.g. 1000" />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={mStyles.field}>
            <label style={mStyles.label}>Date Received</label>
            <input type="date" value={dateReceived} required onChange={e => setDateReceived(e.target.value)} style={mStyles.input} />
          </div>

          <div style={mStyles.field}>
            <label style={mStyles.label}>Date Started</label>
            <input type="date" value={dateStarted} required onChange={e => setDateStarted(e.target.value)} style={mStyles.input} />
          </div>
        </div>

        <div style={mStyles.field}>
          <label style={mStyles.label}>Current Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={mStyles.input}>
            <option value="Designed">Designed</option>
            <option value="Printed">Printed</option>
            <option value="Dispatched">Dispatched</option>
          </select>
        </div>

        <div style={mStyles.field}>
          <label style={mStyles.label}>Assign Monitors (Staff)</label>
          <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', background: 'var(--bg-light)' }}>
            {staffList.map(staff => (
              <label key={staff._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="checkbox" checked={monitors.includes(staff._id)} onChange={() => toggleMonitor(staff._id)} />
                {staff.name} ({staff.email})
              </label>
            ))}
            {staffList.length === 0 && <span style={{ fontSize: '12px', color: 'gray' }}>No staff found.</span>}
          </div>
        </div>

        <div style={mStyles.modalFooter}>
          <button type="submit" style={mStyles.saveBtn}>💾 Save Project</button>
          <button type="button" onClick={onClose} style={mStyles.cancelBtn}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const UsageModal = ({ onClose, onSubmit, projectName, mode = 'deduct' }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(Number(amount), note);
  };

  return (
    <div style={mStyles.overlay}>
      <form onSubmit={handleSubmit} style={{ ...mStyles.modal, maxWidth: '400px' }}>
        <div style={mStyles.modalHeader}>
          <h2 style={mStyles.modalTitle}>{mode === 'deduct' ? 'Update Usage' : 'Add Paid Cards'}: {projectName}</h2>
          <button type="button" onClick={onClose} style={mStyles.modalClose}>✕</button>
        </div>
        <div style={mStyles.field}>
          <label style={mStyles.label}>{mode === 'deduct' ? 'Cards Produced / Used Today' : 'New Cards Paid For'}</label>
          <input type="number" min="1" value={amount} required onChange={e => setAmount(e.target.value)} style={mStyles.input} placeholder="e.g. 50" />
          <p style={{ fontSize: '11px', color: 'gray', marginTop: '6px' }}>
            {mode === 'deduct' 
              ? 'This number will be deducted from their total remaining cards.' 
              : 'This number will be added to their total cards paid balance.'}
          </p>
        </div>
        {mode === 'deduct' && (
          <div style={mStyles.field}>
            <label style={mStyles.label}>Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} style={mStyles.input} placeholder="e.g. Batch 1, replacement cards, etc." />
          </div>
        )}
        <div style={mStyles.modalFooter}>
          <button type="submit" style={mStyles.saveBtn}>💾 {mode === 'deduct' ? 'Update Cards' : 'Add Cards'}</button>
          <button type="button" onClick={onClose} style={mStyles.cancelBtn}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const ExportModal = ({ onClose, onExport, projects }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCardTypes, setSelectedCardTypes] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  
  // Get unique companies and card types from all projects
  const allCompanies = [...new Set(projects.map(p => p.companyName))].sort();
  const allCardTypes = [...new Set(projects.flatMap(p => p.cardMaterials))];
  
  const handleCompanyToggle = (company) => {
    setSelectedCompanies(prev => 
      prev.includes(company) 
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };
  
  const handleCardTypeToggle = (cardType) => {
    setSelectedCardTypes(prev => 
      prev.includes(cardType) 
        ? prev.filter(t => t !== cardType)
        : [...prev, cardType]
    );
  };
  
  const handleExport = () => {
    onExport(startDate, endDate, selectedCardTypes, selectedCompanies);
  };
  
  return (
    <div style={mStyles.overlay}>
      <div style={{ ...mStyles.modal, maxWidth: '550px' }}>
        <div style={mStyles.modalHeader}>
          <h2 style={mStyles.modalTitle}>📊 Export to Excel</h2>
          <button type="button" onClick={onClose} style={mStyles.modalClose}>✕</button>
        </div>
        
        <div style={mStyles.field}>
          <label style={mStyles.label}>Companies (Select to filter, or leave empty for all)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', background: 'var(--bg-light)', borderRadius: '10px', border: '1.5px solid var(--border-color)', maxHeight: '150px', overflowY: 'auto' }}>
            {allCompanies.length > 0 ? (
              allCompanies.map(company => (
                <label key={company} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', padding: '6px 12px', borderRadius: '20px', background: selectedCompanies.includes(company) ? '#3b82f622' : 'white', border: `1px solid ${selectedCompanies.includes(company) ? '#3b82f6' : '#e2e8f0'}`, color: selectedCompanies.includes(company) ? '#3b82f6' : '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={selectedCompanies.includes(company)} onChange={() => handleCompanyToggle(company)} style={{ display: 'none' }} />
                  {company}
                </label>
              ))
            ) : (
              <span style={{ fontSize: '12px', color: 'gray' }}>No companies found</span>
            )}
          </div>
        </div>
        
        <div style={mStyles.field}>
          <label style={mStyles.label}>Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            style={mStyles.input} 
          />
        </div>
        
        <div style={mStyles.field}>
          <label style={mStyles.label}>End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            style={mStyles.input} 
          />
        </div>
        
        <div style={mStyles.field}>
          <label style={mStyles.label}>Card Types (Select to filter, or leave empty for all)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', background: 'var(--bg-light)', borderRadius: '10px', border: '1.5px solid var(--border-color)', maxHeight: '120px', overflowY: 'auto' }}>
            {allCardTypes.length > 0 ? (
              allCardTypes.map(cardType => (
                <label key={cardType} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', padding: '6px 12px', borderRadius: '20px', background: selectedCardTypes.includes(cardType) ? '#10b98122' : 'white', border: `1px solid ${selectedCardTypes.includes(cardType) ? '#10b981' : '#e2e8f0'}`, color: selectedCardTypes.includes(cardType) ? '#10b981' : '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={selectedCardTypes.includes(cardType)} onChange={() => handleCardTypeToggle(cardType)} style={{ display: 'none' }} />
                  {cardType}
                </label>
              ))
            ) : (
              <span style={{ fontSize: '12px', color: 'gray' }}>No card types found</span>
            )}
          </div>
        </div>
        
        <div style={mStyles.modalFooter}>
          <button type="button" onClick={handleExport} style={mStyles.saveBtn}>📥 Export</button>
          <button type="button" onClick={onClose} style={mStyles.cancelBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

function ClientProgress() {
  const [projects, setProjects] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [usageProject, setUsageProject] = useState(null);
  const [usageMode, setUsageProjectMode] = useState('deduct'); // 'deduct' or 'add'
  const [historyOpen, setHistoryOpen] = useState({});
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportCardTypes, setExportCardTypes] = useState([]);

  // Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      // Determine which endpoint to use based on user role
      const projectsEndpoint = userRole === 'admin' ? '/api/admin/client-projects' : '/api/admin/client-projects/staff/assigned';
      
      const [projRes, staffRes] = await Promise.all([
        fetch(projectsEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/all-staff', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (projRes.ok) setProjects(await projRes.json());
      if (staffRes.ok) setStaffList(await staffRes.json());
      setLoading(false);
    } catch (err) {
      setToast({ message: 'Failed to fetch data', type: 'error' });
      setLoading(false);
    }
  };

  // Get user role from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUserRole(payload.role);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);

  useEffect(() => { 
    if (userRole) fetchData(); 
  }, [userRole]);

  const handleCreateOrEdit = async (data) => {
    const token = localStorage.getItem('token');
    try {
      const url = editingProject
        ? `/api/admin/client-project/${editingProject._id}`
        : '/api/admin/client-project';
      const res = await fetch(url, {
        method: editingProject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Operation failed');

      if (editingProject) {
        setProjects(prev => prev.map(p => p._id === editingProject._id ? resData : p));
        setToast({ message: 'Project updated successfully!', type: 'success' });
      } else {
        setProjects(prev => [resData, ...prev]);
        setToast({ message: 'Project created successfully!', type: 'success' });
      }
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
  };

  const handleUpdateUsage = async (amount, deductionNote) => {
    if (!usageProject?._id) return;
    const token = localStorage.getItem('token');
    const targetId = usageProject._id;
    
    const payload = usageMode === 'add' 
      ? { addTotalCardsPaid: amount } 
      : { addCardsUsed: amount, deductionNote };

    try {
      const res = await fetch(`/api/admin/client-project/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error('Server returned HTML. Check API route.');
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Server error');
      
      setProjects(prev => prev.map(p => p._id === targetId ? resData : p));
      
      if (usageMode === 'deduct') {
        setToast({ message: `Deducted ${amount} cards`, type: 'success' });
      } else {
        setToast({ message: `Added ${amount} cards to balance`, type: 'success' });
      }
      setUsageProject(null);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client tracking record?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/client-project/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects(prev => prev.filter(p => p._id !== id));
      setToast({ message: 'Project deleted', type: 'success' });
    } catch (err) { setToast({ message: err.message, type: 'error' }); }
  };

  const handleExport = async (startDate, endDate, cardTypes, companies) => {
    const token = localStorage.getItem('token');
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (cardTypes.length > 0) params.append('cardTypes', cardTypes.join(','));
      if (companies.length > 0) params.append('companies', companies.join(','));
      
      const url = `/api/admin/export-client-projects?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Export failed');
      
      // Download the file
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Client_Projects_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setShowExportModal(false);
      setToast({ message: 'Export successful!', type: 'success' });
    } catch (err) { 
      setToast({ message: err.message, type: 'error' }); 
    }
  };

  // --- Search, Sort & Pagination Logic ---
  const filteredProjects = projects.filter(p => 
    p.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc': return a.companyName.localeCompare(b.companyName);
      case 'name-desc': return b.companyName.localeCompare(a.companyName);
      case 'newest': return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      case 'oldest': return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
      case 'type': return a.planType.localeCompare(b.planType);
      case 'year': return new Date(b.dateReceived).getFullYear() - new Date(a.dateReceived).getFullYear();
      case 'month': return new Date(b.dateReceived).getMonth() - new Date(a.dateReceived).getMonth();
      default: return 0;
    }
  });

  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-main)' }}>Loading projects...</div>;

  return (
    <div style={s.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <TopBar title="Client Work Progress" />

      <div style={s.main} className="app-content-pad">
        <div style={s.toolbar}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>CRM & Project Tracking</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Track client orders, retainerships, and fulfillment progress.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ ...s.inputSearch, paddingLeft: '34px' }}
              />
            </div>

            {/* Sort Select */}
            <select 
              value={sortOption} 
              onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
              style={s.sortSelect}
            >
              <option value="newest">Sort: Date Modified (Latest)</option>
              <option value="oldest">Sort: Date Modified (Oldest)</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="type">Sort: Plan Type</option>
              <option value="year">Sort: Year Uploaded</option>
              <option value="month">Sort: Month Uploaded</option>
            </select>

            <button style={{ ...s.btnPrimary, background: '#f1f5f9', color: '#475569', boxShadow: 'none' }} onClick={fetchData}>
              🔄 Refresh
            </button>
            <button style={{ ...s.btnPrimary, background: '#10b981', color: 'white' }} onClick={() => setShowExportModal(true)}>
              📊 Export to Excel
            </button>
            {userRole === 'admin' && (
              <button style={s.btnPrimary} onClick={() => { setEditingProject(null); setShowProjectModal(true); }}>
                ➕ New Project
              </button>
            )}
          </div>
        </div>

        <div style={s.layout}>
          {/* LEFT PANEL: Projects Grid */}
          <div style={s.projectsPane}>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                No active client projects found. Create one to get started!
              </div>
            ) : (
              <div style={s.grid}>
                {paginatedProjects.map(proj => {
                  const isRetain = proj.planType === 'Retainership';
                  const cardsLeft = isRetain ? Math.max(0, proj.totalCardsPaid - proj.cardsUsed) : 0;
                  const statusColors = { 'Designed': '#3b82f6', 'Printed': '#f59e0b', 'Dispatched': '#10b981' };

                  return (
                    <div key={proj._id} style={s.card}>
                      <div style={s.cardHeader}>
                        <h3 style={s.companyName}>{proj.companyName}</h3>
                        <div style={s.actions}>
                          <button onClick={() => { setEditingProject(proj); setShowProjectModal(true); }} style={s.iconBtn} title="Edit Project">✏️</button>
                          <button onClick={() => handleDelete(proj._id)} style={{ ...s.iconBtn, color: '#ef4444' }} title="Delete">🗑️</button>
                        </div>
                      </div>

                      <div style={s.tagsRow}>
                        <span style={{ ...s.tag, background: isRetain ? '#8b5cf622' : '#64748b22', color: isRetain ? '#8b5cf6' : '#64748b' }}>
                          {proj.planType}
                        </span>
                        <span style={{ ...s.tag, background: statusColors[proj.status] + '22', color: statusColors[proj.status] }}>
                          {proj.status}
                        </span>
                      </div>

                      {proj.cardMaterials && proj.cardMaterials.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                          {proj.cardMaterials.map(mat => (
                            <span key={mat} style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', border: '1px solid #e2e8f0' }}>
                              🏷️ {mat}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={s.gridData}>
                        <div><strong style={s.dataLabel}>Received:</strong> {new Date(proj.dateReceived).toLocaleDateString()}</div>
                        <div><strong style={s.dataLabel}>Started:</strong> {new Date(proj.dateStarted).toLocaleDateString()}</div>
                      </div>

                      {/* Retainership Logic */}
                      {isRetain && (
                        <div style={s.retainArea}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={s.statValue}>{proj.totalCardsPaid}</div>
                              <div style={s.statLabel}>Paid</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ ...s.statValue, color: '#f59e0b' }}>{proj.cardsUsed}</div>
                              <div style={s.statLabel}>Used</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ ...s.statValue, color: cardsLeft < 50 ? '#ef4444' : '#10b981' }}>{cardsLeft}</div>
                              <div style={s.statLabel}>Left</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setUsageProject(proj); setUsageProjectMode('deduct'); }} style={{ ...s.btnUpdateUsage, flex: 1 }}>
                              📉 Deduct Used
                            </button>
                            <button onClick={() => { setUsageProject(proj); setUsageProjectMode('add'); }} style={{ ...s.btnUpdateUsage, flex: 1, color: '#10b981' }}>
                              💳 Add Paid
                            </button>
                          </div>
                        </div>
                      )}

                      {/* History Sections - Applicable to Retainership Only */}
                      {isRetain && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
                          {/* Deduction History */}
                          <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setHistoryOpen(prev => ({ ...prev, [proj._id]: !prev[proj._id] }));
                              }}
                              style={{ padding: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: historyOpen[proj._id] ? '#f1f5f9' : 'transparent' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '12px' }}>📉</span>
                                <strong style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Deductions ({proj.deductionHistory?.length || 0})
                                </strong>
                              </div>
                              <span style={{ fontSize: '10px', color: '#000', fontWeight: '900' }}>{historyOpen[proj._id] ? '▲' : '▼'}</span>
                            </div>

                            {historyOpen[proj._id] && (
                              <div style={{ maxHeight: '150px', overflowY: 'auto', borderTop: '1px solid var(--border-light)', background: 'white' }}>
                                {proj.deductionHistory && proj.deductionHistory.length > 0 ? (
                                  [...proj.deductionHistory].reverse().map((log, idx) => (
                                    <div key={idx} style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                        <span style={{ fontWeight: '700', color: '#6366f1' }}>{new Date(log.date).toLocaleDateString('en-GB')}</span>
                                        <span style={{ fontWeight: '800', color: '#ef4444' }}>-{log.amount}</span>
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#0f172a', marginTop: '2px' }}>{log.note || 'Used'}</div>
                                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>👤 By: {log.performedBy || 'Admin'}</div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ padding: '10px', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>None</div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Payment History */}
                          <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaymentHistoryOpen(prev => ({ ...prev, [proj._id]: !prev[proj._id] }));
                              }}
                              style={{ padding: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: paymentHistoryOpen[proj._id] ? '#f1f5f9' : 'transparent' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '12px' }}>💳</span>
                                <strong style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Payments ({proj.paymentHistory?.length || 0})
                                </strong>
                              </div>
                              <span style={{ fontSize: '10px', color: '#000', fontWeight: '900' }}>{paymentHistoryOpen[proj._id] ? '▲' : '▼'}</span>
                            </div>

                            {paymentHistoryOpen[proj._id] && (
                              <div style={{ maxHeight: '150px', overflowY: 'auto', borderTop: '1px solid var(--border-light)', background: 'white' }}>
                                {proj.paymentHistory && proj.paymentHistory.length > 0 ? (
                                  [...proj.paymentHistory].reverse().map((log, idx) => (
                                    <div key={idx} style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                        <span style={{ fontWeight: '700', color: '#10b981' }}>{new Date(log.date).toLocaleDateString('en-GB')}</span>
                                        <span style={{ fontWeight: '800', color: '#10b981' }}>+{log.amount}</span>
                                      </div>
                                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', fontWeight: '600' }}>👤 By: {log.performedBy || 'Admin'}</div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ padding: '10px', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>None</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={s.monitorsArea}>
                        <strong style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Monitors</strong>
                        <div style={s.monitorsList}>
                          {proj.monitors && proj.monitors.length > 0 ? (
                            proj.monitors.map(m => (
                              <div key={m._id} style={s.monitorBadge} title={m.email}>{m.name}</div>
                            ))
                          ) : (
                            <span style={{ fontSize: '12px', color: 'gray', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={s.pagination}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{ ...s.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      style={{ 
                        ...s.pageNumber, 
                        background: currentPage === i + 1 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white',
                        color: currentPage === i + 1 ? 'white' : 'var(--text-main)',
                        border: currentPage === i + 1 ? 'none' : '1px solid var(--border-color)'
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{ ...s.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Identicare */}
          <div style={s.promoPane}>
            <div style={s.promoCard}>
              <div style={s.promoIcon}>🛡️</div>
              <h2 style={s.promoTitle}>Identicare Program</h2>
              <div style={s.promoLine} />
              <p style={s.promoText}>
                <strong>Identicare</strong> is our exclusive platform feature designed to deliver unmatched peace of mind to our clients.
              </p>
              <div style={s.promoBox}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>💡</span>
                <div>
                  <strong>The 50% Rule</strong><br />
                  If a client misplaces their cards and wants them reproduced, Identicare ensures they only pay <strong>half the original price</strong> to get them back!
                </div>
              </div>
              <p style={s.promoText}>
                Use this CRM dashboard to track their exact retainership balances. When they request replacements, simply inform them of their Identicare benefits, add a new project, and update their remaining card balances dynamically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showProjectModal && <ProjectModal staffList={staffList} initialData={editingProject} onClose={() => { setShowProjectModal(false); setEditingProject(null); }} onSubmit={handleCreateOrEdit} />}
      {usageProject && <UsageModal projectName={usageProject.companyName} mode={usageMode} onClose={() => setUsageProject(null)} onSubmit={handleUpdateUsage} />}
      {showExportModal && <ExportModal projects={projects} onClose={() => setShowExportModal(false)} onExport={handleExport} />}
    </div>
  );
}

export default ClientProgress;

const s = {
  container: { background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  main: { flex: 1, padding: '24px 32px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)' },
  btnPrimary: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' },
  
  inputSearch: { padding: '10px 14px', borderRadius: '12px', border: '1.5px solid rgba(255, 255, 255, 0.2)', outline: 'none', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', color: 'var(--text-main)', fontSize: '14px', width: '200px', transition: 'all 0.3s ease' },
  sortSelect: { padding: '10px 14px', borderRadius: '12px', border: '1.5px solid rgba(255, 255, 255, 0.2)', outline: 'none', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' },
  
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '32px', padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' },
  pageBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'all 0.3s ease' },
  pageNumber: { width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },

  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)', gap: '24px', alignItems: 'start' },

  projectsPane: { display: 'flex', flexDirection: 'column', gap: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },

  card: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  companyName: { fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0, lineHeight: 1.2 },
  actions: { display: 'flex', gap: '4px' },
  iconBtn: { background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease', backdropFilter: 'blur(8px)' },

  tagsRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tag: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)' },

  gridData: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: 'var(--text-main)', marginBottom: '16px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' },
  dataLabel: { color: 'var(--text-muted)', fontWeight: '600', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' },

  retainArea: { background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.15)' },
  statValue: { fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' },
  statLabel: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' },
  btnUpdateUsage: { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#000000', padding: '8px', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' },

  monitorsArea: { marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' },
  monitorsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
  monitorBadge: { background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: 'var(--text-main)', backdropFilter: 'blur(8px)' },

  promoPane: { position: 'sticky', top: '24px' },
  promoCard: { background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '32px', color: 'white', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)' },
  promoIcon: { fontSize: '48px', marginBottom: '16px' },
  promoTitle: { fontSize: '22px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '0.5px' },
  promoLine: { height: '3px', width: '40px', background: '#3b82f6', marginBottom: '20px', borderRadius: '2px' },
  promoText: { fontSize: '14px', lineHeight: 1.6, color: '#cbd5e1', margin: '0 0 20px 0' },
  promoBox: { background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px', color: '#f8fafc', backdropFilter: 'blur(8px)' },
};

const mStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', width: '100%', maxWidth: '600px', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)', border: '1px solid rgba(255, 255, 255, 0.2)', maxHeight: '85vh', overflowY: 'auto', position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', zIndex: 10, marginTop: '-20px', paddingTop: '20px' },
  modalTitle: { margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-main)' },
  modalClose: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' },
  input: { width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid rgba(255, 255, 255, 0.2)', outline: 'none', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', color: 'var(--text-main)', fontSize: '13px', transition: 'all 0.3s ease' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', position: 'sticky', bottom: 0, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', zIndex: 10, marginBottom: '-20px', paddingBottom: '20px' },
  saveBtn: { background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s ease' },
  cancelBtn: { background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-main)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }
};
