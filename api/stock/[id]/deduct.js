const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { quantity, reason } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Stock ID is required' });
  }

  try {
    const stockId = new ObjectId(id);
    const qty = parseInt(quantity);

    const stock = await req.db.collection('stocks').findOne({ _id: stockId });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    if (stock.currentQuantity < qty) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const result = await req.db.collection('stocks').findOneAndUpdate(
      { _id: stockId },
      { 
        $inc: { currentQuantity: -qty },
        $push: { 
          transactions: {
            type: 'deduct',
            quantity: qty,
            reason: reason || 'Deducted stock',
            addedBy: new ObjectId(req.user.id),
            addedByName: req.user.name,
            date: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    res.json(result);
  } catch (error) {
    console.error('Error deducting stock:', error);
    res.status(500).json({ message: 'Error deducting stock' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
