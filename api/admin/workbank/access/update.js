const { withMiddleware } = require('../../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { staffIds } = req.body || {};

  try {
    // Convert string IDs to ObjectId
    const objectStaffIds = (staffIds || []).map(id => new ObjectId(id));
    
    // Delete existing access and create new one
    await req.db.collection('workbankaccesses').deleteMany({});
    
    const access = {
      staffIds: objectStaffIds,
      updatedAt: new Date(),
      updatedBy: new ObjectId(req.user.id)
    };
    
    await req.db.collection('workbankaccesses').insertOne(access);
    
    res.json({ message: 'Work Bank access updated', access });
  } catch (error) {
    console.error('Error updating Work Bank access:', error);
    res.status(500).json({ message: 'Error updating Work Bank access' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
