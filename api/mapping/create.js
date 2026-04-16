const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Company name is required' });
  }

  const companyName = name.trim();

  try {
    // Check if company already exists
    let company = await req.db.collection('companymappings').findOne({ companyName });

    if (company) {
      if (company.isDeleted) {
        // Restore deleted company
        await req.db.collection('companymappings').updateOne(
          { _id: company._id },
          { 
            $set: { isDeleted: false },
            $unset: { deletedAt: "", deletedBy: "", deletedByName: "" },
            $addToSet: { assignedStaff: new ObjectId(req.user.id) }
          }
        );
        const updated = await req.db.collection('companymappings').findOne({ _id: company._id });
        return res.status(200).json(updated);
      } else {
        // Company exists and is active. Ensure current user is assigned.
        const userIdStr = req.user.id.toString();
        const isAssigned = company.assignedStaff && company.assignedStaff.some(id => id.toString() === userIdStr);
        
        if (!isAssigned) {
          await req.db.collection('companymappings').updateOne(
            { _id: company._id },
            { $addToSet: { assignedStaff: new ObjectId(req.user.id) } }
          );
          const updated = await req.db.collection('companymappings').findOne({ _id: company._id });
          return res.status(200).json(updated);
        }
        return res.status(400).json({ message: 'Company already exists and is already assigned to you' });
      }
    }

    // Create a new company
    const newMapping = {
      companyName,
      companyType: '',
      cardType: '',
      cardsProduced: 0,
      assignedStaff: [new ObjectId(req.user.id)],
      createdForClientDocsOnly: true,
      createdAt: new Date(),
      isDeleted: false
    };

    const result = await req.db.collection('companymappings').insertOne(newMapping);
    newMapping._id = result.insertedId;

    return res.status(201).json(newMapping);
  } catch (error) {
    console.error('Error creating company:', error);
    return res.status(500).json({ message: 'Error creating company: ' + error.message });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
