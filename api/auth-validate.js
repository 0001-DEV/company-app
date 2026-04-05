const { withMiddleware } = require('./middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // If we reach here, the token is valid (middleware verified it)
    const user = req.user;
    
    // Optionally fetch fresh user data from database to ensure user still exists
    // and hasn't been deactivated
    const dbUser = await req.db.collection('users').findOne({ 
      _id: user.id 
    });

    if (!dbUser) {
      return res.status(401).json({ 
        valid: false,
        message: 'User no longer exists' 
      });
    }

    // Check if user is still active (if you have an active field)
    if (dbUser.active === false) {
      return res.status(401).json({ 
        valid: false,
        message: 'User account has been deactivated' 
      });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        department: dbUser.department || null,
        profilePicture: dbUser.profilePicture || '',
        permissions: user.permissions || []
      },
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ 
      valid: false,
      message: 'Server error during token validation' 
    });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});