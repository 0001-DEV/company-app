const { withMiddleware } = require('./middleware');
const { logAuthEvent } = require('./auth-utils');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (userId) {
      // Log logout event for audit purposes
      await logAuthEvent(req.db, userId, 'logout', {
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        role: userRole
      });
      
      console.log(`User logout: ${userId} (${userRole}) at ${new Date().toISOString()}`);
    }

    return res.status(200).json({
      message: 'Logout successful',
      success: true
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      message: 'Server error during logout',
      success: false 
    });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});