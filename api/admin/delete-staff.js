const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};

  if (!id) {
    return res.status(400).json({ message: 'Staff ID is required' });
  }

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Staff ID format' });
    }
    
    const staff = await req.db.collection('users').findOne({
      _id: new ObjectId(id)
    });

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await req.db.collection('users').deleteOne({ _id: staff._id });

    return res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
