import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";

const DAYS = ["mon","tue","wed","thu","fri","sat","sun"];
const DAY_LABELS = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };
const SHIFT_COLORS = { "Morning":"#dbeafe", "Afternoon":"#dcfce7", "Night":"#fef9c3", "Off":"#f1f5f9", "":"#f8fafc" };

export default function ScheduleBoard() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [deptFilter, setDeptFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weekLabel: "", weekStart: "", departmentId: "", departmentName: "", rows: [] });
  const [saving, setSaving] = useState(false);
  const token = () => localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, deptRes, staffRes, schedRes] = await Promise.all([
          fetch("http://localhost:5000/api/chat/me", { headers: { Authorization: `Bearer ${token()}` } }),
          fetch("http://localhost:5000/api/admin/fixed-departments", { headers: { Authorization: `Bearer ${token()}` } }),
          fetch("http://localhost:5000/api/admin/all-staff", { headers: { Authorization: `Bearer ${token()}` } }),
          fetch("http://localhost:5000/api/extras/schedules", { headers: { Authorization: `Bearer ${token()}` } }),
        ]);
        if (meRes.ok) setCurrentUser(await meRes.json());
        if (deptRes.ok) setDepartments(await deptRes.json());
        if (staffRes.ok) setStaff(await staffRes.json());
        if (schedRes.ok) setSchedules(await schedRes.json());
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const isAdmin = currentUser?.role === "admin";
  const backPath = isAdmin ? "/home" : "/staff-dashboard";

  const filtered = deptFilter === "all" ? schedules : schedules.filter(s => s.departmentId === deptFilter || s.departmentName === deptFilter);

  const initForm = (deptId) => {
    const dept = departments.find(d => d._id === deptId);
    const deptStaff = staff.filter(s => s.department?._id === deptId || s.department === deptId);
    const today = new Date();
    const mon = new Date(today); mon.setDate(today.getDate() - today.getDay() + 1);
    setForm({
      weekLabel: `Week of ${mon.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
      weekStart: mon.toISOString().split("T")[0],
      departmentId: deptId,
      departmentName: dept?.name || "",
      rows: deptStaff.map(s => ({ staffId: s._id, staffName: s.name, shifts: { mon:"", tue:"", wed:"", thu:"", fri:"", sat:"", sun:"" } })),
    });
    setShowForm(true);
  };

  const updateShift = (rowIdx, day, val) => {
    setForm(f => {
      const rows = [...f.rows];
      rows[rowIdx] = { ...rows[rowIdx], shifts: { ...rows[rowIdx].shifts, [day]: val } };
      return { ...f, rows };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/extras/schedules", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const s = await res.json();
        setSchedules(prev => [s, ...prev]);
        setShowForm(false);
      }
    } catch (_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    await fetch(`http://localhost:5000/api/extras/schedules/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setSchedules(prev => prev.filter(s => s._id !== id));
  };

  return (
    <div style={s.page}>
      <TopBar title="📅 Schedule Board" subtitle="Weekly shift schedules by department" backPath={backPath} />
      <div style={s.body}>
        <div style={s.toolbar}>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={s.select}>
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          {isAdmin && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {departments.map(d => (
                <button key={d._id} style={s.newBtn} onClick={() => initForm(d._id)}>+ {d.name}</button>
              ))}
            </div>
          )}
        </div>

        {loading ? <div style={s.center}><div style={s.spinner} /></div> : (
          filtered.length === 0 ? (
            <div style={s.empty}><div style={{ fontSize: 48, marginBottom: 12 }}>📅</div><div>No schedules posted yet</div></div>
          ) : (
            filtered.map(sched => (
              <div key={sched._id} style={s.schedCard}>
                <div style={s.schedHeader}>
                  <div>
                    <div style={s.schedTitle}>{sched.departmentName}</div>
                    <div style={s.schedSub}>{sched.weekLabel} · Posted by {sched.createdByName}</div>
                  </div>
                  {isAdmin && <button style={s.deleteBtn} onClick={() => handleDelete(sched._id)}>🗑️</button>}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Staff</th>
                        {DAYS.map(d => <th key={d} style={s.th}>{DAY_LABELS[d]}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(sched.rows || []).map((row, i) => (
                        <tr key={i}>
                          <td style={s.tdName}>{row.staffName}</td>
                          {DAYS.map(d => (
                            <td key={d} style={{ ...s.td, background: SHIFT_COLORS[row.shifts?.[d]] || "#f8fafc" }}>
                              {row.shifts?.[d] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Create schedule modal */}
      {showForm && (
        <div style={s.overlay} onClick={() => setShowForm(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>New Schedule — {form.departmentName}</span>
              <button style={s.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={s.formRow}>
              <label style={s.label}>Week Label</label>
              <input value={form.weekLabel} onChange={e => setForm(f => ({ ...f, weekLabel: e.target.value }))} style={s.input} />
            </div>
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Staff</th>
                    {DAYS.map(d => <th key={d} style={s.th}>{DAY_LABELS[d]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {form.rows.map((row, i) => (
                    <tr key={i}>
                      <td style={s.tdName}>{row.staffName}</td>
                      {DAYS.map(d => (
                        <td key={d} style={s.td}>
                          <select value={row.shifts[d]} onChange={e => updateShift(i, d, e.target.value)}
                            style={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 6px", width: "100%" }}>
                            <option value="">—</option>
                            <option>Morning</option>
                            <option>Afternoon</option>
                            <option>Night</option>
                            <option>Off</option>
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Schedule"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  body: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" },
  toolbar: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start" },
  select: { padding: "10px 16px", borderRadius: 10, border: '1.5px solid var(--border-color, #e2e8f0)', fontSize: 14, outline: "none", background: 'var(--bg-card, white)' },
  newBtn: { padding: "8px 14px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  center: { display: "flex", justifyContent: "center", padding: 60 },
  spinner: { width: 36, height: 36, border: "4px solid #e5e7eb", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty: { textAlign: "center", padding: "60px 20px", color: 'var(--text-lighter, #94a3b8)' },
  schedCard: { background: 'var(--bg-card, white)', borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: 20, overflow: "hidden" },
  schedHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: '1px solid var(--border-light, #f1f5f9)' },
  schedTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-main, #0f172a)' },
  schedSub: { fontSize: 12, color: 'var(--text-lighter, #94a3b8)', marginTop: 2 },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#ef4444" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "10px 12px", background: 'var(--bg-light, #f8fafc)', fontWeight: 700, color: 'var(--text-muted, #475569)', textAlign: "center", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" },
  td: { padding: "9px 10px", textAlign: "center", borderBottom: '1px solid var(--border-light, #f1f5f9)', fontSize: 12 },
  tdName: { padding: "9px 14px", fontWeight: 600, color: 'var(--text-main, #0f172a)', borderBottom: '1px solid var(--border-light, #f1f5f9)', whiteSpace: "nowrap" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 },
  modal: { background: 'var(--bg-card, white)', borderRadius: 16, padding: "24px", width: "90vw", maxWidth: 900, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  closeBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: 'var(--text-lighter, #94a3b8)' },
  formRow: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #64748b)' },
  input: { padding: "9px 12px", borderRadius: 8, border: '1.5px solid var(--border-color, #e2e8f0)', fontSize: 14, outline: "none" },
  saveBtn: { marginTop: 16, width: "100%", padding: 13, background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" },
};
