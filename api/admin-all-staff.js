const { withMiddleware } = require('./middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Aggregate to get staff with department details
    const staff = await req.db.collection('users').aggregate([
      { $match: { role: 'staff' } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();
    
    res.json(staff);
    
  } catch (error) {
    console.error('Error fetching all staff:', error);
    res.status(500).json({ message: 'Error fetching staff' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireRole: 'admin',
  requireDb: true 
});