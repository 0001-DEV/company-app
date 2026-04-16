const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { name } = req.body || {};

  if (!id || !name || !name.trim()) {
    return res.status(400).json({ message: 'Stock ID and name are required' });
  }

  try {
    const stockId = new ObjectId(id);
    const stockName = name.trim();

    const existing = await req.db.collection('stocks').findOne({ 
      _id: { $ne: stockId },
      name: { $regex: new RegExp('^' + stockName + '$', 'i') } 
    });
    
    if (existing) {
      return res.status(400).json({ message: `Stock with name "${stockName}" already exists` });
    }

    const result = await req.db.collection('stocks').findOneAndUpdate(
      { _id: stockId },
      { 
        $set: { name: stockName, updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating stock name:', error);
    res.status(500).json({ message: 'Error updating stock name' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
