import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";

export default function DailyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ workedOn: "", challenges: "", nextSteps: "", reportType: "daily" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const token = () => localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/chat/me", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : null).then(u => setCurrentUser(u));
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/extras/reports", {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) setReports(await res.json());
    } catch (_) {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.workedOn.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/extras/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ workedOn: "", challenges: "", nextSteps: "", reportType: "daily" });
        setShowForm(false);
        showToast("Report submitted!", "success");
        fetchReports();
      }
    } catch (_) {}
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    await fetch(`http://localhost:5000/api/extras/reports/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token()}` }
    });
    setReports(prev => prev.filter(r => r._id !== id));
    showToast("Deleted.", "success");
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isAdmin = currentUser?.role === "admin";
  const backPath = isAdmin ? "/home" : "/staff-dashboard";

  return (
    <div style={s.page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } } .rep-card { animation: fadeUp 0.3s ease both; }`}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, background: toast.type === "success" ? "#10b981" : "#ef4444", color: "white", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <TopBar title="📝 Daily Reports" subtitle="Work progress submissions" backPath={backPath} />

      <div style={s.body}>
        <div style={s.headerRow}>
          <div style={s.pageTitle}>
            {isAdmin ? "All Staff Reports" : "My Reports"}
          </div>
          {!isAdmin && (
            <button style={s.newBtn} onClick={() => setShowForm(v => !v)}>
              {showForm ? "✕ Cancel" : "+ Submit Report"}
            </button>
          )}
        </div>

        {/* Submit form (staff only) */}
        {!isAdmin && showForm && (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formTitle}>📝 Submit Work Report</div>
            <div style={s.typeRow}>
              {["daily", "weekly"].map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, reportType: t }))}
                  style={{ ...s.typeBtn, background: form.reportType === t ? "#eff6ff" : "white", border: `2px solid ${form.reportType === t ? "#3b82f6" : "#e5e7eb"}`, color: form.reportType === t ? "#2563eb" : "#64748b" }}>
                  {t === "daily" ? "📅 Daily" : "📆 Weekly"}
                </button>
              ))}
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>What did you work on? *</label>
              <textarea placeholder="Describe your tasks and progress..." value={form.workedOn}
                onChange={e => setForm(f => ({ ...f, workedOn: e.target.value }))} style={s.textarea} required />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Challenges faced</label>
              <textarea placeholder="Any blockers or difficulties?" value={form.challenges}
                onChange={e => setForm(f => ({ ...f, challenges: e.target.value }))} style={{ ...s.textarea, minHeight: 70 }} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Next steps</label>
              <textarea placeholder="What's planned for next?" value={form.nextSteps}
                onChange={e => setForm(f => ({ ...f, nextSteps: e.target.value }))} style={{ ...s.textarea, minHeight: 70 }} />
            </div>
            <button type="submit" disabled={submitting} style={s.submitBtn}>
              {submitting ? "Submitting..." : "📤 Submit Report"}
            </button>
          </form>
        )}

        {loading ? (
          <div style={s.loading}><div style={s.spinner} /> Loading...</div>
        ) : reports.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main, #0f172a)', marginBottom: 6 }}>No reports yet</div>
            {!isAdmin && <div style={{ color: 'var(--text-muted, #64748b)' }}>Submit your first report above.</div>}
          </div>
        ) : (
          <div style={s.list}>
            {reports.map((rep, idx) => (
              <div key={rep._id} className="rep-card" style={{ ...s.card, animationDelay: `${idx * 0.04}s` }}>
                <div style={s.cardHeader}>
                  <div style={s.cardLeft}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={s.cardName}>{rep.staffName}</span>
                      {rep.departmentName && <span style={s.deptTag}>{rep.departmentName}</span>}
                      <span style={{ ...s.typeTag, background: rep.reportType === "weekly" ? "#ede9fe" : "#dbeafe", color: rep.reportType === "weekly" ? "#7c3aed" : "#2563eb" }}>
                        {rep.reportType === "weekly" ? "📆 Weekly" : "📅 Daily"}
                      </span>
                    </div>
                    <div style={s.cardDate}>
                      {new Date(rep.createdAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(rep._id)} style={s.deleteBtn}>🗑️</button>
                  )}
                </div>
                <div style={s.cardBody}>
                  <div style={s.section}>
                    <div style={s.sectionLabel}>✅ Worked on</div>
                    <div style={s.sectionText}>{rep.workedOn}</div>
                  </div>
                  {rep.challenges && (
                    <div style={s.section}>
                      <div style={s.sectionLabel}>⚠️ Challenges</div>
                      <div style={s.sectionText}>{rep.challenges}</div>
                    </div>
                  )}
                  {rep.nextSteps && (
                    <div style={s.section}>
                      <div style={s.sectionLabel}>🔜 Next steps</div>
                      <div style={s.sectionText}>{rep.nextSteps}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  body: { maxWidth: 820, margin: "0 auto", padding: "28px 20px 60px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  pageTitle: { fontSize: 24, fontWeight: 800, color: 'var(--text-main, #0f172a)' },
  newBtn: { padding: "10px 20px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" },
  form: { background: 'var(--bg-card, white)', borderRadius: 16, padding: "24px", marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 16 },
  formTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-main, #0f172a)' },
  typeRow: { display: "flex", gap: 10 },
  typeBtn: { padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 700, color: "#374151" },
  textarea: { padding: "11px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 13, outline: "none", minHeight: 90, resize: "vertical", fontFamily: "inherit" },
  submitBtn: { padding: "12px", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.35)" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "60px", color: 'var(--text-muted, #64748b)', fontSize: 15 },
  spinner: { width: 24, height: 24, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty: { textAlign: "center", padding: "60px 20px", color: 'var(--text-lighter, #94a3b8)' },
  list: { display: "flex", flexDirection: "column", gap: 14 },
  card: { background: 'var(--bg-card, white)', borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", borderLeft: "4px solid #6366f1" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px 12px", borderBottom: '1px solid var(--border-light, #f1f5f9)' },
  cardLeft: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 15, fontWeight: 700, color: 'var(--text-main, #0f172a)' },
  deptTag: { padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f1f5f9", color: 'var(--text-muted, #475569)' },
  typeTag: { padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  cardDate: { fontSize: 12, color: 'var(--text-lighter, #94a3b8)', marginTop: 4 },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ef4444", padding: "4px 6px", borderRadius: 6, flexShrink: 0 },
  cardBody: { padding: "14px 20px 18px", display: "flex", flexDirection: "column", gap: 12 },
  section: { display: "flex", flexDirection: "column", gap: 4 },
  sectionLabel: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: "uppercase", letterSpacing: "0.4px" },
  sectionText: { fontSize: 13, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" },
};
