const express = require('express');
const router = express.Router();
const CompanyMapping = require('../models/CompanyMapping');
const adminAuth = require('../middleware/adminAuth');
const { verifyUser } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');

// Multer setup for Excel uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Bulk upload companies from Excel/CSV
router.post('/bulk-upload', verifyUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const companies = data.map(row => ({
      companyName: row.companyName || row.Name || row.Company,
      companyType: row.companyType || row.Type || row.Industry || '',
      cardType: row.cardType || row.CardType || row['Card Type'] || '',
      cardsProduced: parseInt(row.cardsProduced || row.CardsProduced || row['Cards Produced']) || 0,
      assignedStaff: [req.user.id], // Auto-assign the uploader
      monthUploaded: new Date().toLocaleString('en-US', { month: 'long' }),
      yearUploaded: new Date().getFullYear(),
      fullDateUploaded: new Date()
    })).filter(c => c.companyName); // Ensure name exists

    if (companies.length === 0) return res.status(400).json({ message: 'No valid company data found in file' });

    const savedCompanies = await CompanyMapping.insertMany(companies);
    res.status(201).json({ message: `${savedCompanies.length} companies uploaded successfully`, companies: savedCompanies });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ message: 'Error processing bulk upload' });
  }
});

// Create a new company mapping
router.post('/', verifyUser, async (req, res) => {
  try {
    const { companyName, companyType, assignedStaff, cardType, cardsProduced } = req.body;
    
    let finalAssignedStaff = [];
    if (req.user.role === 'admin') {
      finalAssignedStaff = assignedStaff || [];
    } else {
      // Staff can only assign themselves
      finalAssignedStaff = [req.user.id];
    }

    const newMapping = new CompanyMapping({
      companyName,
      companyType,
      cardType: cardType || '',
      cardsProduced: cardsProduced || 0,
      assignedStaff: finalAssignedStaff
    });
    await newMapping.save();
    const populated = await CompanyMapping.findById(newMapping._id).populate('assignedStaff', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error creating company mapping' });
  }
});

// Create a new company (simple endpoint for client documentation)
router.post('/create', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    // Check if company already exists
    const existing = await CompanyMapping.findOne({ companyName: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    const newMapping = new CompanyMapping({
      companyName: name.trim(),
      companyType: '',
      cardType: '',
      cardsProduced: 0,
      assignedStaff: [req.user.id]
    });
    await newMapping.save();
    const populated = await CompanyMapping.findById(newMapping._id).populate('assignedStaff', 'name email');
    
    console.log('✅ New company created:', populated);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ message: 'Error creating company: ' + err.message });
  }
});

// 👑 Admin only routes

// Get all company mappings (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const mappings = await CompanyMapping.find().populate('assignedStaff', 'name email').sort({ createdAt: -1 });
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mappings' });
  }
});

// Get all companies (for dropdowns - admin only)
router.get('/all', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    // Include companies where isDeleted is false OR isDeleted doesn't exist (backward compatibility)
    const companies = await CompanyMapping.find({ 
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    }).select('_id companyName').sort({ companyName: 1 });
    console.log('🏢 Fetching all companies:', companies.length, 'companies');
    res.json(companies);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

// Get all companies including deleted (for admin view)
router.get('/all-with-deleted', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const companies = await CompanyMapping.find().select('_id companyName isDeleted').sort({ companyName: 1 });
    const active = companies.filter(c => !c.isDeleted && c.isDeleted !== undefined).length + companies.filter(c => !c.isDeleted && c.isDeleted === undefined).length;
    const deleted = companies.filter(c => c.isDeleted === true).length;
    console.log('📊 Total companies in DB:', companies.length, '| Active:', active, '| Deleted:', deleted);
    res.json(companies);
  } catch (err) {
    console.error('Error fetching all companies:', err);
    res.status(500).json({ message: 'Error fetching all companies' });
  }
});

// Get deleted companies (recycle bin)
router.get('/recycle-bin/all', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const companies = await CompanyMapping.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(companies);
  } catch (err) {
    console.error('Error fetching deleted companies:', err);
    res.status(500).json({ message: 'Error fetching deleted companies' });
  }
});

// Delete a company (soft delete)
router.delete('/:companyId', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const company = await CompanyMapping.findByIdAndUpdate(
      req.params.companyId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
        deletedByName: req.user.name
      },
      { new: true }
    );
    
    res.json({ message: 'Company moved to recycle bin', company });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ message: 'Error deleting company' });
  }
});

// Restore a company from recycle bin
router.put('/:companyId/restore', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const company = await CompanyMapping.findByIdAndUpdate(
      req.params.companyId,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deletedByName: null
      },
      { new: true }
    );
    
    res.json({ message: 'Company restored', company });
  } catch (err) {
    console.error('Error restoring company:', err);
    res.status(500).json({ message: 'Error restoring company' });
  }
});

// Permanently delete a company
router.delete('/:companyId/permanent', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await CompanyMapping.findByIdAndDelete(req.params.companyId);
    res.json({ message: 'Company permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting company:', err);
    res.status(500).json({ message: 'Error permanently deleting company' });
  }
});

// Delete a company mapping (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await CompanyMapping.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mapping deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting mapping' });
  }
});

