import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WeeklyReport = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [weekInfo, setWeekInfo] = useState({ weekNumber: 0, year: 0 });
  const [formData, setFormData] = useState({
    progress: '',
    plans: '',
    problems: ''
  });
  const [toast, setToast] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchCurrentReport();
  }, []);

  const fetchCurrentReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reports/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWeekInfo({ weekNumber: data.weekNumber, year: data.year });
        if (data.report) {
          setReport(data.report);
          setFormData({
            progress: data.report.progress || '',
            plans: data.report.plans || '',
            problems: data.report.problems || ''
          });
          setIsSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      showToast('Failed to load report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.progress.trim() && !formData.plans.trim() && !formData.problems.trim()) {
      showToast('Please fill in at least one field', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
        setIsSubmitted(true);
        showToast('Report submitted successfully', 'success');
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to submit report', 'error');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      showToast('Error submitting report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ progress: '', plans: '', problems: '' });
    setIsSubmitted(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const glassStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const darkBg = {
    background: 'linear-gradient(135deg, #1e1e2f 0%, #3a0ca3 100%)',
    color: '#e0e0e0'
  };

  return (
    <div style={{ ...darkBg, minHeight: '100vh', padding: '30px 20px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          padding: '14px 20px',
          borderRadius: '10px',
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: 14,
          animation: 'slideIn 0.25s ease'
        }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>📊 Weekly Report</h1>
            <p style={{ margin: '8px 0 0 0', color: '#b0b0b0', fontSize: '14px' }}>Track your weekly progress</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}>
              Week {weekInfo.weekNumber}, {weekInfo.year}
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e0e0e0' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <p>Loading your report...</p>
          </div>
        ) : isSubmitted ? (
          <div style={{ ...glassStyle, padding: '40px', marginBottom: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '24px' }}>Report Submitted</h2>
            <p style={{ color: '#b0b0b0', marginBottom: '20px' }}>You've already submitted your report for this week. You can update it below.</p>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear Form
            </button>
          </div>
        ) : null}

        {/* Main Glass Card */}
        <div style={{ ...glassStyle, padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            {/* Progress Section */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
                ✅ Progress
              </label>
              <p style={{ color: '#b0b0b0', fontSize: '13px', marginBottom: '12px' }}>What did you accomplish this week?</p>
              <textarea
                name="progress"
                value={formData.progress}
                onChange={handleInputChange}
                placeholder="List what you accomplished this week..."
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e0e0e0',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '120px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              />
            </div>

            {/* Plans Section */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
                📌 Plans
              </label>
              <p style={{ color: '#b0b0b0', fontSize: '13px', marginBottom: '12px' }}>What are your plans for next week?</p>
              <textarea
                name="plans"
                value={formData.plans}
                onChange={handleInputChange}
                placeholder="What are your plans for next week?"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e0e0e0',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '120px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              />
            </div>

            {/* Problems Section */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
                ⚠️ Problems
              </label>
              <p style={{ color: '#b0b0b0', fontSize: '13px', marginBottom: '12px' }}>Any blockers or issues?</p>
              <textarea
                name="problems"
                value={formData.problems}
                onChange={handleInputChange}
                placeholder="Any blockers or issues?"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#e0e0e0',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '120px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  opacity: submitting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                  }
                }}
              >
                {submitting ? '⏳ Submitting...' : '✓ Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default WeeklyReport;
