const { withMiddleware } = require('../../../middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const access = await req.db.collection('mappingaccesses').findOne({}, { sort: { updatedAt: -1 } });
    
    if (!access) {
      return res.json({ staffIds: [] });
    }
    
    res.json({ staffIds: access.staffIds || [] });
  } catch (error) {
    console.error('Error getting mapping access:', error);
    res.status(500).json({ message: 'Error getting access' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
