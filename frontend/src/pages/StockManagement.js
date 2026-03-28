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
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStocks();
    fetchStaff();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/stock/all', {
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
      const res = await fetch('http://localhost:5000/api/chat/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStaffList(await res.json());
    } catch (err) {
      console.error('Error fetching staff:', err);
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
      const res = await fetch('http://localhost:5000/api/stock/create', {
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
      const res = await fetch(`http://localhost:5000/api/stock/${selectedStock._id}/${endpoint}`, {
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
      const res = await fetch(`http://localhost:5000/api/stock/${selectedStock._id}/assign-monitor`, {
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
      const res = await fetch(`http://localhost:5000/api/stock/${selectedStock._id}/update-name`, {
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

  const handleUploadExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/stock/upload-excel', {
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

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Exporting for month:', selectedMonth, 'year:', selectedYear);
      const res = await fetch(`http://localhost:5000/api/stock/export/${selectedMonth}/${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response status:', res.status);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-report-${selectedMonth}-${selectedYear}.xlsx`;
        a.click();
        alert('Report exported successfully');
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

  const S = {
    root: { display: 'flex', flexDirection: 'column', gap: 20, padding: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: '#e9edef' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
    title: { fontSize: 28, fontWeight: 700, color: '#f1f5f9' },
    btnGroup: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    btn: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: 'rgba(99,102,241,0.2)', color: '#6366f1', backdropFilter: 'blur(10px)', border: '1px solid rgba(99,102,241,0.3)' },
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none' },
    searchBox: { padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e9edef', outline: 'none', width: '100%', maxWidth: 300 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
    card: { background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12, padding: 20, transition: 'all 0.3s' },
    cardHover: { background: 'rgba(30,41,59,0.95)', borderColor: 'rgba(99,102,241,0.5)', boxShadow: '0 8px 32px rgba(99,102,241,0.1)' },
    stockName: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 },
    stockInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 },
    quantity: { fontSize: 24, fontWeight: 700, color: '#6366f1', marginBottom: 12 },
    monitor: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
    actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    smallBtn: { flex: 1, padding: '8px 12px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(99,102,241,0.2)', color: '#6366f1', transition: 'all 0.2s' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 16, padding: 32, maxWidth: 500, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' },
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
          <button style={S.btn} onClick={() => setShowAssignMonitor(true)}>👤 Assign Monitor</button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={{ ...S.select, marginBottom: 0, width: 100 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'short' })}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ ...S.select, marginBottom: 0, width: 100 }}>
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button style={S.btn} onClick={handleExportExcel}>📊 Export</button>
          </div>
          <button style={{ ...S.btn, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => navigate('/home')}>← Back</button>
        </div>
      </div>

      <input type="text" placeholder="🔍 Search stocks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={S.searchBox} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>
      ) : (
        <div style={S.grid}>
          {filteredStocks.map(stock => (
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
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default StockManagement;
