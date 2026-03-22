import React, { useState, useEffect } from "react";

export default function PollWidget({ departmentId, currentUser, isGroupAdmin }) {
  const [polls, setPolls] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem("token");
  const canCreate = currentUser?.role === "admin" || isGroupAdmin;

  useEffect(() => {
    if (!departmentId) return;
    fetchPolls();
    const iv = setInterval(fetchPolls, 10000);
    return () => clearInterval(iv);
  }, [departmentId]);

  const fetchPolls = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/features/polls?departmentId=${departmentId}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) setPolls(await res.json());
    } catch (_) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const validOpts = options.filter(o => o.trim());
    if (!question.trim() || validOpts.length < 2) return;
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/features/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ question, options: validOpts, departmentId, scope: "department" })
      });
      if (res.ok) {
        setQuestion(""); setOptions(["", ""]); setShowCreate(false);
        fetchPolls();
      }
    } catch (_) {}
    setSaving(false);
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      const res = await fetch(`http://localhost:5000/api/features/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ optionIndex })
      });
      if (res.ok) {
        const updated = await res.json();
        setPolls(prev => prev.map(p => p._id === pollId ? updated : p));
      }
    } catch (_) {}
  };

  const handleDelete = async (pollId) => {
    await fetch(`http://localhost:5000/api/features/polls/${pollId}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token()}` }
    });
    setPolls(prev => prev.filter(p => p._id !== pollId));
  };

  if (!departmentId) return null;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.headerTitle}>📊 Polls</span>
        {canCreate && (
          <button style={s.createBtn} onClick={() => setShowCreate(v => !v)}>
            {showCreate ? "✕" : "+ Poll"}
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={s.form}>
          <input placeholder="Ask a question..." value={question}
            onChange={e => setQuestion(e.target.value)} style={s.input} required />
          {options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <input placeholder={`Option ${i + 1}`} value={opt}
                onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                style={{ ...s.input, flex: 1 }} />
              {options.length > 2 && (
                <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  style={s.removeOptBtn}>✕</button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button type="button" onClick={() => setOptions([...options, ""])} style={s.addOptBtn}>+ Add option</button>
          )}
          <button type="submit" disabled={saving} style={s.submitBtn}>{saving ? "Creating..." : "📊 Create Poll"}</button>
        </form>
      )}

      {polls.length === 0 && !showCreate && (
        <div style={s.empty}>No polls yet{canCreate ? " — create one above" : ""}</div>
      )}

      {polls.map(poll => {
        const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
        const myVoteIdx = poll.options.findIndex(o => o.votes?.some(v => v === currentUser?.id || v?.toString() === currentUser?.id));
        return (
          <div key={poll._id} style={s.pollCard}>
            <div style={s.pollHeader}>
              <span style={s.pollQ}>{poll.question}</span>
              {currentUser?.role === "admin" && (
                <button onClick={() => handleDelete(poll._id)} style={s.delBtn}>🗑️</button>
              )}
            </div>
            <div style={s.optionsList}>
              {poll.options.map((opt, i) => {
                const pct = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0;
                const isMyVote = myVoteIdx === i;
                return (
                  <div key={i} style={s.optionWrap} onClick={() => handleVote(poll._id, i)}>
                    <div style={{ ...s.optionBar, width: `${pct}%`, background: isMyVote ? "#3b82f6" : "#e2e8f0" }} />
                    <div style={s.optionContent}>
                      <span style={{ ...s.optionText, fontWeight: isMyVote ? 700 : 500 }}>
                        {isMyVote ? "✓ " : ""}{opt.text}
                      </span>
                      <span style={s.optionPct}>{pct}% ({opt.votes?.length || 0})</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={s.pollMeta}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""} · by {poll.createdByName}</div>
          </div>
        );
      })}
    </div>
  );
}

const s = {
  wrap: { padding: "12px 0" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  headerTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-lighter, #94a3b8)', textTransform: "uppercase", letterSpacing: "0.5px" },
  createBtn: { padding: "4px 12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" },
  form: { background: "#0f172a", borderRadius: 12, padding: "14px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 },
  input: { padding: "8px 11px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  removeOptBtn: { padding: "8px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, flexShrink: 0 },
  addOptBtn: { padding: "6px 12px", background: "none", color: "#60a5fa", border: "1px dashed #334155", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600 },
  submitBtn: { padding: "9px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" },
  empty: { fontSize: 12, color: 'var(--text-muted, #475569)', textAlign: "center", padding: "12px 0" },
  pollCard: { background: "#0f172a", borderRadius: 12, padding: "14px", marginBottom: 10, border: "1px solid #1e293b" },
  pollHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  pollQ: { fontSize: 13, fontWeight: 700, color: "#f1f5f9", flex: 1, lineHeight: 1.4 },
  delBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#ef4444", padding: "0 0 0 8px", flexShrink: 0 },
  optionsList: { display: "flex", flexDirection: "column", gap: 6 },
  optionWrap: { position: "relative", borderRadius: 8, overflow: "hidden", background: "#1e293b", cursor: "pointer", minHeight: 34 },
  optionBar: { position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 8, transition: "width 0.4s ease", opacity: 0.35 },
  optionContent: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px" },
  optionText: { fontSize: 13, color: "#f1f5f9" },
  optionPct: { fontSize: 11, color: 'var(--text-lighter, #94a3b8)', flexShrink: 0, marginLeft: 8 },
  pollMeta: { fontSize: 11, color: 'var(--text-muted, #475569)', marginTop: 8 },
};
