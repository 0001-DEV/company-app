const { withMiddleware } = require('./middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const departments = await req.db.collection('departments')
      .find({})
      .sort({ name: 1 })
      .toArray();
    
    res.json(departments);
    
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});