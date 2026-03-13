// pages/Department.jsx
import React, { useState, useEffect } from 'react';

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

// Department modal for add/edit
const DepartmentModal = ({ onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, _id: initialData?._id });
    setName('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '10px',
        width: '90%', maxWidth: '400px', boxShadow: '0 0 15px rgba(0,0,0,0.2)'
      }}>
        <h2>{initialData ? 'Edit Department' : 'Create Department'}</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>Department Name</label>
          <input
            type="text"
            value={name}
            required
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>Save</button>
          <button type="button" onClick={onClose} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch departments from backend
  const fetchDepartments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load departments', type: 'error' });
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  // 🔹 Add/Edit department
  const handleAddOrEditDept = async (data) => {
    const token = localStorage.getItem('token');
    try {
      let res;

      if (data._id) {
        // Editing existing department
        res = await fetch(`http://localhost:5000/api/admin/edit-department/${data._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: data.name })
        });
      } else {
        // Creating new department
        res = await fetch(`http://localhost:5000/api/admin/create-department`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: data.name })
        });
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Operation failed');

      if (data._id) {
        // Update existing department in state
        setDepartments(prev => prev.map(d => d._id === data._id ? { ...d, name: data.name } : d));
        setToast({ message: 'Department updated!', type: 'success' });
      } else {
        // Add new department to state (resData.department OR resData)
setDepartments(prev => [...prev, resData]);
        setToast({ message: 'Department created!', type: 'success' });
      }

      setShowModal(false);
      setEditingDept(null);

    } catch (err) {
      console.error(err);
      setToast({ message: err.message, type: 'error' });
    }
  };

  // Delete department
  const handleDeleteDept = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete-department/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Delete failed');
      setDepartments(prev => prev.filter(d => d._id !== id));
      setToast({ message: 'Department deleted!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Departments</h1>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button onClick={() => { setShowModal(true); setEditingDept(null); }} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', marginBottom: '15px' }}>➕ Create Department</button>

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
                <button onClick={() => { setEditingDept(d); setShowModal(true); }} style={{ padding: '5px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '5px' }}>Edit</button>
                <button onClick={() => handleDeleteDept(d._id)} style={{ padding: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && <DepartmentModal onClose={() => { setShowModal(false); setEditingDept(null); }} onSubmit={handleAddOrEditDept} initialData={editingDept} />}
    </div>
  );
};

export default Department;
