import { useState, useEffect } from 'react';

const BirthdayNotification = ({ userRole }) => {
  const [birthdays, setBirthdays] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchBirthdays();
    const interval = setInterval(fetchBirthdays, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchBirthdays = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = userRole === 'admin' 
        ? 'http://localhost:5000/api/admin/upcoming-birthdays'
        : 'http://localhost:5000/api/staff/upcoming-birthdays';
      
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBirthdays(data);
      }
    } catch (err) {
      console.error('Error fetching birthdays:', err);
    }
  };

  const dismissNotification = () => {
    setDismissed(birthdays.map(b => b.staffId));
  };

  const visibleBirthdays = birthdays.filter(b => !dismissed.includes(b.staffId));

  if (visibleBirthdays.length === 0) return null;

  // Separate today's birthdays from upcoming ones
  const todayBirthdays = visibleBirthdays.filter(b => b.daysUntil === 0);
  const upcomingBirthdays = visibleBirthdays.filter(b => b.daysUntil > 0);
  
  // Display all birthdays (today first, then upcoming)
  const displayBirthdays = [...todayBirthdays, ...upcomingBirthdays];
  
  const todayCount = todayBirthdays.length;
  const upcomingCount = upcomingBirthdays.length;
  const isCelebrant = todayBirthdays.length === 1 && todayBirthdays[0]?.isCurrentUser;

  return (
    <div style={styles.container}>
      <div 
        style={{
          ...styles.notification,
          ...(expanded ? styles.notificationExpanded : {})
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <button 
          style={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            dismissNotification();
          }}
        >
          ✕
        </button>
        
        {/* Collapsed Header */}
        <div style={styles.collapsedView}>
          <div style={styles.iconSmall}>
            {isCelebrant ? '🎊' : todayCount > 0 ? '🎂' : '🎉'}
          </div>
          <div style={styles.collapsedText}>
            {isCelebrant ? (
              <>
                <div style={styles.collapsedTitle}>Your Birthday!</div>
                <div style={styles.collapsedCount}>Celebrate! 🎈</div>
              </>
            ) : (
              <>
                {todayCount > 0 && (
                  <div style={styles.collapsedTitle}>
                    Birthday Today ({todayCount})
                  </div>
                )}
                {upcomingCount > 0 && (
                  <div style={todayCount > 0 ? styles.collapsedCount : styles.collapsedTitle}>
                    Birthday in few days ({upcomingCount})
                  </div>
                )}
              </>
            )}
          </div>
          <div style={styles.expandIcon}>{expanded ? '▲' : '▼'}</div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div style={styles.expandedView}>
            {displayBirthdays.map((birthday, index) => (
              <div key={birthday.staffId}>
                {index > 0 && <div style={styles.divider}></div>}
                <div style={styles.birthdayItem}>
                  {birthday.daysUntil === 0 ? (
                    birthday.isCurrentUser ? (
                      <>
                        <div style={styles.title}>🎊 Happy Birthday to You!</div>
                        <div style={styles.message}>
                          Xtreme Cr8ivity wishes you an amazing day filled with joy and blessings! 🎈✨
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={styles.title}>🎂 {birthday.name}</div>
                        <div style={styles.message}>
                          It's their birthday! Wish them well! 🎉
                        </div>
                      </>
                    )
                  ) : (
                    <>
                      <div style={styles.title}>📅 {birthday.name}</div>
                      <div style={styles.message}>
                        Birthday in {birthday.daysUntil} day{birthday.daysUntil > 1 ? 's' : ''}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    right: '20px',
    top: '20px',
    zIndex: 9999,
    pointerEvents: 'none'
  },
  notification: {
    width: '240px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '10px 12px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
    pointerEvents: 'auto',
    animation: 'slideIn 0.5s ease-out',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  notificationExpanded: {
    width: '280px',
    padding: '12px 14px'
  },
  closeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(255, 255, 255, 0.25)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    zIndex: 10,
    opacity: 0.8
  },
  collapsedView: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingRight: '25px'
  },
  iconSmall: {
    fontSize: '22px',
    flexShrink: 0
  },
  collapsedText: {
    flex: 1,
    minWidth: 0
  },
  collapsedTitle: {
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '2px',
    letterSpacing: '0.3px'
  },
  collapsedCount: {
    fontSize: '10px',
    opacity: 0.85,
    fontWeight: '500'
  },
  expandIcon: {
    fontSize: '12px',
    opacity: 0.7,
    flexShrink: 0,
    marginLeft: 'auto'
  },
  expandedView: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.25)'
  },
  birthdayItem: {
    textAlign: 'center',
    padding: '6px 0'
  },
  title: {
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '0.2px'
  },
  message: {
    fontSize: '11px',
    lineHeight: '1.5',
    opacity: 0.95,
    fontWeight: '400'
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.2)',
    margin: '6px 0'
  }
};

export default BirthdayNotification;
