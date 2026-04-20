import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/cards/CR8.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const text = await res.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text);
        setError('Server error: Invalid response. Make sure backend is running.');
        setLoading(false);
        return;
      }

      if (res.ok) {
        setMessage(data.message);
        setSubmitted(true);
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      padding: '40px',
      maxWidth: '400px',
      width: '100%'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logo: {
      width: '60px',
      height: '60px',
      marginBottom: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      margin: '0'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    button: {
      padding: '12px 16px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      marginTop: '8px'
    },
    backButton: {
      padding: '12px 16px',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    message: {
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px'
    },
    successMessage: {
      background: '#dcfce7',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    errorMessage: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    successBox: {
      textAlign: 'center'
    },
    successIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    successText: {
      fontSize: '16px',
      color: '#1e293b',
      marginBottom: '8px',
      fontWeight: '600'
    },
    successSubtext: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '24px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src={logo} alt="Xtreme Cr8tivity" style={styles.logo} />
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>Enter your email to receive a reset link</p>
        </div>

        {submitted ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successText}>Check Your Email</div>
            <div style={styles.successSubtext}>
              We've sent a password reset link to your email. The link will expire in 1 hour.
            </div>
            <button
              onClick={() => navigate('/admin-login')}
              style={styles.button}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ ...styles.message, ...styles.errorMessage }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@xtremecr8ivity.com"
                  style={styles.input}
                  required
                />
                <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Enter your login email or functional email
                </small>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <button
              onClick={() => navigate('/admin-login')}
              style={{ ...styles.backButton, marginTop: '16px', width: '100%' }}
            >
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
