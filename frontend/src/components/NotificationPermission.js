import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const NotificationPermission = () => {
  const [status, setStatus] = useState('unknown'); // unknown | default | granted | denied

  useEffect(() => {
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    setStatus(Notification.permission);
  }, []);

  const handleClick = () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }
    Notification.requestPermission().then(perm => {
      setStatus(perm);
      if (perm === 'granted') {
        new Notification('✅ Alerts enabled!', {
          body: 'You will now receive desktop alerts for new messages.',
          icon: '/favicon.ico'
        });
      } else if (perm === 'denied') {
        alert(
          'Notifications are blocked.\n\n' +
          'To fix this in Chrome:\n' +
          '1. Click the lock 🔒 icon in the address bar\n' +
          '2. Find "Notifications" and set it to Allow\n' +
          '3. Refresh the page'
        );
      }
    });
  };

  // Already granted — nothing to show
  if (status === 'granted' || status === 'unsupported' || status === 'unknown') return null;

  // Render directly into document.body via portal — nothing can block this
  return ReactDOM.createPortal(
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2147483647,
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        padding: '14px 22px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 6px 24px rgba(245,158,11,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        animation: 'none',
        outline: 'none',
        pointerEvents: 'all'
      }}
    >
      🔔 Enable Desktop Alerts
    </button>,
    document.body
  );
};

export default NotificationPermission;
