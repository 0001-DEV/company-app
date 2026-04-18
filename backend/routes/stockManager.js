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

    console.log('📋 All stock managers:', managers.length);
    managers.forEach(m => {
      console.log(`  - ${m.staffName} (${m.staffId?._id})`);
    });

    res.json(managers);
  } catch (err) {
    console.error('Error fetching stock managers:', err);
    res.status(500).json({ message: 'Error fetching stock managers' });
  }
});

// Assign a staff member as stock manager
router.post('/assign', verifyUser, async (req, res) => {
  try {
    console.log('📝 Assign stock manager request');
    console.log('Admin check - req.user.role:', req.user.role);
    if (req.user.role !== 'admin') {
      console.log('❌ Not admin, rejecting');
      return res.status(403).json({ message: 'Admin only' });
    }

    const { staffId } = req.body;
    console.log('📌 Assigning staffId:', staffId);

    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }

    // Check if staff exists
    const staff = await User.findById(staffId);
    console.log('👤 Staff found:', staff?.name, 'ID:', staff?._id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if already assigned
    const existing = await StockManager.findOne({ staffId });
    console.log('🔍 Existing manager record:', existing);
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

    console.log('💾 Saving manager:', manager);
    await manager.save();
    console.log('✅ Manager saved successfully:', manager._id);

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
    console.log('🔍 Stock manager check for userId:', req.user.id);
    const manager = await StockManager.findOne({ staffId: req.user.id });
    console.log('📋 Manager record found:', !!manager);
    if (manager) {
      console.log('✅ User is stock manager');
    } else {
      console.log('❌ User is not a stock manager');
    }
    res.json({ isStockManager: !!manager });
  } catch (err) {
    console.error('Error checking stock manager status:', err);
    res.status(500).json({ message: 'Error checking status' });
  }
});

// DEBUG: Get all stock managers (for debugging)
router.get('/debug/all', async (req, res) => {
  try {
    const managers = await StockManager.find().lean();
    console.log('🔍 DEBUG: All stock managers in database:', managers);
    res.json({ 
      count: managers.length,
      managers: managers.map(m => ({
        staffId: m.staffId.toString(),
        staffName: m.staffName,
        staffEmail: m.staffEmail,
        assignedAt: m.assignedAt
      }))
    });
  } catch (err) {
    console.error('Error in debug endpoint:', err);
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;
