import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BirthdayNotification from '../components/BirthdayNotification';
import NoticeBoard from '../components/NoticeBoard';

const StaffDashboard = () => {
  const [staff, setStaff] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileComments, setFileComments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [canViewOthers, setCanViewOthers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientProjects, setClientProjects] = useState([]);
  const [staffUsageProject, setStaffUsageProject] = useState(null);
  const [staffUsageCards, setStaffUsageCards] = useState('');
  const [staffUsageNote, setStaffUsageNote] = useState('');
  const [staffHistoryOpen, setStaffHistoryOpen] = useState({});

  // Project Navigation States
  const [projectSearch, setProjectSearch] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  const projectsPerPage = 10;
  const [activeNav, setActiveNav] = useState('files');
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [hasNewNotice, setHasNewNotice] = useState(false);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const filesPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/staff-login'); return; }
      try {
        const [meRes, profileRes, filesRes, unreadRes, noticeRes, clientProjRes] = await Promise.all([
          fetch('/api/chat/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/staff/my-profile', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/staff/my-files', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/chat/unread-counts', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/notices', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/staff/my-client-projects', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!meRes.ok) { navigate('/staff-login'); return; }
        setStaff(await meRes.json());
        if (profileRes.ok) { const p = await profileRes.json(); setCanViewOthers(p.canViewOthersWork === true); }
        if (filesRes.ok) setUploadedFiles(await filesRes.json());
        if (unreadRes.ok) { const u = await unreadRes.json(); setHasUnread(Object.keys(u).length > 0); }
        if (noticeRes.ok) {
          const notices = await noticeRes.json();
          if (notices.length > 0) {
            const lastSeen = localStorage.getItem('lastSeenNotice');
            const latest = notices[0]._id;
            if (lastSeen !== latest) setHasNewNotice(true);
          }
        }
        if (clientProjRes && clientProjRes.ok) {
          setClientProjects(await clientProjRes.json());
        }
        // Check unread announcements
        try {
          const annRes = await fetch('/api/features/announcements', { headers: { Authorization: `Bearer ${token}` } });
          if (annRes.ok) {
            const anns = await annRes.json();
            const meData = await fetch('/api/chat/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
            const hasUnreadAnn = anns.some(a => !a.readBy?.includes(meData.id));
            setHasNewAnnouncement(hasUnreadAnn);
          }
        } catch (_) { }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleFileUpload = async () => {
    if (!files || files.length === 0) { alert('Please select at least one file'); return; }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    try {
      const res = await fetch('/api/staff/upload-general-file', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      if (res.ok) { alert(`${files.length} file(s) uploaded!`); setFiles([]); window.location.reload(); }
      else { const d = await res.json(); alert(`Failed: ${d.message}`); }
    } catch (err) { alert('Upload error'); }
  };

  const handleDeleteFile = async (fileId, uploadedAt) => {
    const diff = (new Date() - new Date(uploadedAt)) / (1000 * 60 * 60);
    if (diff > 1.5) { alert('Cannot delete after 1.5 hours'); return; }
    if (!window.confirm('Delete this file?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/staff/delete-file/${fileId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { alert('Deleted!'); window.location.reload(); }
    } catch (err) { alert('Error deleting'); }
  };

  const handleUpdateComment = async (fileId) => {
    const commentText = fileComments[fileId];
    if (!commentText?.trim()) { alert('Enter a comment'); return; }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/staff/file-comment/${fileId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: commentText })
      });
      if (res.ok) { alert('Comment saved!'); window.location.reload(); }
    } catch (err) { alert('Error saving comment'); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/staff-login'); };

  if (loading) return <div style={s.loadingScreen}><div style={s.spinner} /><span>Loading your dashboard...</span></div>;

  const filteredFiles = uploadedFiles.filter(f => {
    const name = (f.originalName || f.path?.split('/').pop() || '').toLowerCase();
    const comment = (f.comment || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || comment.includes(searchQuery.toLowerCase());
  });

  const paginatedFiles = filteredFiles.slice((currentPage - 1) * filesPerPage, currentPage * filesPerPage);
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

  const navItems = [
    { id: 'files', icon: '📁', label: 'My Files' },
    { id: 'upload', icon: '📤', label: 'Upload Work' },
    { id: 'clientProjects', icon: '📊', label: 'Monitor Client' },
    { id: 'mapping', icon: '🗺️', label: 'Mapping', action: () => navigate('/mapping') },
    { id: 'notices', icon: '📋', label: 'Notices', badge: hasNewNotice },
    { id: 'chat', icon: '💬', label: 'Chat', badge: hasUnread, action: () => navigate('/chat') },
    { id: 'announcements', icon: '📢', label: 'Announcements', action: () => navigate('/announcements'), badge: hasNewAnnouncement },
    { id: 'tasks', icon: '✅', label: 'My Tasks', action: () => navigate('/tasks') },
    { id: 'directory', icon: '👤', label: 'Employee Directory', action: () => navigate('/employee-directory') },
    { id: 'schedule', icon: '📅', label: 'Schedule Board', action: () => navigate('/schedule-board') },
    { id: 'reports', icon: '📝', label: 'Daily Reports', action: () => navigate('/daily-reports') },
    ...(canViewOthers ? [{ id: 'others', icon: '👥', label: "Work Bank", action: () => navigate('/all-staff-works') }] : []),
  ];

  const initials = staff?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';

  const filteredProjects = clientProjects.filter(p => 
    p.companyName.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const totalProjectPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice((projectPage - 1) * projectsPerPage, projectPage * projectsPerPage);

  const handleProjectPageChange = (page) => {
    setProjectPage(page);
  };

  return (
    <div style={s.container}>
      <BirthdayNotification userRole="staff" />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 150 }} />
      )}

      {/* Sidebar */}
      <aside className="ignore-dark" style={{
        ...s.sidebar,
        ...(isMobile ? {
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 200,
        } : {})
      }}>
        <div style={s.brand}>
          <div style={s.brandIcon}>X</div>
          <div>
            <div style={s.brandName}>Xtreme Cr8ivity</div>
            <div style={s.brandSub}>Staff Portal</div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-lighter, #94a3b8)', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
          )}
        </div>
        <div style={s.divider} />

        <nav style={s.nav}>
          {navItems.map(item => (
            <button key={item.id} style={{ ...s.navBtn, ...(activeNav === item.id ? s.navBtnActive : {}) }}
              onClick={() => {
                if (item.action) { item.action(); }
                else {
                  setActiveNav(item.id);
                  if (item.id === 'notices') {
                    setHasNewNotice(false);
                    // mark as seen by storing latest notice id
                    fetch('/api/notices', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                      .then(r => r.json()).then(notices => { if (notices[0]) localStorage.setItem('lastSeenNotice', notices[0]._id); }).catch(() => { });
                  }
                }
              }}>
              <span style={s.navIcon}>{item.icon}</span>
              <span style={s.navLabel}>{item.label}</span>
              {item.badge && <span style={s.badge} />}
              {activeNav === item.id && <span style={s.activeBar} />}
            </button>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          {staff?.profilePicture ? (
            <img src={staff.profilePicture} alt={staff.name} style={{ ...s.footerAvatar, objectFit: 'cover' }} />
          ) : (
            <div style={s.footerAvatar}>{initials}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.footerName}>{staff?.name}</div>
            <div style={s.footerRole}>Staff Member</div>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ ...s.main, marginLeft: isMobile ? 0 : '240px' }}>
        {/* Topbar */}
        <div style={{ ...s.topbar, left: isMobile ? 0 : '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--text-main, #0f172a)', padding: '4px 8px', borderRadius: '8px', lineHeight: 1 }}
              >☰</button>
            )}
            <div>
              <div style={s.pageTitle}>
                {activeNav === 'files' && 'My Work Files'}
                {activeNav === 'upload' && 'Upload Work'}
                {activeNav === 'notices' && 'Notice Board'}
                {activeNav === 'clientProjects' && 'Monitored Client Projects'}
              </div>
              <div style={s.pageCrumb}>Staff Dashboard / {activeNav === 'clientProjects' ? 'Monitored Clients' : activeNav === 'files' ? 'Files' : activeNav === 'upload' ? 'Upload' : 'Notices'}</div>            </div>
          </div>
          <div style={s.topbarRight}>
            <div style={s.staffBadge}>
              {staff?.profilePicture ? (
                <img src={staff.profilePicture} alt={staff.name} style={{ ...s.staffAvatar, objectFit: 'cover' }} />
              ) : (
                <span style={s.staffAvatar}>{initials}</span>
              )}
              <span style={s.staffName}>{staff?.name}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={s.content} className="app-content-pad">

          {/* ── MY FILES TAB ── */}
          {activeNav === 'files' && (
            <>
              {/* Stats */}
              <div style={s.statsRow} className="stats-grid-4">
                <div style={s.statCard}>
                  <div style={{ ...s.statIcon, background: '#dbeafe', color: '#2563eb' }}>📁</div>
                  <div><div style={s.statVal}>{uploadedFiles.length}</div><div style={s.statLbl}>Total Files</div></div>
                </div>
                <div style={s.statCard}>
                  <div style={{ ...s.statIcon, background: '#dcfce7', color: '#16a34a' }}>✅</div>
                  <div><div style={s.statVal}>{uploadedFiles.filter(f => f.comment).length}</div><div style={s.statLbl}>With Comments</div></div>
                </div>
                <div style={s.statCard}>
                  <div style={{ ...s.statIcon, background: '#fef9c3', color: '#ca8a04' }}>🕐</div>
                  <div>
                    <div style={s.statVal}>{uploadedFiles.filter(f => (new Date() - new Date(f.uploadedAt)) / 3600000 <= 1.5).length}</div>
                    <div style={s.statLbl}>Deletable</div>
                  </div>
                </div>
                <div style={{ ...s.statCard, cursor: 'pointer' }} onClick={() => setActiveNav('upload')}>
                  <div style={{ ...s.statIcon, background: '#ede9fe', color: '#7c3aed' }}>📤</div>
                  <div><div style={s.statVal}>+</div><div style={s.statLbl}>Upload New</div></div>
                </div>
              </div>

              {/* Search */}
              <div style={s.searchWrap}>
                <span style={s.searchIcon}>🔍</span>
                <input type="text" placeholder="Search files by name or comment..." value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} style={s.searchInput} />
                {searchQuery && <button style={s.clearBtn} onClick={() => setSearchQuery('')}>✕</button>}
              </div>

              {filteredFiles.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
                  <div>{searchQuery ? `No files matching "${searchQuery}"` : 'No files uploaded yet'}</div>
                  {!searchQuery && <button style={s.emptyUploadBtn} onClick={() => setActiveNav('upload')}>Upload your first file →</button>}
                </div>
              ) : (
                <>
                  <div style={s.filesGrid}>
                    {paginatedFiles.map((file, i) => {
                      const canDelete = (new Date() - new Date(file.uploadedAt)) / 3600000 <= 1.5;
                      const name = file.originalName || file.path?.split('/').pop() || 'File';
                      const ext = name.split('.').pop().toLowerCase();
                      const icon = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? '🖼️'
                        : ['pdf'].includes(ext) ? '📕'
                          : ['doc', 'docx'].includes(ext) ? '📝'
                            : ['xls', 'xlsx'].includes(ext) ? '📊'
                              : '📄';
                      return (
                        <div key={i} style={s.fileCard}>
                          <div style={s.fileCardTop}>
                            <div style={s.fileIconBig}>{icon}</div>
                            <a href={`http://localhost:5000/${file.path}`} target="_blank" rel="noopener noreferrer" style={s.fileName}>
                              {name.length > 28 ? name.substring(0, 28) + '…' : name}
                            </a>
                            <div style={s.fileDate}>{new Date(file.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <div style={s.fileCardBottom}>
                            {staff?.role === 'admin' && (
                              <>
                                <textarea placeholder="Add a comment..." value={fileComments[file._id] !== undefined ? fileComments[file._id] : (file.comment || '')}
                                  onChange={e => setFileComments({ ...fileComments, [file._id]: e.target.value })} style={s.commentBox} />
                                <div style={s.fileActions}>
                                  <button style={s.commentSaveBtn} onClick={() => handleUpdateComment(file._id)}>💬 Save</button>
                                  {canDelete && <button style={s.deleteBtn} onClick={() => handleDeleteFile(file._id, file.uploadedAt)}>🗑️</button>}
                                </div>
                              </>
                            )}
                            {staff?.role !== 'admin' && (
                              <div style={s.fileActions}>
                                {file.comment && <div style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', padding: '4px 0' }}>💬 {file.comment}</div>}
                                {canDelete && <button style={s.deleteBtn} onClick={() => handleDeleteFile(file._id, file.uploadedAt)}>🗑️</button>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div style={s.pagination}>
                      <button style={{ ...s.pageBtn, ...(currentPage === 1 ? s.pageBtnOff : {}) }} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>← Prev</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} style={{ ...s.pageBtn, ...(p === currentPage ? s.pageBtnActive : {}) }} onClick={() => setCurrentPage(p)}>{p}</button>
                      ))}
                      <button style={{ ...s.pageBtn, ...(currentPage === totalPages ? s.pageBtnOff : {}) }} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next →</button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── UPLOAD TAB ── */}
          {activeNav === 'upload' && (
            <div style={s.uploadSection}>
              <div style={s.uploadCard}>
                <div style={s.uploadCardHeader}>
                  <span style={{ fontSize: '32px' }}>📤</span>
                  <div>
                    <div style={s.uploadCardTitle}>Upload Work Files</div>
                    <div style={s.uploadCardSub}>Share your completed work, documents, or progress files</div>
                  </div>
                </div>
                <label style={s.dropZone}>
                  <span style={{ fontSize: '40px' }}>📁</span>
                  <span style={{ fontWeight: '600', color: '#1e40af' }}>Click to choose files</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-lighter, #94a3b8)' }}>Multiple files supported</span>
                  <input type="file" multiple onChange={e => { if (e.target.files?.length) setFiles(e.target.files); }} style={{ display: 'none' }} />
                </label>
                {files && files.length > 0 && (
                  <div style={s.selectedList}>
                    <div style={s.selectedHeader}>Selected ({files.length} file{files.length > 1 ? 's' : ''})</div>
                    {Array.from(files).map((f, i) => (
                      <div key={i} style={s.selectedItem}>
                        <span>📄</span>
                        <span style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>{f.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-lighter, #94a3b8)' }}>{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                    <button style={s.uploadBtn} onClick={handleFileUpload}>Upload All Files</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── NOTICES TAB ── */}
          {activeNav === 'notices' && (
            <NoticeBoard isAdmin={false} />
          )}

          {/* ── MONITOR CLIENT TAB ── */}
          {activeNav === 'clientProjects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={s.uploadCardHeader}>
                <span style={{ fontSize: '32px' }}>📊</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={s.uploadCardTitle}>Monitor Client Projects</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                    <button onClick={() => { 
                      const token = localStorage.getItem('token');
                      fetch('/api/staff/my-client-projects', { headers: { Authorization: `Bearer ${token}` } })
                        .then(res => res.json())
                        .then(data => setClientProjects(data));
                    }} style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                      🔄 Refresh
                    </button>
                    {/* Project Search */}
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}>🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={projectSearch}
                        onChange={(e) => { setProjectSearch(e.target.value); setProjectPage(1); }}
                        style={{ ...s.searchInput, paddingLeft: '30px', height: '32px', width: '150px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {clientProjects.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <div>No client projects assigned to you currently.</div>
                </div>
              ) : (
                <>
                  <div style={s.filesGrid}>
                    {paginatedProjects.map(proj => {
                      const isRetain = proj.planType === 'Retainership';
                      const cardsLeft = Math.max(0, proj.totalCardsPaid - proj.cardsUsed);
                      const statusColors = { 'Designed': '#3b82f6', 'Printed': '#f59e0b', 'Dispatched': '#10b981' };

                      const updateStatus = async (newStatus) => {
                        const token = localStorage.getItem('token');
                        try {
                          const res = await fetch(`http://localhost:5000/api/staff/my-client-project/${proj._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ status: newStatus })
                          });
                          const data = await res.json();
                          if (res.ok) setClientProjects(prev => prev.map(p => p._id === proj._id ? data : p));
                          else alert(data.message);
                        } catch (err) { alert('Update failed'); }
                      };

                      return (
                        <div key={proj._id} style={{ ...s.fileCard, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* Header */}
                          <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: 'var(--text-main, #0f172a)' }}>{proj.companyName}</h3>
                            <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', background: isRetain ? '#8b5cf622' : '#64748b22', color: isRetain ? '#8b5cf6' : '#64748b' }}>
                              {proj.planType}
                            </span>
                          </div>

                          {/* Info */}
                          <div style={{ background: 'var(--bg-light, #f8fafc)', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ color: 'var(--text-muted, #64748b)' }}>Date Received:</span>
                              <strong>{new Date(proj.dateReceived).toLocaleDateString('en-GB')}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: 'var(--text-muted, #64748b)' }}>Status:</span>
                              <select
                                value={proj.status}
                                onChange={e => updateStatus(e.target.value)}
                                style={{ fontSize: '12px', fontWeight: '700', color: statusColors[proj.status], background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer' }}
                              >
                                {['Designed', 'Printed', 'Dispatched'].map(st => <option key={st} value={st}>{st}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* Usage stats block */}
                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Card Usage</span>
                              <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{proj.cardsUsed}</span>
                            </div>
                            {isRetain && (
                              <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '700', textTransform: 'uppercase', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
                                Remaining: {cardsLeft} of {proj.totalCardsPaid}
                              </div>
                            )}
                            <button onClick={() => setStaffUsageProject(proj)}
                              style={{ background: 'white', border: '1px solid #e2e8f0', color: '#000', padding: '8px', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                              📉 Record Deduction
                            </button>
                          </div>

                          {/* Deduction History - Applicable to All */}
                          <div style={{ marginBottom: '18px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
                            <div 
                              onClick={() => setStaffHistoryOpen(prev => ({ ...prev, [proj._id]: !staffHistoryOpen[proj._id] }))}
                              style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: staffHistoryOpen[proj._id] ? '#f1f5f9' : 'transparent' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px' }}>📋</span>
                                <strong style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Deduction Log ({proj.deductionHistory?.length || 0})
                                </strong>
                              </div>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>{staffHistoryOpen[proj._id] ? '▲ Close' : '▼ View'}</span>
                            </div>

                            {/* Latest Deduction Summary */}
                            {!staffHistoryOpen[proj._id] && proj.deductionHistory && proj.deductionHistory.length > 0 && (
                              <div style={{ padding: '8px 14px', fontSize: '11px', color: '#64748b', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Latest: <strong style={{ color: '#ef4444' }}>-{proj.deductionHistory[proj.deductionHistory.length - 1].amount}</strong></span>
                                <span>{new Date(proj.deductionHistory[proj.deductionHistory.length - 1].date).toLocaleDateString('en-GB')}</span>
                              </div>
                            )}

                            {staffHistoryOpen[proj._id] && (
                              <div style={{ maxHeight: '250px', overflowY: 'auto', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                                {proj.deductionHistory && proj.deductionHistory.length > 0 ? (
                                  [...proj.deductionHistory].reverse().map((log, idx) => (
                                    <div key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1' }}>
                                          {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#ef4444' }}>
                                          -{log.amount} Cards
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                        🏷️ {log.note || 'Deduction'}
                                      </div>
                                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                        By: {log.performedBy || 'Staff'}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                                    No deductions recorded yet.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {paginatedProjects.length === 0 && projectSearch && (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', gridColumn: '1 / -1' }}>No matches found for "{projectSearch}"</div>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalProjectPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                      <button 
                        disabled={projectPage === 1}
                        onClick={() => handleProjectPageChange(projectPage - 1)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', cursor: projectPage === 1 ? 'default' : 'pointer', opacity: projectPage === 1 ? 0.5 : 1 }}
                      >
                        Prev
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Page {projectPage} of {totalProjectPages}</span>
                      <button 
                        disabled={projectPage === totalProjectPages}
                        onClick={() => handleProjectPageChange(projectPage + 1)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', cursor: projectPage === totalProjectPages ? 'default' : 'pointer', opacity: projectPage === totalProjectPages ? 0.5 : 1 }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Usage Modal */}
          {staffUsageProject && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <form onSubmit={async e => {
                e.preventDefault();
                if (!staffUsageProject?._id) { alert('Project ID missing'); return; }
                const token = localStorage.getItem('token');
                try {
                  const res = await fetch(`http://localhost:5000/api/staff/my-client-project/${staffUsageProject._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ addCardsUsed: Number(staffUsageCards), deductionNote: staffUsageNote })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setClientProjects(prev => prev.map(p => p._id === staffUsageProject._id ? data : p));
                    setStaffHistoryOpen(prev => ({ ...prev, [staffUsageProject._id]: true }));
                    setStaffUsageProject(null); setStaffUsageCards(''); setStaffUsageNote('');
                  } else {
                    alert(`Update failed: ${data.message || 'Unknown error'}`);
                  }
                } catch (err) { alert(`Error: ${err.message}`); }
              }} style={{ background: 'var(--bg-card, white)', borderRadius: '16px', padding: '28px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <strong style={{ fontSize: '16px', color: 'var(--text-main, #0f172a)' }}>Deduct Cards: {staffUsageProject.companyName}</strong>
                  <button type="button" onClick={() => setStaffUsageProject(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main, #0f172a)' }}>Cards Used Today</label>
                  <input type="number" min="1" required value={staffUsageCards} onChange={e => setStaffUsageCards(e.target.value)}
                    placeholder="e.g. 50" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main, #0f172a)' }}>Note (optional)</label>
                  <input type="text" value={staffUsageNote} onChange={e => setStaffUsageNote(e.target.value)}
                    placeholder="e.g. Batch 2, replacement run..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setStaffUsageProject(null)} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>💾 Save Deduction</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

const s = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", background: 'var(--bg-main, #f0f4f8)' },
  loadingScreen: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', color: 'var(--text-muted, #64748b)', fontSize: '16px' },
  spinner: { width: '36px', height: '36px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  /* Sidebar */
  sidebar: { width: '240px', background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '4px 0 20px rgba(0,0,0,0.3)', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, overflowY: 'auto' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 20px 20px' },
  brandIcon: { width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', flexShrink: 0 },
  brandName: { fontSize: '14px', fontWeight: '700', color: 'white' },
  brandSub: { fontSize: '11px', color: 'var(--text-lighter, #94a3b8)', marginTop: '2px' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 20px 16px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px', flex: 1 },
  navBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'var(--text-lighter, #94a3b8)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', position: 'relative', textAlign: 'left' },
  navBtnActive: { background: 'rgba(59,130,246,0.15)', color: 'white' },
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 },
  navLabel: { flex: 1 },
  badge: { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' },
  activeBar: { position: 'absolute', right: 0, top: '20%', height: '60%', width: '3px', borderRadius: '3px 0 0 3px', background: '#3b82f6' },
  sidebarFooter: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto' },
  footerAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: 'white', flexShrink: 0 },
  footerName: { fontSize: '13px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  footerRole: { fontSize: '11px', color: 'var(--text-muted, #64748b)' },
  logoutBtn: { background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', flexShrink: 0 },

  /* Main */
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: '240px' },
  topbar: { height: '70px', background: 'var(--bg-card, white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 28px', boxShadow: '0 1px 10px rgba(0,0,0,0.08)', flexShrink: 0, position: 'fixed', top: 0, left: '240px', right: 0, zIndex: 99 },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-main, #0f172a)' },
  pageCrumb: { fontSize: '12px', color: 'var(--text-lighter, #94a3b8)', marginTop: '2px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  staffBadge: { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-light, #f8fafc)', padding: '8px 14px', borderRadius: '50px', border: '1px solid var(--border-color, #e2e8f0)' },
  staffAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: 'white' },
  staffName: { fontSize: '13px', fontWeight: '600', color: 'var(--text-main, #0f172a)' },
  content: { flex: 1, overflowY: 'auto', padding: '24px 28px', marginTop: '70px' },

  /* Stats */
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'var(--bg-card, white)', borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  statIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
  statVal: { fontSize: '22px', fontWeight: '800', color: 'var(--text-main, #0f172a)' },
  statLbl: { fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '2px' },

  /* Search */
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' },
  searchIcon: { position: 'absolute', left: '14px', fontSize: '14px' },
  searchInput: { width: '100%', padding: '11px 40px', borderRadius: '50px', border: '1.5px solid var(--border-color, #e2e8f0)', fontSize: '13px', outline: 'none', background: 'var(--bg-card, white)', boxSizing: 'border-box' },
  clearBtn: { position: 'absolute', right: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '11px' },

  /* Files grid */
  filesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px', marginBottom: '20px' },
  fileCard: { background: 'var(--bg-card, white)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid var(--border-light, #f1f5f9)' },
  fileCardTop: { padding: '20px 16px 14px', textAlign: 'center', borderBottom: '1px solid var(--border-light, #f1f5f9)', background: 'var(--bg-light, #f8fafc)' },
  fileIconBig: { fontSize: '44px', marginBottom: '10px' },
  fileName: { display: 'block', color: '#2563eb', fontWeight: '600', fontSize: '13px', textDecoration: 'none', marginBottom: '6px', wordBreak: 'break-word' },
  fileDate: { fontSize: '11px', color: 'var(--text-lighter, #94a3b8)' },
  fileCardBottom: { padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  commentBox: { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid var(--border-color, #e2e8f0)', fontSize: '12px', minHeight: '56px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' },
  fileActions: { display: 'flex', gap: '8px' },
  commentSaveBtn: { flex: 1, padding: '8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', boxShadow: '0 4px 10px rgba(37,99,235,0.35)' },
  deleteBtn: { padding: '8px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 10px rgba(220,38,38,0.35)' },

  /* Empty state */
  empty: { textAlign: 'center', padding: '60px 20px', color: 'var(--text-lighter, #94a3b8)', fontSize: '15px' },
  emptyUploadBtn: { marginTop: '16px', padding: '10px 22px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },

  /* Pagination */
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '20px 0' },
  pageBtn: { padding: '8px 14px', background: 'var(--bg-card, white)', color: 'var(--text-muted, #475569)', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  pageBtnActive: { background: '#3b82f6', color: 'white', border: '1px solid #3b82f6' },
  pageBtnOff: { opacity: 0.4, cursor: 'not-allowed' },

  /* Upload tab */
  uploadSection: { display: 'flex', justifyContent: 'center' },
  uploadCard: { background: 'var(--bg-card, white)', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '560px', border: '1px solid var(--border-light, #f1f5f9)' },
  uploadCardHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  uploadCardTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text-main, #0f172a)' },
  uploadCardSub: { fontSize: '13px', color: 'var(--text-muted, #64748b)', marginTop: '4px' },
  dropZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px', border: '2px dashed #bfdbfe', borderRadius: '14px', cursor: 'pointer', background: '#f0f9ff', transition: 'all 0.2s' },
  selectedList: { marginTop: '20px' },
  selectedHeader: { fontSize: '13px', fontWeight: '700', color: 'var(--text-main, #0f172a)', marginBottom: '10px' },
  selectedItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '8px' },
  uploadBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', marginTop: '12px', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' },
};

export default StaffDashboard;
