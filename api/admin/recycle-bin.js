const { withMiddleware } = require('../middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const deletedFiles = await req.db.collection('recyclebin')
      .find({ type: 'staff_work' })
      .sort({ deletedAt: -1 })
      .toArray();
    
    // Format for the frontend
    const formatted = deletedFiles.map(item => ({
      _id: item._id,
      staffId: item.originalStaffId,
      staffName: item.staffName || 'Unknown Staff',
      deletedAt: item.deletedAt,
      deletedByName: item.deletedByName,
      file: {
        _id: item._id, // Original file ID
        originalName: item.originalName || 'Unknown File',
        displayName: item.displayName,
        path: item.path,
        uploadedAt: item.uploadedAt
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching recycle bin:', error);
    res.status(500).json({ message: 'Error fetching recycle bin' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
