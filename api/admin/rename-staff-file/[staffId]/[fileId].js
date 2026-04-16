const { withMiddleware } = require('../../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { staffId, fileId } = req.query || {};
  const { displayName } = req.body || {};

  if (!staffId || !fileId || !displayName) {
    return res.status(400).json({ message: 'Staff ID, File ID and new name are required' });
  }

  try {
    const adminId = new ObjectId(req.user.id);
    
    // Check permissions
    const access = await req.db.collection('workbankaccesses').findOne({}, { sort: { updatedAt: -1 } });
    const hasWorkBankAccess = access?.staffIds?.some(id => id.toString() === adminId.toString());

    if (req.user.role !== 'admin' && !hasWorkBankAccess) {
      return res.status(403).json({ message: 'You do not have permission to rename this file' });
    }

    const sId = new ObjectId(staffId);
    const fId = new ObjectId(fileId);

    const result = await req.db.collection('users').updateOne(
      { _id: sId, "uploadedFiles._id": fId },
      { $set: { "uploadedFiles.$.displayName": displayName } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Staff or file not found' });
    }

    res.json({ message: 'File renamed successfully' });
  } catch (error) {
    console.error('Error renaming staff file:', error);
    res.status(500).json({ message: 'Error renaming file' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
