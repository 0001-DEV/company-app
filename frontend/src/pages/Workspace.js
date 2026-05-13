import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Workspace.css';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const COLORS = ['#e53e3e','#dd6b20','#d69e2e','#38a169','#3182ce','#805ad5','#d53f8c','#00b5d8'];

function MemberProgress({ member }) {
  const allTasks = member.days.flatMap(d => d.tasks);
  const total = allTasks.length;
  const done = allTasks.filter(t => t.completed).length;
  const pending = total - done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const color = pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#e53e3e';
  return (
    <div className="wb-progress-wrap">
      <div className="wb-progress-bar-track">
        <div className="wb-progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="wb-progress-stats">
        <span style={{ color: '#10b981' }}>{done} done</span>
        <span style={{ color: '#f59e0b' }}>{pending} pending</span>
        <span style={{ color, fontWeight: 700 }}>{pct}% complete</span>
      </div>
    </div>
  );
}

export default function Workspace() {
  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWsManager, setIsWsManager] = useState(false);

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addingTask, setAddingTask] = useState(null);
  const [taskText, setTaskText] = useState('');
  const [copyToAllDays, setCopyToAllDays] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [activeSnapshot, setActiveSnapshot] = useState(null);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);

  const [boardForm, setBoardForm] = useState({ name: '', weekLabel: '', selectedDays: [...DAYS], memberIds: [] });
  const [createFilter, setCreateFilter] = useState('all');
  const [createSearch, setCreateSearch] = useState('');
  const [addFilter, setAddFilter] = useState('all');
  const [addSearch, setAddSearch] = useState('');

  useEffect(() => { loadBoards(); }, []);
  useEffect(() => { if (isAdmin) { loadStaff(); loadDepts(); } }, [isAdmin]);
  // Staff: check if they are a workspace manager
  useEffect(() => {
    if (!isAdmin) {
      fetch('/api/admin/all-staff', { headers: getAuthHeader() })
        .then(r => r.ok ? r.json() : [])
        .then(list => {
          const me = list.find(s => s._id === (user?._id || user?.id));
          setIsWsManager(me?.isWorkspaceManager || false);
          if (me?.isWorkspaceManager) { loadStaff(); loadDepts(); }
        }).catch(() => {});
    }
  }, [isAdmin]);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/task-boards', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
        if (data.length > 0) setActiveBoard(data[0]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/admin/all-staff', { headers: getAuthHeader() });
      if (res.ok) setStaffList(await res.json());
    } catch (e) {}
  };

  const loadDepts = async () => {
    try {
      const res = await fetch('/api/admin/departments', { headers: getAuthHeader() });
      if (res.ok) setDepartments(await res.json());
    } catch (e) {}
  };

  const loadSnapshots = async (boardId) => {
    setSnapshotsLoading(true);
    setActiveSnapshot(null);
    try {
      const res = await fetch(`/api/task-boards/${boardId}/snapshots`, { headers: getAuthHeader() });
      if (res.ok) setSnapshots(await res.json());
      else setSnapshots([]);
    } catch (e) { setSnapshots([]); }
    setSnapshotsLoading(false);
  };

  const filterStaff = (deptFilter, search, list) => list.filter(s => {
    const deptId = s.department?._id || s.department;
    const matchDept = deptFilter === 'all' || deptId === deptFilter;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const createFilteredStaff = useMemo(
    () => filterStaff(createFilter, createSearch, staffList),
    [staffList, createFilter, createSearch]
  );

  const addFilteredStaff = useMemo(
    () => filterStaff(addFilter, addSearch, staffList).filter(
      s => !activeBoard?.members.some(m => m.userId?.toString() === s._id)
    ),
    [staffList, addFilter, addSearch, activeBoard]
  );

  const toggleMemberId = (id, checked) => {
    setBoardForm(f => ({
      ...f,
      memberIds: checked ? [...f.memberIds, id] : f.memberIds.filter(x => x !== id)
    }));
  };

  const createBoard = async () => {
    if (!boardForm.name.trim()) return;
    try {
      const res = await fetch('/api/task-boards', {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: boardForm.name,
          weekLabel: boardForm.weekLabel,
          days: boardForm.selectedDays,
          memberIds: boardForm.memberIds
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBoards(prev => [data, ...prev]);
        setActiveBoard(data);
        setShowCreateBoard(false);
        setBoardForm({ name: '', weekLabel: '', selectedDays: [...DAYS], memberIds: [] });
        setCreateFilter('all'); setCreateSearch('');
      } else {
        alert('Failed: ' + (data.message || 'Unknown error'));
      }
    } catch (e) { alert('Network error: ' + e.message); }
  };

  const deleteBoard = async (boardId) => {
    if (!window.confirm('Delete this board?')) return;
    await fetch(`/api/task-boards/${boardId}`, { method: 'DELETE', headers: getAuthHeader() });
    const updated = boards.filter(b => b._id !== boardId);
    setBoards(updated);
    setActiveBoard(updated[0] || null);
  };

  const resetWeek = async () => {
    const weekLabel = window.prompt('Enter new week label:', '');
    if (weekLabel === null) return;
    const res = await fetch(`/api/task-boards/${activeBoard._id}/reset-week`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekLabel })
    });
    if (res.ok) {
      const updated = await res.json();
      setActiveBoard(updated);
      setBoards(prev => prev.map(b => b._id === updated._id ? updated : b));
    }
  };

  const addTask = async () => {
    if (!taskText.trim() || !addingTask) return;
    const daysToAdd = copyToAllDays ? boardDays : [addingTask.day];
    let updated;
    for (const day of daysToAdd) {
      const res = await fetch(`/api/task-boards/${activeBoard._id}/task`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: addingTask.memberId, day, text: taskText })
      });
      if (res.ok) updated = await res.json();
    }
    if (updated) {
      setActiveBoard(updated);
      setBoards(prev => prev.map(b => b._id === updated._id ? updated : b));
    }
    setTaskText(''); setAddingTask(null); setCopyToAllDays(false);
  };

  const toggleTask = async (memberId, day, taskId) => {
    const res = await fetch(`/api/task-boards/${activeBoard._id}/task/${taskId}/toggle`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, day })
    });
    if (res.ok) {
      const updated = await res.json();
      setActiveBoard(updated);
      setBoards(prev => prev.map(b => b._id === updated._id ? updated : b));
    }
  };

  const deleteTask = async (memberId, day, taskId) => {
    const res = await fetch(`/api/task-boards/${activeBoard._id}/task/${taskId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, day })
    });
    if (res.ok) {
      const updated = await res.json();
      setActiveBoard(updated);
      setBoards(prev => prev.map(b => b._id === updated._id ? updated : b));
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Remove this person?')) return;
    const res = await fetch(`/api/task-boards/${activeBoard._id}/member/${memberId}`, {
      method: 'DELETE', headers: getAuthHeader()
    });
    if (res.ok) {
      const updated = await res.json();
      setActiveBoard(updated);
      setBoards(prev => prev.map(b => b._id === updated._id ? updated : b));
    }
  };

  const addMemberToBoard = async (userId, name) => {
    const res = await fetch(`/api/task-boards/${activeBoard._id}/member`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name })
    });
    if (res.ok) {
      const updated = await res.json();
      setActiveBoard(updated);
      setBoards(prev => prev.map(b => b._id === updated._id ? updated : b));
    }
    setShowAddMember(false);
  };

  const hasAdminPowers = isAdmin || isWsManager;

  const canEditColumn = (memberCol) =>
    hasAdminPowers ||
    memberCol.userId?.toString() === user?._id?.toString() ||
    memberCol.userId?.toString() === user?.id?.toString();

  const boardDays = activeBoard?.days || DAYS;

  // ── Staff Picker ──
  const StaffPicker = ({ filtered, selectedIds, onToggle, onSelectAll, onClear, filter, setFilter, search, setSearch }) => (
    <div>
      <div className="wb-dept-tabs">
        <button className={`wb-dept-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        {departments.map(d => (
          <button key={d._id} className={`wb-dept-tab ${filter === d._id ? 'active' : ''}`} onClick={() => setFilter(d._id)}>
            {d.name}
          </button>
        ))}
      </div>
      <div className="wb-picker-toolbar">
        <input className="wb-picker-search" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="wb-picker-action" onClick={onSelectAll}>Select visible</button>
          {filter !== 'all' && (
            <button className="wb-picker-action dept" onClick={() => {
              staffList.filter(s => (s.department?._id || s.department) === filter).forEach(s => onToggle(s._id, true));
            }}>+ Whole dept</button>
          )}
          <button className="wb-picker-action clear" onClick={onClear}>Clear all</button>
        </div>
      </div>
      <div className="wb-staff-list">
        {filtered.length === 0 && (
          <div style={{ color: '#94a3b8', fontSize: 13, padding: 16, textAlign: 'center' }}>
            {search ? 'No matches' : 'No staff in this department'}
          </div>
        )}
        {filtered.map((s, i) => {
          const deptName = departments.find(d => d._id === (s.department?._id || s.department))?.name || '';
          const isSelected = selectedIds.includes(s._id);
          return (
            <label key={s._id} className={`wb-staff-check ${isSelected ? 'selected' : ''}`}>
              <input type="checkbox" checked={isSelected} onChange={e => onToggle(s._id, e.target.checked)} />
              <span className="wb-staff-avatar" style={{ background: COLORS[i % COLORS.length] }}>{s.name.charAt(0)}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 500 }}>{s.name}</span>
                {deptName && <span style={{ fontSize: 11, color: '#94a3b8' }}>{deptName}</span>}
              </span>
              {isSelected && <span style={{ color: '#3b82f6', fontSize: 14, fontWeight: 700 }}>✓</span>}
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="wb-container">
      {/* Sidebar */}
      <aside className="wb-sidebar ignore-dark">
        <div className="wb-sidebar-top">
          <button className="wb-back-btn" onClick={() => navigate(isAdmin ? '/home' : '/staff-dashboard')}>← Back</button>
          <div className="wb-sidebar-title">Task Boards</div>
        </div>
        <div className="wb-board-list">
          {boards.map(b => (
            <div key={b._id} className={`wb-board-item ${activeBoard?._id === b._id ? 'active' : ''}`} onClick={() => setActiveBoard(b)}>
              <span className="wb-board-icon">📋</span>
              <div className="wb-board-item-info">
                <div className="wb-board-item-name">{b.name}</div>
                {b.weekLabel && <div className="wb-board-item-week">{b.weekLabel}</div>}
              </div>
            </div>
          ))}
          {boards.length === 0 && !loading && <div className="wb-empty-sidebar">No boards yet</div>}
        </div>
        {hasAdminPowers && <button className="wb-create-btn" onClick={() => setShowCreateBoard(true)}>+ New Board</button>}
      </aside>

      {/* Main */}
      <main className="wb-main">
        {loading ? (
          <div className="wb-loading">Loading...</div>
        ) : !activeBoard ? (
          <div className="wb-empty-main">
            <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
            <h2>No boards yet</h2>
            {hasAdminPowers && <p>Create a board and assign team members to get started.</p>}
            {hasAdminPowers && <button className="wb-create-btn-big" onClick={() => setShowCreateBoard(true)}>+ Create First Board</button>}
          </div>
        ) : (
          <>
            <div className="wb-board-header">
              <div>
                <h1 className="wb-board-title">{activeBoard.name}</h1>
                {activeBoard.weekLabel && <div className="wb-board-week">{activeBoard.weekLabel}</div>}
              </div>
              {hasAdminPowers && (
                <div className="wb-board-actions">
                  <button className="wb-action-btn" onClick={() => setShowAddMember(true)}>+ Add Person</button>
                  <button className="wb-action-btn reset" onClick={resetWeek}>🔄 New Week</button>
                  {isAdmin && <button className="wb-action-btn" onClick={() => { setShowHistory(true); loadSnapshots(activeBoard._id); }}>📚 History</button>}
                  <button className="wb-action-btn danger" onClick={() => deleteBoard(activeBoard._id)}>Delete</button>
                </div>
              )}
            </div>

            <div className="wb-columns-scroll">
              <div className="wb-columns">
                {activeBoard.members.map((member, mi) => {
                  const canEdit = canEditColumn(member);
                  return (
                    <div key={member._id} className="wb-column">
                      {/* Column header */}
                      <div className="wb-col-header" style={{ borderBottom: `3px solid ${member.color || COLORS[mi % COLORS.length]}` }}>
                        <div className="wb-col-avatar" style={{ background: member.color || COLORS[mi % COLORS.length] }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="wb-col-name">{member.name.toUpperCase()}</div>
                        <div className="wb-col-count">{member.days.reduce((a, d) => a + d.tasks.length, 0)} tasks</div>
                        {hasAdminPowers && <button className="wb-col-remove" onClick={() => removeMember(member._id)} title="Remove">✕</button>}
                      </div>

                      {/* Progress bar */}
                      <MemberProgress member={member} />

                      {/* Day sections */}
                      <div className="wb-col-body">
                        {boardDays.map(day => {
                          const dayData = member.days.find(d => d.day === day) || { day, tasks: [] };
                          const isAddingHere = addingTask?.memberId === member._id && addingTask?.day === day;
                          return (
                            <div key={day} className="wb-day-section">
                              <div className="wb-day-label">{day}</div>
                              {dayData.tasks.map(task => (
                                <div key={task._id} className={`wb-task ${task.completed ? 'done' : ''}`}>
                                  <input type="checkbox" checked={task.completed} onChange={() => canEdit && toggleTask(member._id, day, task._id)} disabled={!canEdit} />
                                  <span className="wb-task-text">{task.text}</span>
                                  {canEdit && <button className="wb-task-del" onClick={() => deleteTask(member._id, day, task._id)}>✕</button>}
                                </div>
                              ))}
                              {canEdit && (
                                isAddingHere ? (
                                  <div className="wb-add-task-form">
                                    <input autoFocus value={taskText} onChange={e => setTaskText(e.target.value)}
                                      onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') { setAddingTask(null); setCopyToAllDays(false); } }}
                                      placeholder="Type task, press Enter..." className="wb-task-input" />
                                    <label className="wb-copy-all-label">
                                      <input type="checkbox" checked={copyToAllDays} onChange={e => setCopyToAllDays(e.target.checked)} />
                                      <span>📋 Add to all days</span>
                                    </label>
                                    <div className="wb-add-task-btns">
                                      <button onClick={addTask} className="wb-save-task">
                                        {copyToAllDays ? `Add to all ${boardDays.length} days` : 'Add'}
                                      </button>
                                      <button onClick={() => { setAddingTask(null); setTaskText(''); setCopyToAllDays(false); }} className="wb-cancel-task">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <button className="wb-add-task-btn" onClick={() => { setAddingTask({ memberId: member._id, day }); setTaskText(''); setCopyToAllDays(false); }}>
                                    + Add a task
                                  </button>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {activeBoard.members.length === 0 && (
                  <div className="wb-no-members">
                    {hasAdminPowers ? 'Click "+ Add Person" to assign team members.' : 'No members assigned yet.'}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateBoard && (
        <div className="wb-modal-overlay" onClick={() => setShowCreateBoard(false)}>
          <div className="wb-modal" onClick={e => e.stopPropagation()}>
            <div className="wb-modal-header">
              <h3>Create Task Board</h3>
              <button onClick={() => setShowCreateBoard(false)}>✕</button>
            </div>
            <div className="wb-modal-body">
              <label>Board Name *</label>
              <input value={boardForm.name} onChange={e => setBoardForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Weekly Tasks — Design Team" />
              <label>Week Label</label>
              <input value={boardForm.weekLabel} onChange={e => setBoardForm(f => ({ ...f, weekLabel: e.target.value }))} placeholder="e.g. Week of May 12, 2026" />
              <label>Days to include</label>
              <div className="wb-day-checkboxes">
                {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map(d => (
                  <label key={d} className="wb-day-check">
                    <input type="checkbox" checked={boardForm.selectedDays.includes(d)}
                      onChange={e => setBoardForm(f => ({
                        ...f,
                        selectedDays: e.target.checked ? [...f.selectedDays, d] : f.selectedDays.filter(x => x !== d)
                      }))} />
                    {d.slice(0,3)}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>Assign Team Members</label>
                <span style={{ fontSize: 12, color: boardForm.memberIds.length > 0 ? '#3b82f6' : '#94a3b8', fontWeight: 600 }}>
                  {boardForm.memberIds.length} selected
                </span>
              </div>
              <StaffPicker
                filtered={createFilteredStaff}
                selectedIds={boardForm.memberIds}
                onToggle={toggleMemberId}
                onSelectAll={() => setBoardForm(f => ({ ...f, memberIds: [...new Set([...f.memberIds, ...createFilteredStaff.map(s => s._id)])] }))}
                onClear={() => setBoardForm(f => ({ ...f, memberIds: [] }))}
                filter={createFilter} setFilter={setCreateFilter}
                search={createSearch} setSearch={setCreateSearch}
              />
            </div>
            <div className="wb-modal-footer">
              <button onClick={() => setShowCreateBoard(false)} className="wb-btn-cancel">Cancel</button>
              <button onClick={createBoard} className="wb-btn-create" disabled={!boardForm.name.trim()}>
                Create Board {boardForm.memberIds.length > 0 ? `(${boardForm.memberIds.length} people)` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && activeBoard && (
        <div className="wb-modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="wb-modal" onClick={e => e.stopPropagation()}>
            <div className="wb-modal-header">
              <h3>Add Person to Board</h3>
              <button onClick={() => setShowAddMember(false)}>✕</button>
            </div>
            <div className="wb-modal-body">
              <StaffPicker
                filtered={addFilteredStaff}
                selectedIds={[]}
                onToggle={(id) => {
                  const s = staffList.find(x => x._id === id);
                  if (s) addMemberToBoard(s._id, s.name);
                }}
                onSelectAll={() => {}}
                onClear={() => {}}
                filter={addFilter} setFilter={setAddFilter}
                search={addSearch} setSearch={setAddSearch}
              />
              {addFilteredStaff.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>All staff already added</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="wb-modal-overlay" onClick={() => { setShowHistory(false); setActiveSnapshot(null); }}>
          <div className="wb-modal wb-history-modal" onClick={e => e.stopPropagation()}>
            <div className="wb-modal-header">
              <h3>📚 Week History — {activeBoard?.name}</h3>
              <button onClick={() => { setShowHistory(false); setActiveSnapshot(null); }}>✕</button>
            </div>
            <div className="wb-history-body">
              {/* Snapshot list */}
              <div className="wb-history-sidebar">
                <div className="wb-history-sidebar-title">Past Weeks</div>
                {snapshotsLoading && <div style={{ color: '#94a3b8', padding: 16, fontSize: 13 }}>Loading...</div>}
                {!snapshotsLoading && snapshots.length === 0 && (
                  <div style={{ color: '#94a3b8', padding: 16, fontSize: 13 }}>No history yet. History is saved when you click "New Week".</div>
                )}
                {snapshots.map(snap => (
                  <div key={snap._id}
                    className={`wb-history-item ${activeSnapshot?._id === snap._id ? 'active' : ''}`}
                    onClick={() => setActiveSnapshot(snap)}>
                    <div className="wb-history-item-label">{snap.weekLabel || 'Unlabelled week'}</div>
                    <div className="wb-history-item-date">{new Date(snap.snapshotAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                ))}
              </div>

              {/* Snapshot detail */}
              <div className="wb-history-detail">
                {!activeSnapshot ? (
                  <div className="wb-history-empty">← Select a week to view its report</div>
                ) : (
                  <>
                    <div className="wb-history-detail-header">
                      <div>
                        <div className="wb-history-detail-title">{activeSnapshot.weekLabel || 'Unlabelled week'}</div>
                        <div className="wb-history-detail-date">Saved on {new Date(activeSnapshot.snapshotAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className="wb-history-members">
                      {(activeSnapshot.members || []).map((member, mi) => {
                        const allTasks = member.days.flatMap(d => d.tasks);
                        const done = allTasks.filter(t => t.completed).length;
                        const total = allTasks.length;
                        const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                        const color = pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#e53e3e';
                        return (
                          <div key={mi} className="wb-history-member-card">
                            <div className="wb-history-member-header" style={{ borderLeft: `4px solid ${member.color || COLORS[mi % COLORS.length]}` }}>
                              <span className="wb-history-member-avatar" style={{ background: member.color || COLORS[mi % COLORS.length] }}>{member.name.charAt(0)}</span>
                              <span className="wb-history-member-name">{member.name}</span>
                              <span className="wb-history-member-pct" style={{ color }}>{pct}% · {done}/{total} tasks</span>
                            </div>
                            <div className="wb-history-days">
                              {member.days.filter(d => d.tasks.length > 0).map((dayCol, di) => (
                                <div key={di} className="wb-history-day">
                                  <div className="wb-history-day-label">{dayCol.day}</div>
                                  {dayCol.tasks.map((task, ti) => (
                                    <div key={ti} className={`wb-history-task ${task.completed ? 'done' : ''}`}>
                                      <span className="wb-history-task-check">{task.completed ? '✓' : '○'}</span>
                                      <span>{task.text}</span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                              {member.days.every(d => d.tasks.length === 0) && (
                                <div style={{ color: '#64748b', fontSize: 12, padding: '8px 0' }}>No tasks recorded</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
