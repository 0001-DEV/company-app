import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";

const COLUMNS = [
  { id: "todo",       label: "To Do",       color: 'var(--text-muted, #64748b)', bg: "#f1f5f9", icon: "📋" },
  { id: "inprogress", label: "In Progress",  color: "#f59e0b", bg: "#fffbeb", icon: "⚡" },
  { id: "done",       label: "Done",         color: "#10b981", bg: "#f0fdf4", icon: "✅" },
];
const PRIORITY_META = {
  low:    { label: "Low",    color: "#10b981", bg: "#f0fdf4" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb" },
  high:   { label: "High",   color: "#ef4444", bg: "#fef2f2" },
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", assignedTo: [], dueDate: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [dragOver, setDragOver] = useState(null);

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/chat/me", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : null).then(u => { setCurrentUser(u); });
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "admin") {
      fetch("http://localhost:5000/api/chat/users", { headers: { Authorization: `Bearer ${token()}` } })
        .then(r => r.ok ? r.json() : []).then(setStaffList);
    }
  }, [currentUser]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/features/tasks", { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setTasks(await res.json());
    } catch (_) {}
    setLoading(false);
  };

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: "", description: "", priority: "medium", assignedTo: [], dueDate: "" });
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description || "",
      priority: task.priority, assignedTo: task.assignedTo || [], dueDate: task.dueDate ? task.dueDate.substring(0, 10) : ""
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const assignedToNames = staffList.filter(s => form.assignedTo.includes(s._id)).map(s => s.name);
      const body = { ...form, assignedToNames };
      const url = editTask ? `http://localhost:5000/api/features/tasks/${editTask._id}` : "http://localhost:5000/api/features/tasks";
      const method = editTask ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowForm(false); setEditTask(null);
        showToast(editTask ? "Task updated!" : "Task created!", "success");
        fetchTasks();
      }
    } catch (_) {}
    setSaving(false);
  };

  const updateStatus = async (taskId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/features/tasks/${taskId}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await fetch(`http://localhost:5000/api/features/tasks/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setTasks(prev => prev.filter(t => t._id !== id));
    showToast("Task deleted.", "success");
  };

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const isAdmin = currentUser?.role === "admin";
  const filtered = filterStatus === "all" ? tasks : tasks.filter(t => t.status === filterStatus);

  const toggleAssign = (id) => {
    setForm(f => ({ ...f, assignedTo: f.assignedTo.includes(id) ? f.assignedTo.filter(x => x !== id) : [...f.assignedTo, id] }));
  };

  const isOverdue = (task) => task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  return (
    <div style={s.page}>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .task-card { animation: fadeUp 0.25s ease both; transition: box-shadow 0.2s, transform 0.2s; }
        .task-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; transform: translateY(-2px); }
        .col-drop-active { background: rgba(99,102,241,0.06) !important; border: 2px dashed #6366f1 !important; }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, background: toast.type === "success" ? "#10b981" : "#ef4444", color: "white", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease" }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <TopBar title="📋 Task Board" subtitle="Assign and track tasks" backPath={isAdmin ? "/home" : "/staff-dashboard"} />

      <div style={s.body}>
        {/* Header */}
        <div style={s.headerRow}>
          <div>
            <div style={s.pageTitle}>Task Board</div>
            <div style={s.pageSub}>{tasks.length} task{tasks.length !== 1 ? "s" : ""} total</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* Filter */}
            <div style={s.filterRow}>
              {["all", ...COLUMNS.map(c => c.id)].map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  style={{ ...s.filterBtn, ...(filterStatus === f ? s.filterBtnActive : {}) }}>
                  {f === "all" ? "All" : COLUMNS.find(c => c.id === f)?.label}
                </button>
              ))}
            </div>
            {isAdmin && <button style={s.createBtn} onClick={openCreate}>+ New Task</button>}
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {COLUMNS.map(col => {
            const count = tasks.filter(t => t.status === col.id).length;
            return (
              <div key={col.id} style={{ ...s.statCard, borderTop: `3px solid ${col.color}` }}>
                <div style={{ fontSize: 22 }}>{col.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted, #64748b)' }}>{col.label}</div>
              </div>
            );
          })}
          <div style={{ ...s.statCard, borderTop: "3px solid #ef4444" }}>
            <div style={{ fontSize: 22 }}>🔴</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{tasks.filter(isOverdue).length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #64748b)' }}>Overdue</div>
          </div>
        </div>

        {loading ? (
          <div style={s.loading}><div style={s.spinner} /> Loading tasks...</div>
        ) : (
          /* Kanban board */
          <div style={s.board}>
            {COLUMNS.map(col => {
              const colTasks = filtered.filter(t => t.status === col.id);
              return (
                <div key={col.id}
                  className={dragOver === col.id ? "col-drop-active" : ""}
                  onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData("taskId"); if (id) updateStatus(id, col.id); }}
                  style={{ ...s.column, background: col.bg }}>
                  <div style={s.colHeader}>
                    <span style={{ fontSize: 18 }}>{col.icon}</span>
                    <span style={{ fontWeight: 700, color: col.color, fontSize: 14 }}>{col.label}</span>
                    <span style={{ ...s.colCount, background: col.color }}>{colTasks.length}</span>
                  </div>
                  <div style={s.colBody}>
                    {colTasks.length === 0 && (
                      <div style={s.emptyCol}>Drop tasks here</div>
                    )}
                    {colTasks.map((task, idx) => {
                      const pm = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                      const overdue = isOverdue(task);
                      return (
                        <div key={task._id} className="task-card"
                          draggable
                          onDragStart={e => e.dataTransfer.setData("taskId", task._id)}
                          style={{ ...s.taskCard, animationDelay: `${idx * 0.04}s`, border: overdue ? "1.5px solid #fca5a5" : "1.5px solid #f1f5f9" }}>
                          {/* Priority + overdue */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ ...s.priorityTag, background: pm.bg, color: pm.color }}>{pm.label}</span>
                            {overdue && <span style={s.overdueTag}>⏰ Overdue</span>}
                          </div>
                          <div style={s.taskTitle}>{task.title}</div>
                          {task.description && <div style={s.taskDesc}>{task.description.substring(0, 80)}{task.description.length > 80 ? "…" : ""}</div>}
                          {/* Assignees */}
                          {task.assignedToNames?.length > 0 && (
                            <div style={s.assignees}>
                              {task.assignedToNames.map((n, i) => (
                                <span key={i} style={s.assigneeChip}>{n.split(" ")[0]}</span>
                              ))}
                            </div>
                          )}
                          {/* Due date */}
                          {task.dueDate && (
                            <div style={{ fontSize: 11, color: overdue ? "#ef4444" : "#94a3b8", marginTop: 6 }}>
                              📅 {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </div>
                          )}
                          {/* Actions */}
                          <div style={s.taskActions}>
                            {/* Status quick-move */}
                            {COLUMNS.filter(c => c.id !== task.status).map(c => (
                              <button key={c.id} onClick={() => updateStatus(task._id, c.id)}
                                style={{ ...s.moveBtn, color: c.color }}>→ {c.label}</button>
                            ))}
                            {isAdmin && (
                              <>
                                <button onClick={() => openEdit(task)} style={s.editBtn}>✏️</button>
                                <button onClick={() => handleDelete(task._id)} style={s.delBtn}>🗑️</button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div style={s.overlay}>
          <form onSubmit={handleSave} style={s.modal}>
            <div style={s.modalHeader}>
              <span style={{ fontWeight: 800, fontSize: 17, color: "white" }}>{editTask ? "✏️ Edit Task" : "➕ New Task"}</span>
              <button type="button" onClick={() => setShowForm(false)} style={s.closeBtn}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.field}>
                <label style={s.fieldLabel}>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Task title..." style={s.input} required />
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional details..." style={{ ...s.input, minHeight: 80, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={s.input}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={s.input} />
                </div>
              </div>
              {isAdmin && staffList.length > 0 && (
                <div style={s.field}>
                  <label style={s.fieldLabel}>Assign To</label>
                  <div style={s.staffGrid}>
                    {staffList.map(staff => (
                      <div key={staff._id} onClick={() => toggleAssign(staff._id)}
                        style={{ ...s.staffChip, background: form.assignedTo.includes(staff._id) ? "#eff6ff" : "#f8fafc", border: `1.5px solid ${form.assignedTo.includes(staff._id) ? "#3b82f6" : "#e5e7eb"}`, color: form.assignedTo.includes(staff._id) ? "#1d4ed8" : "#374151" }}>
                        {form.assignedTo.includes(staff._id) ? "✓ " : ""}{staff.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={s.modalFooter}>
              <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
              <button type="submit" disabled={saving} style={s.saveBtn}>{saving ? "Saving..." : editTask ? "💾 Update" : "✅ Create Task"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  body: { padding: "28px 24px 60px", maxWidth: 1200, margin: "0 auto" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  pageTitle: { fontSize: 24, fontWeight: 800, color: 'var(--text-main, #0f172a)' },
  pageSub: { fontSize: 13, color: 'var(--text-muted, #64748b)', marginTop: 2 },
  filterRow: { display: "flex", gap: 6, background: 'var(--bg-card, white)', padding: "4px", borderRadius: 10, border: "1px solid #e5e7eb" },
  filterBtn: { padding: "6px 14px", borderRadius: 8, border: "none", background: "none", fontSize: 13, fontWeight: 600, color: 'var(--text-muted, #64748b)', cursor: "pointer" },
  filterBtnActive: { background: "#1d4ed8", color: "white" },
  createBtn: { padding: "10px 20px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 },
  statCard: { background: 'var(--bg-card, white)', borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "60px", color: 'var(--text-muted, #64748b)', fontSize: 15 },
  spinner: { width: 24, height: 24, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  board: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  column: { borderRadius: 14, padding: "14px 12px", minHeight: 400, border: "2px solid transparent", transition: "all 0.2s" },
  colHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "0 4px" },
  colCount: { marginLeft: "auto", color: "white", borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 700 },
  colBody: { display: "flex", flexDirection: "column", gap: 10 },
  emptyCol: { textAlign: "center", padding: "30px 10px", color: "#cbd5e1", fontSize: 13, border: "2px dashed #e2e8f0", borderRadius: 10 },
  taskCard: { background: 'var(--bg-card, white)', borderRadius: 12, padding: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", cursor: "grab" },
  priorityTag: { padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  overdueTag: { padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#ef4444" },
  taskTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-main, #0f172a)', marginBottom: 4 },
  taskDesc: { fontSize: 12, color: 'var(--text-muted, #64748b)', lineHeight: 1.5, marginBottom: 6 },
  assignees: { display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 },
  assigneeChip: { padding: "2px 8px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  taskActions: { display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap", alignItems: "center" },
  moveBtn: { padding: "4px 8px", background: "none", border: "1px solid currentColor", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" },
  editBtn: { padding: "4px 8px", background: "#eff6ff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", marginLeft: "auto" },
  delBtn: { padding: "4px 8px", background: "#fef2f2", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)" },
  modal: { background: 'var(--bg-card, white)', borderRadius: 20, width: "90%", maxWidth: 520, boxShadow: "0 30px 80px rgba(0,0,0,0.3)", overflow: "hidden" },
  modalHeader: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  modalBody: { padding: "24px", display: "flex", flexDirection: "column", gap: 14, maxHeight: "60vh", overflowY: "auto" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: "uppercase", letterSpacing: "0.4px" },
  input: { padding: "10px 13px", borderRadius: 9, border: "2px solid #e5e7eb", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%" },
  staffGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  staffChip: { padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "0 24px 24px" },
  cancelBtn: { padding: "10px 20px", background: "#f1f5f9", color: 'var(--text-muted, #475569)', border: "none", borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: "pointer" },
  saveBtn: { padding: "10px 22px", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.35)" },
};
