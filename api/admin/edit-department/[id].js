const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { name, description } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Department ID is required' });
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Department name cannot be empty' });
  }

  try {
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

    if (!result.value) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json(result.value);
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

