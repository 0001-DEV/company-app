const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');
const CompanyStaff = require('../models/CompanyStaff');
const CompanyMapping = require('../models/CompanyMapping');

// Get staff assigned to a company
router.get('/:companyId', verifyUser, async (req, res) => {
  try {
    const companyStaff = await CompanyStaff.findOne({ companyId: req.params.companyId })
      .populate('assignedStaff', 'name email')
      .populate('assignedBy', 'name');
    
    res.json(companyStaff || { companyId: req.params.companyId, assignedStaff: [], assignedStaffNames: [] });
  } catch (err) {
    console.error('Error fetching company staff:', err);
    res.status(500).json({ message: 'Error fetching company staff' });
  }
});

// Assign staff to company (applies to all card types)
router.put('/:companyId/assign', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const { staffIds, staffNames } = req.body;
    if (!staffIds || !Array.isArray(staffIds)) {
      return res.status(400).json({ message: 'Staff IDs array is required' });
    }

    const company = await CompanyMapping.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    let companyStaff = await CompanyStaff.findOne({ companyId: req.params.companyId });
    
    if (!companyStaff) {
      companyStaff = await CompanyStaff.create({
        companyId: req.params.companyId,
        companyName: company.companyName,
        assignedStaff: staffIds,
        assignedStaffNames: staffNames || [],
        assignedBy: req.user.id,
        assignedByName: req.user.name
      });
    } else {
      companyStaff.assignedStaff = staffIds;
      companyStaff.assignedStaffNames = staffNames || [];
      companyStaff.updatedAt = new Date();
      await companyStaff.save();
    }

    await companyStaff.populate('assignedStaff', 'name email');
    res.json({ message: 'Staff assigned to company', companyStaff });
  } catch (err) {
    console.error('Error assigning staff:', err);
    res.status(500).json({ message: 'Error assigning staff: ' + err.message });
  }
});

// Assign staff to company via POST (alternative endpoint)
router.post('/assign', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const { companyId, staffIds, staffNames } = req.body;
    if (!companyId || !staffIds || !Array.isArray(staffIds)) {
      return res.status(400).json({ message: 'Company ID and staff IDs array are required' });
    }

    const company = await CompanyMapping.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    let companyStaff = await CompanyStaff.findOne({ companyId });
    
    if (!companyStaff) {
      companyStaff = await CompanyStaff.create({
        companyId,
        companyName: company.companyName,
        assignedStaff: staffIds,
        assignedStaffNames: staffNames || [],
        assignedBy: req.user.id,
        assignedByName: req.user.name
      });
    } else {
      companyStaff.assignedStaff = staffIds;
      companyStaff.assignedStaffNames = staffNames || [];
      companyStaff.updatedAt = new Date();
      await companyStaff.save();
    }

    await companyStaff.populate('assignedStaff', 'name email');
    res.json({ message: 'Staff assigned to company', companyStaff });
  } catch (err) {
    console.error('Error assigning staff:', err);
    res.status(500).json({ message: 'Error assigning staff: ' + err.message });
  }
});

// Remove staff from company
router.delete('/:companyId', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    await CompanyStaff.findOneAndDelete({ companyId: req.params.companyId });
    res.json({ message: 'Staff assignment removed' });
  } catch (err) {
    console.error('Error removing staff:', err);
    res.status(500).json({ message: 'Error removing staff' });
  }
});

module.exports = router;
