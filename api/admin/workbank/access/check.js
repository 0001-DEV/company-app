const { withMiddleware } = require('../../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (req.user.role === 'admin') {
      return res.json({ hasAccess: true });
    }
    
    const access = await req.db.collection('workbankaccesses').findOne({}, { sort: { updatedAt: -1 } });
    
    if (!access || !access.staffIds) {
      return res.json({ hasAccess: false });
    }
    
    const userIdStr = req.user.id.toString();
    const hasAccess = access.staffIds.some(id => id.toString() === userIdStr);
    
    res.json({ hasAccess });
  } catch (error) {
    console.error('Error checking Work Bank access:', error);
    res.status(500).json({ message: 'Error checking Work Bank access' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
