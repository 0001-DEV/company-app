import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";

export default function OrgChart() {
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const token = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, staffRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/departments", { headers: { Authorization: `Bearer ${token()}` } }),
          fetch("http://localhost:5000/api/admin/all-staff", { headers: { Authorization: `Bearer ${token()}` } }),
        ]);
        const depts = deptRes.ok ? await deptRes.json() : [];
        const staffList = staffRes.ok ? await staffRes.json() : [];
        setDepartments(depts);
        setStaff(staffList);
        // Expand all by default
        const exp = {};
        depts.forEach(d => { exp[d._id] = true; });
        setExpanded(exp);
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const getStaffForDept = (deptId) =>
    staff.filter(s => {
      const id = s.department?._id || s.department;
      return id?.toString() === deptId?.toString();
    });

  const toggleDept = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const DEPT_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#f97316","#84cc16","#a855f7"];

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:scaleY(0.95); } to { opacity:1; transform:scaleY(1); } }
        .org-members { animation: fadeIn 0.2s ease both; transform-origin: top; }
      `}</style>
      <TopBar title="🏗️ Org Chart" subtitle="Company hierarchy" backPath="/home" />
      <div style={s.body}>
        <div style={s.pageTitle}>Organisation Chart</div>
        <div style={s.subtitle}>{departments.length} departments · {staff.length} staff members</div>

        {loading ? (
          <div style={s.loading}><div style={s.spinner} /> Loading...</div>
        ) : (
          <>
            {/* Company root */}
            <div style={s.rootBox}>
              <div style={s.rootIcon}>🏢</div>
              <div>
                <div style={s.rootName}>Xtreme Cr8ivity</div>
                <div style={s.rootSub}>Head Office</div>
              </div>
            </div>

            {/* Connector line */}
            <div style={s.rootLine} />

            {/* Departments row */}
            <div style={s.deptGrid}>
              {departments.map((dept, i) => {
                const members = getStaffForDept(dept._id);
                const color = DEPT_COLORS[i % DEPT_COLORS.length];
                const isOpen = expanded[dept._id];
                return (
                  <div key={dept._id} style={s.deptCol}>
                    {/* Dept card */}
                    <div style={{ ...s.deptCard, borderTop: `4px solid ${color}` }}
                      onClick={() => toggleDept(dept._id)}>
                      <div style={{ ...s.deptIcon, background: color + "20", color }}>🏬</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.deptName}>{dept.name}</div>
                        <div style={s.deptCount}>{members.length} member{members.length !== 1 ? "s" : ""}</div>
                      </div>
                      <span style={{ color: 'var(--text-lighter, #94a3b8)', fontSize: 14, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>⌄</span>
                    </div>

                    {/* Members */}
                    {isOpen && (
                      <div className="org-members" style={s.memberList}>
                        {members.length === 0 ? (
                          <div style={s.noMembers}>No staff assigned</div>
                        ) : (
                          members.map(m => {
                            const initials = m.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?";
                            return (
                              <div key={m._id} style={s.memberCard}>
                                <div style={{ ...s.memberAvatar, background: color + "30", color }}>
                                  {m.photo
                                    ? <img src={`http://localhost:5000/${m.photo}`} alt={m.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                                    : initials}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={s.memberName}>{m.name}</div>
                                  <div style={s.memberRole}>{m.jobTitle || m.role || "Staff"}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  body: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" },
  pageTitle: { fontSize: 24, fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'var(--text-lighter, #94a3b8)', marginBottom: 32 },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "60px", color: 'var(--text-muted, #64748b)', fontSize: 15 },
  spinner: { width: 24, height: 24, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  rootBox: { display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg,#1e40af,#3b82f6)", borderRadius: 16, padding: "18px 24px", maxWidth: 320, margin: "0 auto", boxShadow: "0 8px 24px rgba(59,130,246,0.3)" },
  rootIcon: { fontSize: 32 },
  rootName: { fontSize: 16, fontWeight: 800, color: "white" },
  rootSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  rootLine: { width: 2, height: 32, background: "#cbd5e1", margin: "0 auto" },

  deptGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  deptCol: { display: "flex", flexDirection: "column", gap: 0 },
  deptCard: { background: 'var(--bg-card, white)', borderRadius: "12px 12px 0 0", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", cursor: "pointer", userSelect: "none" },
  deptIcon: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  deptName: { fontSize: 13, fontWeight: 800, color: 'var(--text-main, #0f172a)', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  deptCount: { fontSize: 11, color: 'var(--text-lighter, #94a3b8)', marginTop: 2 },

  memberList: { background: 'var(--bg-card, white)', borderRadius: "0 0 12px 12px", borderTop: "1px solid #f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", overflow: "hidden" },
  noMembers: { padding: "12px 16px", fontSize: 12, color: 'var(--text-lighter, #94a3b8)', textAlign: "center" },
  memberCard: { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid #f8fafc" },
  memberAvatar: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, overflow: "hidden" },
  memberName: { fontSize: 12, fontWeight: 400, color: 'var(--text-main, #0f172a)', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  memberRole: { fontSize: 11, color: 'var(--text-lighter, #94a3b8)', marginTop: 1 },
};
