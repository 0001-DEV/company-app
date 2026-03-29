const express = require('express');
const router = express.Router();
const os = require('os');

// Get machine IP address
router.get('/machine-ip', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let ip = 'localhost';

    // Try to find a non-internal IPv4 address
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Skip internal and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          ip = iface.address;
          break;
        }
      }
      if (ip !== 'localhost') break;
    }

    res.json({ ip });
  } catch (err) {
    console.error('Error getting machine IP:', err);
    res.status(500).json({ message: 'Error getting machine IP' });
  }
});

module.exports = router;
