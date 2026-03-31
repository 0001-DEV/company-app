import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const ClientDocumentation = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyForAdd, setSelectedCompanyForAdd] = useState('');
  const [selectedCardType, setSelectedCardType] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showAddRemove, setShowAddRemove] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [allCompanies, setAllCompanies] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showJobAssign, setShowJobAssign] = useState(false);
  const [showStaffAssign, setShowStaffAssign] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [addRemoveAction, setAddRemoveAction] = useState('add');
  const [addRemoveQuantity, setAddRemoveQuantity] = useState('');
  const [manualData, setManualData] = useState({ quantity: '' });
  const [newClientName, setNewClientName] = useState('');
  const [recycleBinData, setRecycleBinData] = useState({ docs: [], companies: [] });
  const [historyData, setHistoryData] = useState([]);
  const [jobInput, setJobInput] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedCompanyView, setSelectedCompanyView] = useState(null);
  const [showCompanyDocs, setShowCompanyDocs] = useState(false);
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [selectedCompanyViewDropdown, setSelectedCompanyViewDropdown] = useState('');
  const [selectedCompanyForStaff, setSelectedCompanyForStaff] = useState('');
  const [companyStaffList, setCompanyStaffList] = useState([]);
  const [showCompanyStaffAssign, setShowCompanyStaffAssign] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [showCardUsageReport, setShowCardUsageReport] = useState(false);
  const [cardUsageData, setCardUsageData] = useState(null);
  const [reportLink, setReportLink] = useState('');
  const fileInputRef = useRef(null);

  const cardTypes = ['Business Card', 'Smart Card', 'Duplex Card', 'De-Titan Card'];

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setUserRole(user.role || '');
        setUserId(user.id || '');
      } catch (err) {
        console.error('Error parsing user info:', err);
      }
    }
    
    fetchDocuments();
    fetchCompanies();
    fetchStaff();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/client-documents/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      // If staff, get only assigned companies; if admin, get all
      const endpoint = userRole === 'admin' 
        ? 'http://localhost:5000/api/mapping/all'
        : 'http://localhost:5000/api/mapping/my-companies';
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchAllCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      // If staff, get only assigned companies; if admin, get all
      const endpoint = userRole === 'admin' 
        ? 'http://localhost:5000/api/mapping/all'
        : 'http://localhost:5000/api/mapping/my-companies';
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllCompanies(data);
      }
    } catch (err) {
      console.error('Error fetching all companies:', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/chat/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const hasAccessToCompany = (companyId) => {
    // Admins have access to all companies
    if (userRole === 'admin') return true;
    
    // Staff can only view if they're assigned to the company
    // This will be checked when fetching company documents
    return true; // Allow staff to see the page, backend will filter
  };

  const fetchRecycleBin = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/client-documents/recycle-bin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecycleBinData(data);
      }
    } catch (err) {
      console.error('Error fetching recycle bin:', err);
    }
  };

  const fetchHistory = async (docId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/${docId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Backend returns { companyName, cardType, currentQuantity, history }
        setHistoryData(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistoryData([]);
    }
  };

  const fetchCompanyDocuments = async (companyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCompanyDocuments(data);
      }
    } catch (err) {
      console.error('Error fetching company documents:', err);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { companyName: 'Example Company', cardType: 'Business Card', quantity: 100 },
      { companyName: 'Example Company', cardType: 'Smart Card', quantity: 50 },
      { companyName: 'Another Company', cardType: 'Duplex Card', quantity: 75 }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Documentation');
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const url = window.URL.createObjectURL(new Blob([buffer]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client-documentation-template.xlsx';
    a.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedCompanyForAdd || !selectedCardType) {
      alert('Please select a company and card type');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyId', selectedCompanyForAdd);
      formData.append('cardType', selectedCardType);

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/client-documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert('File uploaded successfully');
        fetchDocuments();
        if (selectedCompanyViewDropdown) {
          fetchCompanyDocuments(selectedCompanyViewDropdown);
        }
        setSelectedCompanyForAdd('');
        setSelectedCardType('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (docId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/export/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Get the document to find company name
        const doc = documents.find(d => d._id === docId);
        const companyName = doc ? doc.companyName : 'document';
        a.download = `${companyName}-${doc?.cardType || 'report'}.xlsx`;
        a.click();
      }
    } catch (err) {
      console.error('Error exporting document:', err);
    }
  };

  const handleExportCompany = async (companyId) => {
    try {
      const company = allCompanies.find(c => c._id === companyId);
      const companyName = company ? company.companyName : 'company';
      
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/export-company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${companyName}-documentation.xlsx`;
        a.click();
      }
    } catch (err) {
      console.error('Error exporting company data:', err);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Move to recycle bin?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Document moved to recycle bin');
        fetchDocuments();
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleManualEntry = async () => {
    if (!selectedCompanyForAdd || !selectedCardType || !manualData.quantity) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/client-documents/manual-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          companyId: selectedCompanyForAdd,
          cardType: selectedCardType,
          quantity: manualData.quantity,
          fileName: `Manual Entry - ${new Date().toLocaleDateString()}`
        })
      });
      if (res.ok) {
        alert('Entry added successfully');
        fetchDocuments();
        if (selectedCompanyViewDropdown) {
          fetchCompanyDocuments(selectedCompanyViewDropdown);
        }
        setShowManualEntry(false);
        setManualData({ quantity: '' });
        setSelectedCompanyForAdd('');
        setSelectedCardType('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error('Error adding manual entry:', err);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName || !newClientName.trim()) {
      alert('Please enter a client name');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/mapping/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newClientName.trim() })
      });
      if (res.ok) {
        alert('Client created successfully');
        fetchCompanies();
        setShowNewClient(false);
        setNewClientName('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error('Error creating client:', err);
      alert('Error creating client: ' + err.message);
    }
  };

  const handleAddRemove = async () => {
    if (!selectedDoc || !addRemoveQuantity) {
      alert('Please select a document and enter quantity');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/${selectedDoc._id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: addRemoveAction,
          quantity: parseInt(addRemoveQuantity)
        })
      });
      if (res.ok) {
        alert(`Cards ${addRemoveAction}ed successfully`);
        fetchDocuments();
        // Refresh company documents if viewing a specific company
        if (selectedCompanyViewDropdown) {
          fetchCompanyDocuments(selectedCompanyViewDropdown);
        }
        setShowAddRemove(false);
        setAddRemoveQuantity('');
        setSelectedDoc(null);
        setAddRemoveAction('add');
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error('Error updating document:', err);
      alert('Error updating document');
    }
  };

  const handleRestoreFromRecycleBin = async (docId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/${docId}/restore`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Document restored');
        fetchRecycleBin();
        fetchDocuments();
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error('Error restoring document:', err);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/mapping/${companyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Company deleted');
        fetchCompanies();
        fetchAllCompanies();
      }
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  const handleRestoreCompany = async (companyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/mapping/${companyId}/restore`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Company restored');
        fetchCompanies();
      }
    } catch (err) {
      console.error('Error restoring company:', err);
    }
  };

  const handlePermanentDeleteDoc = async (docId) => {
    if (!window.confirm('Permanently delete this document?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/${docId}/permanent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Document permanently deleted');
        fetchRecycleBin();
      }
    } catch (err) {
      console.error('Error permanently deleting document:', err);
    }
  };

  const handlePermanentDeleteCompany = async (companyId) => {
    if (!window.confirm('Permanently delete this company?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/mapping/${companyId}/permanent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Company permanently deleted');
        fetchCompanies();
        fetchAllCompanies();
      }
    } catch (err) {
      console.error('Error permanently deleting company:', err);
    }
  };

  const handleAssignJob = async () => {
    if (!selectedDoc || !jobInput) {
      alert('Please select a document and enter a job');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/${selectedDoc._id}/assign-job`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job: jobInput })
      });
      if (res.ok) {
        alert('Job assigned successfully');
        fetchDocuments();
        setShowJobAssign(false);
        setJobInput('');
        setSelectedDoc(null);
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error('Error assigning job:', err);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedDoc || selectedStaff.length === 0) {
      alert('Please select a document and at least one staff member');
      return;
    }
    try {
      const staffNames = selectedStaff.map(id => {
        const staff = staffList.find(s => s._id === id);
        return staff ? staff.name : '';
      });

      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/${selectedDoc._id}/assign-staff`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staffIds: selectedStaff, staffNames })
      });
      if (res.ok) {
        alert('Staff assigned successfully');
        fetchDocuments();
        setShowStaffAssign(false);
        setSelectedStaff([]);
        setSelectedDoc(null);
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error('Error assigning staff:', err);
    }
  };

  const handleAssignCompanyStaff = async () => {
    if (!selectedCompanyForStaff || companyStaffList.length === 0) {
      alert('Please select a company and at least one staff member');
      return;
    }
    try {
      const staffNames = companyStaffList.map(id => {
        const staff = staffList.find(s => s._id === id);
        return staff ? staff.name : '';
      });

      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/company-staff/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          companyId: selectedCompanyForStaff, 
          staffIds: companyStaffList, 
          staffNames 
        })
      });
      if (res.ok) {
        alert('Staff assigned to company successfully');
        setShowCompanyStaffAssign(false);
        setCompanyStaffList([]);
        setSelectedCompanyForStaff('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error('Error assigning company staff:', err);
      alert('Error assigning staff');
    }
  };

  const handleGenerateCardUsageReport = async (companyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/client-documents/card-usage-report/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCardUsageData(data);
        const encodedId = btoa(companyId);
        
        // Get the host from window.location, but replace localhost with the actual IP
        let host = window.location.host;
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          // Get the machine's IP address from the backend
          try {
            const ipRes = await fetch('http://localhost:5000/api/config/machine-ip');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              host = `${ipData.ip}:3000`;
            }
          } catch (err) {
            console.warn('Could not fetch machine IP, using localhost');
          }
        }
        
        const link = `http://${host}/card-usage-report/${encodedId}`;
        setReportLink(link);
        setShowCardUsageReport(true);
      } else {
        alert('Error generating report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Error generating report');
    }
  };

  const handleViewCompanyDocs = (company) => {
    setSelectedCompanyView(company);
    fetchCompanyDocuments(company._id);
    setShowCompanyDocs(true);
  };

  const glassStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const darkBg = {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#e0e0e0'
  };

  const modalStyle = {
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
    padding: '20px'
  };

  const modalContentStyle = {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  return (
    <div style={{ ...darkBg, minHeight: '100vh', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>📄 Client Documentation</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => { setShowAllCompanies(true); fetchAllCompanies(); }} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>👁️ View All Clients</button>
            {userRole === 'admin' && (
              <button onClick={() => { setShowRecycleBin(true); fetchRecycleBin(); }} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Recycle Bin</button>
            )}
            <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>← Back</button>
          </div>
        </div>

        {/* Identicare Program Section */}
        <div style={{ ...glassStyle, padding: '25px', marginBottom: '30px', background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)' }}>
          <h2 style={{ marginTop: 0, color: '#4CAF50', fontSize: '20px' }}>🛡️ Identicare Program</h2>
          <p style={{ color: '#e0e0e0', marginBottom: '15px', fontSize: '15px' }}>
            <strong>Identicare</strong> is our exclusive platform feature designed to deliver unmatched peace of mind to our clients.
          </p>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h3 style={{ marginTop: 0, color: '#4CAF50', fontSize: '16px' }}>💡 The 50% Rule</h3>
            <p style={{ color: '#e0e0e0', marginBottom: 0 }}>
              If a client misplaces their cards and wants them reproduced, Identicare ensures they only pay <strong>half the original price</strong> to get them back!
            </p>
          </div>
          <p style={{ color: '#e0e0e0', marginBottom: 0, fontSize: '14px' }}>
            Use this CRM dashboard to track their exact retainership balances. When they request replacements, simply inform them of their Identicare benefits, add a new project, and update their remaining card balances dynamically.
          </p>
        </div>

        {/* Step-by-Step Guide */}
        <div style={{ ...glassStyle, padding: '25px', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#fff', fontSize: '20px' }}>📋 Step-by-Step Guide</h2>
          <ol style={{ color: '#e0e0e0', lineHeight: '1.8', marginBottom: 0 }}>
            <li>Select a company from the dropdown or create a new client</li>
            <li>Choose the card type (Business Card, Smart Card, Duplex Card, De-Titan Card)</li>
            <li>Upload an Excel file or manually enter card quantities</li>
            <li>View all documentation in the table below</li>
            <li>Use actions to add/remove cards, assign jobs, or manage staff</li>
            <li>Export summaries or check history for audit trails</li>
          </ol>
        </div>

        {/* Add Documentation Section */}
        <div style={{ ...glassStyle, padding: '25px', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#fff', fontSize: '20px' }}>➕ Add Documentation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <select value={selectedCompanyForAdd} onChange={(e) => setSelectedCompanyForAdd(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: '#1a1a2e', color: '#e0e0e0', fontSize: '14px' }}>
              <option value="" style={{ background: '#1a1a2e', color: '#e0e0e0' }}>Select Company</option>
              {companies.map(c => <option key={c._id} value={c._id} style={{ background: '#1a1a2e', color: '#e0e0e0' }}>{c.companyName}</option>)}
            </select>
            <select value={selectedCardType} onChange={(e) => setSelectedCardType(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: '#1a1a2e', color: '#e0e0e0', fontSize: '14px' }}>
              <option value="" style={{ background: '#1a1a2e', color: '#e0e0e0' }}>Select Card Type</option>
              {cardTypes.map(ct => <option key={ct} value={ct} style={{ background: '#1a1a2e', color: '#e0e0e0' }}>{ct}</option>)}
            </select>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx" disabled={uploading} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', color: '#e0e0e0', fontSize: '14px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowManualEntry(true)} style={{ padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📝 Manual Entry</button>
            <button onClick={handleDownloadTemplate} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📋 Download Template</button>
            {userRole === 'admin' && (
              <>
                <button onClick={() => setShowNewClient(true)} style={{ padding: '10px 20px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>➕ Create New Client</button>
              </>
            )}
          </div>
        </div>

        {/* View Documentation Section */}
        <div style={{ ...glassStyle, padding: '25px', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#fff', fontSize: '20px' }}>📊 View Documentation</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#e0e0e0', marginBottom: '8px', fontWeight: 'bold' }}>Select a Company to View Documentation</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={selectedCompanyViewDropdown} onChange={(e) => {
                setSelectedCompanyViewDropdown(e.target.value);
                if (e.target.value) {
                  fetchCompanyDocuments(e.target.value);
                }
              }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: '#1a1a2e', color: '#e0e0e0', fontSize: '14px', flex: 1, minWidth: '200px' }}>
                <option value="" style={{ background: '#1a1a2e', color: '#e0e0e0' }}>-- Select a Company --</option>
                {companies.map(c => <option key={c._id} value={c._id} style={{ background: '#1a1a2e', color: '#e0e0e0' }}>{c.companyName}</option>)}
              </select>
              {selectedCompanyViewDropdown && (
                <>
                  <button onClick={() => handleExportCompany(selectedCompanyViewDropdown)} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>📥 Export Company Summary</button>
                  <button onClick={() => handleGenerateCardUsageReport(selectedCompanyViewDropdown)} style={{ padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>📊 View Card Usage Report</button>
                  <button onClick={() => { setSelectedCompanyForStaff(selectedCompanyViewDropdown); setShowCompanyStaffAssign(true); }} style={{ padding: '10px 20px', background: '#9C27B0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>👥 Assign Staff to Company</button>
                </>
              )}
            </div>
          </div>
          {!selectedCompanyViewDropdown ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#e0e0e0' }}>
              <p style={{ fontSize: '16px' }}>Select a company from the dropdown above to view its documentation</p>
            </div>
          ) : loading ? (
            <p style={{ color: '#e0e0e0' }}>Loading...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {companyDocuments.length === 0 ? (
                <p style={{ color: '#e0e0e0', textAlign: 'center', padding: '20px' }}>No documentation exists for the selected company</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Client Name</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Card Type</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>File Name</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Quantity</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Date</th>
                      <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyDocuments.map(doc => (
                      <tr key={doc._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '15px' }}>{doc.companyName}</td>
                        <td style={{ padding: '15px' }}>{doc.cardType}</td>
                        <td style={{ padding: '15px' }}>{doc.fileName || 'N/A'}</td>
                        <td style={{ padding: '15px' }}>{doc.quantity}</td>
                        <td style={{ padding: '15px' }}>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                        <td style={{ padding: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <button onClick={() => { setSelectedDoc(doc); setShowAddRemove(true); }} style={{ padding: '6px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>➕ Add</button>
                          <button onClick={() => { setSelectedDoc(doc); setShowAddRemove(true); setAddRemoveAction('remove'); }} style={{ padding: '6px 10px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>➖ Remove</button>
                          <button onClick={() => { setSelectedDoc(doc); setShowJobAssign(true); }} style={{ padding: '6px 10px', background: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>?? Assign Job</button>
                          <button onClick={() => { setSelectedDoc(doc); fetchHistory(doc._id); setShowHistory(true); }} style={{ padding: '6px 10px', background: '#00BCD4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>?? History</button>
                          <button onClick={() => handleExport(doc._id)} style={{ padding: '6px 10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>?? Export</button>
                          <button onClick={() => handleDelete(doc._id)} style={{ padding: '6px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>??? Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div style={modalStyle} onClick={() => setShowManualEntry(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>?? Manual Entry</h2>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <input type="number" placeholder="Quantity" value={manualData.quantity} onChange={(e) => setManualData({ ...manualData, quantity: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', color: '#e0e0e0', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleManualEntry} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Submit</button>
              <button onClick={() => setShowManualEntry(false)} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {showNewClient && (
        <div style={modalStyle} onClick={() => setShowNewClient(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>? Create New Client</h2>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <input type="text" placeholder="Client Name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', color: '#e0e0e0', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCreateClient} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Create</button>
              <button onClick={() => setShowNewClient(false)} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Remove Modal */}
      {showAddRemove && selectedDoc && (
        <div style={modalStyle} onClick={() => setShowAddRemove(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>{addRemoveAction === 'add' ? '? Add Cards' : '? Remove Cards'}</h2>
            <p style={{ color: '#e0e0e0' }}>Document: {selectedDoc.fileName}</p>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <input type="number" placeholder="Quantity" value={addRemoveQuantity} onChange={(e) => setAddRemoveQuantity(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', color: '#e0e0e0', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAddRemove} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Confirm</button>
              <button onClick={() => setShowAddRemove(false)} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Job Assign Modal */}
      {showJobAssign && selectedDoc && (
        <div style={modalStyle} onClick={() => setShowJobAssign(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>?? Assign Job</h2>
            <p style={{ color: '#e0e0e0' }}>Document: {selectedDoc.fileName}</p>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <input type="text" placeholder="Job Name" value={jobInput} onChange={(e) => setJobInput(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', color: '#e0e0e0', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAssignJob} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Assign</button>
              <button onClick={() => setShowJobAssign(false)} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && historyData && historyData.length > 0 && (
        <div style={modalStyle} onClick={() => setShowHistory(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>?? Document History</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Action</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Quantity</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Before</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>After</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>By</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((entry, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <td style={{ padding: '10px' }}>{(entry.action === "created" ? "? CREATED" : entry.action === "added" ? "? ADDED" : entry.action === "removed" ? "? REMOVED" : entry.action?.toUpperCase())}</td>
                      <td style={{ padding: '10px' }}>{entry.quantity}</td>
                      <td style={{ padding: '10px' }}>{entry.previousQuantity}</td>
                      <td style={{ padding: '10px' }}>{entry.newQuantity}</td>
                      <td style={{ padding: '10px' }}>{entry.performedByName}</td>
                      <td style={{ padding: '10px' }}>{new Date(entry.timestamp).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setShowHistory(false)} style={{ marginTop: '20px', padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Close</button>
          </div>
        </div>
      )}

      {/* All Companies Modal */}
      {showAllCompanies && (
        <div style={modalStyle} onClick={() => setShowAllCompanies(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>?? All Clients</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Company Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allCompanies.map(company => (
                    <tr key={company._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <td style={{ padding: '15px' }}>{company.companyName}</td>
                      <td style={{ padding: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleDeleteCompany(company._id)} style={{ padding: '6px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>??? Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setShowAllCompanies(false)} style={{ marginTop: '20px', padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Close</button>
          </div>
        </div>
      )}

      {/* Company Documentation Modal */}
      {showCompanyDocs && selectedCompanyView && (
        <div style={modalStyle} onClick={() => setShowCompanyDocs(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#fff' }}>{selectedCompanyView.companyName} - Documentation</h2>
              <button onClick={() => setShowCompanyDocs(false)} style={{ padding: '8px 16px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Back</button>
            </div>
            <button onClick={() => handleExportCompany(selectedCompanyView._id)} style={{ marginBottom: '20px', padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>?? Export Company Summary</button>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Card Type</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>File Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Quantity</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Date</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companyDocuments.map(doc => (
                    <tr key={doc._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <td style={{ padding: '15px' }}>{doc.cardType}</td>
                      <td style={{ padding: '15px' }}>{doc.fileName || 'N/A'}</td>
                      <td style={{ padding: '15px' }}>{doc.quantity}</td>
                      <td style={{ padding: '15px' }}>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                      <td style={{ padding: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button onClick={() => { setSelectedDoc(doc); setShowAddRemove(true); }} style={{ padding: '6px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>? Add</button>
                        <button onClick={() => { setSelectedDoc(doc); setShowAddRemove(true); setAddRemoveAction('remove'); }} style={{ padding: '6px 10px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>? Remove</button>
                        <button onClick={() => { setSelectedDoc(doc); fetchHistory(doc._id); setShowHistory(true); }} style={{ padding: '6px 10px', background: '#00BCD4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>?? History</button>
                        <button onClick={() => handleExport(doc._id)} style={{ padding: '6px 10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>?? Export</button>
                        <button onClick={() => handleDelete(doc._id)} style={{ padding: '6px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>??? Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bin Modal */}
      {showRecycleBin && (
        <div style={modalStyle} onClick={() => setShowRecycleBin(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>??? Recycle Bin</h2>
            
            <h3 style={{ color: '#fff', marginTop: '20px' }}>Documents</h3>
            {recycleBinData.docs.length > 0 ? (
              <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Company</th>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>File Name</th>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recycleBinData.docs.map(doc => (
                      <tr key={doc._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '10px' }}>{doc.companyName}</td>
                        <td style={{ padding: '10px' }}>{doc.fileName}</td>
                        <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleRestoreFromRecycleBin(doc._id)} style={{ padding: '6px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>?? Restore</button>
                          <button onClick={() => handlePermanentDeleteDoc(doc._id)} style={{ padding: '6px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>??? Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#e0e0e0' }}>No deleted documents</p>
            )}

            <h3 style={{ color: '#fff', marginTop: '20px' }}>Companies</h3>
            {recycleBinData.companies.length > 0 ? (
              <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Company Name</th>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recycleBinData.companies.map(company => (
                      <tr key={company._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '10px' }}>{company.companyName}</td>
                        <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleRestoreCompany(company._id)} style={{ padding: '6px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>?? Restore</button>
                          <button onClick={() => handlePermanentDeleteCompany(company._id)} style={{ padding: '6px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>??? Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#e0e0e0' }}>No deleted companies</p>
            )}

            <button onClick={() => setShowRecycleBin(false)} style={{ marginTop: '20px', padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Close</button>
          </div>
        </div>
      )}

      {/* Card Usage Report Modal */}
      {showCardUsageReport && cardUsageData && (
        <div style={modalStyle} onClick={() => setShowCardUsageReport(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>?? Card Usage Report - {cardUsageData.companyName}</h2>
            
            {/* Report Link Section */}
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ color: '#e0e0e0', marginBottom: '10px', fontSize: '14px' }}>
                <strong>Shareable Link:</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={reportLink} 
                  readOnly 
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(255, 255, 255, 0.3)', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    color: '#e0e0e0',
                    fontSize: '12px'
                  }} 
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(reportLink);
                    alert('Link copied to clipboard!');
                  }}
                  style={{ 
                    padding: '10px 15px', 
                    background: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ?? Copy Link
                </button>
              </div>
            </div>

            {/* Card Usage Summary */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>Card Usage Summary</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Card Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Total Quantity</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Cards Used</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardUsageData.cardTypes && cardUsageData.cardTypes.map((card, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '12px' }}>{card.cardType}</td>
                        <td style={{ padding: '12px' }}>{card.totalQuantity || card.initialQuantity}</td>
                        <td style={{ padding: '12px', color: '#FF9800' }}>{card.cardsUsed}</td>
                        <td style={{ padding: '12px', color: '#4CAF50', fontWeight: 'bold' }}>{card.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed History */}
            {cardUsageData.history && cardUsageData.history.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>Detailed History</h3>
                <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Card Type</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Action</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Quantity</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cardUsageData.history.map((entry, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <td style={{ padding: '10px' }}>{entry.cardType}</td>
                          <td style={{ padding: '10px' }}>
                            {entry.action === 'added' ? '? Added' : entry.action === 'removed' ? '? Removed' : '? Created'}
                          </td>
                          <td style={{ padding: '10px' }}>{entry.quantity}</td>
                          <td style={{ padding: '10px' }}>{new Date(entry.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(reportLink);
                  alert('Link copied to clipboard!');
                }}
                style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ?? Copy Link
              </button>
              <button onClick={() => setShowCardUsageReport(false)} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Assign Modal */}
      {showStaffAssign && selectedDoc && (
        <div style={modalStyle} onClick={() => setShowStaffAssign(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>?? Assign Staff</h2>
            <p style={{ color: '#e0e0e0' }}>Document: {selectedDoc.fileName}</p>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {staffList.map(staff => (
                <label key={staff._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e0e0e0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedStaff.includes(staff._id)} onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStaff([...selectedStaff, staff._id]);
                    } else {
                      setSelectedStaff(selectedStaff.filter(id => id !== staff._id));
                    }
                  }} style={{ cursor: 'pointer' }} />
                  {staff.name}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAssignStaff} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Assign</button>
              <button onClick={() => setShowStaffAssign(false)} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Company Staff Assign Modal */}
      {showCompanyStaffAssign && (
        <div style={modalStyle} onClick={() => setShowCompanyStaffAssign(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>?? Assign Staff to Company</h2>
            <p style={{ color: '#e0e0e0' }}>This will assign staff to handle all card types for this company</p>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {staffList.map(staff => (
                <label key={staff._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e0e0e0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={companyStaffList.includes(staff._id)} onChange={(e) => {
                    if (e.target.checked) {
                      setCompanyStaffList([...companyStaffList, staff._id]);
                    } else {
                      setCompanyStaffList(companyStaffList.filter(id => id !== staff._id));
                    }
                  }} style={{ cursor: 'pointer' }} />
                  {staff.name}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAssignCompanyStaff} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Assign</button>
              <button onClick={() => { setShowCompanyStaffAssign(false); setCompanyStaffList([]); setSelectedCompanyForStaff(''); }} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Card Usage Report Modal */}
      {showCardUsageReport && cardUsageData && (
        <div style={modalStyle} onClick={() => setShowCardUsageReport(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>?? Card Usage Report - {cardUsageData.companyName}</h2>

            {/* Report Link Section */}
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ color: '#e0e0e0', marginBottom: '10px', fontSize: '14px' }}>
                <strong>Shareable Link:</strong>
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={reportLink}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#e0e0e0',
                    fontSize: '12px'
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reportLink);
                    alert('Link copied to clipboard!');
                  }}
                  style={{
                    padding: '10px 15px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ?? Copy Link
                </button>
              </div>
            </div>

            {/* Card Usage Summary */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>Card Usage Summary</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Card Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Total Quantity</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Cards Used</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardUsageData.cardTypes && cardUsageData.cardTypes.map((card, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td style={{ padding: '12px' }}>{card.cardType}</td>
                        <td style={{ padding: '12px' }}>{card.totalQuantity || card.initialQuantity}</td>
                        <td style={{ padding: '12px', color: '#FF9800' }}>{card.cardsUsed}</td>
                        <td style={{ padding: '12px', color: '#4CAF50', fontWeight: 'bold' }}>{card.remaining}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed History */}
            {cardUsageData.history && cardUsageData.history.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>Detailed History</h3>
                <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Card Type</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Action</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Quantity</th>
                        <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cardUsageData.history.map((entry, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <td style={{ padding: '10px' }}>{entry.cardType}</td>
                          <td style={{ padding: '10px' }}>
                            {entry.action === 'added' ? '? Added' : entry.action === 'removed' ? '? Removed' : '? Created'}
                          </td>
                          <td style={{ padding: '10px' }}>{entry.quantity}</td>
                          <td style={{ padding: '10px' }}>{new Date(entry.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(reportLink);
                  alert('Link copied to clipboard!');
                }}
                style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ?? Copy Link
              </button>
              <button onClick={() => setShowCardUsageReport(false)} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>? Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDocumentation;


