import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadedWorks = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/all-uploaded-files', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      } else {
        console.error('Failed to fetch files:', res.status);
        if (res.status === 401 || res.status === 403) {
          navigate('/admin-login');
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDeleteFile = async (staffId, fileId) => {
    if (!window.confirm('Are you sure you want to delete this file? It will be moved to the recycle bin.')) {
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete-staff-file/${staffId}/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('File moved to recycle bin successfully!');
        fetchFiles(); // Reload files
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (err) {
      alert('Error deleting file');
      console.error(err);
    }
  };

  // Group files by staff
  const staffGroups = files.reduce((acc, file) => {
    if (!acc[file.staffId]) {
      acc[file.staffId] = {
        staffId: file.staffId,
        staffName: file.staffName,
        staffEmail: file.staffEmail,
        department: file.department,
        files: []
      };
    }
    acc[file.staffId].files.push(file);
    return acc;
  }, {});

  const staffList = Object.values(staffGroups);

  // Filter staff by search
  const filteredStaff = staffList.filter(staff => 
    staff.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.staffEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected staff's files
  const selectedStaffFiles = selectedStaff ? staffGroups[selectedStaff]?.files || [] : [];

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📂 Staff Uploaded Works</h2>
          <p style={styles.subtitle}>
            {selectedStaff ? `Viewing ${staffGroups[selectedStaff]?.staffName}'s files` : 'Select a staff member to view their uploads'}
          </p>
        </div>
        <button style={styles.backButton} onClick={() => navigate('/home')}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.mainContent}>
        {/* Sidebar - Staff Folders */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>Staff Members ({filteredStaff.length})</h3>
            <input
              type="text"
              placeholder="🔍 Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.staffList}>
            {filteredStaff.length === 0 ? (
              <p style={styles.emptyText}>No staff found</p>
            ) : (
              filteredStaff.map((staff) => (
                <div
                  key={staff.staffId}
                  style={{
                    ...styles.staffFolder,
                    ...(selectedStaff === staff.staffId ? styles.staffFolderActive : {})
                  }}
                  onClick={() => setSelectedStaff(staff.staffId)}
                >
                  <div style={styles.folderIcon}>📁</div>
                  <div style={styles.staffFolderInfo}>
                    <div style={styles.staffFolderName}>{staff.staffName}</div>
                    <div style={styles.staffFolderMeta}>
                      <span>{staff.department}</span>
                      <span style={styles.fileCount}>{staff.files.length} files</span>
                    </div>
                  </div>
                  {staff.files.length > 0 && (
                    <div style={styles.newBadge}>
                      {staff.files.length}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Files */}
        <div style={styles.contentArea}>
          {!selectedStaff ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📂</div>
              <h3 style={styles.emptyTitle}>Select a Staff Folder</h3>
              <p style={styles.emptyText}>Click on a staff member from the left to view their uploaded files</p>
            </div>
          ) : (
            <>
              <div style={styles.contentHeader}>
                <button 
                  style={styles.closeButton}
                  onClick={() => setSelectedStaff(null)}
                  title="Close folder"
                >
                  ✕
                </button>
                <div style={styles.staffInfoCard}>
                  <div style={styles.staffAvatar}>👤</div>
                  <div>
                    <h3 style={styles.staffInfoName}>{staffGroups[selectedStaff]?.staffName}</h3>
                    <p style={styles.staffInfoEmail}>{staffGroups[selectedStaff]?.staffEmail}</p>
                    <p style={styles.staffInfoDept}>📍 {staffGroups[selectedStaff]?.department}</p>
                  </div>
                </div>
                <div style={styles.statsCard}>
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>{selectedStaffFiles.length}</div>
                    <div style={styles.statLabel}>Total Files</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statValue}>
                      {selectedStaffFiles.filter(f => f.comment).length}
                    </div>
                    <div style={styles.statLabel}>With Comments</div>
                  </div>
                </div>
              </div>

              {selectedStaffFiles.length === 0 ? (
                <div style={styles.noFiles}>
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                <div style={styles.filesList}>
                  {selectedStaffFiles
                    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
                    .map((file, i) => (
                    <div key={i} style={styles.fileCard}>
                      <div style={styles.fileCardHeader}>
                        <div style={styles.fileIconLarge}>📄</div>
                        <div style={styles.fileCardInfo}>
                          <a 
                            href={`http://localhost:5000/${file.filePath}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={styles.fileName}
                          >
                            {file.fileName}
                          </a>
                          <div style={styles.fileMetaRow}>
                            <span style={styles.fileMeta}>
                              📅 {new Date(file.uploadedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span style={styles.fileMeta}>
                              🕐 {new Date(file.uploadedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <a 
                            href={`http://localhost:5000/${file.filePath}`} 
                            download
                            style={styles.downloadButton}
                          >
                            ⬇️ Download
                          </a>
                          <button
                            onClick={() => handleDeleteFile(selectedStaff, file.fileId)}
                            style={styles.deleteButton}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {file.comment && (
                        <div style={styles.commentSection}>
                          <div style={styles.commentLabel}>💬 Staff Comment:</div>
                          <div style={styles.commentText}>{file.comment}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
  header: { background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  title: { fontSize: '32px', margin: 0 },
  subtitle: { fontSize: '14px', margin: '5px 0 0 0', opacity: 0.9 },
  backButton: { padding: '10px 20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' },
  mainContent: { display: 'flex', height: 'calc(100vh - 100px)' },
  
  // Sidebar
  sidebar: { width: '350px', background: 'white', borderRight: '2px solid #e5e7eb', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '20px', borderBottom: '2px solid #e5e7eb' },
  sidebarTitle: { margin: '0 0 15px 0', color: '#1e40af', fontSize: '18px' },
  searchInput: { width: '100%', padding: '10px 15px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', transition: 'border 0.3s' },
  staffList: { flex: 1, overflowY: 'auto', padding: '10px' },
  staffFolder: { padding: '15px', marginBottom: '10px', background: '#f8fafc', borderRadius: '10px', border: '2px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s' },
  staffFolderActive: { background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: '2px solid #3b82f6', transform: 'scale(1.02)' },
  folderIcon: { fontSize: '32px', flexShrink: 0 },
  staffFolderInfo: { flex: 1, minWidth: 0 },
  staffFolderName: { fontWeight: '600', color: '#1e40af', fontSize: '16px', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  staffFolderMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' },
  fileCount: { background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' },
  newBadge: { background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', flexShrink: 0 },
  
  // Content Area
  contentArea: { flex: 1, overflowY: 'auto', padding: '20px' },
  emptyState: { textAlign: 'center', padding: '100px 20px' },
  emptyIcon: { fontSize: '80px', marginBottom: '20px' },
  emptyTitle: { fontSize: '24px', color: '#1e40af', margin: '0 0 10px 0' },
  emptyText: { color: '#6b7280', fontSize: '14px' },
  
  closeButton: { position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)', transition: 'all 0.3s', zIndex: 10 },
  
  contentHeader: { marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', position: 'relative' },
  staffInfoCard: { flex: 1, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  staffAvatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 },
  staffInfoName: { margin: '0 0 5px 0', color: '#1e40af', fontSize: '20px' },
  staffInfoEmail: { margin: '0 0 5px 0', color: '#6b7280', fontSize: '14px' },
  staffInfoDept: { margin: 0, color: '#3b82f6', fontSize: '14px', fontWeight: '600' },
  
  statsCard: { display: 'flex', gap: '20px', background: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statItem: { textAlign: 'center' },
  statValue: { fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '5px' },
  statLabel: { fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' },
  
  noFiles: { textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px', color: '#6b7280' },
  
  filesList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  fileCard: { background: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s' },
  fileCardHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  fileIconLarge: { fontSize: '40px', flexShrink: 0 },
  fileCardInfo: { flex: 1, minWidth: 0 },
  fileName: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600', fontSize: '18px', display: 'block', marginBottom: '8px', wordBreak: 'break-word' },
  fileMetaRow: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  fileMeta: { color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' },
  downloadButton: { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.3s', flexShrink: 0 },
  deleteButton: { padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', transition: 'all 0.3s', flexShrink: 0 },
  
  commentSection: { background: '#f0fdf4', padding: '15px', borderRadius: '10px', border: '2px solid #10b981', marginTop: '15px' },
  commentLabel: { fontWeight: '600', color: '#065f46', marginBottom: '8px', fontSize: '14px' },
  commentText: { color: '#065f46', fontSize: '14px', lineHeight: '1.6' }
};

export default UploadedWorks;
