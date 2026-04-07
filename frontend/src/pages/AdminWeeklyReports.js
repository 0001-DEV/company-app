import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminWeeklyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekInfo, setWeekInfo] = useState({ weekNumber: 0, year: 0 });
  const [filterDept, setFilterDept] = useState('');
  const [searchStaff, setSearchStaff] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchDepartments();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reports/all-current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setWeekInfo({ weekNumber: data.weekNumber, year: data.year });
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredReports = reports.filter(report => {
    const matchDept = !filterDept || report.user?.department?._id === filterDept;
    const matchSearch = !searchStaff || report.user?.name?.toLowerCase().includes(searchStaff.toLowerCase());
    return matchDept && matchSearch;
  });

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

  return (
    <div style={{ ...darkBg, minHeight: '100vh', padding: '30px 20px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: '14px 20px',
          borderRadius: '10px',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: 14
        }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>📊 Weekly Reports</h1>
            <p style={{ margin: '8px 0 0 0', color: '#b0b0b0', fontSize: '14px' }}>Review all staff submissions</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}>
              Week {weekInfo.weekNumber}, {weekInfo.year}
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ ...glassStyle, padding: '20px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Filter by Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e0e0e0',
                  fontSize: '14px'
                }}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Search Staff</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchStaff}
                onChange={(e) => setSearchStaff(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e0e0e0',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={fetchReports}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e0e0e0' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <p>Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ ...glassStyle, padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
            <p style={{ color: '#b0b0b0', marginBottom: '10px' }}>
              {searchStaff || filterDept ? 'No reports match your filters' : 'No reports submitted yet for this week'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredReports.map(report => (
              <div
                key={report._id}
                style={{ ...glassStyle, padding: '20px', cursor: 'pointer', transition: 'all 0.3s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                }}
                onClick={() => {
                  setSelectedReport(report);
                  setShowModal(true);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                  {report.user?.profilePicture ? (
                    <img 
                      src={`${report.user.profilePicture}?t=${Date.now()}`}
                      alt={report.user?.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid rgba(16, 185, 129, 0.3)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    display: report.user?.profilePicture ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {report.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>{report.user?.name}</div>
                    <div style={{ color: '#b0b0b0', fontSize: '12px' }}>{report.user?.department?.name}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>✅ Progress</div>
                    <div style={{ color: '#b0b0b0', fontSize: '13px', lineHeight: '1.5', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.progress || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>📌 Plans</div>
                    <div style={{ color: '#b0b0b0', fontSize: '13px', lineHeight: '1.5', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.plans || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>⚠️ Problems</div>
                    <div style={{ color: '#b0b0b0', fontSize: '13px', lineHeight: '1.5', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.problems || '—'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', color: '#b0b0b0' }}>
                  Submitted: {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedReport && (
        <div style={{
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
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {selectedReport.user?.profilePicture ? (
                  <img 
                    src={`${selectedReport.user.profilePicture}?t=${Date.now()}`}
                    alt={selectedReport.user?.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid rgba(16, 185, 129, 0.3)'
                    }}
                    onError={(e) => {
                      e.style.display = 'none';
                    }}
                  />
                ) : null}
                <div>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>{selectedReport.user?.name}</h2>
                  <p style={{ margin: '8px 0 0 0', color: '#b0b0b0', fontSize: '14px' }}>{selectedReport.user?.department?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>✅ Progress</h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '15px',
                  borderRadius: '10px',
                  color: '#e0e0e0',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {selectedReport.progress || 'No progress recorded'}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 12px 0', color: '#f59e0b', fontSize: '16px', fontWeight: 'bold' }}>📌 Plans</h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '15px',
                  borderRadius: '10px',
                  color: '#e0e0e0',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {selectedReport.plans || 'No plans recorded'}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 12px 0', color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>⚠️ Problems</h3>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '15px',
                  borderRadius: '10px',
                  color: '#e0e0e0',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {selectedReport.problems || 'No problems recorded'}
                </div>
              </div>

              <div style={{ paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '13px', color: '#b0b0b0' }}>
                <div>Submitted: {new Date(selectedReport.createdAt).toLocaleString()}</div>
                {selectedReport.updatedAt !== selectedReport.createdAt && (
                  <div>Last Updated: {new Date(selectedReport.updatedAt).toLocaleString()}</div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: '30px',
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWeeklyReports;
