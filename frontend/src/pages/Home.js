import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import BirthdayNotification from "../components/BirthdayNotification";
import logo from "../assets/cards/CR8.png";
import card0 from "../assets/cards/CARD 0.jpeg";
import card1 from "../assets/cards/CARD 1.jpeg";
import card2 from "../assets/cards/CARD 2.jpeg";
import card3 from "../assets/cards/CARD 3.jpeg";

function Home() {
  const navigate = useNavigate();
  const { user: admin, logout, getAuthHeader } = useAuth();
  const [search, setSearch] = React.useState("");
  const [hasUnreadMessages, setHasUnreadMessages] = React.useState(false);
  const [activeNav, setActiveNav] = React.useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const lastMessageIds = React.useRef(new Set());

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [stats, setStats] = React.useState([
    { label: "Total Staff",    value: "—", icon: "👥", color: "#3b82f6", path: "/all-staff" },
    { label: "Departments",    value: "—", icon: "🏢", color: "#8b5cf6", path: "/department" },
    { label: "Files Uploaded", value: "—", icon: "📁", color: "#10b981", path: "/uploaded-works" },
    { label: "Active Stocks",  value: "—", icon: "📦", color: "#f59e0b", path: "/stock-management" },
  ]);

  // Analytics state
  const [analyticsData, setAnalyticsData] = React.useState({
    staffPerDept: [],       // [{ name, count }]
    filesPerDay: [],        // [{ day, count }] last 7 days
    staffWithFiles: 0,
    staffWithoutFiles: 0,
    totalComments: 0,
  });
  const [analyticsTab, setAnalyticsTab] = React.useState('departments');

  React.useEffect(() => {
    const checkUnreadMessages = async () => {
      try {
        const authHeaders = getAuthHeader();
        if (!authHeaders.Authorization) return;

        const response = await fetch('/api/chat/unread-counts', {
          headers: authHeaders
        });
        if (response.ok) {
          const data = await response.json();
          setHasUnreadMessages(Object.keys(data).length > 0);
        }

        // Also poll latest messages to track new ones
        const msgsRes = await fetch('/api/chat/latest-messages', {
          headers: authHeaders
        });
        if (msgsRes.ok) {
          const messages = await msgsRes.json();
          messages.forEach(msg => {
            lastMessageIds.current.add(msg._id);
          });
        }
      } catch (err) {}
    };
    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 5000);
    return () => clearInterval(interval);
  }, [getAuthHeader]);

  // Fetch real stats
  React.useEffect(() => {
    const fetchStats = async () => {
      const authHeaders = getAuthHeader();
      if (!authHeaders.Authorization) return;
      try {
        const [staffRes, deptRes, filesRes] = await Promise.all([
          fetch('/api/admin/all-staff', { headers: authHeaders }),
          fetch('/api/admin/departments', { headers: authHeaders }),
          fetch('/api/admin/all-uploaded-files', { headers: authHeaders }),
        ]);

        const staffData  = staffRes.ok  ? await staffRes.json()  : [];
        const deptData   = deptRes.ok   ? await deptRes.json()   : [];
        const filesData  = filesRes.ok  ? await filesRes.json()  : [];

        // Fetch stocks for count
        const stockRes = await fetch('/api/stock/all', { headers: authHeaders });
        const stockData = stockRes.ok ? await stockRes.json() : [];

        setStats([
          { label: "Total Staff",    value: staffData.length,  icon: "👥", color: "#3b82f6", path: "/all-staff" },
          { label: "Departments",    value: deptData.length,   icon: "🏢", color: "#8b5cf6", path: "/department" },
          { label: "Files Uploaded", value: filesData.length,  icon: "📁", color: "#10b981", path: "/uploaded-works" },
          { label: "Active Stocks",  value: stockData.length,  icon: "📦", color: "#f59e0b", path: "/stock-management" },
        ]);

        // ── Build analytics ──
        // Staff per department
        const deptMap = {};
        deptData.forEach(d => { deptMap[d._id] = { name: d.name, count: 0 }; });
        staffData.forEach(s => {
          const dId = s.department?._id || s.department;
          if (dId && deptMap[dId]) deptMap[dId].count++;
        });
        const staffPerDept = Object.values(deptMap)
          .filter(d => d.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        // Files uploaded per day (last 7 days)
        const now = new Date();
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now);
          d.setDate(d.getDate() - (6 - i));
          return { date: d, label: d.toLocaleDateString('en-GB', { weekday: 'short' }), count: 0 };
        });
        filesData.forEach(f => {
          const uploaded = new Date(f.uploadedAt);
          days.forEach(day => {
            if (
              uploaded.getDate() === day.date.getDate() &&
              uploaded.getMonth() === day.date.getMonth() &&
              uploaded.getFullYear() === day.date.getFullYear()
            ) day.count++;
          });
        });

        // Staff activity
        const staffWithFiles = staffData.filter(s => s.uploadedFiles?.length > 0).length;
        const totalComments = filesData.filter(f => f.comment).length;

        setAnalyticsData({
          staffPerDept,
          filesPerDay: days.map(d => ({ day: d.label, count: d.count })),
          staffWithFiles,
          staffWithoutFiles: staffData.length - staffWithFiles,
          totalComments,
        });

      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, [getAuthHeader]);

  const navItems = [
    { id: "staff",         icon: "🆔", label: "Staff IDs",              path: "/all-staff" },
    { id: "dept",          icon: "🏢", label: "Departments",            path: "/department" },
    { id: "mapping",       icon: "🗺️", label: "Mapping",                path: "/mapping" },
    { id: "client-docs",   icon: "📄", label: "Client Documentation",   path: "/client-documentation" },
    { id: "works",         icon: "📤", label: "Work Bank",              path: "/uploaded-works" },
    { id: "stock",         icon: "📦", label: "Stock Management",       path: "/stock-management" },
    { id: "cards",         icon: "🎴", label: "Our Portfolio",          path: "/card-samples" },
    { id: "creds",         icon: "🔒", label: "Staff Credentials",      path: "/staff-credentials" },
    { id: "announcements", icon: "📢", label: "Announcements",          path: "/announcements" },
    { id: "directory",     icon: "👥", label: "Employee Directory",     path: "/employee-directory" },
    { id: "admin-weekly",  icon: "📊", label: "Weekly Reports",         path: "/admin/weekly-reports" },
    { id: "recycle",       icon: "🗑️", label: "Recycle Bin",            path: "/recycle-bin" },
  ];

  const cards = [
    { name: "NFC Smart Cards — tap to share contact, social profiles & links instantly.", image: card2, tag: "NFC" },
    { name: "Luxurious Business Cards — premium finish that leaves a lasting impression.", image: card1, tag: "Business" },
    { name: "Staff ID Cards — QR-coded identity cards for secure access & verification.", image: card0, tag: "ID Card" },
    { name: "Maintenance Cards — durable cards built to endure the test of time.", image: card3, tag: "Maintenance" }
  ];

  const infoCards = [
    {
      icon: "🏆",
      title: "Nearly a Decade of Excellence",
      shortText: "Pioneers of luxury cards in Nigeria...",
      fullText: "As the first card-making outfit to introduce Luxurious Business Cards into the Nigerian business space, we bring almost a decade of experience in strategy, innovation, and design — consistently setting the standard others follow."
    },
    {
      icon: "📲",
      title: "NFC & QR Smart Cards",
      shortText: "Tap or scan to connect...",
      fullText: "Nigeria's first luxury NFC business card maker. Each card is embedded with NFC technology and a unique QR code — tap or scan to instantly share contact info, social profiles, and business links."
    },
    {
      icon: "🪪",
      title: "Premium ID Card Production",
      shortText: "Professional identity cards...",
      fullText: "We design and print high-quality staff ID cards with QR codes for secure identity verification, access control, and professional representation across departments."
    },
    {
      icon: "🎨",
      title: "Custom Branding & Design",
      shortText: "Designs that match your brand...",
      fullText: "With nearly a decade of experience, our design team creates cards that match your brand identity — from color schemes and logos to finishes that make a bold, lasting impression."
    },
    {
      icon: "🔐",
      title: "Secure Access Management",
      shortText: "Control who goes where...",
      fullText: "Each staff card is tied to a digital profile with role-based access. Admins control department permissions, file access, and identity verification from one central dashboard."
    },
    {
      icon: "🚀",
      title: "Fast Turnaround & Delivery",
      shortText: "Quick production & delivery...",
      fullText: "From mapping to printing, our streamlined production process ensures your cards are designed, QR-coded, and delivered with speed — without compromising on quality."
    }
  ];

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      navigate("/");
    }
  };

  return (
    <div style={styles.container}>
      <BirthdayNotification userRole="admin" />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 150 }} />
      )}

      {/* ── Sidebar ── */}
      <aside className="ignore-dark" style={{
        ...styles.sidebar,
        ...(isMobile ? {
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 200,
        } : {})
      }}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <img src={logo} alt="CR8" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={styles.brandName}>Xtreme Cr8tivity</div>
            <div style={styles.brandSub}>Admin Portal</div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-lighter, #94a3b8)', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
          )}
        </div>

        <div style={styles.divider} />

        {/* Nav */}
        <nav style={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navBtn,
                ...(activeNav === item.id ? styles.navBtnActive : {})
              }}
              onClick={() => { setActiveNav(item.id); navigate(item.path); }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {item.badge && <span style={styles.badge} />}
              {activeNav === item.id && <span style={styles.activeBar} />}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {admin?.profilePicture ? (
              <img src={admin.profilePicture} alt="Admin" style={{ ...styles.footerAvatar, objectFit: 'cover' }} />
            ) : (
              <div style={styles.footerAvatar}>👤</div>
            )}
            <div>
              <div style={styles.footerName}>{admin?.name || 'Administrator'}</div>
              <div style={styles.footerRole}>Super Admin</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="admin-logout-btn"
            title="Log Out"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ ...styles.main, marginLeft: isMobile ? 0 : '240px' }}>

        {/* Topbar */}
        <div style={{ ...styles.topbar, left: isMobile ? 0 : '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--text-main, #0f172a)', padding: '4px 8px', borderRadius: '8px', lineHeight: 1, flexShrink: 0 }}
              >☰</button>
            )}
            <div>
              <div style={styles.pageTitle}>Admin Dashboard</div>
              <div style={styles.pageCrumb}>Home / Dashboard</div>
            </div>
          </div>

          <div style={styles.topbarRight}>
            {admin?.profilePicture ? (
              <img src={admin.profilePicture} alt="Admin" style={{ ...styles.topbarAvatar, objectFit: 'cover' }} />
            ) : (
              <div style={styles.topbarAvatar}>👤</div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={styles.content} className="app-content-pad">

          {/* Stats Row */}
          <div style={styles.statsRow} className="stats-grid-4">
            {stats.map((s, i) => (
              <div
                key={i}
                style={{ ...styles.statCard, borderTop: `4px solid ${s.color}`, cursor: 'pointer' }}
                onClick={() => navigate(s.path)}
                title={`Go to ${s.label}`}
              >
                <div style={{ ...styles.statIcon, background: s.color + "20", color: s.color }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
                {s.label === "Active Chats" && hasUnreadMessages && (
                  <span style={styles.statGreenDot} title="New messages!" />
                )}
              </div>
            ))}
          </div>

          {/* Hero Banner */}
          <div style={{ ...styles.heroBanner, gridColumn: '1 / -1' }} className="ignore-dark">
            <div style={styles.heroText}>
              <h2 style={styles.heroTitle}>Simplifying identity and access,<br />one ID at a time!</h2>
              <p style={styles.heroSub}>
                Identifine is a platform that simplifies identity verification and access management,
                helping organizations securely manage staff IDs and credentials.
              </p>
            </div>
            <div style={styles.heroDecor}>🪪</div>
          </div>

          {/* Analytics Overview */}
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📊 Analytics Overview</h3>
            <span style={styles.sectionLine} />
          </div>
          <div style={styles.chartBox}>
            {/* Tab switcher */}
            <div style={styles.chartTabs}>
              {[
                { id: 'departments', label: '🏢 Staff by Dept' },
                { id: 'uploads',     label: '📁 Uploads (7 days)' },
                { id: 'activity',    label: '📈 Activity' },
              ].map(tab => (
                <button key={tab.id}
                  style={{ ...styles.chartTab, ...(analyticsTab === tab.id ? styles.chartTabActive : {}) }}
                  onClick={() => setAnalyticsTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Staff per Department bar chart */}
            {analyticsTab === 'departments' && (
              <div style={styles.chartArea}>
                {analyticsData.staffPerDept.length === 0 ? (
                  <div style={styles.chartEmpty}>No department data yet</div>
                ) : (
                  <>
                    <div style={styles.barChart}>
                      {analyticsData.staffPerDept.map((d, i) => {
                        const max = Math.max(...analyticsData.staffPerDept.map(x => x.count), 1);
                        const pct = (d.count / max) * 100;
                        const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316'];
                        return (
                          <div key={i} style={styles.barGroup}>
                            <div style={styles.barCountLabel}>{d.count}</div>
                            <div style={styles.barTrack}>
                              <div style={{ ...styles.barFill, height: `${pct}%`, background: colors[i % colors.length] }} />
                            </div>
                            <div style={styles.barLabel} title={d.name}>
                              {d.name.length > 10 ? d.name.substring(0, 10) + '…' : d.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={styles.chartLegend}>
                      {analyticsData.staffPerDept.map((d, i) => {
                        const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316'];
                        return (
                          <div key={i} style={styles.legendItem}>
                            <div style={{ ...styles.legendDot, background: colors[i % colors.length] }} />
                            <span style={styles.legendText}>{d.name} ({d.count})</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Files per day */}
            {analyticsTab === 'uploads' && (
              <div style={styles.chartArea}>
                <div style={styles.barChart}>
                  {analyticsData.filesPerDay.map((d, i) => {
                    const max = Math.max(...analyticsData.filesPerDay.map(x => x.count), 1);
                    const pct = (d.count / max) * 100;
                    const isToday = i === 6;
                    return (
                      <div key={i} style={styles.barGroup}>
                        <div style={styles.barCountLabel}>{d.count}</div>
                        <div style={styles.barTrack}>
                          <div style={{
                            ...styles.barFill,
                            height: `${Math.max(pct, d.count > 0 ? 4 : 0)}%`,
                            background: isToday
                              ? 'linear-gradient(180deg,#10b981,#059669)'
                              : 'linear-gradient(180deg,#3b82f6,#6366f1)'
                          }} />
                        </div>
                        <div style={{ ...styles.barLabel, fontWeight: isToday ? 700 : 400, color: isToday ? '#10b981' : '#64748b' }}>
                          {d.day}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lighter, #94a3b8)', marginTop: 8 }}>
                  Total this week: <strong style={{ color: 'var(--text-main, #0f172a)' }}>{analyticsData.filesPerDay.reduce((a, d) => a + d.count, 0)}</strong> files uploaded
                </div>
              </div>
            )}

            {/* Activity breakdown */}
            {analyticsTab === 'activity' && (
              <div style={styles.activityGrid} className="activity-grid">
                {[
                  { label: 'Staff Active (uploaded files)', value: analyticsData.staffWithFiles, color: '#10b981', icon: '✅', total: analyticsData.staffWithFiles + analyticsData.staffWithoutFiles },
                  { label: 'Staff Not Yet Active', value: analyticsData.staffWithoutFiles, color: '#f59e0b', icon: '⏳', total: analyticsData.staffWithFiles + analyticsData.staffWithoutFiles },
                  { label: 'Files with Comments', value: analyticsData.totalComments, color: '#3b82f6', icon: '💬', total: null },
                  { label: 'Departments with Staff', value: analyticsData.staffPerDept.length, color: '#8b5cf6', icon: '🏢', total: null },
                ].map((item, i) => (
                  <div key={i} style={{ ...styles.activityCard, borderLeft: `4px solid ${item.color}` }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', marginTop: 4 }}>{item.label}</div>
                    {item.total > 0 && (
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${Math.round((item.value / item.total) * 100)}%`, background: item.color }} />
                      </div>
                    )}
                    {item.total > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-lighter, #94a3b8)', marginTop: 4 }}>
                        {Math.round((item.value / item.total) * 100)}% of total staff
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Our Portfolio */}
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Our Portfolio</h3>
            <span style={styles.sectionLine} />
          </div>
          <div style={styles.cardGrid} className="card-grid-4">
            {cards
              .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
              .map((card, i) => (
                <div key={i} className="image-hover-card" style={styles.imageCard}>
                  <img src={card.image} alt={card.name} className="card-image" />
                  <div style={styles.cardTag}>{card.tag}</div>
                  <div className="card-overlay-text">{card.name}</div>
                </div>
              ))}
          </div>

          {/* What Makes Us Different */}
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>What Makes Us Different</h3>
            <span style={styles.sectionLine} />
          </div>
          <div style={styles.infoGrid} className="info-grid-3">
            {infoCards.map((card, i) => (
              <div key={i} style={styles.infoCard} className="hover-card">
                <div style={styles.infoCardIcon}>{card.icon}</div>
                <h4 style={styles.infoCardTitle}>{card.title}</h4>
                <p className="card-text" style={styles.infoCardText}>{card.shortText}</p>
                <p className="card-full-text" style={styles.infoCardFull}>{card.fullText}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}

/* ─────────────── STYLES ─────────────── */
const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', Arial, sans-serif", background: 'var(--bg-main, #f0f4f8)' },

  /* Sidebar */
  sidebar: { 
    width: "240px", 
    background: "rgba(15, 23, 42, 0.95)", 
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "white", 
    display: "flex", 
    flexDirection: "column", 
    padding: "0", 
    boxShadow: "4px 0 30px rgba(0,0,0,0.4)", 
    flexShrink: 0, 
    position: "fixed", 
    top: 0, 
    left: 0, 
    bottom: 0, 
    zIndex: 100, 
    overflowY: "auto",
    borderRight: "1px solid rgba(255,255,255,0.1)"
  },
  brand: { display: "flex", alignItems: "center", gap: "12px", padding: "24px 20px 20px" },
  brandIcon: { width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "20px", flexShrink: 0 },
  brandName: { fontSize: "14px", fontWeight: "700", color: "white", letterSpacing: "0.3px" },
  brandSub: { fontSize: "11px", color: 'var(--text-lighter, #94a3b8)', marginTop: "2px" },
  divider: { height: "1px", background: "rgba(255,255,255,0.08)", margin: "0 20px 16px" },
  nav: { display: "flex", flexDirection: "column", gap: "4px", padding: "0 12px", flex: 1 },
  navBtn: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "10px", border: "none", background: "transparent", color: 'var(--text-lighter, #94a3b8)', cursor: "pointer", fontSize: "13px", fontWeight: "500", transition: "all 0.2s", position: "relative", textAlign: "left" },
  navBtnActive: { background: "rgba(59,130,246,0.15)", color: "white" },
  navIcon: { fontSize: "16px", width: "20px", textAlign: "center", flexShrink: 0 },
  navLabel: { flex: 1 },
  badge: { width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse 2s infinite" },
  activeBar: { position: "absolute", right: 0, top: "20%", height: "60%", width: "3px", borderRadius: "3px 0 0 3px", background: "#3b82f6" },
  sidebarFooter: { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "auto" },
  footerAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 },
  footerName: { fontSize: "13px", fontWeight: "600", color: "white" },
  footerRole: { fontSize: "11px", color: 'var(--text-muted, #64748b)' },

  /* Main */
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", marginLeft: "240px" },

  /* Topbar */
  topbar: { 
    height: "70px", 
    background: 'var(--bg-card, rgba(255, 255, 255, 0.95))', 
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "0 28px", 
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.07)", 
    flexShrink: 0, 
    position: "fixed", 
    top: 0, 
    left: "240px", 
    right: 0, 
    zIndex: 99,
    borderBottom: "1px solid var(--border-color, rgba(255, 255, 255, 0.18))"
  },
  topbarLeft: {},
  pageTitle: { fontSize: "18px", fontWeight: "700", color: 'var(--text-main, #0f172a)' },
  pageCrumb: { fontSize: "12px", color: 'var(--text-lighter, #94a3b8)', marginTop: "2px" },
  topbarRight: { display: "flex", alignItems: "center", gap: "16px" },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "12px", fontSize: "14px", zIndex: 1 },
  search: { padding: "9px 36px 9px 36px", borderRadius: "50px", border: '1.5px solid var(--border-color, #e2e8f0)', fontSize: "13px", outline: "none", width: "220px", background: 'var(--bg-light, #f8fafc)', transition: "all 0.3s" },
  clearSearch: { position: "absolute", right: "10px", background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" },
  topbarAvatar: { width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", cursor: "pointer" },

  /* Content */
  content: { flex: 1, overflowY: "auto", padding: "24px 28px", marginTop: "70px" },

  /* Stats */
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: 'var(--bg-card, white)', borderRadius: "14px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s" },
  statIcon: { width: "46px", height: "46px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 },
  statValue: { fontSize: "24px", fontWeight: "800", color: 'var(--text-main, #0f172a)' },
  statLabel: { fontSize: "12px", color: 'var(--text-muted, #64748b)', fontWeight: "500", marginTop: "2px" },
  statGreenDot: { width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse 2s infinite", flexShrink: 0 },

  /* Hero */
  heroBanner: { background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #8b5cf6 100%)", borderRadius: "18px", padding: "32px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 8px 30px rgba(59,130,246,0.35)", marginBottom: "28px" },
  heroText: {},
  heroTitle: { margin: "0 0 12px 0", fontSize: "22px", fontWeight: "800", color: "white", lineHeight: "1.4" },
  heroSub: { margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.85)", maxWidth: "520px", lineHeight: "1.7" },
  heroDecor: { fontSize: "80px", opacity: 0.3 },

  /* Section headers */
  sectionHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" },
  sectionTitle: { margin: 0, fontSize: "16px", fontWeight: "700", color: 'var(--text-main, #0f172a)', whiteSpace: "nowrap" },
  sectionLine: { flex: 1, height: "1px", background: "linear-gradient(90deg, #e2e8f0, transparent)" },

  /* Card grid */
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" },
  imageCard: { borderRadius: "14px", overflow: "hidden", height: "180px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", position: "relative" },
  cardTag: { position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.55)", color: "white", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", backdropFilter: "blur(4px)", zIndex: 2 },

  /* Info cards */
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" },
  infoCard: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: "24px", borderRadius: "16px", boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)", cursor: "pointer", transition: "all 0.3s", border: '1px solid rgba(255, 255, 255, 0.2)' },
  infoCardIcon: { fontSize: "32px", marginBottom: "12px" },
  infoCardTitle: { margin: "0 0 8px 0", fontSize: "15px", fontWeight: "700", color: 'var(--text-main, #0f172a)' },
  infoCardText: { margin: 0, fontSize: "13px", color: 'var(--text-muted, #64748b)', lineHeight: "1.6" },
  infoCardFull: { margin: 0, fontSize: "13px", color: 'var(--text-muted, #475569)', lineHeight: "1.7" },

  /* Chart / Analytics */
  chartBox: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: "16px", padding: "20px 24px", boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)", border: '1px solid rgba(255, 255, 255, 0.2)', marginBottom: "32px" },
  chartTabs: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  chartTab: { padding: "7px 16px", borderRadius: "50px", border: '1.5px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', color: 'var(--text-muted, #64748b)', cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" },
  chartTabActive: { background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "white", border: "1.5px solid transparent", boxShadow: "0 4px 12px rgba(59,130,246,0.35)" },
  chartArea: { minHeight: "180px" },
  chartEmpty: { textAlign: "center", color: 'var(--text-lighter, #94a3b8)', padding: "40px", fontSize: "14px" },

  barChart: { display: "flex", alignItems: "flex-end", gap: "10px", height: "160px", padding: "0 4px" },
  barGroup: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" },
  barCountLabel: { fontSize: "11px", fontWeight: "700", color: 'var(--text-main, #0f172a)', minHeight: "16px" },
  barTrack: { flex: 1, width: "100%", background: "rgba(255, 255, 255, 0.1)", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "flex-end", overflow: "hidden", backdropFilter: 'blur(4px)' },
  barFill: { width: "100%", borderRadius: "6px 6px 0 0", transition: "height 0.6s ease", minHeight: "2px" },
  barLabel: { fontSize: "10px", color: 'var(--text-muted, #64748b)', textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  chartLegend: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" },
  legendItem: { display: "flex", alignItems: "center", gap: "6px" },
  legendDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  legendText: { fontSize: "12px", color: 'var(--text-muted, #475569)' },

  activityGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" },
  activityCard: { background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', borderRadius: "12px", padding: "18px 16px", textAlign: "center", border: '1px solid rgba(255, 255, 255, 0.1)' },
  progressBar: { height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", marginTop: "10px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "3px", transition: "width 0.6s ease" },
};

export default Home;
