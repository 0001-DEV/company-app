import React from "react";
import { useNavigate } from "react-router-dom";
import cod from "../assets/cards/cod.jpeg";
import cod0 from "../assets/cards/cod0.jpeg";
import cod1 from "../assets/cards/cod1.jpeg";
import card0 from "../assets/cards/CARD 0.jpeg";
import card1 from "../assets/cards/CARD 1.jpeg";
import card2 from "../assets/cards/CARD 2.jpeg";
import card3 from "../assets/cards/CARD 3.jpeg";
import cardmaint0 from "../assets/cards/CARD MAINT 0.jpeg";
import cardmaint1 from "../assets/cards/CARD MAINT 1.jpeg";
import cardmaint from "../assets/cards/CARD MAINT.jpeg";
import BirthdayNotification from "../components/BirthdayNotification";

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [hasUnreadMessages, setHasUnreadMessages] = React.useState(false);

  // Check for unread messages
  React.useEffect(() => {
    const checkUnreadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/chat/unread-counts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const hasUnread = Object.keys(data).length > 0;
          setHasUnreadMessages(hasUnread);
        }
      } catch (err) {
        console.error('Error checking unread messages:', err);
      }
    };

    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      name: "Networking will be more resilient, scalable, and vital for digital identity and access.",
      image: card2
    },
    {
      name: "Designed for use without digital connectivity or integration.",
      image: card1
    },
    {
      name: "Create a strong impression that stays with people.",
      image: card0
    },
    {
      name: "Made to leave a lasting impression and endure the test of time.",
      image: card3
    }
  ];

  const infoCards = [
    {
      title: "Secure Identity Management",
      shortText: "We protect your staff data...",
      fullText:
        "We protect your staff data with advanced identity verification systems, encrypted storage, and secure access control solutions."
    },
    {
      title: "Premium Smart Cards",
      shortText: "High-quality durable cards...",
      fullText:
        "High-quality durable cards designed with premium materials that ensure longevity, professional appearance, and reliability."
    },
    {
      title: "Access Control Systems",
      shortText: "Control who goes where...",
      fullText:
        "Control who goes where with smart authorization systems that manage departments, permissions, and security levels efficiently."
    }
  ];

  return (
    <div style={styles.container}>
      <BirthdayNotification userRole="admin" />
      
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Welcome!👋</h2>

        <nav style={styles.nav}>
          <button style={styles.link} onClick={() => navigate("/all-staff")}>
            <b>🆔 Staff IDs</b>
          </button>

          <button style={styles.link} onClick={() => navigate("/department")}>
            <b>🏢 Departments</b>
          </button>

          <button style={styles.link} onClick={() => navigate("/uploaded-works")}>
            <b>✅📤 Uploaded Works</b>
          </button>

          <button style={styles.link} onClick={() => navigate("/manage-permissions")}>
            <b>🔑 Manage Permissions</b>
          </button>

          <button style={styles.link} onClick={() => navigate("/cards")}>
            <b>💳 Card Samples</b>
          </button>

          <button style={styles.link} onClick={() => navigate("/tasks")}>
            <b>📝 Tasks</b>
          </button>

          <button style={styles.link} onClick={() => navigate("/settings")}>
            <b>⚙️ Settings</b>
          </button>

          <button style={styles.link} onClick={() => navigate("/chat")}>
            <b>📩 Chat box</b>
            {hasUnreadMessages && (
              <span style={styles.greenDot}></span>
            )}
          </button>

          <button style={styles.link} onClick={() => navigate("/recycle-bin")}>
            <b>🗑️ Recycle Bin</b>
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topbar}>
          <span style={{ fontWeight: "bold" }}>Admin Dashboard</span>
          
          <div style={styles.avatar}>👤</div>
        </div>

        <div style={styles.content}>
          <div style={styles.searchContainer}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search features, cards, or information..."
                style={styles.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  style={styles.clearSearch}
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <h2>Simplifying identity and access, one ID at a time!</h2>

          <p>
            Identifine is a platform that simplifies identity verification and
            access management, helping organizations securely manage staff IDs
            and credentials.
          </p>
          <br></br>

          {/* Image Cards */}
      <div style={styles.cardGrid}>
  {cards
    .filter(card => card.name.toLowerCase().includes(search.toLowerCase()))
    .map((card, index) => (
    <div key={index} className="image-hover-card">
      
      <img
        src={card.image}
        alt={card.name}
        className="card-image"
      />

      <div className="card-overlay-text">
        {card.name}
      </div>

    </div>
  ))}
</div>


          {/* Why Choose Us */}
          <section style={styles.section}>
            <br></br>
            <h3>What Makes Us Different</h3>
            <br></br>

            <div style={styles.infoGrid}>
  {infoCards.map((card, index) => (
    <div
      key={index}
      style={styles.infoCard}
      className="hover-card"
    >
      <h4>{card.title}</h4>

      <p className="card-text">
        {card.shortText}
      </p>

      <p className="card-full-text">
        {card.fullText}
      </p>
    </div>
  ))}
</div>


          </section>

          <div style={styles.chart}>📊 Chart goes here</div>
        </div>
      </main>
    </div>
  );
}

export default Home;

/* ================= STYLES ================= */

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif"
  },

  sidebar: {
    width: "220px",
    background: "linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)",
    color: "white",
    padding: "10px",
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
  },

  logo: {
    marginBottom: "30px",
    color: "white"
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  link: {
    background: "rgba(255, 255, 255, 0.15)",
    border: "none",
    color: "white",
    textAlign: "left",
    padding: "15px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontWeight: "500",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },

  greenDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 10px #10b981",
    animation: "pulse 2s infinite",
    marginLeft: "auto"
  },

  main: {
    flex: 1,
    background: "#f5f5f5",
    color: "#333"
  },

  topbar: {
    height: "80px",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    color: "white"
  },

  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  content: {
    padding: "20px"
  },

  searchContainer: {
    marginBottom: "30px"
  },

  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    maxWidth: "600px",
    margin: "0 auto 20px auto"
  },

  searchIcon: {
    position: "absolute",
    left: "15px",
    fontSize: "20px",
    zIndex: 1
  },

  search: {
    padding: "15px 50px 15px 50px",
    width: "100%",
    borderRadius: "50px",
    border: "2px solid #3b82f6",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.2)"
  },

  clearSearch: {
    position: "absolute",
    right: "15px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(50, 47, 47, 0.1)",
    color: "black",
  },

  section: {
    marginBottom: "30px"
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  infoCard: {
  background: "white",   // GREEN background
  color: "black",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  cursor: "pointer",
  transition: "all 0.4s ease"
},


  chart: {
    background: "white",
    height: "200px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777"
  }
};
