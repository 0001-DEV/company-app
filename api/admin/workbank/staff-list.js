const { withMiddleware } = require('../../middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const staff = await req.db.collection('users').find({ role: 'staff' })
      .project({ name: 1, email: 1 })
      .sort({ name: 1 })
      .toArray();
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff list for workbank:', error);
    res.status(500).json({ message: 'Error fetching staff' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
