const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { addCardsUsed, addTotalCardsPaid, deductionNote, status } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  try {
    const userId = new ObjectId(req.user.id);
    const projectId = new ObjectId(id);

    const project = await req.db.collection('clientprojects').findOne({ _id: projectId, monitors: userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found or you are not an assigned monitor' });
    }

    const update = { $set: { updatedAt: new Date() } };
    
    if (status) {
      update.$set.status = status;
    }

    // Handle adding paid cards (Monitors can do this)
    if (addTotalCardsPaid) {
      const amount = Number(addTotalCardsPaid);
      if (!isNaN(amount) && amount > 0) {
        const paymentLog = {
          amount,
          date: new Date(),
          performedBy: req.user.name || 'Staff (Monitor)',
          _id: new ObjectId()
        };
        update.$inc = { ...update.$inc, totalCardsPaid: amount };
        update.$push = { ...update.$push, paymentHistory: paymentLog };
      } else {
        return res.status(400).json({ message: 'Invalid amount for payment' });
      }
    }

    // Handle deducting cards
    if (addCardsUsed) {
      const amount = Number(addCardsUsed);
      if (!isNaN(amount) && amount !== 0) {
        const newLog = {
          amount,
          note: deductionNote || '',
          date: new Date(),
          performedBy: req.user.name || 'Staff',
          _id: new ObjectId()
        };
        update.$inc = { ...update.$inc, cardsUsed: amount };
        update.$push = { ...update.$push, deductionHistory: newLog };
      }
    }

    const result = await req.db.collection('clientprojects').findOneAndUpdate(
      { _id: projectId },
      update,
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Failed to update project' });
    }

    // Populate monitors manually
    const monitorIds = result.monitors || [];
    const monitors = await req.db.collection('users')
      .find({ _id: { $in: monitorIds } })
      .project({ name: 1, email: 1 })
      .toArray();

    res.json({ ...result, monitors });
  } catch (error) {
    console.error('Error updating client project:', error);
    res.status(500).json({ message: 'Error updating client project' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
