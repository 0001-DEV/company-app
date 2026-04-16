const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    const admin = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error verifying password:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
