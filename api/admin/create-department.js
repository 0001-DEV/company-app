const { withMiddleware } = require('../middleware');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, description } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  try {
    const trimmedName = name.trim();

    const existing = await req.db.collection('departments').findOne({ name: trimmedName });
    if (existing) {
      return res.status(400).json({ message: `Department "${trimmedName}" already exists` });
    }

    const department = {
      name: trimmedName,
      description: typeof description === 'string' ? description : '',
      createdAt: new Date()
    };

    const result = await req.db.collection('departments').insertOne(department);
    department._id = result.insertedId;

    return res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});

