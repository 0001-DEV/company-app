const { initializeDatabase } = require('../lib/db-init');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

module.exports = async (req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Only allow POST requests for initialization
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST to initialize database.' 
    });
  }

  try {
    const result = await initializeDatabase();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Database initialized successfully',
        timestamp: new Date().toISOString(),
        defaultCredentials: {
          admin: {
            email: 'admin@xtremecr8ivity.com',
            password: 'admin123'
          },
          staff: {
            email: 'staff@xtremecr8ivity.com',
            password: 'staff123'
          }
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Database initialization failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database initialization failed'
    });
  }
};