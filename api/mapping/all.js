const { withMiddleware } = require('../middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const companies = await req.db.collection('companymappings')
      .find({ isDeleted: { $ne: true } })
      .sort({ companyName: 1 })
      .toArray();
    
    res.json(companies);
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});