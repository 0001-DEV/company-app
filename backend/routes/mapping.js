const express = require('express');
const router = express.Router();
const CompanyMapping = require('../models/CompanyMapping');
const MappingAccess = require('../models/MappingAccess');
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

    console.log('📊 Uploaded data:', JSON.stringify(data.slice(0, 5), null, 2));

    // Group rows by company name, handling empty company names (continuation rows)
    const groupedByCompany = {};
    let currentCompany = null;

    data.forEach(row => {
      let companyName = row['MAPPED CLIENT'] || row['Company Name'] || row.companyName || row.Name || row.Company;
      
      // If company name is empty/null, use the previous company (continuation row)
      if (!companyName || !companyName.toString().trim()) {
        companyName = currentCompany;
      } else {
        currentCompany = companyName.toString().trim();
      }

      if (companyName && companyName.toString().trim()) {
        if (!groupedByCompany[companyName]) {
          groupedByCompany[companyName] = [];
        }
        groupedByCompany[companyName].push(row);
      }
    });

    console.log('🏢 Grouped companies:', Object.keys(groupedByCompany));

    const parseCheckbox = (val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val.toLowerCase() === 'yes' || val.toLowerCase() === 'true';
      return false;
    };

    const safeParseInt = (val) => {
      if (val === null || val === undefined || val === '') return 0;
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Create one document per company, combining all card types
    const companies = Object.entries(groupedByCompany).map(([companyName, rows]) => {
      try {
        // Combine all card types into JSON format
        const cardTypes = rows.map(row => {
          const type = (row['ID Card Types'] || row['ID Card Types '] || row['ID CARD TYPES & QTY'] || '').toString().trim();
          const qty = safeParseInt(row['Card Number'] || row['Card Qty'] || row['Card Quantity']);
          return { type, quantity: qty };
        }).filter(ct => ct.type && ct.type !== '');

        const businessCardTypes = rows.map(row => {
          const type = (row['Business Card Type'] || row['BUSINESS CARD TYPE & QTY'] || '').toString().trim();
          const qty = safeParseInt(row['Business Card No'] || row['Biz Card Qty'] || row['Business Card Quantity']);
          return { type, quantity: qty };
        }).filter(bct => bct.type && bct.type !== '');

        // Use first row for common fields
        const firstRow = rows[0];

        const mapping = {
          companyName: companyName.toString().trim(),
          companyType: (firstRow['Industry/Type'] || firstRow.companyType || firstRow.Type || firstRow.Industry || '').toString().trim(),
          cardType: JSON.stringify(cardTypes),
          cardsProduced: 0,
          businessCardType: JSON.stringify(businessCardTypes),
          businessCardNo: 0,
          cardHolderType: (firstRow['Card Holder type'] || firstRow['CARD HOLDER TYPE'] || firstRow['Card Holder Type'] || '').toString().trim(),
          cardHolderNumber: safeParseInt(firstRow['Card Holder number'] || firstRow['HOLDER QTY'] || firstRow['Holder Qty']),
          lanyard: (firstRow['Lanyard'] || firstRow['LANYARD'] || '').toString().trim(),
          dateSent: (firstRow['Date sent'] || firstRow['DATE SENT'] || firstRow['Date Sent']) ? new Date(firstRow['Date sent'] || firstRow['DATE SENT'] || firstRow['Date Sent']) : null,
          delivered: parseCheckbox(firstRow['Delivered'] || firstRow['DELIVERED']),
          reachedOut: (firstRow['Reached out'] || firstRow['REACHED OUT'] || firstRow['Reached Out'] || '').toString().trim(),
          clientComment: (firstRow['Client Feedback'] || firstRow.clientComment || '').toString().trim(),
          assignedStaff: [], // Empty - all assigned staff can see all companies
          monthUploaded: new Date().toLocaleString('en-US', { month: 'long' }),
          yearUploaded: new Date().getFullYear(),
          fullDateUploaded: new Date()
        };

        console.log(`✅ Processed ${companyName}:`, mapping);
        return mapping;
      } catch (rowErr) {
        console.error(`❌ Error processing company ${companyName}:`, rowErr);
        throw rowErr;
      }
    });

    if (companies.length === 0) return res.status(400).json({ message: 'No valid company data found in file' });

    const savedCompanies = await CompanyMapping.insertMany(companies);
    console.log(`✅ Saved ${savedCompanies.length} companies`);
    res.status(201).json({ message: `${savedCompanies.length} companies uploaded successfully`, companies: savedCompanies });
  } catch (err) {
    console.error('❌ Bulk upload error:', err.message);
    res.status(500).json({ message: `Error processing bulk upload: ${err.message}` });
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
      assignedStaff: [req.user.id],
      createdForClientDocsOnly: true
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
router.get('/', verifyUser, async (req, res) => {
  try {
    // Allow admins and assigned staff to see all mappings
    if (req.user.role !== 'admin') {
      // Check if user is in assigned staff list (stored in database or localStorage)
      // For now, we'll allow all staff to see all mappings if they have access
      // In production, you might want to store this in the database
    }
    
    const mappings = await CompanyMapping.find({ 
      createdForClientDocsOnly: { $ne: true },
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    }).populate('assignedStaff', 'name email').sort({ createdAt: -1 });
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
    // Allow admins and assigned staff to delete
    // For now, we allow all verified users to delete
    // In production, you might want to check if they're in the assigned staff list
    
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

// Assign staff and update company info (Admin only for assignments)
router.put('/assign/:id', verifyUser, async (req, res) => {
  try {
    // Allow admins to assign staff
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign staff' });
    }
    
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
    const notDeletedFilter = {
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }
      ]
    };
    
    if (req.user.role === 'admin') {
      mappings = await CompanyMapping.find(notDeletedFilter).populate('assignedStaff', 'name email').sort({ createdAt: -1 });
    } else {
      mappings = await CompanyMapping.find({ 
        assignedStaff: req.user.id,
        ...notDeletedFilter
      }).populate('assignedStaff', 'name email').sort({ createdAt: -1 });
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
    const { 
      companyName, cardType, cardsProduced, businessCardType, businessCardNo, 
      cardHolderType, cardHolderNumber, lanyard, dateSent, delivered, reachedOut, 
      clientComment 
    } = req.body;
    
    // Check if user is admin or assigned to this mapping
    const mapping = await CompanyMapping.findById(req.params.id);
    if (!mapping) return res.status(404).json({ message: 'Mapping not found' });

    if (req.user.role !== 'admin' && !mapping.assignedStaff.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this company.' });
    }

    const updateData = {
      updatedAt: Date.now()
    };

    if (companyName !== undefined) updateData.companyName = companyName;
    if (cardType !== undefined) updateData.cardType = cardType;
    if (cardsProduced !== undefined) updateData.cardsProduced = cardsProduced;
    if (businessCardType !== undefined) updateData.businessCardType = businessCardType;
    if (businessCardNo !== undefined) updateData.businessCardNo = businessCardNo;
    if (cardHolderType !== undefined) updateData.cardHolderType = cardHolderType;
    if (cardHolderNumber !== undefined) updateData.cardHolderNumber = cardHolderNumber;
    if (lanyard !== undefined) updateData.lanyard = lanyard;
    if (dateSent !== undefined) updateData.dateSent = dateSent ? new Date(dateSent) : null;
    if (delivered !== undefined) updateData.delivered = delivered;
    if (reachedOut !== undefined) updateData.reachedOut = reachedOut;
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

// Get mapping page access list
router.get('/access/staff-list', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    // Get all staff
    const User = require('../models/User');
    const staff = await User.find({ role: 'staff' }).select('_id name email').sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Error fetching staff' });
  }
});

// Update mapping page access
router.post('/access/update', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const { staffIds } = req.body;
    
    // Delete existing access and create new one
    await MappingAccess.deleteMany({});
    const access = new MappingAccess({
      staffIds: staffIds || [],
      updatedAt: new Date(),
      updatedBy: req.user.id
    });
    await access.save();
    
    res.json({ message: 'Access updated', access });
  } catch (err) {
    console.error('Error updating access:', err);
    res.status(500).json({ message: 'Error updating access' });
  }
});

// Get mapping page access
router.get('/access/get', verifyUser, async (req, res) => {
  try {
    const access = await MappingAccess.findOne().sort({ updatedAt: -1 });
    
    if (!access) {
      return res.json({ staffIds: [] });
    }
    
    res.json({ staffIds: access.staffIds || [] });
  } catch (err) {
    console.error('Error getting access:', err);
    res.status(500).json({ message: 'Error getting access' });
  }
});

// Check if user has mapping page access
router.get('/access/check', verifyUser, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({ hasAccess: true });
    }
    
    const access = await MappingAccess.findOne().sort({ updatedAt: -1 });
    
    const hasAccess = access && access.staffIds && access.staffIds.includes(req.user.id);
    res.json({ hasAccess: hasAccess || false });
  } catch (err) {
    console.error('Error checking access:', err);
    res.status(500).json({ message: 'Error checking access' });
  }
});

module.exports = router;
