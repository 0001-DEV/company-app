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
    const adminId = new ObjectId(req.user.id);
    const admin = await req.db.collection('users').findOne({ _id: adminId });
    
    // Admins only, unless staff have access (backend will check)
    // Here we'll just check if it's admin role or has workbank access
    const access = await req.db.collection('workbankaccesses').findOne({}, { sort: { updatedAt: -1 } });
    const hasWorkBankAccess = access?.staffIds?.some(id => id.toString() === adminId.toString());

    if (req.user.role !== 'admin' && !hasWorkBankAccess) {
      return res.status(403).json({ message: 'You do not have permission to delete this file' });
    }

    const sId = new ObjectId(staffId);
    const fId = new ObjectId(fileId);

    const staffMember = await req.db.collection('users').findOne({ _id: sId });
    if (!staffMember || !staffMember.uploadedFiles) {
      return res.status(404).json({ message: 'Staff or file not found' });
    }

    const fileIndex = staffMember.uploadedFiles.findIndex(f => f._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = staffMember.uploadedFiles[fileIndex];

    // Move to recycle bin collection
    await req.db.collection('recyclebin').insertOne({
      ...file,
      originalStaffId: sId,
      deletedBy: adminId,
      deletedByName: req.user.name,
      deletedAt: new Date(),
      type: 'staff_work'
    });

    // Remove from staff's uploadedFiles array
    await req.db.collection('users').updateOne(
      { _id: sId },
      { $pull: { uploadedFiles: { _id: fId } } }
    );

    res.json({ message: 'File moved to recycle bin successfully' });
  } catch (error) {
    console.error('Error deleting staff file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
