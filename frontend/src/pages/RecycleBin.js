import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecycleBin = () => {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeletedFiles();
  }, []);

  const fetchDeletedFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/recycle-bin', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDeletedFiles(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deleted files:', err);
      setLoading(false);
    }
  };

  const restoreFile = async (staffId, fileId) => {
    if (!window.confirm('Are you sure you want to restore this file?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/restore-file/${staffId}/${fileId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('File restored successfully!');
        fetchDeletedFiles();
      } else {
        const data = await response.json();
        alert(`Failed to restore: ${data.message}`);
      }
    } catch (err) {
      alert('Error restoring file');
      console.error(err);
    }
  };

  const permanentlyDelete = async (staffId, fileId) => {
    if (!window.confirm('Are you sure you want to permanently delete this file? This cannot be undone!')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/permanent-delete/${staffId}/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('File permanently deleted!');
        fetchDeletedFiles();
      } else {
        const data = await response.json();
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (err) {
      alert('Error deleting file');
      console.error(err);
    }
  };

  const filteredFiles = deletedFiles.filter(item => {
    const query = searchQuery.toLowerCase();
    return item.staffName.toLowerCase().includes(query) ||
           item.file.originalName.toLowerCase().includes(query);
  });

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/admin-dashboard')}>
          ← Back to Dashboard
        </button>
        <h2 style={styles.title}>🗑️ Recycle Bin</h2>
        <p style={styles.subtitle}>Restore or permanently delete files</p>
      </div>

      <div style={styles.content}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Search deleted files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {filteredFiles.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🗑️</div>
            <h3>Recycle Bin is Empty</h3>
            <p>No deleted files found</p>
          </div>
        ) : (
          <div style={styles.filesList}>
            {filteredFiles.map((item, index) => (
              <div key={index} style={styles.fileCard}>
                <div style={styles.fileHeader}>
                  <div style={styles.fileIcon}>📄</div>
                  <div style={styles.fileInfo}>
                    <div style={styles.fileName}>{item.file.originalName}</div>
                    <div style={styles.staffInfo}>
                      Staff: <strong>{item.staffName}</strong> ({item.staffEmail})
                    </div>
                    <div style={styles.fileDate}>
                      Uploaded: {new Date(item.file.uploadedAt).toLocaleString()}
                    </div>
                    <div style={styles.deleteDate}>
                      Deleted: {new Date(item.file.deletedAt).toLocaleString()}
                    </div>
                    {item.file.comment && (
                      <div style={styles.comment}>
                        Comment: {item.file.comment}
                      </div>
                    )}
                  </div>
                </div>
                <div style={styles.actions}>
                  <button
                    style={styles.restoreButton}
                    onClick={() => restoreFile(item.staffId, item.file._id)}
                  >
                    ♻️ Restore
                  </button>
                  <button
                    style={styles.deleteButton}
                    onClick={() => permanentlyDelete(item.staffId, item.file._id)}
                  >
                    🗑️ Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' },
  loading: { textAlign: 'center', padding: '50px', fontSize: '18px' },
  header: { background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  backButton: { padding: '10px 20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px', fontWeight: '600' },
  title: { margin: '0 0 10px 0', fontSize: '32px' },
  subtitle: { margin: 0, opacity: 0.9 },
  content: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  searchBox: { marginBottom: '30px' },
  searchInput: { width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #3b82f6', fontSize: '16px', outline: 'none' },
  emptyState: { textAlign: 'center', padding: '60px', color: '#6b7280' },
  emptyIcon: { fontSize: '80px', marginBottom: '20px' },
  filesList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fileCard: { background: 'var(--bg-card, white)', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid #e5e7eb' },
  fileHeader: { display: 'flex', gap: '20px', marginBottom: '20px' },
  fileIcon: { fontSize: '40px', flexShrink: 0 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: '18px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' },
  staffInfo: { fontSize: '14px', color: '#6b7280', marginBottom: '5px' },
  fileDate: { fontSize: '13px', color: 'var(--text-lighter, #94a3b8)', marginBottom: '3px' },
  deleteDate: { fontSize: '13px', color: '#ef4444', fontWeight: '600', marginBottom: '8px' },
  comment: { fontSize: '14px', color: '#059669', marginTop: '10px', padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #10b981' },
  actions: { display: 'flex', gap: '15px' },
  restoreButton: { padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s' },
  deleteButton: { padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s' }
};

export default RecycleBin;
