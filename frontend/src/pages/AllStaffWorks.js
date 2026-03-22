import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FILE_ICONS = {
  pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗',
  ppt: '📙', pptx: '📙', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
  gif: '🖼️', webp: '🖼️', mp4: '🎬', mov: '🎬', mp3: '🎵',
  wav: '🎵', zip: '🗜️', rar: '🗜️', txt: '📄', csv: '📊',
};

const EXT_COLORS = {
  pdf: '#ef4444', doc: '#3b82f6', docx: '#3b82f6', xls: '#10b981', xlsx: '#10b981',
  jpg: '#f59e0b', jpeg: '#f59e0b', png: '#f59e0b', gif: '#f59e0b', webp: '#f59e0b',
  mp4: '#8b5cf6', mov: '#8b5cf6', mp3: '#ec4899', wav: '#ec4899',
  zip: '#64748b', rar: '#64748b', txt: '#94a3b8', csv: '#10b981',
};

const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316'];

const getFileIcon = (name = '') => FILE_ICONS[name.split('.').pop().toLowerCase()] || '📎';
const getExtColor = (name = '') => EXT_COLORS[name.split('.').pop().toLowerCase()] || '#64748b';
const getExt = (name = '') => name.split('.').pop().toUpperCase();
const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const isImage = (name = '') => /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
const isVideo = (name = '') => /\.(mp4|mov|webm)$/i.test(name);
const isAudio = (name = '') => /\.(mp3|wav|ogg|webm)$/i.test(name);

