<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const FILE_ICONS = {
  pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗',
  ppt: '📙', pptx: '📙', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
  gif: '🖼️', mp4: '🎬', mov: '🎬', mp3: '🎵', wav: '🎵',
  zip: '🗜️', rar: '🗜️', txt: '📄', csv: '📊',
};

const getFileIcon = (name = '') => {
  const ext = name.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || '📎';
};

const getFileExt = (name = '') => name.split('.').pop().toUpperCase();

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const avatarColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', top: 20, right: 20, zIndex: 9999,
    padding: '13px 20px', borderRadius: 10, color: 'white', fontWeight: 600, fontSize: 14,
    background: type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 10
  }}>
    {type === 'success' ? '✅' : '❌'} {message}
    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontWeight: 'bold' }}>×</button>
  </div>
);

const UploadedWorks = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [search, setSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | name
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [viewFile, setViewFile] = useState(null);
  const [renameModal, setRenameModal] = useState(null); // { staffId, fileId }
  const [renameValue, setRenameValue] = useState('');
  const filesPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => { fetchFiles(); }, []);

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/admin-login'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/admin/all-uploaded-files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setFiles(await res.json());
      else if (res.status === 401 || res.status === 403) navigate('/admin-login');
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (staffId, fileId, fileName) => {
    if (!window.confirm(`Move "${fileName}" to recycle bin?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete-staff-file/${staffId}/${fileId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { showToast('File moved to recycle bin'); fetchFiles(); }
      else { const d = await res.json(); showToast(d.message || 'Delete failed', 'error'); }
    } catch (err) { showToast('Error deleting file', 'error'); }
  };

  // Group by staff
  const staffGroups = files.reduce((acc, file) => {
    if (!acc[file.staffId]) {
      acc[file.staffId] = { staffId: file.staffId, staffName: file.staffName, staffEmail: file.staffEmail, department: file.department, files: [] };
    }
    acc[file.staffId].files.push(file);
    return acc;
  }, {});

  const staffList = Object.values(staffGroups);
  const filteredStaff = staffList.filter(s =>
    s.staffName.toLowerCase().includes(search.toLowerCase()) ||
    s.staffEmail.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const selectedGroup = selectedStaffId ? staffGroups[selectedStaffId] : null;
  const selectedFiles = (selectedGroup?.files || [])
    .filter(f => {
      const q = fileSearch.toLowerCase();
      return (
        (f.fileName || '').toLowerCase().includes(q) ||
        (f.comment || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const da = new Date(a.uploadedAt);
      const db = new Date(b.uploadedAt);
      
      if (sortBy === 'oldest') return da.getTime() - db.getTime();
      if (sortBy === 'name') return (a.fileName || '').localeCompare(b.fileName || '');
      if (sortBy === 'type') {
        const extA = (a.fileName || '').split('.').pop().toLowerCase();
        const extB = (b.fileName || '').split('.').pop().toLowerCase();
        return extA.localeCompare(extB);
      }
      if (sortBy === 'year') return db.getFullYear() - da.getFullYear();
      if (sortBy === 'month') return db.getMonth() - da.getMonth();
      
      return db.getTime() - da.getTime(); // newest
    });

  const totalPages = Math.ceil(selectedFiles.length / filesPerPage);
  const pagedFiles = selectedFiles.slice((currentPage - 1) * filesPerPage, currentPage * filesPerPage);

  const totalFiles = files.length;
  const totalStaff = staffList.length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #1e293b', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: 15 }}>Loading files...</p>
      </div>
    </div>
  );

  return (
    <div style={S.page} className="ignore-dark">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* File preview modal */}      {viewFile && (
        <div style={S.previewOverlay} onClick={() => setViewFile(null)}>
          <div style={S.previewBox} onClick={e => e.stopPropagation()}>
            <div style={S.previewHeader}>
              <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>{viewFile.fileName}</span>
              <button onClick={() => setViewFile(null)} style={S.previewClose}>✕</button>
            </div>
            {/\.(jpg|jpeg|png|gif|webp)$/i.test(viewFile.fileName) ? (
              <img src={`http://localhost:5000/${viewFile.filePath}`} alt={viewFile.fileName}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
            ) : /\.(mp4|mov|webm)$/i.test(viewFile.fileName) ? (
              <video controls style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}>
                <source src={`http://localhost:5000/${viewFile.filePath}`} />
              </video>
            ) : /\.(mp3|wav|ogg|webm)$/i.test(viewFile.fileName) ? (
              <audio controls style={{ width: '100%', marginTop: 20 }}>
                <source src={`http://localhost:5000/${viewFile.filePath}`} />
              </audio>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-lighter, #94a3b8)' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>{getFileIcon(viewFile.fileName)}</div>
                <p>Preview not available for this file type.</p>
                <a href={`http://localhost:5000/${viewFile.filePath}`} download style={S.dlBtn}>⬇ Download to view</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rename work modal */}
      {renameModal && (
        <div style={S.renameOverlay} onClick={() => setRenameModal(null)}>
          <div style={S.renameBox} onClick={e => e.stopPropagation()}>
            <div style={S.renameHead}>
              <div style={S.renameTitle}>Rename Work</div>
              <button style={S.renameClose} onClick={() => setRenameModal(null)}>✕</button>
            </div>

            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--text-lighter, #94a3b8)', marginBottom: 8, fontWeight: 700 }}>
                Current: <span style={{ color: '#e2e8f0' }}>{renameModal.fileName}</span>
              </div>

              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                style={S.renameInput}
                placeholder="Enter new work name"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button style={S.renameCancelBtn} onClick={() => setRenameModal(null)}>
                  Cancel
                </button>
                <button
                  style={S.renameSaveBtn}
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    try {
                      const res = await fetch(
                        `http://localhost:5000/api/admin/rename-staff-file/${renameModal.staffId}/${renameModal.fileId}`,
                        {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ displayName: renameValue }),
                        }
                      );
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(data.message || 'Rename failed');
                      showToast('Work renamed');
                      setRenameModal(null);
                      fetchFiles();
                    } catch (err) {
                      showToast(err.message, 'error');
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TopBar
        title="📂 Work Bank"
        subtitle={`${totalStaff} staff · ${totalFiles} files`}
        backPath="/home"
      />

      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={S.headerIcon}>📂</div>
          <div>
            <div style={S.headerTitle}>Work Bank</div>
            <div style={S.headerSub}>All staff file submissions</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={S.statPill}>👥 {totalStaff} staff</div>
          <div style={S.statPill}>📎 {totalFiles} files</div>
          <button style={S.backBtn} onClick={() => navigate('/home')}>← Dashboard</button>
        </div>
      </div>
      <div style={S.body} className="uploaded-works-body">
        {/* Sidebar */}
        <div style={S.sidebar} className="uploaded-works-sidebar">
          <div style={S.sidebarTop}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted, #64748b)' }}>🔍</span>
              <input type="text" placeholder="Search staff..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={S.sidebarSearch} />
            </div>
          </div>
          <div style={S.sidebarList}>
            {filteredStaff.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted, #475569)', fontSize: 13 }}>No staff with uploads</div>
            ) : filteredStaff.map((staff, i) => {
              const color = avatarColors[i % avatarColors.length];
              const isActive = selectedStaffId === staff.staffId;
              return (
                <div key={staff.staffId}
                  style={{ ...S.staffItem, ...(isActive ? { ...S.staffItemActive, borderLeft: `3px solid ${color}` } : {}) }}
                  onClick={() => { setSelectedStaffId(staff.staffId); setCurrentPage(1); setFileSearch(''); }}>
                  <div style={{ ...S.staffAvatar, background: color }}>{getInitials(staff.staffName)}</div>
                  <div style={S.staffItemInfo}>
                    <div style={S.staffItemName}>{staff.staffName}</div>
                    <div style={S.staffItemSub}>{staff.department}</div>
                  </div>
                  <div style={{ ...S.fileBadge, background: isActive ? color : '#334155', color: 'white' }}>
                    {staff.files.length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div style={S.main}>
          {!selectedGroup ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>📂</div>
              <div style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Select a Staff Member</div>
              <div style={{ color: 'var(--text-muted, #64748b)', fontSize: 14 }}>Choose someone from the left panel to view their uploaded files</div>
            </div>
          ) : (
            <>
              {/* Staff info bar */}
              <div style={S.staffBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ ...S.staffAvatar, width: 48, height: 48, fontSize: 18, background: avatarColors[filteredStaff.findIndex(s => s.staffId === selectedStaffId) % avatarColors.length] }}>
                    {getInitials(selectedGroup.staffName)}
                  </div>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>{selectedGroup.staffName}</div>
                    <div style={{ color: 'var(--text-muted, #64748b)', fontSize: 12 }}>{selectedGroup.staffEmail} · {selectedGroup.department}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={S.miniStat}><span style={{ color: '#3b82f6', fontWeight: 700 }}>{selectedGroup.files.length}</span> files</div>
                  <div style={S.miniStat}><span style={{ color: '#10b981', fontWeight: 700 }}>{selectedGroup.files.filter(f => f.comment).length}</span> comments</div>
                  <button style={S.closeBtn} onClick={() => setSelectedStaffId(null)}>✕</button>
                </div>
              </div>

              {/* File search */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', maxWidth: 360, flex: '1 1 260px' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted, #64748b)' }}>🔍</span>
                  <input type="text" placeholder="Search files..." value={fileSearch}
                    onChange={e => { setFileSearch(e.target.value); setCurrentPage(1); }}
                    style={{ ...S.sidebarSearch, paddingLeft: 36, background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>Sort</span>
                  <select style={S.sortSelect} value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}>
                  <option value="newest">🗓️ Date Modified (Newest)</option>
                  <option value="oldest">🗓️ Date Modified (Oldest)</option>
                  <option value="name">🔤 Name (A-Z)</option>
                  <option value="type">📂 Type</option>
                  <option value="year">📆 Year Uploaded</option>
                  <option value="month">🌙 Month Uploaded</option>
                </select>
                </div>
              </div>

              {/* Files */}
              {selectedFiles.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted, #475569)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🗂️</div>
                  <div>No files found</div>
                </div>
              ) : (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pagedFiles.map((file, i) => (
                    <div key={i} style={S.fileCard}>
                      <div style={S.fileCardLeft}>
                        <div style={S.fileIconBox}>
                          <span style={{ fontSize: 28 }}>{getFileIcon(file.fileName)}</span>
                          <span style={S.extTag}>{getFileExt(file.fileName)}</span>
                        </div>
                        <div style={S.fileInfo}>
                          <div style={S.fileName}>{file.fileName}</div>
                          <div style={S.fileMeta}>
                            📅 {new Date(file.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            &nbsp;·&nbsp;
                            🕐 {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {file.comment && (
                            <div style={S.commentChip}>💬 {file.comment}</div>
                          )}
                        </div>
                      </div>
                      <div style={S.fileActions}>
                        <button style={S.previewBtn} onClick={() => setViewFile(file)} title="Preview">👁</button>
                        <a href={`http://localhost:5000/${file.filePath}`} download style={S.dlBtnSmall} title="Download">⬇</a>
                        <button
                          style={S.renameBtn}
                          onClick={() => { setRenameModal({ staffId: file.staffId, fileId: file.fileId, fileName: file.fileName || '' }); setRenameValue(file.fileName || ''); }}
                          title="Rename work"
                        >
                          ✏️
                        </button>
                        <button style={S.delBtnSmall} onClick={() => handleDelete(selectedStaffId, file.fileId, file.fileName)} title="Delete">🗑</button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={S.pagination}>
                      <button style={{ ...S.pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }}
                        onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>← Prev</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setCurrentPage(p)}
                          style={{ ...S.pageBtn, ...(p === currentPage ? S.pageBtnActive : {}) }}>{p}</button>
                      ))}
                      <button style={{ ...S.pageBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}
                        onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next →</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: "'Segoe UI', Arial, sans-serif" },

  header: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  headerIcon: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  headerTitle: { color: '#f1f5f9', fontWeight: 800, fontSize: 20 },
  headerSub: { color: 'var(--text-muted, #64748b)', fontSize: 12, marginTop: 2 },
  statPill: { background: '#0f172a', border: '1px solid #334155', color: 'var(--text-lighter, #94a3b8)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  backBtn: { padding: '8px 18px', background: '#334155', color: 'var(--text-lighter, #94a3b8)', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },

  body: { flex: 1, display: 'flex', overflow: 'hidden' },

  // Sidebar
  sidebar: { width: 280, background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarTop: { padding: '14px 12px', borderBottom: '1px solid #334155' },
  sidebarSearch: { width: '100%', padding: '9px 12px 9px 36px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  sidebarList: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  staffItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s', borderLeft: '3px solid transparent' },
  staffItemActive: { background: '#0f172a' },
  staffAvatar: { width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0 },
  staffItemInfo: { flex: 1, minWidth: 0 },
  staffItemName: { color: '#e2e8f0', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  staffItemSub: { color: 'var(--text-muted, #64748b)', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileBadge: { borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0 },

  // Main
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 },

  staffBar: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  miniStat: { background: '#0f172a', border: '1px solid #334155', padding: '5px 12px', borderRadius: 20, fontSize: 12, color: 'var(--text-lighter, #94a3b8)' },
  closeBtn: { width: 30, height: 30, borderRadius: '50%', background: '#334155', border: 'none', color: 'var(--text-lighter, #94a3b8)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // File card
  fileCard: { background: '#1e293b', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, border: '1px solid #334155', transition: 'border-color 0.15s' },
  fileCardLeft: { display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 },
  fileIconBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 },
  extTag: { background: '#334155', color: 'var(--text-lighter, #94a3b8)', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, letterSpacing: '0.5px' },
  fileInfo: { flex: 1, minWidth: 0 },
  fileName: { color: '#e2e8f0', fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileMeta: { color: 'var(--text-muted, #64748b)', fontSize: 11, marginBottom: 6 },
  commentChip: { display: 'inline-block', background: '#0f172a', border: '1px solid #334155', color: 'var(--text-lighter, #94a3b8)', fontSize: 11, padding: '3px 10px', borderRadius: 20, maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'normal' },

  fileActions: { display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' },
  previewBtn: { width: 34, height: 34, borderRadius: 8, background: '#334155', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dlBtnSmall: { width: 34, height: 34, borderRadius: 8, background: '#064e3b', color: '#10b981', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  sortSelect: { background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 10, padding: '9px 10px', fontSize: 12, fontWeight: 700, outline: 'none' },
  renameBtn: { width: 34, height: 34, borderRadius: 8, background: '#1e3a8a', color: '#c7d2fe', border: '1px solid rgba(99,102,241,0.5)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  delBtnSmall: { width: 34, height: 34, borderRadius: 8, background: '#450a0a', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // Preview modal
  previewOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  previewBox: { background: '#1e293b', borderRadius: 16, width: '90%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto', border: '1px solid #334155', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #334155' },
  previewClose: { background: '#334155', border: 'none', color: 'var(--text-lighter, #94a3b8)', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  dlBtn: { display: 'inline-block', marginTop: 16, padding: '10px 22px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 },

  // Rename modal
  renameOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(6px)', padding: 16 },
  renameBox: { background: '#1e293b', borderRadius: 16, width: '90%', maxWidth: 420, border: '1px solid #334155', boxShadow: '0 28px 70px rgba(0,0,0,0.7)', overflow: 'hidden' },
  renameHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #334155' },
  renameTitle: { fontSize: 14, fontWeight: 900, color: '#f1f5f9' },
  renameClose: { background: '#334155', border: 'none', color: 'var(--text-lighter, #94a3b8)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontWeight: 800 },
  renameInput: { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', outline: 'none', fontSize: 13, boxSizing: 'border-box' },
  renameCancelBtn: { padding: '8px 14px', background: '#334155', color: 'var(--text-lighter, #94a3b8)', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 12 },
  renameSaveBtn: { padding: '8px 16px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 900, fontSize: 12 },

  // Pagination
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px 0', flexWrap: 'wrap' },
  pageBtn: { padding: '8px 16px', background: '#1e293b', color: 'var(--text-lighter, #94a3b8)', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  pageBtnActive: { background: '#3b82f6', color: 'white', border: '1px solid #3b82f6' },
};

export default UploadedWorks;
=======
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
>>>>>>> 500de3921b8b68c26e46441c078fdc0e74f56b00
