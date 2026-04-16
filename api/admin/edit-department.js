const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { name, description } = req.body || {};

  if (!id || !name || !name.trim()) {
    return res.status(400).json({ message: 'Department ID and name are required' });
  }

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Department ID format' });
    }

    const update = {
      name: name.trim()
    };

    if (typeof description === 'string') {
      update.description = description;
    }

    const result = await req.db.collection('departments').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json(result);
  } catch (error) {
    console.error('Error editing department:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});
