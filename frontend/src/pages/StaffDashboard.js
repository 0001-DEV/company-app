import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BirthdayNotification from '../components/BirthdayNotification';

const StaffDashboard = () => {
  const [staff, setStaff] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileComments, setFileComments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [canViewOthers, setCanViewOthers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/staff-login');
        return;
      }

      try {
        const staffRes = await fetch('http://localhost:5000/api/chat/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!staffRes.ok) {
          alert('Failed to load staff data. Please login again.');
          navigate('/staff-login');
          return;
        }
        
        const staffData = await staffRes.json();
        setStaff(staffData);
        
        // Check if staff can view others' work by fetching their own user data
        const userRes = await fetch(`http://localhost:5000/api/staff/my-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('User profile data:', userData);
          console.log('Can view others work:', userData.canViewOthersWork);
          setCanViewOthers(userData.canViewOthersWork === true);
        } else {
          console.error('Failed to fetch user profile:', userRes.status);
        }

        const jobsRes = await fetch('http://localhost:5000/api/staff/my-jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData);
        } else {
          setJobs([]);
        }
        
        const filesRes = await fetch('http://localhost:5000/api/staff/my-files', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          setUploadedFiles(filesData);
        } else {
          setUploadedFiles([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching staff data:', err);
        alert('Error loading dashboard. Please try again.');
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [navigate]);

  const handleFileUpload = async () => {
    if (!files || files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const url = 'http://localhost:5000/api/staff/upload-general-file';

      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const responseData = await res.json();

      if (res.ok) {
        alert(`${files.length} file(s) uploaded successfully!`);
        setFiles([]);
        window.location.reload();
      } else {
        alert(`Failed to upload files: ${responseData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Error uploading files: ${err.message}`);
    }
  };

  const handleDeleteFile = async (fileId, uploadedAt) => {
    const uploadTime = new Date(uploadedAt);
    const now = new Date();
    const hoursDiff = (now - uploadTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 1.5) {
      alert('Cannot delete file after 1.5 hours of upload');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/staff/delete-file/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('File deleted successfully!');
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete file: ${errorData.message}`);
      }
    } catch (err) {
      alert('Error deleting file');
      console.error(err);
    }
  };

  const handleUpdateComment = async (fileId) => {
    const commentText = fileComments[fileId];
    if (!commentText || !commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/staff/file-comment/${fileId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: commentText })
      });

      if (res.ok) {
        alert('Comment updated successfully!');
        window.location.reload();
      } else {
        alert('Failed to update comment');
      }
    } catch (err) {
      alert('Error updating comment');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/staff-login');
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  // Filter uploaded files based on search query
  const filteredFiles = uploadedFiles.filter(file => {
    const fileName = (file.originalName || file.path.split('/').pop()).toLowerCase();
    const fileComment = (file.comment || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fileName.includes(query) || fileComment.includes(query);
  });

  return (
    <div style={styles.container}>
      <BirthdayNotification userRole="staff" />
      
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Staff Dashboard</h2>
          <p style={styles.subtitle}>Welcome, {staff?.name}</p>
          {/* Debug: Show permission status */}
          <p style={{ fontSize: '12px', opacity: 0.8, margin: '5px 0 0 0' }}>
            Permission to view others' work: {canViewOthers ? 'YES ✓' : 'NO ✗'}
          </p>
        </div>
        <div style={styles.headerRight}>
          {canViewOthers && (
            <button style={styles.viewOthersButton} onClick={() => navigate('/all-staff-works')}>
              👥 View All Staff Works
            </button>
          )}
          <button style={styles.chatButton} onClick={() => navigate('/chat')}>
            💬 Chat with Admin
          </button>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.sectionTitle}>My Work Files</h3>

        <div style={styles.standaloneUpload}>
          <h3 style={styles.standaloneTitle}>📤 Upload Work Files</h3>
          <p style={styles.standaloneHint}>Upload your completed work, documents, or progress files (multiple files allowed)</p>
          
          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              <span style={styles.uploadIcon}>📁</span>
              <span>Choose files from your computer</span>
              <input 
                type="file" 
                multiple
                onChange={(e) => {
                  const selectedFiles = e.target.files;
                  if (selectedFiles && selectedFiles.length > 0) {
                    setFiles(selectedFiles);
                  }
                }}
                style={styles.fileInputHidden}
              />
            </label>
            
            {files && files.length > 0 && (
              <div style={styles.selectedFilesContainer}>
                <h4 style={{ margin: '15px 0 10px 0', color: '#1e40af' }}>
                  Selected Files ({files.length})
                </h4>
                {Array.from(files).map((file, idx) => (
                  <div key={idx} style={styles.selectedFile}>
                    <div style={styles.fileIcon}>📄</div>
                    <div style={styles.fileDetails}>
                      <div style={styles.fileName}>{file.name}</div>
                      <div style={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</div>
                    </div>
                  </div>
                ))}
                <button 
                  style={styles.uploadButton}
                  onClick={handleFileUpload}
                >
                  Upload All Files
                </button>
              </div>
            )}
          </div>
          
          <div style={styles.allFilesSection}>
            <div style={styles.searchSection}>
              <h4 style={styles.allFilesTitle}>📎 My Uploaded Files ({filteredFiles.length})</h4>
              <div style={styles.searchBox}>
                <input
                  type="text"
                  placeholder="🔍 Search files by name or comment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
                {searchQuery && (
                  <button 
                    style={styles.clearButton}
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {filteredFiles.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                {searchQuery ? `No files found matching "${searchQuery}"` : 'No files uploaded yet'}
              </p>
            ) : (
              <>
                <div style={styles.filesGrid}>
                  {filteredFiles
                    .slice((currentPage - 1) * filesPerPage, currentPage * filesPerPage)
                    .map((file, i) => {
                    const uploadTime = new Date(file.uploadedAt);
                    const now = new Date();
                    const hoursDiff = (now - uploadTime) / (1000 * 60 * 60);
                    const canDelete = hoursDiff <= 1.5;
                    
                    return (
                      <div key={i} style={styles.fileCardHorizontal}>
                        <div style={styles.filePreview}>
                          <div style={styles.fileIconLarge}>📄</div>
                          <a href={`http://localhost:5000/${file.path}`} target="_blank" rel="noopener noreferrer" style={styles.fileNameHorizontal}>
                            {(file.originalName || file.path.split('/').pop()).substring(0, 20)}...
                          </a>
                        </div>
                        
                        <div style={styles.fileDetails}>
                          <div style={styles.fileDateSmall}>
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </div>
                          {canDelete && (
                            <button 
                              style={styles.deleteButtonSmall}
                              onClick={() => handleDeleteFile(file._id, file.uploadedAt)}
                              title="Delete file"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        
                        <div style={styles.commentSectionCompact}>
                          {file.comment && (
                            <div style={styles.commentPreview}>
                              💬 {file.comment.substring(0, 30)}...
                            </div>
                          )}
                          <textarea
                            placeholder="Comment..."
                            value={fileComments[file._id] !== undefined ? fileComments[file._id] : (file.comment || '')}
                            onChange={(e) => setFileComments({...fileComments, [file._id]: e.target.value})}
                            style={styles.commentTextareaSmall}
                          />
                          <button 
                            style={styles.commentSaveButtonSmall}
                            onClick={() => handleUpdateComment(file._id)}
                          >
                            {file.comment ? '✏️' : '💬'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                {filteredFiles.length > filesPerPage && (
                  <div style={styles.pagination}>
                    <button
                      style={{...styles.paginationButton, ...(currentPage === 1 ? styles.paginationButtonDisabled : {})}}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    <span style={styles.paginationInfo}>
                      Page {currentPage} of {Math.ceil(filteredFiles.length / filesPerPage)}
                    </span>
                    <button
                      style={{...styles.paginationButton, ...(currentPage === Math.ceil(filteredFiles.length / filesPerPage) ? styles.paginationButtonDisabled : {})}}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredFiles.length / filesPerPage)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' },
  loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
  header: { background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  title: { margin: 0, fontSize: '28px' },
  subtitle: { margin: '5px 0 0 0', opacity: 0.9 },
  headerRight: { display: 'flex', gap: '10px' },
  viewOthersButton: { padding: '10px 20px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' },
  chatButton: { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  logoutButton: { padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  content: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: { fontSize: '24px', marginBottom: '20px', color: '#1e40af' },
  standaloneUpload: { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '30px', border: '3px solid #3b82f6' },
  standaloneTitle: { margin: '0 0 10px 0', color: '#1e40af', fontSize: '24px', fontWeight: '700' },
  standaloneHint: { margin: '0 0 20px 0', color: '#64748b', fontSize: '16px' },
  allFilesSection: { marginTop: '25px', paddingTop: '25px', borderTop: '2px solid #e5e7eb' },
  allFilesTitle: { margin: '0 0 15px 0', color: '#1e40af', fontSize: '18px' },
  searchSection: { marginBottom: '20px' },
  searchBox: { position: 'relative', marginTop: '10px' },
  searchInput: { width: '100%', padding: '12px 40px 12px 15px', borderRadius: '10px', border: '2px solid #3b82f6', fontSize: '16px', outline: 'none', transition: 'all 0.3s' },
  clearButton: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  filesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
  fileCardHorizontal: { background: 'white', padding: '20px', borderRadius: '15px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '300px' },
  filePreview: { textAlign: 'center', paddingBottom: '15px', borderBottom: '2px solid #e5e7eb' },
  fileIconLarge: { fontSize: '60px', marginBottom: '10px' },
  fileNameHorizontal: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600', display: 'block', fontSize: '14px', wordBreak: 'break-word' },
  fileDetails: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' },
  fileDateSmall: { fontSize: '12px', color: '#94a3b8' },
  deleteButtonSmall: { padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'all 0.3s' },
  commentSectionCompact: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  commentPreview: { fontSize: '12px', color: '#059669', background: '#f0fdf4', padding: '8px', borderRadius: '6px', border: '1px solid #10b981' },
  commentTextareaSmall: { width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e5e7eb', minHeight: '60px', fontSize: '13px', fontFamily: 'Arial, sans-serif', resize: 'vertical' },
  commentSaveButtonSmall: { padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px', padding: '20px' },
  paginationButton: { padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s' },
  paginationButtonDisabled: { background: '#94a3b8', cursor: 'not-allowed', opacity: 0.6 },
  paginationInfo: { fontSize: '16px', fontWeight: '600', color: '#1e40af' },
  uploadBox: { background: 'white', padding: '20px', borderRadius: '10px', border: '2px dashed #3b82f6' },
  uploadLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', transition: 'all 0.3s', border: 'none' },
  uploadIcon: { fontSize: '24px' },
  fileInputHidden: { display: 'none' },
  selectedFilesContainer: { marginTop: '15px' },
  selectedFile: { marginTop: '10px', padding: '15px', background: '#f0fdf4', borderRadius: '10px', border: '2px solid #10b981', display: 'flex', alignItems: 'center', gap: '15px' },
  fileIcon: { fontSize: '32px' },
  fileDetails: { flex: 1 },
  fileName: { fontWeight: '600', color: '#065f46', marginBottom: '5px' },
  fileSize: { fontSize: '12px', color: '#6b7280' },
  uploadButton: { padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s', whiteSpace: 'nowrap', marginTop: '15px', width: '100%' },
  fileCardExtended: { background: '#ffffff', padding: '25px', borderRadius: '15px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s', position: 'relative' },
  fileCardHeader: { display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb' },
  fileCardIcon: { fontSize: '40px', flexShrink: 0 },
  fileCardInfo: { flex: 1, minWidth: 0 },
  fileCardName: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600', display: 'block', marginBottom: '8px', fontSize: '18px', wordBreak: 'break-word' },
  fileCardDate: { color: '#94a3b8', fontSize: '13px', marginTop: '5px' },
  deleteButton: { padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s', whiteSpace: 'nowrap', flexShrink: 0 },
  fileCommentSection: { marginTop: '15px', background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' },
  existingComment: { background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '12px', color: '#065f46', border: '2px solid #10b981', fontSize: '14px', lineHeight: '1.6' },
  commentTextarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', minHeight: '80px', marginBottom: '10px', fontSize: '14px', fontFamily: 'Arial, sans-serif', resize: 'vertical', transition: 'border 0.3s' },
  commentSaveButton: { padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s', width: '100%' }
};

export default StaffDashboard;
