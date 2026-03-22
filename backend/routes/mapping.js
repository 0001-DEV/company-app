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
