const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Aggregate to get documents with uploader details
    const documents = await req.db.collection('clientdocuments').aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploadedBy'
        }
      },
      {
        $unwind: {
          path: '$uploadedBy',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          companyId: 1,
          companyName: 1,
          fileName: 1,
          cardType: 1,
          quantity: 1,
          uploadDate: 1,
          'uploadedBy.name': 1
        }
      },
      { $sort: { uploadDate: -1 } }
    ]).toArray();
    
    console.log('📄 Documents fetched:', documents.length);
    res.json(documents);
    
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireRole: 'admin',
  requireDb: true 
});