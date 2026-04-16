const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id: fileId } = req.query || {};
  const { comment } = req.body || {};

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
    
    // Update the comment inside the user's uploadedFiles array
    await req.db.collection('users').updateOne(
      { _id: userId, "uploadedFiles._id": new ObjectId(fileId) },
      { $set: { "uploadedFiles.$.comment": comment } }
    );
    
    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Error updating file comment:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
