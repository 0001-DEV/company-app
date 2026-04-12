import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import card0 from "../assets/cards/CARD 0.jpeg";
import card1 from "../assets/cards/CARD 1.jpeg";
import card2 from "../assets/cards/CARD 2.jpeg";

function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [noticePopup, setNoticePopup] = useState(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, user, getAuthHeader } = useAuth();

  const images = [card0, card1, card2];

  // Redirect if already authenticated as staff
  useEffect(() => {
    if (isAuthenticated() && user?.role === 'staff') {
      navigate('/staff-dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password }, 'staff');

      if (result.success) {
        // Skip notices fetch - just redirect to dashboard
        navigate("/staff-dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("Server error, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="ignore-dark">
      {/* Notice Popup */}
      {noticePopup && (
        <div style={styles.noticePopup}>
          <div style={styles.noticePopupInner}>
            <div style={styles.noticePopupIcon}>📢</div>
            <div style={{ flex: 1 }}>
              <div style={styles.noticePopupTitle}>{noticePopup.title}</div>
              <div style={styles.noticePopupBody}>{noticePopup.body}</div>
            </div>
          </div>
          <div style={styles.noticePopupBar} />
        </div>
      )}
      {/* Background Carousel */}
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Background ${index + 1}`}
          style={{
            ...styles.carouselImage,
            opacity: currentImage === index ? 1 : 0,
            transform: currentImage === index ? 'scale(1.1)' : 'scale(1)'
          }}
        />
      ))}
      
      {/* Overlay */}
      <div style={styles.overlay}></div>

      {/* Login Card */}
      <div style={styles.loginCard} className="login-card-inner">
        <div style={styles.logoSection}>
          <div style={styles.logo}>👤</div>
          <h1 style={styles.title}>Staff Portal</h1>
          <p style={styles.subtitle}>Sign in to access your dashboard</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...styles.input, paddingRight: '50px' }}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={styles.eyeBtn}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.loginButton} disabled={loading}>
            <span style={styles.buttonIcon}>🔐</span>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <button 
            style={styles.backLink}
            onClick={() => navigate("/")}
          >
            ← Back to Login Selection
          </button>
        </div>

        {/* Indicators */}
        <div style={styles.indicators}>
          {images.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.indicator,
                ...(currentImage === index ? styles.indicatorActive : {})
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
    background: "#059669"
  },
  carouselImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 0.6s ease-in-out, transform 4s ease-in-out",
    zIndex: 0
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, rgba(5, 150, 105, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)",
    zIndex: 1
  },
  loginCard: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255, 255, 255, 0.95)",
    padding: "50px 40px",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
    width: "90%",
    maxWidth: "450px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.5)"
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "30px"
  },
  logo: {
    fontSize: "64px",
    marginBottom: "15px"
  },
  title: {
    margin: "0 0 10px 0",
    color: "#059669",
    fontSize: "32px",
    fontWeight: "700"
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px"
  },
  errorBox: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    border: "2px solid #fca5a5"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151"
  },
  input: {
    padding: "14px 18px",
    fontSize: "16px",
    border: "2px solid #d1d5db",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.3s ease",
    background: 'var(--bg-card, white)',
    width: "100%",
    boxSizing: "border-box"
  },
  loginButton: {
    padding: "16px",
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px"
  },
  buttonIcon: {
    fontSize: "20px"
  },
  footer: {
    marginTop: "25px",
    textAlign: "center"
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#059669",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "none",
    transition: "all 0.3s"
  },
  eyeBtn: {
    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '2px', lineHeight: 1
  },
  noticePopup: {
    position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #dc2626, #f97316)',
    borderRadius: 16, padding: '16px 20px', zIndex: 9999,
    boxShadow: '0 8px 32px rgba(220,38,38,0.6)', minWidth: 300, maxWidth: 420,
    animation: 'slideDown 0.4s ease', overflow: 'hidden'
  },
  noticePopupInner: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  noticePopupIcon: { fontSize: 28, flexShrink: 0 },
  noticePopupTitle: { color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 4 },
  noticePopupBody: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.5 },
  noticePopupBar: {
    height: 3, background: 'rgba(255,255,255,0.4)', borderRadius: 2, marginTop: 12,
    animation: 'shrink 3s linear forwards'
  },
  indicators: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "25px"
  },
  indicator: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#d1d5db",
    transition: "all 0.3s ease"
  },
  indicatorActive: {
    background: "#059669",
    width: "25px",
    borderRadius: "5px"
  }
};

export default StaffLogin;
