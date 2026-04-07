import React, { useEffect, useState } from 'react';
import { getToken } from '../auth';

// Simple toast notification
const Toast = ({ message, type = 'success', onClose }) => (
  <div style={{
    position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
    padding: '15px 25px', borderRadius: '8px',
    backgroundColor: type === 'success' ? '#28a745' : '#dc3545',
    color: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
  }}>
    {message}
    <button onClick={onClose} style={{
      marginLeft: '15px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold'
    }}>×</button>
  </div>
);

// Modal component for adding/editing department
const DepartmentModal = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name });
    setName('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'var(--bg-card, white)', padding: '30px', borderRadius: '10px',
        width: '90%', maxWidth: '400px', boxShadow: '0 0 15px rgba(0,0,0,0.2)'
      }}>
        <h2>{initialData ? 'Edit Department' : 'Add New Department'}</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>Name</label>
          <input type="text" value={name} required onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>Save</button>
          <button type="button" onClick={onClose} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

function AllDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const fetchDepartments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDepartments(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load departments', type: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleAddOrEdit = async (data) => {
    const token = localStorage.getItem('token');
    try {
      if (editingData) {
        // Edit department
        await fetch(`/api/admin/departments/${editingData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(data)
        });
        setDepartments(prev => prev.map(d => d._id === editingData._id ? { ...d, ...data } : d));
        setToast({ message: 'Department updated!', type: 'success' });
      } else {
        // Add new department
        const res = await fetch('/api/admin/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(data)
        });
        const newDept = await res.json();
        setDepartments(prev => [...prev, newDept]);
        setToast({ message: 'Department added!', type: 'success' });
      }
      setShowModal(false);
      setEditingData(null);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Operation failed', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`/api/admin/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(prev => prev.filter(d => d._id !== id));
      setToast({ message: 'Department deleted!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>All Departments</h1>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>➕ Add Department</button>
      </div>

      {loading ? <p>Loading departments...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1976d2', color: 'white' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{d.name}</td>
                <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                  <button onClick={() => { setEditingData(d); setShowModal(true); }} style={{ padding: '5px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '5px' }}>Edit</button>
                  <button onClick={() => handleDelete(d._id)} style={{ padding: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && <DepartmentModal
        onClose={() => { setShowModal(false); setEditingData(null); }}
        onSubmit={handleAddOrEdit}
        initialData={editingData}
      />}
    </div>
  );
}

export default AllDepartments;
