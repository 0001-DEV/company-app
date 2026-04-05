const { withMiddleware } = require('./middleware');
const bcrypt = require('bcryptjs');

const handler = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test authentication system functionality
    const tests = [];
    
    // Test 1: Check if users collection exists and has data
    const userCount = await req.db.collection('users').countDocuments();
    tests.push({
      test: 'Users Collection',
      status: userCount > 0 ? 'PASS' : 'WARN',
      message: `Found ${userCount} users in database`,
      details: userCount === 0 ? 'No users found - authentication will fail' : null
    });

    // Test 2: Check for admin users
    const adminCount = await req.db.collection('users').countDocuments({ role: 'admin' });
    tests.push({
      test: 'Admin Users',
      status: adminCount > 0 ? 'PASS' : 'WARN',
      message: `Found ${adminCount} admin users`,
      details: adminCount === 0 ? 'No admin users found' : null
    });

    // Test 3: Check for staff users
    const staffCount = await req.db.collection('users').countDocuments({ role: 'staff' });
    tests.push({
      test: 'Staff Users',
      status: staffCount > 0 ? 'PASS' : 'WARN',
      message: `Found ${staffCount} staff users`,
      details: staffCount === 0 ? 'No staff users found' : null
    });

    // Test 4: Check password hashing
    const sampleUser = await req.db.collection('users').findOne({});
    if (sampleUser && sampleUser.password) {
      const isBcryptHash = sampleUser.password.startsWith('$2');
      tests.push({
        test: 'Password Hashing',
        status: isBcryptHash ? 'PASS' : 'WARN',
        message: isBcryptHash ? 'Passwords are properly hashed' : 'Passwords may not be properly hashed',
        details: isBcryptHash ? null : 'Check if passwords are bcrypt hashed'
      });
    }

    // Test 5: JWT Secret configuration
    const jwtSecret = process.env.JWT_SECRET;
    tests.push({
      test: 'JWT Configuration',
      status: jwtSecret && jwtSecret !== 'fallback-secret' ? 'PASS' : 'WARN',
      message: jwtSecret ? 'JWT secret is configured' : 'Using fallback JWT secret',
      details: !jwtSecret || jwtSecret === 'fallback-secret' ? 'Set JWT_SECRET environment variable for production' : null
    });

    // Test 6: Database indexes
    const userIndexes = await req.db.collection('users').indexes();
    const hasEmailIndex = userIndexes.some(index => 
      index.key && index.key.email === 1
    );
    tests.push({
      test: 'Database Indexes',
      status: hasEmailIndex ? 'PASS' : 'WARN',
      message: hasEmailIndex ? 'Email index exists' : 'Email index missing',
      details: hasEmailIndex ? null : 'Email index recommended for login performance'
    });

    const overallStatus = tests.every(t => t.status === 'PASS') ? 'PASS' : 
                         tests.some(t => t.status === 'FAIL') ? 'FAIL' : 'WARN';

    return res.status(200).json({
      success: true,
      message: 'Authentication system test completed',
      overallStatus,
      timestamp: new Date().toISOString(),
      tests,
      endpoints: {
        login: [
          'POST /api/auth-login - General authentication',
          'POST /api/admin-login - Admin-specific login',
          'POST /api/staff-login - Staff-specific login'
        ],
        session: [
          'GET /api/auth-validate - Validate JWT token',
          'POST /api/auth-refresh - Refresh JWT token',
          'GET /api/auth-me - Get current user info',
          'POST /api/auth-logout - Logout user'
        ]
      },
      recommendations: tests
        .filter(t => t.details)
        .map(t => t.details)
    });

  } catch (error) {
    console.error('Authentication test error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication test failed',
      error: error.message
    });
  }
};

module.exports = withMiddleware(handler, { requireDb: true });