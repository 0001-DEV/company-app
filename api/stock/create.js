const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, quantity, unit } = req.body || {};
  
  if (!name || quantity === undefined) {
    return res.status(400).json({ message: 'Name and quantity are required' });
  }
  
  const stockName = String(name).trim();

  try {
    // Check if stock already exists
    const existing = await req.db.collection('stocks').findOne({ 
      name: { $regex: new RegExp('^' + stockName + '$', 'i') } 
    });
    
    if (existing) {
      return res.status(400).json({ message: `Stock with name "${stockName}" already exists` });
    }
    
    const stock = {
      name: stockName,
      currentQuantity: parseInt(quantity),
      unit: unit || 'pcs',
      createdAt: new Date(),
      updatedAt: new Date(),
      transactions: [{
        type: 'add',
        quantity: parseInt(quantity),
        reason: 'Initial stock',
        addedBy: new ObjectId(req.user.id),
        addedByName: req.user.name,
        date: new Date()
      }]
    };
    
    const result = await req.db.collection('stocks').insertOne(stock);
    stock._id = result.insertedId;
    
    res.json(stock);
  } catch (error) {
    console.error('Error creating stock:', error);
    res.status(500).json({ message: 'Error creating stock: ' + error.message });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
