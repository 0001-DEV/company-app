const { withMiddleware } = require('./middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get current user from validated token
    const userId = req.user.id;
    
    // Fetch complete user data from database
    const user = await req.db.collection('users').findOne({ 
      _id: userId 
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'User no longer exists' 
      });
    }

    // Get department information if user has one
    let department = null;
    if (user.department) {
      department = await req.db.collection('departments').findOne({
        _id: user.department
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        department: department ? {
          id: department._id,
          name: department.name,
          description: department.description || ''
        } : null,
        profilePicture: user.profilePicture || '',
        birthday: user.birthday || null,
        canViewOthersWork: user.canViewOthersWork || false,
        createdAt: user.createdAt,
        permissions: req.user.permissions || []
      },
      session: {
        loginTime: req.user.iat ? new Date(req.user.iat * 1000) : null,
        expiresAt: req.user.exp ? new Date(req.user.exp * 1000) : null,
        isValid: true
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({ 
      message: 'Server error retrieving user information' 
    });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});