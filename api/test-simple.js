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

  try {
    res.status(200).json({
      success: true,
      message: 'API is working! Authentication system ready.',
      timestamp: new Date().toISOString(),
      userStats: {
        total: 1,
        admins: 1,
        staff: 0
      },
      apiEndpoints: [
        'POST /api/auth-login - General authentication',
        'POST /api/admin-login - Admin authentication', 
        'POST /api/staff-login - Staff authentication',
        'GET /api/auth-validate - Token validation',
        'POST /api/auth-refresh - Token refresh',
        'GET /api/auth-me - User profile',
        'POST /api/auth-logout - Logout'
      ],
      testCredentials: {
        admin: {
          email: 'admin@xtremecr8ivity.com',
          password: 'admin123'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
};