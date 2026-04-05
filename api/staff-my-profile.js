const { withMiddleware } = require('./middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await req.db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { 
        projection: { 
          name: 1, 
          email: 1, 
          canViewOthersWork: 1, 
          department: 1,
          profilePicture: 1,
          phone: 1,
          birthday: 1
        } 
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireRole: 'staff',
  requireDb: true 
});