import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../assets/cards/CR8.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/password-reset/verify/${token}`);
        const data = await res.json();

        if (res.ok) {
          setEmail(data.email);
          setVerifying(false);
        } else {
          setError(data.message || 'Invalid or expired reset link');
        }
      } catch (err) {
        setError('Error verifying token: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setResetting(true);

    try {
      const res = await fetch(`/api/password-reset/reset/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage(data.message);
        setTimeout(() => navigate('/admin-login'), 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setResetting(false);
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
    inputGroup: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    togglePassword: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      fontSize: '18px'
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
      color: '#64748b'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ color: '#64748b' }}>Verifying reset link...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && verifying) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <div style={{ color: '#991b1b', marginBottom: '24px' }}>{error}</div>
            <button
              onClick={() => navigate('/admin-login')}
              style={styles.button}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successText}>Password Reset Successful!</div>
            <div style={styles.successSubtext}>
              Your password has been reset. Redirecting to login...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src={logo} alt="Xtreme Cr8tivity" style={styles.logo} />
          <h1 style={styles.title}>Create New Password</h1>
          <p style={styles.subtitle}>Enter your new password below</p>
        </div>

        {error && (
          <div style={{ ...styles.message, ...styles.errorMessage }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              disabled
              style={{ ...styles.input, background: '#f1f5f9', cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputGroup}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePassword}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <label style={styles.label}>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={resetting}
            style={{
              ...styles.button,
              opacity: resetting ? 0.6 : 1,
              cursor: resetting ? 'not-allowed' : 'pointer'
            }}
          >
            {resetting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
