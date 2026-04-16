const { withMiddleware } = require('../../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { staffId, fileId } = req.query || {};

  if (!staffId || !fileId) {
    return res.status(400).json({ message: 'Staff ID and File ID are required' });
  }

  try {
    const fId = new ObjectId(fileId);

    // Find the file in recycle bin first to get the path
    const item = await req.db.collection('recyclebin').findOne({ _id: fId });

    if (!item) {
      return res.status(404).json({ message: 'File not found in recycle bin' });
    }

    // Note: We don't delete from stored_files here automatically to prevent data loss, 
    // but in a production app you might want to cleanup the binary data too.
    
    // Remove from recycle bin
    await req.db.collection('recyclebin').deleteOne({ _id: fId });

    res.json({ message: 'File permanently deleted from database' });
  } catch (error) {
    console.error('Error permanently deleting file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
