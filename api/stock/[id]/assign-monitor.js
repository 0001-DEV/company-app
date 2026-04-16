const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { monitorId } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Stock ID is required' });
  }

  try {
    const stockId = new ObjectId(id);
    const mId = monitorId ? new ObjectId(monitorId) : null;

    const result = await req.db.collection('stocks').findOneAndUpdate(
      { _id: stockId },
      { 
        $set: { monitor: mId, updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error assigning monitor:', error);
    res.status(500).json({ message: 'Error assigning monitor' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
