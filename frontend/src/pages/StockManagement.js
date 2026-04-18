import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const StockManagement = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [transactionType, setTransactionType] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [newStockName, setNewStockName] = useState('');
  const [newStockQty, setNewStockQty] = useState('');
  const [newStockUnit, setNewStockUnit] = useState('pcs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [staffList, setStaffList] = useState([]);
  const [showAssignMonitor, setShowAssignMonitor] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyStock, setHistoryStock] = useState(null);
  const [showEditStock, setShowEditStock] = useState(false);
  const [editStockName, setEditStockName] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('single');
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportStartMonth, setExportStartMonth] = useState(1);
  const [exportEndMonth, setExportEndMonth] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [showStockManagerModal, setShowStockManagerModal] = useState(false);
  const [stockManagers, setStockManagers] = useState([]);
  const [selectedStaffForManager, setSelectedStaffForManager] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStocks();
    fetchStaff();
    fetchStockManagers();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/stock/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStocks(await res.json());
    } catch (err) {
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStaffList(await res.json());
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const fetchStockManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/stock-manager/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStockManagers(await res.json());
    } catch (err) {
      console.error('Error fetching stock managers:', err);
    }
  };

  const handleCreateStock = async () => {
    if (!newStockName || !newStockQty) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }
      const res = await fetch('/api/stock/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newStockName, quantity: parseInt(newStockQty), unit: newStockUnit })
      });
      
      const text = await res.text();
      console.log('Response status:', res.status);
      console.log('Response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON. Response:', text.substring(0, 500));
        alert('Server error: ' + text.substring(0, 200));
        return;
      }
      
      if (res.ok) {
        alert('Stock created successfully');
        fetchStocks();
        setShowAddStock(false);
        setNewStockName('');
        setNewStockQty('');
        setNewStockUnit('pcs');
      } else {
        alert('Error: ' + (data.message || 'Failed to create stock'));
      }
    } catch (err) {
      console.error('Error creating stock:', err);
      alert('Error creating stock: ' + err.message);
    }
  };

  const handleTransaction = async () => {
    if (!selectedStock || !quantity) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = transactionType === 'add' ? 'add' : 'deduct';
      const res = await fetch(`/api/stock/${selectedStock._id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: parseInt(quantity), reason })
      });
      if (res.ok) {
        fetchStocks();
        setShowTransaction(false);
        setQuantity('');
        setReason('');
        setSelectedStock(null);
      }
    } catch (err) {
      console.error('Error processing transaction:', err);
    }
  };

  const handleAssignMonitor = async () => {
    if (!selectedStock || !selectedMonitor) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/stock/${selectedStock._id}/assign-monitor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monitorId: selectedMonitor })
      });
      if (res.ok) {
        fetchStocks();
        setShowAssignMonitor(false);
        setSelectedMonitor('');
        alert('✅ Monitor assigned successfully');
      }
    } catch (err) {
      console.error('Error assigning monitor:', err);
    }
  };

  const handleEditStock = async () => {
    if (!selectedStock || !editStockName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/stock/${selectedStock._id}/update-name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editStockName.trim() })
      });
      if (res.ok) {
        fetchStocks();
        setShowEditStock(false);
        setEditStockName('');
        alert('✅ Stock name updated');
      } else {
        const error = await res.json();
        alert('Error: ' + (error.message || 'Failed to update'));
      }
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Error updating stock');
    }
  };

  const handleDeleteStock = async (stock) => {
    if (!window.confirm(`Are you sure you want to delete "${stock.name}"? This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/stock/${stock._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStocks();
        alert('✅ Stock deleted successfully');
      } else {
        const error = await res.json();
        alert('Error: ' + (error.message || 'Failed to delete'));
      }
    } catch (err) {
      console.error('Error deleting stock:', err);
      alert('Error deleting stock');
    }
  };

  const handleExportSingleStock = async (stock) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/stock/export-stock/${stock._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${stock.name}-details.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert('✅ Stock exported successfully');
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          alert('Error: ' + (error.message || 'Failed to export'));
        } catch (e) {
          alert('Error: ' + text);
        }
      }
    } catch (err) {
      console.error('Error exporting stock:', err);
      alert('Error exporting stock: ' + err.message);
    }
  };

  const handleAssignStockManager = async () => {
    if (!selectedStaffForManager) {
      alert('Please select a staff member');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/stock-manager/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staffId: selectedStaffForManager })
      });
      const data = await res.json();
      if (res.ok) {
        fetchStockManagers();
        setSelectedStaffForManager('');
        alert('✅ Staff member assigned as stock manager');
      } else {
        alert('Error: ' + (data.message || 'Failed to assign'));
      }
    } catch (err) {
      console.error('Error assigning stock manager:', err);
      alert('Error assigning stock manager: ' + err.message);
    }
  };

  const handleRemoveStockManager = async (staffId) => {
    if (!window.confirm('Remove this staff member from stock managers?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/stock-manager/remove/${staffId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStockManagers();
        alert('✅ Stock manager removed');
      } else {
        const error = await res.json();
        alert('Error: ' + (error.message || 'Failed to remove'));
      }
    } catch (err) {
      console.error('Error removing stock manager:', err);
      alert('Error removing stock manager');
    }
  };

  const handleUploadExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/stock/upload-excel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const result = await res.json();
        console.log('Import result:', result);
        fetchStocks();
        alert(`✅ ${result.count} stocks imported successfully!`);
      } else {
        const error = await res.json();
        alert('Error: ' + (error.message || 'Failed to import'));
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading file: ' + err.message);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { name: 'Pen', quantity: 100, unit: 'pcs' },
      { name: 'Paper A4', quantity: 50, unit: 'box' },
      { name: 'Ink Cartridge', quantity: 20, unit: 'pcs' },
      { name: 'Notebook', quantity: 75, unit: 'pack' },
      { name: 'Marker', quantity: 200, unit: 'pcs' }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stocks');
    
    XLSX.write(workbook, { bookType: 'xlsx', type: 'file', file: 'stock-template.xlsx' });
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const url = window.URL.createObjectURL(new Blob([buffer]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock-template.xlsx';
    a.click();
  };

  const handleExportExcel = async (type = 'single') => {
    try {
      const token = localStorage.getItem('token');
      let endpoint;
      let filename;
      
      if (type === 'range') {
        // Export range of months
        endpoint = `/api/stock/export-range/${exportStartMonth}/${exportEndMonth}/${exportYear}`;
        const startMonthName = new Date(exportYear, exportStartMonth - 1).toLocaleString('default', { month: 'long' });
        const endMonthName = new Date(exportYear, exportEndMonth - 1).toLocaleString('default', { month: 'long' });
        filename = `Stock_${startMonthName}_to_${endMonthName}_${exportYear}.xlsx`;
      } else {
        // Export single month
        endpoint = `/api/stock/export/${exportMonth}/${exportYear}`;
        const monthName = new Date(exportYear, exportMonth - 1).toLocaleString('default', { month: 'long' });
        filename = `Stock_${monthName}_${exportYear}.xlsx`;
      }
      
      console.log('Exporting:', type, 'endpoint:', endpoint);
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response status:', res.status);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        alert('Report exported successfully');
        setShowExportModal(false);
      } else {
        const text = await res.text();
        console.error('Export error response:', text);
        try {
          const errorData = JSON.parse(text);
          alert('Error: ' + (errorData.message || 'Failed to export'));
        } catch (e) {
          alert('Error: ' + text);
        }
      }
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Error exporting report: ' + err.message);
    }
  };

  const filteredStocks = stocks.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Pagination logic
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

  const S = {
    root: { display: 'flex', flexDirection: 'column', gap: 20, padding: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#e9edef' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
    title: { fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, color: '#f1f5f9' },
    btnGroup: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    btn: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: 'rgba(99,102,241,0.2)', color: '#6366f1', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.3)' },
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none' },
    searchBox: { padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e9edef', outline: 'none', width: '100%', maxWidth: 300 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 100%, 380px), 1fr))', gap: 20 },
    card: { background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12, padding: 20, transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: 16 },
    cardHover: { background: 'rgba(30,41,59,0.95)', borderColor: 'rgba(99,102,241,0.5)', boxShadow: '0 8px 32px rgba(99,102,241,0.1)' },
    stockName: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 0 },
    stockInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: 0, fontSize: 13, flexWrap: 'wrap', gap: 8 },
    quantity: { fontSize: 24, fontWeight: 700, color: '#6366f1', marginBottom: 0 },
    monitor: { fontSize: 12, color: '#94a3b8', marginBottom: 0 },
    actions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
    smallBtn: { flex: 1, minWidth: '80px', padding: '10px 12px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(99,102,241,0.2)', color: '#6366f1', transition: 'all 0.2s' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 16, padding: 32, maxWidth: 500, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' },
    input: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e9edef', marginBottom: 12, outline: 'none', fontSize: 13, boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e9edef', marginBottom: 12, outline: 'none', fontSize: 13, boxSizing: 'border-box', colorScheme: 'dark' }
  };

  return (
    <div style={S.root}>
      <style>{`
        select option {
          background: #1e293b;
          color: #e9edef;
        }
        select option:hover {
          background: #334155;
        }
      `}</style>
      <div style={S.header}>
        <div>
          <div style={S.title}>📦 Stock Management</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Track inventory in real-time</div>
        </div>
        <div style={S.btnGroup}>
          <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setShowAddStock(true)}>+ New Stock</button>
          <button style={S.btn} onClick={() => fileInputRef.current?.click()}>📥 Import Excel</button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleUploadExcel} style={{ display: 'none' }} />
          <button style={S.btn} onClick={handleDownloadTemplate}>📋 Template</button>
          <button style={S.btn} onClick={() => setShowStockManagerModal(true)}>👥 Manage Managers</button>
          <button style={S.btn} onClick={() => { setExportType('single'); setExportMonth(new Date().getMonth() + 1); setExportYear(new Date().getFullYear()); setShowExportModal(true); }}>📊 Export</button>
          <button style={{ ...S.btn, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => navigate('/home')}>← Back</button>
        </div>
      </div>

      <input type="text" placeholder="🔍 Search stocks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={S.searchBox} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>
      ) : (
        <>
          <div style={S.grid}>
            {paginatedStocks.map(stock => (
            <div key={stock._id} style={S.card} onMouseEnter={e => Object.assign(e.currentTarget.style, S.cardHover)} onMouseLeave={e => Object.assign(e.currentTarget.style, { background: S.card.background, borderColor: S.card.borderColor })}>
              <div style={S.stockName}>{stock.name}</div>
              <div style={S.quantity}>{stock.currentQuantity} {stock.unit}</div>
              <div style={S.stockInfo}>
                <span>Unit: {stock.unit}</span>
                <span>Transactions: {stock.transactions?.length || 0}</span>
              </div>
              {stock.monitor && <div style={S.monitor}>👤 Monitor: {stock.monitorName}</div>}
              <div style={S.actions}>
                <button style={{ ...S.smallBtn, background: 'rgba(34,197,94,0.2)', color: '#22c55e' }} onClick={() => { setSelectedStock(stock); setTransactionType('add'); setShowTransaction(true); }}>➕ Add</button>
                <button style={{ ...S.smallBtn, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => { setSelectedStock(stock); setTransactionType('deduct'); setShowTransaction(true); }}>➖ Use</button>
                <button style={{ ...S.smallBtn, background: 'rgba(168,85,247,0.2)', color: '#a855f7' }} onClick={() => { setHistoryStock(stock); setShowHistory(true); }}>📋 History</button>
              </div>
              <div style={S.actions}>
                <button style={{ ...S.smallBtn, background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }} onClick={() => { setSelectedStock(stock); setShowAssignMonitor(true); }}>👤 Assign</button>
                <button style={{ ...S.smallBtn, background: 'rgba(249,115,22,0.2)', color: '#f97316' }} onClick={() => { setSelectedStock(stock); setEditStockName(stock.name); setShowEditStock(true); }}>✏️ Edit</button>
                <button style={{ ...S.smallBtn, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => handleDeleteStock(stock)}>🗑️ Delete</button>
              </div>
              <div style={S.actions}>
                <button style={{ ...S.smallBtn, background: 'rgba(34,197,94,0.2)', color: '#22c55e' }} onClick={() => handleExportSingleStock(stock)}>📥 Export</button>
              </div>
            </div>
          ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <button 
                style={{ ...S.btn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }} 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    style={{
                      ...S.btn,
                      background: currentPage === page ? '#6366f1' : 'rgba(99,102,241,0.2)',
                      color: currentPage === page ? '#fff' : '#6366f1',
                      padding: '8px 12px',
                      minWidth: '36px'
                    }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                style={{ ...S.btn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }} 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>

              <div style={{ fontSize: 13, color: '#94a3b8', marginLeft: 16 }}>
                Page {currentPage} of {totalPages} ({filteredStocks.length} total)
              </div>
            </div>
          )}
        </>
      )}

      {showAddStock && (
        <div style={S.modal} onClick={() => setShowAddStock(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>➕ Add New Stock</div>
            <input type="text" placeholder="Stock name" value={newStockName} onChange={e => setNewStockName(e.target.value)} style={S.input} />
            <input type="number" placeholder="Quantity" value={newStockQty} onChange={e => setNewStockQty(e.target.value)} style={S.input} />
            <select value={newStockUnit} onChange={e => setNewStockUnit(e.target.value)} style={S.select}>
              <option>pcs</option>
              <option>kg</option>
              <option>ltr</option>
              <option>box</option>
              <option>pack</option>
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ ...S.btn, flex: 1 }} onClick={() => setShowAddStock(false)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1 }} onClick={handleCreateStock}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showTransaction && (
        <div style={S.modal} onClick={() => setShowTransaction(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{transactionType === 'add' ? '➕ Add Stock' : '➖ Use Stock'}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Stock: {selectedStock?.name}</div>
            <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} style={S.input} />
            <input type="text" placeholder="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} style={S.input} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ ...S.btn, flex: 1 }} onClick={() => setShowTransaction(false)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1 }} onClick={handleTransaction}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showAssignMonitor && (
        <div style={S.modal} onClick={() => setShowAssignMonitor(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>👤 Assign Monitor</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Stock: {selectedStock?.name}</div>
            <select value={selectedMonitor} onChange={e => setSelectedMonitor(e.target.value)} style={S.select}>
              <option value="">Select staff member...</option>
              {staffList.map(staff => (
                <option key={staff._id} value={staff._id}>{staff.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ ...S.btn, flex: 1 }} onClick={() => setShowAssignMonitor(false)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1 }} onClick={handleAssignMonitor}>Assign</button>
            </div>
          </div>
        </div>
      )}

      {showHistory && historyStock && (
        <div style={S.modal} onClick={() => setShowHistory(false)}>
          <div style={{ ...S.modalContent, maxWidth: 700, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 Transaction History - {historyStock.name}</div>
            {historyStock.transactions && historyStock.transactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {historyStock.transactions.map((transaction, idx) => (
                  <div key={idx} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: transaction.type === 'add' ? '#22c55e' : '#ef4444' }}>
                        {transaction.type === 'add' ? '➕ Added' : '➖ Used'} {transaction.quantity} {historyStock.unit}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {new Date(transaction.date).toLocaleDateString()} {new Date(transaction.date).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>
                      <strong>By:</strong> {transaction.addedByName || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                      <strong>Reason:</strong> {transaction.reason || 'No reason provided'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No transactions yet</div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1 }} onClick={() => setShowHistory(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showEditStock && (
        <div style={S.modal} onClick={() => setShowEditStock(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>✏️ Edit Stock Name</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Stock: {selectedStock?.name}</div>
            <input type="text" placeholder="New stock name" value={editStockName} onChange={e => setEditStockName(e.target.value)} style={S.input} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ ...S.btn, flex: 1 }} onClick={() => setShowEditStock(false)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1 }} onClick={handleEditStock}>Update</button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div style={S.modal} onClick={() => setShowExportModal(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📊 Export Stock Report</div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#cbd5e1' }}>Export Type</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#cbd5e1' }}>
                  <input type="radio" name="exportType" value="single" checked={exportType === 'single'} onChange={e => setExportType(e.target.value)} />
                  Single Month
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#cbd5e1' }}>
                  <input type="radio" name="exportType" value="range" checked={exportType === 'range'} onChange={e => setExportType(e.target.value)} />
                  Month Range
                </label>
              </div>
            </div>

            {exportType === 'single' ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#cbd5e1' }}>Select Month</label>
                  <select value={exportMonth} onChange={e => setExportMonth(parseInt(e.target.value))} style={S.select}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#cbd5e1' }}>Select Year</label>
                  <select value={exportYear} onChange={e => setExportYear(parseInt(e.target.value))} style={S.select}>
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: '#cbd5e1' }}>
                  <strong>File name:</strong> Stock_{new Date(exportYear, exportMonth - 1).toLocaleString('default', { month: 'long' })}_{exportYear}.xlsx
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#cbd5e1' }}>From Month</label>
                  <select value={exportStartMonth} onChange={e => setExportStartMonth(parseInt(e.target.value))} style={S.select}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#cbd5e1' }}>To Month</label>
                  <select value={exportEndMonth} onChange={e => setExportEndMonth(parseInt(e.target.value))} style={S.select}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#cbd5e1' }}>Select Year</label>
                  <select value={exportYear} onChange={e => setExportYear(parseInt(e.target.value))} style={S.select}>
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: '#cbd5e1' }}>
                  <strong>File name:</strong> Stock_{new Date(exportYear, exportStartMonth - 1).toLocaleString('default', { month: 'long' })}_to_{new Date(exportYear, exportEndMonth - 1).toLocaleString('default', { month: 'long' })}_{exportYear}.xlsx
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ ...S.btn, flex: 1 }} onClick={() => setShowExportModal(false)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1 }} onClick={() => handleExportExcel(exportType)}>Export</button>
            </div>
          </div>
        </div>
      )}

      {showStockManagerModal && (
        <div style={S.modal} onClick={() => setShowStockManagerModal(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>👥 Manage Stock Managers</div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#cbd5e1' }}>Assign New Manager</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={selectedStaffForManager} onChange={e => setSelectedStaffForManager(e.target.value)} style={{ ...S.select, flex: 1, marginBottom: 0 }}>
                  <option value="">Select staff member...</option>
                  {staffList.map(staff => (
                    <option key={staff._id} value={staff._id}>{staff.name}</option>
                  ))}
                </select>
                <button style={{ ...S.btn, ...S.btnPrimary, padding: '12px 20px' }} onClick={handleAssignStockManager}>Assign</button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#cbd5e1' }}>Current Managers</label>
              {stockManagers.length === 0 ? (
                <div style={{ fontSize: 13, color: '#94a3b8', padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: 8 }}>
                  No stock managers assigned yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stockManagers.map(manager => (
                    <div key={manager._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>{manager.staffName}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{manager.staffEmail}</div>
                      </div>
                      <button style={{ ...S.btn, background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '6px 12px', fontSize: 12 }} onClick={() => handleRemoveStockManager(manager.staffId)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1 }} onClick={() => setShowStockManagerModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
