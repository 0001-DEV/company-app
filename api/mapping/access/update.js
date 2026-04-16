const { withMiddleware } = require('../../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { staffIds } = req.body || {};

  try {
    const objectStaffIds = (staffIds || []).map(id => new ObjectId(id));
    
    await req.db.collection('mappingaccesses').deleteMany({});
    
    const access = {
      staffIds: objectStaffIds,
      updatedAt: new Date(),
      updatedBy: new ObjectId(req.user.id)
    };
    
    await req.db.collection('mappingaccesses').insertOne(access);
    
    res.json({ message: 'Access updated', access });
  } catch (error) {
    console.error('Error updating mapping access:', error);
    res.status(500).json({ message: 'Error updating access' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
