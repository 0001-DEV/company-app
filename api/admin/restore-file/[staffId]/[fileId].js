const { withMiddleware } = require('../../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { staffId, fileId } = req.query || {};

  if (!staffId || !fileId) {
    return res.status(400).json({ message: 'Staff ID and File ID are required' });
  }

  try {
    const sId = new ObjectId(staffId);
    const fId = new ObjectId(fileId);

    // Find the file in recycle bin
    const item = await req.db.collection('recyclebin').findOne({ 
      originalStaffId: sId, 
      _id: fId 
    });

    if (!item) {
      return res.status(404).json({ message: 'File not found in recycle bin' });
    }

    // Prepare file metadata for restoration
    const fileMetadata = {
      _id: item._id,
      path: item.path,
      originalName: item.originalName,
      displayName: item.displayName || item.originalName,
      comment: item.comment || '',
      uploadedAt: item.uploadedAt || new Date()
    };

    // Restore to staff's uploadedFiles array
    await req.db.collection('users').updateOne(
      { _id: sId },
      { $push: { uploadedFiles: fileMetadata } }
    );

    // Remove from recycle bin
    await req.db.collection('recyclebin').deleteOne({ _id: fId });

    res.json({ message: 'File restored successfully' });
  } catch (error) {
    console.error('Error restoring file:', error);
    res.status(500).json({ message: 'Error restoring file' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
