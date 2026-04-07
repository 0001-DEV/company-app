import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CardUsageReportPublic = () => {
  const { encodedId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        // Decode the company ID
        const companyId = atob(encodedId);
        
        // Determine backend URL based on current host
        const currentHost = window.location.hostname;
        const backendUrl = currentHost === 'localhost' || currentHost === '127.0.0.1' 
          ? '' 
          : `http://${currentHost}:5000`;
        
        // Fetch the report data from public endpoint (no auth required)
        const res = await fetch(`${backendUrl}/api/client-documents/public/card-usage-report/${companyId}`);
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        } else {
          setError('Report not found or access denied');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Error loading report: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (encodedId) {
      fetchReport();
    }
  }, [encodedId]);

  const darkBg = {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#e0e0e0',
    minHeight: '100vh',
    padding: '30px 20px'
  };

  if (loading) {
    return (
      <div style={darkBg}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
          <p style={{ fontSize: '18px' }}>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={darkBg}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
          <p style={{ fontSize: '18px', color: '#FF6B6B' }}>❌ {error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div style={darkBg}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
          <p style={{ fontSize: '18px' }}>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={darkBg}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>
            📊 Card Usage Report
          </h1>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#4CAF50' }}>
            {reportData.companyName}
          </h2>
        </div>

        {/* Card Usage Summary */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginTop: 0, color: '#fff', fontSize: '20px' }}>Card Usage Summary</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Card Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Total Quantity</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Cards Used</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {reportData.cardTypes && reportData.cardTypes.length > 0 ? (
                  reportData.cardTypes.map((card, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <td style={{ padding: '12px' }}>{card.cardType}</td>
                      <td style={{ padding: '12px' }}>{card.totalQuantity || card.initialQuantity}</td>
                      <td style={{ padding: '12px', color: '#FF9800' }}>{card.cardsUsed}</td>
                      <td style={{ padding: '12px', color: '#4CAF50', fontWeight: 'bold' }}>{card.remaining}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
                      No card data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed History */}
        {reportData.history && reportData.history.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginTop: 0, color: '#fff', fontSize: '20px' }}>Detailed History</h3>
            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Card Type</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Action</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Quantity</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.history.map((entry, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <td style={{ padding: '10px' }}>{entry.cardType}</td>
                      <td style={{ padding: '10px' }}>
                        {entry.action === 'added' ? '➕ Added' : entry.action === 'removed' ? '➖ Removed' : '✨ Created'}
                      </td>
                      <td style={{ padding: '10px' }}>{entry.quantity}</td>
                      <td style={{ padding: '10px' }}>{new Date(entry.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center',
          color: '#999',
          fontSize: '13px'
        }}>
          <p style={{ margin: 0 }}>This is a public report. Share this link with stakeholders to view card usage information.</p>
        </div>
      </div>
    </div>
  );
};

export default CardUsageReportPublic;
