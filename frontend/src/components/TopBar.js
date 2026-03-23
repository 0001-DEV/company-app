import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Shared top bar for standalone pages (no sidebar).
 * Props:
 *   title      – page title string
 *   subtitle   – optional subtitle / breadcrumb
 *   backPath   – where the ← back button goes (default '/home')
 *   backLabel  – label for back button (default '← Dashboard')
 *   actions    – optional array of { label, onClick, style } extra buttons
 */
const TopBar = ({ title, subtitle, backPath = '/home', backLabel = '← Dashboard', actions = [], dark = false }) => {
  const navigate = useNavigate();

  return (
    <>
      <div style={s.spacer} />
      <div style={{ 
        ...s.bar, 
        background: dark ? '#0f172a' : 'var(--bg-card, white)',
        borderBottom: dark ? '1px solid #1e293b' : '1px solid var(--border-light, #f1f5f9)'
      }}>
        <div style={s.left}>
          <button style={{
            ...s.backBtn,
            background: dark ? '#1e293b' : '#f1f5f9',
            color: dark ? '#f8fafc' : 'var(--text-muted, #475569)'
          }} className="topbar-back-btn" onClick={() => navigate(backPath)}>{backLabel}</button>
          <div style={{ ...s.divider, background: dark ? '#1e293b' : '#e2e8f0' }} />
          <div>
            <div style={{ ...s.title, color: dark ? '#f8fafc' : 'var(--text-main, #0f172a)' }} className="topbar-title">{title}</div>
            {subtitle && <div style={{ ...s.sub, color: dark ? '#94a3b8' : 'var(--text-lighter, #94a3b8)' }}>{subtitle}</div>}
          </div>
        </div>
        <div style={s.right} className="topbar-actions">
          {actions.map((a, i) => (
            <button key={i} onClick={a.onClick} className="topbar-action-btn" style={{ ...s.actionBtn, ...a.style }}>{a.label}</button>
          ))}
          <div style={s.avatar}>👤</div>
        </div>
      </div>
    </>
  );
};

const s = {
  spacer: { height: 62, flexShrink: 0 },
  bar: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
    height: 'auto', minHeight: 62, 
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 20px', flexWrap: 'wrap', gap: 8,
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    boxSizing: 'border-box',
  },
  left: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, minWidth: 0 },
  backBtn: {
    padding: '7px 14px', background: '#f1f5f9', color: 'var(--text-muted, #475569)',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
    transition: 'background 0.15s', flexShrink: 0,
  },
  divider: { width: 1, height: 28, background: '#e2e8f0', flexShrink: 0 },
  title: { fontSize: 15, fontWeight: 700, color: 'var(--text-main, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40vw' },
  sub: { fontSize: 11, color: 'var(--text-lighter, #94a3b8)', marginTop: 1 },
  right: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    padding: '7px 14px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
  },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, cursor: 'pointer', flexShrink: 0,
  },
};

export default TopBar;