const AllStaffWorks = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [search, setSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewFile, setViewFile] = useState(null);
  const [renameModal, setRenameModal] = useState(null); // { staffId, fileId, fileName }
  const [renameValue, setRenameValue] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const filesPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { fetchFiles(); }, []);

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/staff-login'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/staff/all-staff-files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { setFiles(await res.json()); }
      else { const d = await res.json(); alert(d.message || 'No permission'); navigate('/staff-dashboard'); }
    } catch (err) { alert('Error loading files'); navigate('/staff-dashboard'); }
    setLoading(false);
  };

  const staffGroups = files.reduce((acc, file) => {
    if (!acc[file.staffId]) acc[file.staffId] = { staffId: file.staffId, staffName: file.staffName, staffEmail: file.staffEmail, department: file.department, files: [] };
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
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  const totalPages = Math.ceil(selectedFiles.length / filesPerPage);
  const pagedFiles = selectedFiles.slice((currentPage - 1) * filesPerPage, currentPage * filesPerPage);

  const selectStaff = (id) => { setSelectedStaffId(id); setCurrentPage(1); setFileSearch(''); if (isMobile) setSidebarOpen(false); };

  if (loading) return (
    <div style={S.loadWrap}>
      <div style={S.spinner} />
      <p style={{ color: 'var(--text-muted, #64748b)', marginTop: 14, fontSize: 14 }}>Loading staff works...</p>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Preview modal */}
      {viewFile && (
        <div style={S.overlay} onClick={() => setViewFile(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{getFileIcon(viewFile.fileName)}</span>
                <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{viewFile.fileName}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`http://localhost:5000/${viewFile.filePath}`} download style={S.modalDl}>⬇ Download</a>
                <button onClick={() => setViewFile(null)} style={S.modalClose}>✕</button>
              </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              {isImage(viewFile.fileName) ? (
                <img src={`http://localhost:5000/${viewFile.filePath}`} alt={viewFile.fileName} style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 10, objectFit: 'contain' }} />
              ) : isVideo(viewFile.fileName) ? (
                <video controls style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 10 }}>
                  <source src={`http://localhost:5000/${viewFile.filePath}`} />
                </video>
              ) : isAudio(viewFile.fileName) ? (
                <audio controls style={{ width: '100%' }}>
                  <source src={`http://localhost:5000/${viewFile.filePath}`} />
                </audio>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-lighter, #94a3b8)' }}>
                  <div style={{ fontSize: 72, marginBottom: 16 }}>{getFileIcon(viewFile.fileName)}</div>
                  <p style={{ marginBottom: 20 }}>Preview not available for this file type.</p>
                  <a href={`http://localhost:5000/${viewFile.filePath}`} download style={S.bigDl}>⬇ Download File</a>
                </div>
              )}
            </div>
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
                      alert('Work renamed successfully');
                      setRenameModal(null);
                      fetchFiles();
                    } catch (err) {
                      alert(err.message);
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

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 149 }} />
      )}

      {/* Top bar */}
      <div style={S.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(v => !v)} style={S.hamburger}>☰</button>
          )}
          <div style={
S.topbarIcon}>👥</div>
          <div>
            <div style={S.topbarTitle}>Work Bank</div>
            <div style={S.topbarSub}>{staffList.length} staff · {files.length} files total</div>
          </div>
        </div>
        <button style={S.backBtn} onClick={() => navigate('/staff-dashboard')}>← Dashboard</button>
      </div>

      <div style={S.body}>
        {/* Sidebar */}
        <div style={{
          ...S.sidebar,
          ...(isMobile ? {
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
            width: '82%', maxWidth: 300,
          } : {})
        }}>
          <div style={S.sidebarHead}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-lighter, #94a3b8)', fontSize: 18, cursor: 'pointer', marginLeft: 'auto', display: 'block', marginBottom: 8 }}>✕</button>
            )}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted, #64748b)' }}>🔍</span>
              <input type="text" placeholder="Search staff..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={S.searchInput} />
            </div>
            <div style={S.sidebarCount}>{filteredStaff.length} member{filteredStaff.length !== 1 ? 's' : ''}</div>
          </div>

          <div style={S.sidebarList}>
            {filteredStaff.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted, #475569)', fontSize: 13 }}>No staff found</div>
            ) : filteredStaff.map((staff, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const isActive = selectedStaffId === staff.staffId;
              return (
                <div key={staff.staffId}
                  style={{ ...S.staffItem, ...(isActive ? { ...S.staffItemActive, borderLeft: `3px solid ${color}` } : {}) }}
                  onClick={() => selectStaff(staff.staffId)}>
                  <div style={{ ...S.avatar, background: color }}>{getInitials(staff.staffName)}</div>
                  <div style={S.staffInfo}>
                    <div style={S.staffName}>{staff.staffName}</div>
                    <div style={S.staffDept}>{staff.department}</div>
                  </div>
                  <div style={{ ...S.badge, background: isActive ? color : '#334155' }}>{staff.files.length}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main panel */}
        <div style={S.main}>
          {!selectedGroup ? (
            <div style={S.empty}>
              {isMobile && (
                <button style={S.mobileOpenBtn} onClick={() => setSidebarOpen(true)}>👥 Browse Staff</button>
              )}
              <div style={{ fontSize: 80, marginBottom: 16 }}>📂</div>
              <div style={S.emptyTitle}>Select a Staff Member</div>
              <div style={S.emptySub}>Choose someone from the {isMobile ? 'menu above' : 'left panel'} to view their uploaded files</div>
            </div>
          ) : (
            <>
              {/* Staff profile bar */}
              <div style={S.profileBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ ...S.avatar, width: 52, height: 52, fontSize: 20, background: AVATAR_COLORS[filteredStaff.findIndex(s => s.staffId === selectedStaffId) % AVATAR_COLORS.length] }}>
                    {getInitials(selectedGroup.staffName)}
                  </div>
                  <div>
                    <div style={S.profileName}>{selectedGroup.staffName}</div>
                    <div style={S.profileMeta}>{selectedGroup.staffEmail}</div>
                    <div style={S.deptTag}>📍 {selectedGroup.department}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={S.statPill}><span style={{ color: '#3b82f6', fontWeight: 700 }}>{selectedGroup.files.length}</span> files</div>
                  <div style={S.statPill}><span style={{ color: '#10b981', fontWeight: 700 }}>{selectedGroup.files.filter(f => f.comment).length}</span> comments</div>
                  {isMobile && <button style={S.changeBtn} onClick={() => setSidebarOpen(true)}>Change</button>}
                  <button style={S.closeBtn} onClick={() => setSelectedStaffId(null)}>✕</button>
                </div>
              </div>

              {/* File search */}
              <div style={S.fileSearchBar}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
                  <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted, #64748b)' }}>🔍</span>
                  <input type="text" placeholder="Search files..." value={fileSearch}
                    onChange={e => { setFileSearch(e.target.value); setCurrentPage(1); }}
                    style={{ ...S.searchInput, background: '#0f172a' }} />
                </div>
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: 12 }}>{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}</div>
              </div>

              {/* Files grid */}
              {selectedFiles.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted, #475569)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🗂️</div>
                  <div>No files found</div>
                </div>
              ) : (
                <div style={S.filesWrap}>
                  <div style={S.filesGrid}>
                    {pagedFiles.map((file, i) => {
                      const extColor = getExtColor(file.fileName);
                      return (
                        <div key={i} style={S.fileCard}>
                          {/* Card top */}
                          <div style={{ ...S.fileCardTop, background: `linear-gradient(135deg, ${extColor}18, ${extColor}08)` }}>
                            <div style={{ ...S.fileIconCircle, background: `${extColor}22`, border: `1.5px solid ${extColor}44` }}>
                              <span style={{ fontSize: 28 }}>{getFileIcon(file.fileName)}</span>
                            </div>
                            <div style={{ ...S.extBadge, background: extColor }}>{getExt(file.fileName)}</div>
                          </div>

                          {/* Card body */}
                          <div style={S.fileCardBody}>
                            <div style={S.fileCardName} title={file.fileName}>
                              {file.fileName.length > 30 ? file.fileName.substring(0, 30) + '…' : file.fileName}
                            </div>
                            <div style={S.fileCardDate}>
                              📅 {new Date(file.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              &nbsp;·&nbsp;
                              {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {file.comment && (
                              <div style={S.commentChip}>💬 {file.comment.length > 50 ? file.comment.substring(0, 50) + '…' : file.comment}</div>
                            )}
                          </div>

                          {/* Card actions */}
                          <div style={S.fileCardActions}>
                            <button style={S.previewBtn} onClick={() => setViewFile(file)}>👁 Preview</button>
                            <a href={`http://localhost:5000/${file.filePath}`} download style={S.dlBtn}>⬇ Download</a>
                            <button
                              style={S.renameBtn}
                              onClick={() => { setRenameModal({ staffId: file.staffId, fileId: file.fileId, fileName: file.fileName || '' }); setRenameValue(file.fileName || ''); }}
                              title="Rename work"
                            >
                              ✏️ Rename
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

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
  page: { minHeight: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: "'Segoe UI', Arial, sans-serif", overflow: 'hidden' },
  loadWrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a' },
  spinner: { width: 40, height: 40, border: '4px solid #1e293b', borderTop: '4px solid #8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  topbar: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  topbarIcon: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  topbarTitle: { color: '#f1f5f9', fontWeight: 800, fontSize: 18 },
  topbarSub: { color: 'var(--text-muted, #64748b)', fontSize: 12, marginTop: 2 },
  backBtn: { padding: '8px 18px', background: '#334155', color: 'var(--text-lighter, #94a3b8)', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  hamburger: { background: 'none', border: 'none', color: '#f1f5f9', fontSize: 22, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 },

  body: { flex: 1, display: 'flex', overflow: 'hidden' },

  sidebar: { width: 270, background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHead: { padding: '14px 12px 10px', borderBottom: '1px solid #334155' },
  searchInput: { width: '100%', padding: '9px 12px 9px 34px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  sidebarCount: { color: 'var(--text-muted, #475569)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 8, paddingLeft: 2 },
  sidebarList: { flex: 1, overflowY: 'auto', padding: '8px 0' },

  staffItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s', borderLeft: '3px solid transparent', borderRadius: 0 },
  staffItemActive: { background: '#0f172a' },
  avatar: { width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0 },
  staffInfo: { flex: 1, minWidth: 0 },
  staffName: { color: '#e2e8f0', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  staffDept: { color: 'var(--text-muted, #64748b)', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 },

  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 },
  emptyTitle: { color: '#e2e8f0', fontSize: 20, fontWeight: 700, marginBottom: 8 },
  emptySub: { color: 'var(--text-muted, #64748b)', fontSize: 14 },
  mobileOpenBtn: { marginBottom: 24, padding: '10px 24px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 },

  profileBar: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 10 },
  profileName: { color: '#f1f5f9', fontWeight: 700, fontSize: 16 },
  profileMeta: { color: 'var(--text-muted, #64748b)', fontSize: 12, marginTop: 2 },
  deptTag: { display: 'inline-block', marginTop: 4, background: '#1e3a5f', color: '#93c5fd', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 },
  statPill: { background: '#0f172a', border: '1px solid #334155', padding: '5px 12px', borderRadius: 20, fontSize: 12, color: 'var(--text-lighter, #94a3b8)' },
  changeBtn: { padding: '6px 12px', background: '#334155', color: 'var(--text-lighter, #94a3b8)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  closeBtn: { width: 30, height: 30, borderRadius: '50%', background: '#334155', border: 'none', color: 'var(--text-lighter, #94a3b8)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  fileSearchBar: { padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 },

  filesWrap: { flex: 1, overflowY: 'auto', padding: '20px' },
  filesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 20 },

  fileCard: { background: '#1e293b', borderRadius: 14, overflow: 'hidden', border: '1px solid #334155', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.15s', cursor: 'default' },
  fileCardTop: { padding: '20px 16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative' },
  fileIconCircle: { width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  extBadge: { position: 'absolute', top: 10, right: 10, color: 'white', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6, letterSpacing: '0.5px' },
  fileCardBody: { padding: '0 14px 12px', flex: 1 },
  fileCardName: { color: '#e2e8f0', fontWeight: 700, fontSize: 13, marginBottom: 6, lineHeight: 1.4 },
  fileCardDate: { color: 'var(--text-muted, #64748b)', fontSize: 11, marginBottom: 8 },
  commentChip: { background: '#0f172a', border: '1px solid #334155', color: 'var(--text-lighter, #94a3b8)', fontSize: 11, padding: '4px 10px', borderRadius: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },

  fileCardActions: { display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid #334155' },
  previewBtn: { flex: 1, padding: '8px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 },
  dlBtn: { flex: 1, padding: '8px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12, textDecoration: 'none', textAlign: 'center' },
  renameBtn: { flex: 1, padding: '8px', background: '#1e3a8a', color: '#c7d2fe', border: '1px solid rgba(99,102,241,0.5)', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: 12 },

  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px 0', flexWrap: 'wrap' },
  pageBtn: { padding: '8px 16px', background: '#1e293b', color: 'var(--text-lighter, #94a3b8)', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  pageBtnActive: { background: '#8b5cf6', color: 'white', border: '1px solid #8b5cf6' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: 16 },
  modal: { background: '#1e293b', borderRadius: 18, width: '100%', maxWidth: 820, maxHeight: '92vh', overflow: 'auto', border: '1px solid #334155', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #334155', gap: 10 },
  modalDl: { padding: '7px 16px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13 },
  modalClose: { width: 32, height: 32, borderRadius: '50%', background: '#334155', border: 'none', color: 'var(--text-lighter, #94a3b8)', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bigDl: { display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 },

  // Rename modal
  renameOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(6px)', padding: 16 },
  renameBox: { background: '#1e293b', borderRadius: 16, width: '90%', maxWidth: 420, border: '1px solid #334155', boxShadow: '0 28px 70px rgba(0,0,0,0.7)', overflow: 'hidden' },
  renameHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #334155' },
  renameTitle: { fontSize: 14, fontWeight: 900, color: '#f1f5f9' },
  renameClose: { background: '#334155', border: 'none', color: 'var(--text-lighter, #94a3b8)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontWeight: 800 },
  renameInput: { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', outline: 'none', fontSize: 13, boxSizing: 'border-box' },
  renameCancelBtn: { padding: '8px 14px', background: '#334155', color: 'var(--text-lighter, #94a3b8)', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 12 },
  renameSaveBtn: { padding: '8px 16px', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 900, fontSize: 12 },
};

export default AllStaffWorks;
