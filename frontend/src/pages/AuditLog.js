import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ACTION_FILTERS = ["", "login", "logout", "upload", "delete_file", "send_message"];

const ACTION_META = {
  login:        { label: "Login",        color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: "→" },
  logout:       { label: "Logout",       color: 'var(--text-lighter, #94a3b8)', bg: "rgba(148,163,184,0.12)", icon: "←" },
  upload:       { label: "Upload",       color: "#6366f1", bg: "rgba(99,102,241,0.12)", icon: "↑" },
  delete_file:  { label: "Delete File",  color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "✕" },
  send_message: { label: "Message",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "◆" },
};

const getMeta = (action) => ACTION_META[action] || { label: action?.replace(/_/g," ") || "—", color: 'var(--text-muted, #64748b)', bg: "rgba(100,116,139,0.1)", icon: "·" };

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const token = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 50, ...(filter ? { filter } : {}) });
        const res = await fetch(`/api/extras/audit?${params}`, {
          headers: { Authorization: `Bearer ${token()}` }
        });
        if (res.status === 403) { navigate("/home"); return; }
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
          setTotalPages(data.pages || 1);
          setTotal(data.total || 0);
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchLogs();
  }, [page, filter, navigate]);

  // Count by action for summary bar
  const counts = logs.reduce((acc, l) => { acc[l.action] = (acc[l.action] || 0) + 1; return acc; }, {});

  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .audit-row { animation: fadeSlide 0.25s ease both; }
        .audit-row:hover { background: rgba(99,102,241,0.04) !important; }
        .filter-chip:hover { opacity: 0.85; }
        .page-btn:hover:not(:disabled) { background: #6366f1 !important; color: white !important; border-color: #6366f1 !important; }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <button onClick={() => navigate("/home")} style={s.backBtn}>← Dashboard</button>
          <div style={s.heroContent}>
            <div style={s.heroLeft}>
              <div style={s.heroIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div>
                <h1 style={s.heroTitle}>Audit Log</h1>
                <p style={s.heroSub}>Complete record of all system activity and user actions</p>
              </div>
            </div>
            <div style={s.heroBadge}>{total.toLocaleString()} events</div>
          </div>

          {/* Summary chips */}
          <div style={s.summaryRow}>
            {Object.entries(ACTION_META).map(([key, meta]) => (
              <button key={key} className="filter-chip"
                onClick={() => { setFilter(filter === key ? "" : key); setPage(1); }}
                style={{ ...s.chip, background: filter === key ? meta.color : "rgba(255,255,255,0.08)", color: filter === key ? "white" : "rgba(255,255,255,0.7)", border: `1px solid ${filter === key ? meta.color : "rgba(255,255,255,0.12)"}` }}>
                <span style={{ ...s.chipDot, background: meta.color }} />
                {meta.label}
                {counts[key] ? <span style={s.chipCount}>{counts[key]}</span> : null}
              </button>
            ))}
            {filter && (
              <button className="filter-chip" onClick={() => { setFilter(""); setPage(1); }}
                style={{ ...s.chip, background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                ✕ Clear filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={s.body}>
        {loading ? (
          <div style={s.loading}>
            <div style={s.spinner} />
            <span style={{ color: 'var(--text-muted, #64748b)', fontSize: 15 }}>Loading audit events...</span>
          </div>
        ) : logs.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-main, #0f172a)', marginBottom: 6 }}>No events found</div>
            <div style={{ color: 'var(--text-lighter, #94a3b8)', fontSize: 14 }}>
              {filter ? `No "${filter.replace(/_/g," ")}" events in the log` : "The audit log is empty"}
            </div>
          </div>
        ) : (
          <>
            <div style={s.tableCard}>
              {/* Table header */}
              <div style={s.tableHead}>
                <div style={{ ...s.col, flex: "0 0 140px" }}>Timestamp</div>
                <div style={{ ...s.col, flex: "0 0 160px" }}>User</div>
                <div style={{ ...s.col, flex: "0 0 90px" }}>Role</div>
                <div style={{ ...s.col, flex: "0 0 130px" }}>Action</div>
                <div style={{ ...s.col, flex: 1 }}>Detail</div>
              </div>

              {/* Rows */}
              <div>
                {logs.map((log, i) => {
                  const meta = getMeta(log.action);
                  return (
                    <div key={log._id} className="audit-row"
                      style={{ ...s.row, animationDelay: `${i * 0.02}s`, borderLeft: `3px solid ${meta.color}` }}>
                      {/* Time */}
                      <div style={{ ...s.cell, flex: "0 0 140px" }}>
                        <div style={s.dateMain}>
                          {new Date(log.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div style={s.dateSub}>
                          {new Date(log.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </div>
                      </div>

                      {/* User */}
                      <div style={{ ...s.cell, flex: "0 0 160px" }}>
                        <div style={s.userRow}>
                          <div style={{ ...s.avatar, background: meta.bg, color: meta.color }}>
                            {(log.userName || "?").charAt(0).toUpperCase()}
                          </div>
                          <span style={s.userName}>{log.userName || "—"}</span>
                        </div>
                      </div>

                      {/* Role */}
                      <div style={{ ...s.cell, flex: "0 0 90px" }}>
                        <span style={{ ...s.rolePill, ...(log.userRole === "admin" ? s.roleAdmin : s.roleStaff) }}>
                          {log.userRole || "—"}
                        </span>
                      </div>

                      {/* Action */}
                      <div style={{ ...s.cell, flex: "0 0 130px" }}>
                        <div style={{ ...s.actionPill, background: meta.bg, color: meta.color }}>
                          <span style={s.actionIcon}>{meta.icon}</span>
                          {meta.label}
                        </div>
                      </div>

                      {/* Detail */}
                      <div style={{ ...s.cell, flex: 1, color: 'var(--text-muted, #64748b)', fontSize: 13, wordBreak: "break-word" }}>
                        {log.detail || <span style={{ color: "#cbd5e1" }}>—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={s.pagination}>
                <button className="page-btn" style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnOff : {}) }}
                  onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  ← Prev
                </button>
                <div style={s.pageInfo}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{page}</span>
                  <span style={{ color: 'var(--text-lighter, #94a3b8)' }}> / {totalPages}</span>
                </div>
                <button className="page-btn" style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnOff : {}) }}
                  onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', system-ui, Arial, sans-serif" },

  /* Hero */
  hero: { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e1b4b 100%)", paddingBottom: 0 },
  heroInner: { maxWidth: 1100, margin: "0 auto", padding: "28px 28px 0" },
  backBtn: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 20, display: "inline-block" },
  heroContent: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  heroLeft: { display: "flex", alignItems: "center", gap: 18 },
  heroIcon: { width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" },
  heroTitle: { margin: 0, fontSize: 28, fontWeight: 800, color: "white", letterSpacing: "-0.5px" },
  heroSub: { margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 400 },
  heroBadge: { background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc", padding: "8px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, alignSelf: "flex-start" },

  /* Filter chips */
  summaryRow: { display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 24 },
  chip: { display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.2px" },
  chipDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  chipCount: { background: "rgba(255,255,255,0.15)", padding: "1px 7px", borderRadius: 20, fontSize: 11 },

  /* Body */
  body: { maxWidth: 1100, margin: "0 auto", padding: "28px 28px 60px" },
  loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 0" },
  spinner: { width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  empty: { textAlign: "center", padding: "80px 20px" },
  emptyIcon: { display: "flex", justifyContent: "center", marginBottom: 16 },

  /* Table card */
  tableCard: { background: 'var(--bg-card, white)', borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden", border: '1px solid var(--border-light, #f1f5f9)' },
  tableHead: { display: "flex", alignItems: "center", padding: "12px 20px", background: 'var(--bg-light, #f8fafc)', borderBottom: "2px solid #f1f5f9" },
  col: { fontSize: 11, fontWeight: 800, color: 'var(--text-lighter, #94a3b8)', textTransform: "uppercase", letterSpacing: "0.8px", padding: "0 8px" },
  row: { display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f8fafc", transition: "background 0.15s", cursor: "default" },
  cell: { padding: "0 8px" },

  /* Time */
  dateMain: { fontSize: 13, fontWeight: 700, color: 'var(--text-main, #0f172a)' },
  dateSub: { fontSize: 11, color: 'var(--text-lighter, #94a3b8)', marginTop: 2, fontVariantNumeric: "tabular-nums" },

  /* User */
  userRow: { display: "flex", alignItems: "center", gap: 9 },
  avatar: { width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--text-main, #0f172a)', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  /* Role */
  rolePill: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" },
  roleAdmin: { background: "#ede9fe", color: "#7c3aed" },
  roleStaff: { background: "#dbeafe", color: "#2563eb" },

  /* Action */
  actionPill: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  actionIcon: { fontSize: 11, fontWeight: 900 },

  /* Pagination */
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 24 },
  pageBtn: { padding: "9px 22px", background: 'var(--bg-card, white)', color: 'var(--text-muted, #475569)', border: '1.5px solid var(--border-color, #e2e8f0)', borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.15s" },
  pageBtnOff: { opacity: 0.35, cursor: "not-allowed", pointerEvents: "none" },
  pageInfo: { fontSize: 14, minWidth: 70, textAlign: "center" },
};
