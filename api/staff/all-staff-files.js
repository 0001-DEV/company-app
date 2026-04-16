const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = new ObjectId(req.user.id);
    const currentUser = await req.db.collection('users').findOne({ _id: userId });
    
    // Check if user is admin or has permission to view others' work
    if (req.user.role !== 'admin' && !currentUser.canViewOthersWork) {
      return res.status(403).json({ message: 'You do not have permission to view others work' });
    }
    
    // Fetch all staff users and their uploaded files
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
          uploadedFiles: 1,
          department: 1
        }
      }
    ]).toArray();
    
    const allFiles = [];
    staff.forEach(s => {
      if (s.uploadedFiles && Array.isArray(s.uploadedFiles)) {
        s.uploadedFiles.forEach(file => {
          allFiles.push({
            fileId: file._id,
            staffId: s._id,
            staffName: s.name,
            staffEmail: s.email,
            department: s.department?.name || 'N/A',
            fileName: file.displayName || file.originalName || file.fileName,
            filePath: file.path || file.filePath,
            comment: file.comment,
            uploadedAt: file.uploadedAt
          });
        });
      }
    });
    
    // Sort by upload date (newest first)
    allFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    res.json(allFiles);
  } catch (error) {
    console.error('Error fetching all staff files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
