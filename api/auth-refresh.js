const { withMiddleware } = require('./middleware');
const { generateToken, createUserResponse, logAuthEvent } = require('./auth-utils');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get current user from validated token
    const userId = req.user.id;
    
    // Fetch fresh user data from database
    const user = await req.db.collection('users').findOne({ 
      _id: userId 
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'User no longer exists' 
      });
    }

    // Check if user is still active
    if (user.active === false) {
      return res.status(401).json({ 
        message: 'User account has been deactivated' 
      });
    }

    // Log token refresh event
    await logAuthEvent(req.db, userId, 'token_refresh', {
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      role: user.role
    });

    // Generate new JWT token with fresh user data
    const newToken = generateToken(user);

    return res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
        profilePicture: user.profilePicture || ''
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ 
      message: 'Server error during token refresh' 
    });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});