// Assign staff and update company info (Admin only for assignments)
router.put('/assign/:id', adminAuth, async (req, res) => {
  try {
    const { staffIds, companyName, companyType, cardType, cardsProduced } = req.body;
    const updateData = { updatedAt: Date.now() };
    if (staffIds !== undefined) updateData.assignedStaff = staffIds;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyType !== undefined) updateData.companyType = companyType;
    if (cardType !== undefined) updateData.cardType = cardType;
    if (cardsProduced !== undefined) updateData.cardsProduced = cardsProduced;

    const mapping = await CompanyMapping.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedStaff', 'name email');
    res.json(mapping);
  } catch (err) {
    res.status(500).json({ message: 'Error updating mapping' });
  }
});

// 👥 General routes (Admin or Assigned Staff)

// Get mappings assigned to current staff
router.get('/my-mappings', verifyUser, async (req, res) => {
  try {
    let mappings;
    if (req.user.role === 'admin') {
      mappings = await CompanyMapping.find().populate('assignedStaff', 'name email').sort({ createdAt: -1 });
    } else {
      mappings = await CompanyMapping.find({ assignedStaff: req.user.id }).populate('assignedStaff', 'name email').sort({ createdAt: -1 });
    }
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assigned mappings' });
  }
});

// Get companies assigned to current staff (for Client Documentation)
router.get('/my-companies', verifyUser, async (req, res) => {
  try {
    let companies;
    if (req.user.role === 'admin') {
      // Admins see all active companies
      companies = await CompanyMapping.find({ 
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } }
        ]
      }).select('_id companyName').sort({ companyName: 1 });
    } else {
      // Staff see only companies they're assigned to
      companies = await CompanyMapping.find({ 
        assignedStaff: req.user.id,
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } }
        ]
      }).select('_id companyName').sort({ companyName: 1 });
    }
    res.json(companies);
  } catch (err) {
    console.error('Error fetching assigned companies:', err);
    res.status(500).json({ message: 'Error fetching assigned companies' });
  }
});

// Update mapping status/comment (Admin or Assigned Staff)
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const { isDesigned, isPackageSent, isPackageReceived, clientComment, cardType, cardsProduced } = req.body;
    
    // Check if user is admin or assigned to this mapping
    const mapping = await CompanyMapping.findById(req.params.id);
    if (!mapping) return res.status(404).json({ message: 'Mapping not found' });

    if (req.user.role !== 'admin' && !mapping.assignedStaff.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this company.' });
    }

    const updateData = {
      updatedAt: Date.now()
    };

    if (cardType !== undefined) updateData.cardType = cardType;
    if (cardsProduced !== undefined) updateData.cardsProduced = cardsProduced;

    // --- Strict Ticking/Unticking Rule ---
    
    if (isDesigned !== undefined) {
      if (isDesigned === true && mapping.isDesigned === false) {
        // Ticking for the first time
        updateData.isDesigned = true;
        updateData.isDesignedAt = Date.now();
        updateData.isDesignedBy = req.user.name;
        updateData.isDesignedById = req.user.id;
      } else if (isDesigned === false && mapping.isDesigned === true) {
        // Attempting to untick
        if (mapping.isDesignedById && mapping.isDesignedById.toString() !== req.user.id) {
          return res.status(403).json({ message: `Accountability Rule: Only ${mapping.isDesignedBy} who performed this task can untick it.` });
        }
        updateData.isDesigned = false;
        updateData.isDesignedAt = null;
        updateData.isDesignedBy = null;
        updateData.isDesignedById = null;
      }
    }

    if (isPackageSent !== undefined) {
      if (isPackageSent === true && mapping.isPackageSent === false) {
        // Ticking for the first time
        updateData.isPackageSent = true;
        updateData.isPackageSentAt = Date.now();
        updateData.isPackageSentBy = req.user.name;
        updateData.isPackageSentById = req.user.id;
      } else if (isPackageSent === false && mapping.isPackageSent === true) {
        // Attempting to untick
        if (mapping.isPackageSentById && mapping.isPackageSentById.toString() !== req.user.id) {
          return res.status(403).json({ message: `Accountability Rule: Only ${mapping.isPackageSentBy} who performed this task can untick it.` });
        }
        updateData.isPackageSent = false;
        updateData.isPackageSentAt = null;
        updateData.isPackageSentBy = null;
        updateData.isPackageSentById = null;
      }
    }

    if (isPackageReceived !== undefined) {
      if (isPackageReceived === true && mapping.isPackageReceived === false) {
        // Ticking for the first time
        updateData.isPackageReceived = true;
        updateData.isPackageReceivedAt = Date.now();
        updateData.isPackageReceivedBy = req.user.name;
        updateData.isPackageReceivedById = req.user.id;
      } else if (isPackageReceived === false && mapping.isPackageReceived === true) {
        // Attempting to untick
        if (mapping.isPackageReceivedById && mapping.isPackageReceivedById.toString() !== req.user.id) {
          return res.status(403).json({ message: `Accountability Rule: Only ${mapping.isPackageReceivedBy} who performed this task can untick it.` });
        }
        updateData.isPackageReceived = false;
        updateData.isPackageReceivedAt = null;
        updateData.isPackageReceivedBy = null;
        updateData.isPackageReceivedById = null;
      }
    }

    if (clientComment !== undefined) updateData.clientComment = clientComment;

    const updatedMapping = await CompanyMapping.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedStaff', 'name email');

    res.json(updatedMapping);
  } catch (err) {
    res.status(500).json({ message: 'Error updating mapping' });
  }
});

module.exports = router;
