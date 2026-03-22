import React, { useState, useEffect } from 'react';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      const stored = localStorage.getItem('company-app-dark-mode');
      if (stored === 'true') {
        setIsDark(true);
        document.documentElement.classList.add('dark-theme');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark-theme');
      }
    };
    // Apply initially
    applyTheme();
    // Listen for storage changes (e.g. from other tabs or hot-reloads)
    window.addEventListener('storage', applyTheme);
    return () => window.removeEventListener('storage', applyTheme);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('company-app-dark-mode', 'false');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('company-app-dark-mode', 'true');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={s.button}
      title="Toggle Dark Mode"
      className="ignore-dark"
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)' }}
    >
      <span style={s.iconWrapper(isDark)}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

const s = {
  button: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white',
    border: 'none',
    boxShadow: '0 8px 16px rgba(59,130,246,0.3)',
    cursor: 'pointer',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  iconWrapper: (isDark) => ({
    fontSize: '24px',
    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transform: isDark ? 'rotate(-360deg)' : 'rotate(0deg)',
    display: 'inline-block'
  })
};

export default DarkModeToggle;
