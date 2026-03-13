import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManagePermissions = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/staff-with-permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const togglePermission = async (staffId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/toggle-view-permission/${staffId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchStaff();
      }
    } catch (err) {
      alert('Error updating permission');
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔐 Manage Staff Permissions</h2>
        <button style={styles.backButton} onClick={() => navigate('/home')}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.infoBox}>
        <p>Control which staff members can view uploaded works from other staff members.</p>
      </div>

      <div style={styles.staffGrid}>
        {staff.map((s) => (
          <div key={s._id} style={styles.staffCard}>
            <div style={styles.staffInfo}>
              <h3 style={styles.staffName}>{s.name}</h3>
              <p style={styles.staffEmail}>{s.email}</p>
              <p style={styles.staffDept}>
                <strong>Department:</strong> {s.department?.name || 'N/A'}
              </p>
            </div>
            
            <div style={styles.permissionSection}>
              <label style={styles.permissionLabel}>
                <input
                  type="checkbox"
                  checked={s.canViewOthersWork}
                  onChange={() => togglePermission(s._id)}
                  style={styles.checkbox}
                />
                <span style={s.canViewOthersWork ? styles.permissionTextActive : styles.permissionText}>
                  {s.canViewOthersWork ? '✓ Can view others work' : '✗ Cannot view others work'}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5', padding: '20px' },
  loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '32px', color: '#1e40af', margin: 0 },
  backButton: { padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  infoBox: { background: '#dbeafe', padding: '15px', borderRadius: '10px', marginBottom: '20px', color: '#1e40af', border: '2px solid #3b82f6' },
  staffGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  staffCard: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: '2px solid #e5e7eb' },
  staffInfo: { marginBottom: '15px', paddingBottom: '15px', borderBottom: '2px solid #e5e7eb' },
  staffName: { margin: '0 0 10px 0', color: '#1e40af', fontSize: '20px' },
  staffEmail: { margin: '5px 0', color: '#6b7280', fontSize: '14px' },
  staffDept: { margin: '5px 0', color: '#374151', fontSize: '14px' },
  permissionSection: { display: 'flex', alignItems: 'center' },
  permissionLabel: { display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  permissionText: { fontSize: '16px', color: '#6b7280' },
  permissionTextActive: { fontSize: '16px', color: '#10b981', fontWeight: '600' }
};

export default ManagePermissions;
