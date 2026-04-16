const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.uploadedFiles || []);
  } catch (error) {
    console.error('Error fetching staff files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
