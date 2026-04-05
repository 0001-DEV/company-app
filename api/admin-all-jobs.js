const { withMiddleware } = require('./middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Aggregate to get jobs with assigned staff and department details
    const jobs = await req.db.collection('jobs').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'assignedStaff',
          foreignField: '_id',
          as: 'assignedStaff'
        }
      },
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
          title: 1,
          company: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          'department.name': 1,
          'assignedStaff.name': 1,
          'assignedStaff.email': 1,
          'assignedStaff._id': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    res.json(jobs);
    
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireRole: 'admin',
  requireDb: true 
});