const { withMiddleware } = require('../middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const stocks = await req.db.collection('stocks').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'monitor',
          foreignField: '_id',
          as: 'monitor'
        }
      },
      {
        $unwind: {
          path: '$monitor',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();
    
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: 'Error fetching stocks' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
