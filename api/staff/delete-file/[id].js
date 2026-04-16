const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id: fileId } = req.query || {};

  if (!fileId) {
    return res.status(400).json({ message: 'File ID is required' });
  }

  try {
    const userId = new ObjectId(req.user.id);
    const user = await req.db.collection('users').findOne({ _id: userId });
    
    if (!user || !user.uploadedFiles) {
      return res.status(404).json({ message: 'User or files not found' });
    }

    const fileIndex = user.uploadedFiles.findIndex(f => f._id.toString() === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const file = user.uploadedFiles[fileIndex];
    const uploadTime = new Date(file.uploadedAt);
    const now = new Date();
    const hoursDiff = (now - uploadTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 1.5) {
      return res.status(403).json({ message: 'Cannot delete file after 1.5 hours' });
    }
    
    // We don't delete from stored_files here because it might be referenced elsewhere (though unlikely in this app's current state)
    // But for a cleaner system, we should delete the metadata from the user.
    
    await req.db.collection('users').updateOne(
      { _id: userId },
      { $pull: { uploadedFiles: { _id: new ObjectId(fileId) } } }
    );
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
