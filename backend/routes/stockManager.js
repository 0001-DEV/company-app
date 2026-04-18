const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');
const StockManager = require('../models/StockManager');
const User = require('../models/User');

// Get all stock managers
router.get('/all', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const managers = await StockManager.find()
      .populate('staffId', 'name email')
      .populate('assignedBy', 'name')
      .sort({ assignedAt: -1 });

    res.json(managers);
  } catch (err) {
    console.error('Error fetching stock managers:', err);
    res.status(500).json({ message: 'Error fetching stock managers' });
  }
});

// Assign a staff member as stock manager
router.post('/assign', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }

    // Check if staff exists
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if already assigned
    const existing = await StockManager.findOne({ staffId });
    if (existing) {
      return res.status(400).json({ message: 'This staff member is already a stock manager' });
    }

    // Create new stock manager
    const manager = new StockManager({
      staffId,
      staffName: staff.name,
      staffEmail: staff.email,
      assignedBy: req.user.id
    });

    await manager.save();

    res.json({ message: 'Staff member assigned as stock manager', manager });
  } catch (err) {
    console.error('Error assigning stock manager:', err);
    res.status(500).json({ message: 'Error assigning stock manager' });
  }
});

// Remove a staff member from stock managers
router.delete('/remove/:staffId', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const { staffId } = req.params;

    const result = await StockManager.findOneAndDelete({ staffId });

    if (!result) {
      return res.status(404).json({ message: 'Stock manager not found' });
    }

    res.json({ message: 'Stock manager removed successfully' });
  } catch (err) {
    console.error('Error removing stock manager:', err);
    res.status(500).json({ message: 'Error removing stock manager' });
  }
});

// Check if current user is a stock manager
router.get('/check', verifyUser, async (req, res) => {
  try {
    const manager = await StockManager.findOne({ staffId: req.user.id });
    res.json({ isStockManager: !!manager });
  } catch (err) {
    console.error('Error checking stock manager status:', err);
    res.status(500).json({ message: 'Error checking status' });
  }
});

module.exports = router;
