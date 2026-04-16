const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { email, password } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Staff ID is required' });
  }

  try {
    const update = {};
    if (email) update.email = email.toLowerCase().trim();
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const result = await req.db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id), role: 'staff' },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    return res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Error updating staff credentials:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
