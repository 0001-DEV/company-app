const { withMiddleware } = require('./middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user details from database
    const user = await req.db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { name: 1, email: 1, role: 1, department: 1, profilePicture: 1 } }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get department details if user has one
    let department = null;
    if (user.department) {
      department = await req.db.collection('departments').findOne(
        { _id: new ObjectId(user.department) },
        { projection: { name: 1 } }
      );
    }

    res.json({
      name: user.name,
      role: user.role,
      id: user._id,
      department: department,
      profilePicture: user.profilePicture || ''
    });

  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Error fetching user information' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});