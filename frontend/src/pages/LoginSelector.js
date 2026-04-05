import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import card0 from "../assets/cards/CARD 0.jpeg";
import card1 from "../assets/cards/CARD 1.jpeg";
import card2 from "../assets/cards/CARD 2.jpeg";
import card3 from "../assets/cards/CARD 3.jpeg";

function LoginSelector() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [card0, card1, card2, card3];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      if (user?.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user?.role === 'staff') {
        navigate('/staff-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div style={styles.container} className="ignore-dark">
      {/* Image Carousel */}
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Slide ${index + 1}`}
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
          <div style={styles.logo}>🏢</div>
          <h1 style={styles.title}>Welcome to Identifiner</h1>
          <p style={styles.subtitle}>Please select your login type</p>
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={() => navigate("/admin-login")}
            style={styles.adminButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(30, 64, 175, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(30, 64, 175, 0.3)';
            }}
          >
            <span style={styles.buttonIcon}>👑</span>
            <div>
              <div style={styles.buttonTitle}>Admin Login</div>
              <div style={styles.buttonSubtitle}>Access admin dashboard</div>
            </div>
          </button>

          <button
            onClick={() => navigate("/staff-login")}
            style={styles.staffButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(5, 150, 105, 0.3)';
            }}
          >
            <span style={styles.buttonIcon}>👤</span>
            <div>
              <div style={styles.buttonTitle}>Staff Login</div>
              <div style={styles.buttonSubtitle}>Access staff portal</div>
            </div>
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
              onClick={() => setCurrentImage(index)}
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
    background: "#1e40af"
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
    background: "linear-gradient(135deg, rgba(30, 64, 175, 0.6) 0%, rgba(59, 130, 246, 0.6) 100%)",
    zIndex: 1
  },
  loginCard: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255, 255, 255, 0.95)",
    padding: "50px 40px",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
    textAlign: "center",
    width: "90%",
    maxWidth: "450px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.5)"
  },
  logoSection: {
    marginBottom: "40px"
  },
  logo: {
    fontSize: "64px",
    marginBottom: "20px"
  },
  title: {
    margin: "0 0 10px 0",
    color: "#1e40af",
    fontSize: "32px",
    fontWeight: "700"
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "16px"
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "30px"
  },
  adminButton: {
    width: "100%",
    padding: "20px",
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)"
  },
  staffButton: {
    width: "100%",
    padding: "20px",
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)"
  },
  buttonIcon: {
    fontSize: "32px"
  },
  buttonTitle: {
    fontSize: "18px",
    fontWeight: "700",
    textAlign: "left"
  },
  buttonSubtitle: {
    fontSize: "13px",
    opacity: 0.9,
    textAlign: "left",
    marginTop: "4px"
  },
  indicators: {
    display: "flex",
    justifyContent: "center",
    gap: "10px"
  },
  indicator: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#d1d5db",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  indicatorActive: {
    background: "#3b82f6",
    width: "30px",
    borderRadius: "6px"
  }
};

export default LoginSelector;
