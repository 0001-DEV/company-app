const { testConnection, initializeDatabase, connectToDatabase } = require('./db-connection');

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
    // Test database connection
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      return res.status(200).json({
        success: false,
        error: connectionTest.error,
        message: connectionTest.message,
        troubleshooting: {
          checkConnectionString: 'Verify MONGODB_URI in Vercel environment variables',
          checkNetworkAccess: 'Ensure Vercel IPs are whitelisted in MongoDB Atlas',
          checkCredentials: 'Verify username and password are correct'
        },
        apiEndpoints: [
          'POST /api/auth-login',
          'POST /api/admin-login', 
          'POST /api/staff-login',
          'POST /api/auth-logout',
          'GET /api/auth-validate',
          'POST /api/auth-refresh',
          'GET /api/auth-me',
          'GET /api/chat-me',
          'GET /api/chat-users',
          'GET /api/chat-messages',
          'POST /api/chat-message',
          'GET /api/staff-all',
          'GET /api/admin-all-staff',
          'GET /api/admin-departments'
        ]
      });
    }

    // Initialize database if connection successful
    await initializeDatabase();
    
    // Get user statistics
    const { db } = await connectToDatabase();
    
    const userCount = await db.collection('users').countDocuments();
    const adminCount = await db.collection('users').countDocuments({ role: 'admin' });
    const staffCount = await db.collection('users').countDocuments({ role: 'staff' });
    
    res.status(200).json({
      success: true,
      message: 'MongoDB Atlas connection successful! All systems operational.',
      timestamp: new Date().toISOString(),
      connectionTime: connectionTest.responseTime,
      collections: connectionTest.collections,
      userStats: {
        total: userCount,
        admins: adminCount,
        staff: staffCount
      },
      serverlessOptimizations: {
        connectionPooling: 'Enabled',
        indexing: 'Optimized',
        caching: 'Active'
      },
      apiEndpoints: [
        'POST /api/auth-login - General authentication',
        'POST /api/admin-login - Admin authentication', 
        'POST /api/staff-login - Staff authentication',
        'POST /api/auth-logout - User logout',
        'GET /api/auth-validate - Token validation',
        'POST /api/auth-refresh - Token refresh',
        'GET /api/auth-me - Current user profile',
        'GET /api/chat-me - Current user info',
        'GET /api/chat-users - Chat users list',
        'GET /api/chat-messages - Message retrieval',
        'POST /api/chat-message - Send message',
        'GET /api/staff-all - Staff directory',
        'GET /api/admin-all-staff - Admin staff management',
        'GET /api/admin-departments - Department management'
      ]
    });
  } catch (error) {
    res.status(200).json({ 
      success: false, 
      error: error.message,
      message: 'Database connection failed. Please verify MongoDB Atlas configuration.',
      troubleshooting: {
        checkConnectionString: 'Verify MONGODB_URI in Vercel environment variables',
        checkNetworkAccess: 'Ensure Vercel IPs are whitelisted in MongoDB Atlas',
        checkCredentials: 'Verify username and password are correct'
      },
      apiEndpoints: [
        'POST /api/auth-login',
        'POST /api/admin-login', 
        'POST /api/staff-login',
        'POST /api/auth-logout',
        'GET /api/auth-validate',
        'POST /api/auth-refresh',
        'GET /api/auth-me',
        'GET /api/chat-me',
        'GET /api/chat-users',
        'GET /api/chat-messages',
        'POST /api/chat-message',
        'GET /api/staff-all',
        'GET /api/admin-all-staff',
        'GET /api/admin-departments'
      ]
    });
  }
}; 