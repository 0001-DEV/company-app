const { withMiddleware } = require('../../middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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
      {
        $project: {
          name: 1,
          email: 1,
          department: 1,
          createdAt: 1,
          profilePicture: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();
    
    res.json(staff);
    
  } catch (error) {
    console.error('Error fetching staff credentials:', error);
    res.status(500).json({ message: 'Error fetching credentials' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireRole: 'admin',
  requireDb: true 
});
