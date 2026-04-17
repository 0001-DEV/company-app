const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { companyId, quantity, fileName, cardType } = req.body || {};
  
  if (!companyId || !quantity || !cardType) {
    return res.status(400).json({ message: 'Company, card type, and quantity are required' });
  }

  try {
    const company = await req.db.collection('companymappings').findOne({ _id: new ObjectId(companyId) });
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // If not admin, check access
    const isAssigned = company.assignedStaff && company.assignedStaff.some(id => id.toString() === req.user.id.toString());
    if (req.user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this company.' });
    }

    const qty = parseInt(quantity);
    const clientDoc = {
      companyId: new ObjectId(companyId),
      companyName: company.companyName || 'Unknown',
      fileName: fileName || `Manual Entry - ${new Date().toLocaleDateString()}`,
      cardType,
      quantity: qty,
      uploadedBy: new ObjectId(req.user.id),
      uploadedByName: req.user.name,
      uploadDate: new Date(),
      isDeleted: false,
      history: [{
        action: 'created',
        quantity: qty,
        previousQuantity: 0,
        newQuantity: qty,
        performedBy: new ObjectId(req.user.id),
        performedByName: req.user.name,
        timestamp: new Date()
      }]
    };

    const result = await req.db.collection('clientdocuments').insertOne(clientDoc);
    clientDoc._id = result.insertedId;

    res.json({ message: 'Entry added successfully', document: clientDoc });
  } catch (err) {
    console.error('Error adding manual entry:', err);
    res.status(500).json({ message: 'Error adding entry: ' + err.message });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
