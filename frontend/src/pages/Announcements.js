import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

const REACTIONS = ["👍", "❤️", "🔥", "👏", "😮", "🙏"];
const PRIORITY_META = {
  normal:    { label: "Normal",    color: "#3b82f6", bg: "#eff6ff", icon: "📢" },
  important: { label: "Important", color: "#f59e0b", bg: "#fffbeb", icon: "⚠️" },
  urgent:    { label: "Urgent",    color: "#ef4444", bg: "#fef2f2", icon: "🚨" },
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "normal" });
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [readersModal, setReadersModal] = useState(null); // { ann, data }
  const [readersLoading, setReadersLoading] = useState(false);
  const navigate = useNavigate();

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/chat/me", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : null).then(u => setCurrentUser(u));
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/features/announcements", { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setAnnouncements(await res.json());
    } catch (_) {}
    setLoading(false);
  };

  const markRead = async (id) => {
    await fetch(`/api/features/announcements/${id}/read`, {
      method: "POST", headers: { Authorization: `Bearer ${token()}` }
    });
    setAnnouncements(prev => prev.map(a => a._id === id && !a.readBy.includes(currentUser?.id)
      ? { ...a, readBy: [...a.readBy, currentUser?.id] } : a));
  };

  const handleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    markRead(id);
  };

  const handleReact = async (id, emoji) => {
    const res = await fetch(`/api/features/announcements/${id}/react`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ emoji })
    });
    if (res.ok) {
      const { reactions } = await res.json();
      setAnnouncements(prev => prev.map(a => a._id === id ? { ...a, reactions } : a));
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/features/announcements", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ title: "", body: "", priority: "normal" });
        setShowForm(false);
        showToast("Announcement posted!", "success");
        fetchAnnouncements();
      }
    } catch (_) {}
    setPosting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await fetch(`/api/features/announcements/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token()}` }
    });
    setAnnouncements(prev => prev.filter(a => a._id !== id));
    showToast("Deleted.", "success");
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewReaders = async (e, ann) => {
    e.stopPropagation();
    setReadersLoading(true);
    setReadersModal({ ann, data: null });
    try {
      const res = await fetch(`/api/extras/announcements/${ann._id}/readers`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReadersModal({ ann, data });
      }
    } catch (_) {}
    setReadersLoading(false);
  };

  const isAdmin = currentUser?.role === "admin";
  const unreadCount = announcements.filter(a => !a.readBy?.includes(currentUser?.id)).length;

  return (
    <div style={s.page}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .ann-card { animation: fadeUp 0.3s ease both; }
        .ann-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important; transform: translateY(-1px); transition: all 0.2s; }
        .react-btn:hover { transform: scale(1.2); }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, background: toast.type === "success" ? "#10b981" : "#ef4444", color: "white", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease" }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Readers modal */}
      {readersModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setReadersModal(null)}>
          <div style={{ background: 'var(--bg-card, white)', borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 20px", borderBottom: '1px solid var(--border-light, #f1f5f9)', display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main, #0f172a)' }}>👁 Read Receipts</div>
                <div style={{ fontSize: 12, color: 'var(--text-lighter, #94a3b8)', marginTop: 2 }}>{readersModal.ann.title}</div>
              </div>
              <button onClick={() => setReadersModal(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: 'var(--text-lighter, #94a3b8)' }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "12px 0" }}>
              {readersLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: 'var(--text-lighter, #94a3b8)' }}>Loading...</div>
              ) : readersModal.data ? (
                <>
                  <div style={{ padding: "6px 20px 10px", fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Read ({readersModal.data.readCount}/{readersModal.data.total})
                  </div>
                  {readersModal.data.readers.map(u => (
                    <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 20px" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-lighter, #94a3b8)' }}>{u.email}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✓ Read</span>
                    </div>
                  ))}
                  {readersModal.data.notRead.length > 0 && (
                    <>
                      <div style={{ padding: "10px 20px 6px", fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: "uppercase", letterSpacing: "0.5px", borderTop: "1px solid #f1f5f9", marginTop: 8 }}>
                        Not Read ({readersModal.data.notRead.length})
                      </div>
                      {readersModal.data.notRead.map(u => (
                        <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 20px" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-lighter, #94a3b8)' }}>{u.email}</div>
                          </div>
                          <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>✗ Unread</span>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <TopBar title="📢 Announcements" subtitle="Company-wide broadcasts" backPath={isAdmin ? "/home" : "/staff-dashboard"} />

      <div style={s.body}>
        {/* Header row */}
        <div style={s.headerRow}>
          <div>
            <div style={s.pageTitle}>Announcements</div>
            {unreadCount > 0 && <div style={s.unreadBadge}>{unreadCount} unread</div>}
          </div>
          {isAdmin && (
            <button style={s.postBtn} onClick={() => setShowForm(v => !v)}>
              {showForm ? "✕ Cancel" : "+ New Announcement"}
            </button>
          )}
        </div>

        {/* Post form */}
        {isAdmin && showForm && (
          <form onSubmit={handlePost} style={s.form}>
            <div style={s.formTitle}>📝 New Announcement</div>
            <input placeholder="Title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={s.input} required />
            <textarea placeholder="Write your announcement..." value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={s.textarea} required />
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <label style={s.label}>Priority:</label>
              {Object.entries(PRIORITY_META).map(([key, meta]) => (
                <button key={key} type="button"
                  onClick={() => setForm(f => ({ ...f, priority: key }))}
                  style={{ ...s.priorityBtn, background: form.priority === key ? meta.bg : "white", border: `2px solid ${form.priority === key ? meta.color : "#e5e7eb"}`, color: form.priority === key ? meta.color : "#64748b" }}>
                  {meta.icon} {meta.label}
                </button>
              ))}
              <button type="submit" disabled={posting} style={s.submitBtn}>
                {posting ? "Posting..." : "📢 Post"}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div style={s.loading}><div style={s.spinner} /> Loading...</div>
        ) : announcements.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-main, #0f172a)', marginBottom: 6 }}>No announcements yet</div>
            {isAdmin && <div style={{ color: 'var(--text-muted, #64748b)' }}>Post the first one above.</div>}
          </div>
        ) : (
          <div style={s.list}>
            {announcements.map((ann, idx) => {
              const meta = PRIORITY_META[ann.priority] || PRIORITY_META.normal;
              const isRead = ann.readBy?.includes(currentUser?.id);
              const isExpanded = expandedId === ann._id;
              const myReaction = ann.reactions?.find(r => r.userId === currentUser?.id || r.userId?.toString() === currentUser?.id);
              // Group reactions
              const reactionGroups = {};
              (ann.reactions || []).forEach(r => { reactionGroups[r.emoji] = (reactionGroups[r.emoji] || 0) + 1; });

              return (
                <div key={ann._id} className="ann-card" style={{ ...s.card, animationDelay: `${idx * 0.05}s`, borderLeft: `4px solid ${meta.color}`, opacity: isRead ? 0.92 : 1 }}>
                  {/* Card header */}
                  <div style={s.cardHeader} onClick={() => handleExpand(ann._id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{ ...s.priorityDot, background: meta.bg, color: meta.color }}>{meta.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={s.cardTitle}>{ann.title}</span>
                          {!isRead && <span style={s.unreadDot} />}
                          <span style={{ ...s.priorityTag, background: meta.bg, color: meta.color }}>{meta.label}</span>
                        </div>
                        <div style={s.cardMeta}>
                          <span>📣 {ann.createdByName || "Admin"}</span>
                          <span>·</span>
                          <span>{new Date(ann.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span>·</span>
                          {isAdmin ? (
                            <span style={{ cursor: "pointer", color: "#3b82f6", fontWeight: 600 }}
                              onClick={e => handleViewReaders(e, ann)}>
                              👁 {ann.readBy?.length || 0} read
                            </span>
                          ) : (
                            <span>👁 {ann.readBy?.length || 0} read</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isAdmin && (
                        <button onClick={e => { e.stopPropagation(); handleDelete(ann._id); }}
                          style={s.deleteBtn}>🗑️</button>
                      )}
                      <span style={{ color: 'var(--text-lighter, #94a3b8)', fontSize: 18, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</span>
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div style={s.cardBody}>
                      <p style={s.bodyText}>{ann.body}</p>
                      {/* Reactions */}
                      <div style={s.reactRow}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {REACTIONS.map(emoji => (
                            <button key={emoji} className="react-btn"
                              onClick={() => handleReact(ann._id, emoji)}
                              style={{ ...s.reactBtn, background: myReaction?.emoji === emoji ? "#eff6ff" : "#f8fafc", border: `1.5px solid ${myReaction?.emoji === emoji ? "#3b82f6" : "#e5e7eb"}` }}>
                              {emoji} {reactionGroups[emoji] ? <span style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', marginLeft: 2 }}>{reactionGroups[emoji]}</span> : null}
                            </button>
                          ))}
                        </div>
                        {Object.keys(reactionGroups).length > 0 && (
                          <div style={s.reactionSummary}>
                            {Object.entries(reactionGroups).map(([e, c]) => `${e} ${c}`).join("  ")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: 'var(--bg-main, #f0f4f8)', fontFamily: "'Segoe UI', Arial, sans-serif" },
  body: { maxWidth: 780, margin: "0 auto", padding: "28px 20px 60px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  pageTitle: { fontSize: 24, fontWeight: 800, color: 'var(--text-main, #0f172a)' },
  unreadBadge: { display: "inline-block", marginTop: 4, padding: "3px 10px", background: "#ef4444", color: "white", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  postBtn: { padding: "10px 20px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" },
  form: { background: 'var(--bg-card, white)', borderRadius: 16, padding: "24px", marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 14 },
  formTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-main, #0f172a)' },
  input: { padding: "11px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, outline: "none", fontFamily: "inherit" },
  textarea: { padding: "11px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, outline: "none", minHeight: 100, resize: "vertical", fontFamily: "inherit" },
  label: { fontSize: 13, fontWeight: 700, color: 'var(--text-muted, #64748b)' },
  priorityBtn: { padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },
  submitBtn: { marginLeft: "auto", padding: "10px 22px", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.35)" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "60px", color: 'var(--text-muted, #64748b)', fontSize: 15 },
  spinner: { width: 24, height: 24, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty: { textAlign: "center", padding: "60px 20px", color: 'var(--text-lighter, #94a3b8)' },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: 'var(--bg-card, white)', borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", overflow: "hidden", cursor: "pointer" },
  cardHeader: { display: "flex", alignItems: "center", gap: 12, padding: "16px 20px" },
  priorityDot: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text-main, #0f172a)' },
  unreadDot: { width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 },
  priorityTag: { padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  cardMeta: { display: "flex", gap: 6, fontSize: 12, color: 'var(--text-lighter, #94a3b8)', marginTop: 3, flexWrap: "wrap" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: "4px 6px", borderRadius: 6, color: "#ef4444" },
  cardBody: { padding: "0 20px 20px", borderTop: "1px solid #f1f5f9" },
  bodyText: { fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "14px 0 16px", whiteSpace: "pre-wrap" },
  reactRow: { display: "flex", flexDirection: "column", gap: 8 },
  reactBtn: { padding: "5px 10px", borderRadius: 20, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", transition: "transform 0.15s" },
  reactionSummary: { fontSize: 12, color: 'var(--text-muted, #64748b)', paddingLeft: 2 },
};
