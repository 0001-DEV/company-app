import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

export default function EmployeeDirectory() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const token = () => localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, staffRes] = await Promise.all([
          fetch("/api/chat/me", { headers: { Authorization: `Bearer ${token()}` } }),
          fetch("/api/admin/all-staff", { headers: { Authorization: `Bearer ${token()}` } }),
        ]);
        if (meRes.ok) setCurrentUser(await meRes.json());
        if (staffRes.ok) setStaff(await staffRes.json());
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const departments = ["all", ...Array.from(new Set(staff.map(s => s.department?.name).filter(Boolean)))];
  const filtered = staff.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.name?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || s.department?.name === deptFilter;
    return matchSearch && matchDept;
  });

  const getInitials = name => (name || "?").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#6366f1"];
  const colorFor = name => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  const isAdmin = currentUser?.role === "admin";
  const backPath = isAdmin ? "/home" : "/staff-dashboard";

  const exportToExcel = async () => {
    try {
      const t = token();
      const res = await fetch('/api/admin/export-staff', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (!res.ok) { 
        const errData = await res.json().catch(() => ({}));
        alert('Export failed: ' + (errData.message || res.statusText)); 
        return; 
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        alert('Export failed: Empty response from server');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `Staff_Directory_${date}.csv`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 1000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Download error: ' + err.message);
    }
  };

  return (
    <div style={s.page}>
      <TopBar title="👥 Employee Directory" subtitle="Find and connect with your team" backPath={backPath} />
      <div style={s.body}>
        {/* Filters */}
        <div style={s.filterRow}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input placeholder="Search by name, email, department..." value={search}
              onChange={e => setSearch(e.target.value)} style={s.searchInput} />
            {search && <button style={s.clearBtn} onClick={() => setSearch("")}>✕</button>}
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={s.select}>
            {departments.map(d => <option key={d} value={d}>{d === "all" ? "All Departments" : d}</option>)}
          </select>
          {isAdmin && (
            <button onClick={exportToExcel} style={s.exportBtn}>
              📥 Export to Excel
            </button>
          )}
        </div>

        <div style={s.countRow}>{filtered.length} staff member{filtered.length !== 1 ? "s" : ""}</div>

        {loading ? (
          <div style={s.center}><div style={s.spinner} /></div>
        ) : (
          <div style={s.grid}>
            {filtered.map(person => (
              <div key={person._id} style={s.card} onClick={() => setSelected(person)}>
                {person.profilePicture && person.profilePicture.trim() ? (
                  <img 
                    src={`${person.profilePicture}?t=${Date.now()}`} 
                    alt={person.name} 
                    style={{ ...s.avatar, objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ ...s.avatar, background: colorFor(person.name) }}>{getInitials(person.name)}</div>
                )}
                <div style={s.name}>{person.name}</div>
                <div style={s.dept}>{person.department?.name || "—"}</div>
                <div style={s.email}>{person.email}</div>
                <div style={s.role}>Staff</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: 'var(--text-lighter, #94a3b8)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div>No staff found matching your search</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile modal */}
      {selected && (
        <div style={s.overlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
            {selected.profilePicture && selected.profilePicture.trim() ? (
              <img 
                src={`${selected.profilePicture}?t=${Date.now()}`} 
                alt={selected.name} 
                style={{ ...s.modalAvatar, objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ ...s.modalAvatar, background: colorFor(selected.name) }}>{getInitials(selected.name)}</div>
            )}
            <div style={s.modalName}>{selected.name}</div>
            <div style={s.modalDept}>{selected.department?.name || "No Department"}</div>
            <div style={s.modalDivider} />
            <div style={s.infoRow}><span style={s.infoLabel}>Email</span><span style={s.infoVal}>{selected.email}</span></div>
            <div style={s.infoRow}><span style={s.infoLabel}>Role</span><span style={s.infoVal}>Staff Member</span></div>
            <div style={s.infoRow}><span style={s.infoLabel}>Department</span><span style={s.infoVal}>{selected.department?.name || "—"}</span></div>
            <div style={s.infoRow}><span style={s.infoLabel}>Joined</span><span style={s.infoVal}>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}</span></div>
            <button style={s.chatBtn} onClick={() => navigate("/chat")}>💬 Send Message</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  body: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" },
  filterRow: { display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  searchWrap: { position: "relative", flex: 1, minWidth: 220 },
  searchIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: 'var(--text-lighter, #94a3b8)' },
  searchInput: { width: "100%", padding: "11px 40px", borderRadius: 50, border: '1.5px solid var(--border-color, #e2e8f0)', fontSize: 14, outline: "none", background: 'var(--bg-card, white)', boxSizing: "border-box" },
  clearBtn: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 11 },
  select: { padding: "11px 16px", borderRadius: 50, border: '1.5px solid var(--border-color, #e2e8f0)', fontSize: 14, outline: "none", background: 'var(--bg-card, white)', cursor: "pointer" },
  exportBtn: { padding: "11px 18px", borderRadius: 50, border: 'none', fontSize: 14, fontWeight: 700, cursor: "pointer", background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' },
  countRow: { fontSize: 13, color: 'var(--text-muted, #64748b)', marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  card: { background: 'var(--bg-card, white)', borderRadius: 16, padding: "24px 16px 20px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", border: '1px solid var(--border-light, #f1f5f9)' },
  avatar: { width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 22, margin: "0 auto 12px" },
  name: { fontSize: 15, fontWeight: 700, color: 'var(--text-main, #0f172a)', marginBottom: 4 },
  dept: { fontSize: 12, color: "#6366f1", fontWeight: 600, marginBottom: 4 },
  email: { fontSize: 12, color: 'var(--text-lighter, #94a3b8)', marginBottom: 6, wordBreak: "break-all" },
  role: { display: "inline-block", padding: "3px 10px", background: "#f0fdf4", color: "#16a34a", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  center: { display: "flex", justifyContent: "center", padding: 60 },
  spinner: { width: 36, height: 36, border: "4px solid #e5e7eb", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 },
  modal: { background: 'var(--bg-card, white)', borderRadius: 20, padding: "32px 28px", width: 360, maxWidth: "90vw", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" },
  closeBtn: { position: "absolute", top: 14, right: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: 'var(--text-lighter, #94a3b8)' },
  modalAvatar: { width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 28, margin: "0 auto 14px" },
  modalName: { fontSize: 20, fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: 4 },
  modalDept: { fontSize: 13, color: "#6366f1", fontWeight: 600, marginBottom: 16 },
  modalDivider: { height: 1, background: "#f1f5f9", margin: "0 0 16px" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc", textAlign: "left" },
  infoLabel: { fontSize: 12, color: 'var(--text-lighter, #94a3b8)', fontWeight: 600 },
  infoVal: { fontSize: 13, color: 'var(--text-main, #0f172a)', fontWeight: 500, maxWidth: "60%", textAlign: "right", wordBreak: "break-all" },
  chatBtn: { marginTop: 20, width: "100%", padding: "12px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" },
};
