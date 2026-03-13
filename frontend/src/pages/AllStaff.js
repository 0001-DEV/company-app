import React, { useEffect, useState } from 'react';
import { getToken } from '../auth';
import { Link } from 'react-router-dom';

// Toast notification
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

// Staff Modal
const StaffModal = ({ onClose, onSubmit, departments, initialData, viewOnly }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [department, setDepartment] = useState(initialData?.department?._id || initialData?.department || '');
  const [password, setPassword] = useState(initialData?.password || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!viewOnly) {
      onSubmit({ name, email, departmentId: department, password });
      setName(''); setEmail(''); setDepartment(''); setPassword('');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '10px',
        width: '90%', maxWidth: '500px', boxShadow: '0 0 15px rgba(0,0,0,0.2)'
      }}>
        <h2>{viewOnly ? 'Staff Details' : (initialData ? 'Edit Staff' : 'Add New Staff')}</h2>

        <div style={{ marginBottom: '10px' }}>
          <label>Name</label>
          {viewOnly ? <p>{name}</p> :
            <input type="text" value={name} required onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '8px' }} />}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          {viewOnly ? <p>{email}</p> :
            <input type="email" value={email} required onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px' }} />}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Department</label>
          {viewOnly ? <p>{initialData?.department?.name || department}</p> :
            <select value={department} onChange={e => setDepartment(e.target.value)} required>
  <option value="" disabled hidden>Select Department</option>
  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
</select>
}
        </div>

        {viewOnly && (
          <div style={{ marginBottom: '10px' }}>
            <label>Assigned Jobs</label>
            {initialData?.assignedJobs?.length > 0 ? (
              <ul>
                {initialData.assignedJobs.map(job => (
                  <li key={job._id}>{job.name}</li>
                ))}
              </ul>
            ) : <p>None</p>}
          </div>
        )}

        {!initialData && !viewOnly && (
          <div style={{ marginBottom: '10px' }}>
            <label>Password</label>
            <input type="password" value={password} required onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {!viewOnly && <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>Save</button>}
          <button type="button" onClick={onClose} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>Close</button>
        </div>
      </form>
    </div>
  );
};

// Department Modal
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
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const fetchStaff = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setToast({ message: 'You are not logged in!', type: 'error' }); setLoading(false); return; }

    try {
      const resStaff = await fetch('http://localhost:5000/api/admin/all-staff', { headers: { 'Authorization': `Bearer ${token}` } });
      const staffData = await resStaff.json();
      setStaff(staffData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server');
      setLoading(false);
    }
  };

  const refreshDepartments = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch("http://localhost:5000/api/admin/fixed-departments", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDepartments(data); // <— this updates the dropdown
  } catch (err) {
    console.error("Failed to refresh departments", err);
  }
};
 

  useEffect(() => {
    fetchStaff();
    refreshDepartments();
  }, []);
  useEffect(() => {
  if (!showDeptModal) {
    refreshDepartments();
  }
}, [showDeptModal]);


  const filteredStaff = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filteredStaff.length / perPage);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) { setToast({ message: 'You are not logged in!', type: 'error' }); return; }
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete-staff/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Delete failed');
      setStaff(prev => prev.filter(s => s._id !== id));
      setToast({ message: 'Staff deleted!', type: 'success' });
    } catch (err) { setToast({ message: 'Failed to delete', type: 'error' }); }
  };

  const handleAddOrEdit = async (data) => {
    const token = localStorage.getItem('token');
    if (!token) { setToast({ message: 'You are not logged in!', type: 'error' }); return; }

    try {
      let res;
      if (editingData) {
        res = await fetch(`http://localhost:5000/api/admin/edit-staff/${editingData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch('http://localhost:5000/api/admin/create-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(data)
        });
      }

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Operation failed');

      if (editingData) {
        const updatedDepartment = departments.find(d => d._id === data.departmentId);
        setStaff(prev => prev.map(s => s._id === editingData._id ? { ...s, name: data.name, email: data.email, department: updatedDepartment } : s));
        setToast({ message: 'Staff updated!', type: 'success' });
      } else {
        const dept = departments.find(d => d._id === data.departmentId);
        setStaff(prev => [...prev, { ...resData, department: dept }]);
        setToast({ message: 'Staff added!', type: 'success' });
      }

      setShowStaffModal(false);
      setEditingData(null);
      setViewOnly(false);

    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

const handleAddOrEditDept = async (data) => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:5000/api/admin/create-department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: data.name })
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed');

    // Update departments state immediately so StaffModal dropdown gets it
    setDepartments(prev => [...prev, resData]); 
    setShowDeptModal(false); // close department modal

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>All Staff</h1>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
        <input type="text" placeholder="Search by name/email" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px', flex: '1 1 250px' }} />
<div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  }}
>
          <button onClick={() => { setEditingData(null); setShowStaffModal(true); setViewOnly(false); }} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
            ➕ Add Staff
          </button>
         <button
  onClick={() => {
    setEditingDept(null);   // reset editing
    setShowDeptModal(true); // open modal
  }}
  style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', border: 'none' }}
>
  🏢 Add Department
</button>

          <Link to="/department" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
            Departments
          </Link>
        </div>
      </div>

      {loading && <p>Loading staff...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1976d2', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Department</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Assigned Jobs</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{s.name}</td>
                  <td style={{ padding: '10px' }}>{s.email}</td>
                  <td style={{ padding: '10px' }}>{s.department?.name || '---'}</td>
                  <td style={{ padding: '10px' }}>{s.assignedJobs?.length || 0}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                    <button onClick={() => { setEditingData(s); setShowStaffModal(true); setViewOnly(true); }} style={{ padding: '5px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px' }}>View</button>
                    <button onClick={() => { setEditingData(s); setShowStaffModal(true); setViewOnly(false); }} style={{ padding: '5px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '5px' }}>Edit</button>
                    <button onClick={() => handleDelete(s._id)} style={{ padding: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} style={{
                padding: '8px 12px',
                backgroundColor: p === currentPage ? '#007bff' : '#e0e0e0',
                color: p === currentPage ? 'white' : 'black',
                border: 'none', borderRadius: '5px', cursor: 'pointer'
              }}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {showStaffModal && <StaffModal
        onClose={() => { setShowStaffModal(false); setEditingData(null); setViewOnly(false); }}
        onSubmit={handleAddOrEdit}
        departments={departments}
        initialData={editingData}
        viewOnly={viewOnly}
      />}

      {showDeptModal && <DepartmentModal
        onClose={() => setShowDeptModal(false)}
        onSubmit={handleAddOrEditDept}
        initialData={editingDept}
      />}
    </div>

  );
}




export default AllStaff;
