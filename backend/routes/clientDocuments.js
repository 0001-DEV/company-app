const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');
const ClientDocument = require('../models/ClientDocument');
const CompanyMapping = require('../models/CompanyMapping');
const multer = require('multer');
const XLSX = require('xlsx');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Get all client documents (exclude soft deleted)
router.get('/all', verifyUser, async (req, res) => {
  try {
    let query = { isDeleted: false };
    
    // If not admin, only show documents assigned to the user OR documents for companies assigned to the user
    if (req.user.role !== 'admin') {
      const assignedCompanies = await CompanyMapping.find({ 
        assignedStaff: req.user.id,
        isDeleted: false 
      }).select('_id');
      
      const companyIds = assignedCompanies.map(c => c._id);
      
      query = {
        isDeleted: false,
        $or: [
          { uploadedBy: req.user.id },
          { assignedStaff: req.user.id },
          { companyId: { $in: companyIds } }
        ]
      };
    }

    const documents = await ClientDocument.find(query)
      .populate('uploadedBy', 'name')
      .sort({ uploadDate: -1 });
    console.log(`📄 Documents fetched for ${req.user.role}:`, documents.length);
    res.json(documents);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

// Get recycle bin (soft deleted documents and companies)
router.get('/recycle-bin', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const documents = await ClientDocument.find({ isDeleted: true })
      .populate('uploadedBy', 'name')
      .populate('deletedBy', 'name')
      .sort({ deletedAt: -1 });
    
    const companies = await CompanyMapping.find({ isDeleted: true })
      .sort({ deletedAt: -1 });
    
    res.json({ docs: documents, companies });
  } catch (err) {
    console.error('Error fetching recycle bin:', err);
    res.status(500).json({ message: 'Error fetching recycle bin' });
  }
});

// Upload and process Excel file
router.post('/upload', verifyUser, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload endpoint hit');
    
    const { companyId, cardType } = req.body;
    if (!companyId) {
      return res.status(400).json({ message: 'Please select a company' });
    }

    // Verify company exists and user has access
    const company = await CompanyMapping.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // If not admin, check if assigned to company (using string comparison for safety)
    const isAssigned = company.assignedStaff.some(id => id.toString() === req.user.id);
    if (req.user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this company.' });
    }

    if (!cardType) {
      return res.status(400).json({ message: 'Please select a card type' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('✅ File received:', req.file.filename);

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Count valid rows (non-empty rows)
    const validRows = data.filter(row => {
      return Object.values(row).some(cell => cell !== null && cell !== undefined && cell !== '');
    });

    const quantity = validRows.length;
    if (quantity === 0) {
      return res.status(400).json({ message: 'No valid data found in the Excel sheet' });
    }

    // Save to database
    const clientDoc = await ClientDocument.create({
      companyId,
      companyName: company.companyName,
      fileName: req.file.originalname,
      cardType,
      quantity,
      uploadedBy: req.user.id,
      uploadedByName: req.user.name,
      history: [{
        action: 'created',
        quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        performedBy: req.user.id,
        performedByName: req.user.name,
        timestamp: new Date()
      }]
    });

    res.json({ 
      message: 'File uploaded successfully',
      document: clientDoc,
      quantity
    });
  } catch (err) {
    console.error('❌ Error uploading file:', err.message);
    res.status(500).json({ message: 'Error uploading file: ' + err.message });
  }
});

// Get documents for a specific company
router.get('/company/:companyId', verifyUser, async (req, res) => {
  try {
    const company = await CompanyMapping.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // If not admin, check if assigned to company (using string comparison for safety)
    const isAssigned = company.assignedStaff.some(id => id.toString() === req.user.id);
    if (req.user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this company.' });
    }
    
    const documents = await ClientDocument.find({ 
      companyId: req.params.companyId,
      isDeleted: false 
    })
      .populate('uploadedBy', 'name')
      .sort({ uploadDate: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error('Error fetching company documents:', err);
    res.status(500).json({ message: 'Error fetching company documents' });
  }
});

// Export single document with history
router.get('/export/:documentId', verifyUser, async (req, res) => {
  try {
    const document = await ClientDocument.findById(req.params.documentId);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // If not admin, check if user has access to this document
    if (req.user.role !== 'admin') {
      const company = await CompanyMapping.findById(document.companyId);
      const isAssignedToCompany = company && company.assignedStaff.some(id => id.toString() === req.user.id);
      const isUploader = document.uploadedBy.toString() === req.user.id.toString();
      const isAssignedToDoc = document.assignedStaff && document.assignedStaff.some(id => id.toString() === req.user.id);

      if (!isAssignedToCompany && !isUploader && !isAssignedToDoc) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Create summary sheet
    const summaryData = [{
      'Company Name': document.companyName,
      'Card Type': document.cardType,
      'File Name': document.fileName,
      'Current Quantity': document.quantity,
      'Upload Date': new Date(document.uploadDate).toLocaleDateString(),
      'Uploaded By': document.uploadedByName
    }];

    // Create history sheet (handle documents without history)
    const historyData = (document.history && document.history.length > 0)
      ? document.history.map(h => ({
          'Action': h.action.toUpperCase(),
          'Quantity Changed': h.quantity,
          'Previous Quantity': h.previousQuantity,
          'New Quantity': h.newQuantity,
          'Performed By': h.performedByName,
          'Date': new Date(h.timestamp).toLocaleDateString(),
          'Time': new Date(h.timestamp).toLocaleTimeString()
        }))
      : [{
          'Action': 'CREATED',
          'Quantity Changed': document.quantity,
          'Previous Quantity': 0,
          'New Quantity': document.quantity,
          'Performed By': document.uploadedByName,
          'Date': new Date(document.uploadDate).toLocaleDateString(),
          'Time': new Date(document.uploadDate).toLocaleTimeString()
        }];

    const workbook = XLSX.utils.book_new();
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    const historySheet = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(workbook, historySheet, 'History');

    const filename = `${document.companyName}-${document.cardType}-Report`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
  } catch (err) {
    console.error('Error exporting document:', err);
    res.status(500).json({ message: 'Error exporting document' });
  }
});

// Export all documents for a company (summary by card type)
router.get('/export-company/:companyId', verifyUser, async (req, res) => {
  try {
    const company = await CompanyMapping.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // If not admin, check if assigned to company (using string comparison for safety)
    const isAssigned = company.assignedStaff.some(id => id.toString() === req.user.id);
    if (req.user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const documents = await ClientDocument.find({ companyId: req.params.companyId, isDeleted: false })
      .sort({ uploadDate: -1 });
    
    if (documents.length === 0) return res.status(404).json({ message: 'No documents found for this company' });

    const companyName = company.companyName || 'Unknown';

    // Group documents by card type and calculate totals
    const cardTypeSummary = {};
    
    documents.forEach(doc => {
      if (!cardTypeSummary[doc.cardType]) {
        cardTypeSummary[doc.cardType] = {
          totalPurchased: 0,
          totalUsed: 0,
          entries: []
        };
      }
      
      // Sum up quantities from history
      let purchased = 0;
      let used = 0;
      
      if (doc.history && Array.isArray(doc.history)) {
        doc.history.forEach(entry => {
          if (entry.action === 'created' || entry.action === 'added') {
            purchased += entry.quantity || 0;
          } else if (entry.action === 'used' || entry.action === 'removed') {
            used += entry.quantity || 0;
          }
        });
      }
      
      cardTypeSummary[doc.cardType].totalPurchased += purchased;
      cardTypeSummary[doc.cardType].totalUsed += used;
      cardTypeSummary[doc.cardType].entries.push({
        fileName: doc.fileName,
        quantity: doc.quantity,
        uploadDate: new Date(doc.uploadDate).toLocaleDateString(),
        uploadedBy: doc.uploadedByName
      });
    });

    // Create summary sheet data
    const summaryData = Object.entries(cardTypeSummary).map(([cardType, data]) => ({
      'Card Type': cardType,
      'Total Purchased': data.totalPurchased,
      'Total Used': data.totalUsed,
      'Total Remaining': data.totalPurchased - data.totalUsed
    }));

    // Create detailed sheet data
    const detailedData = documents.map(doc => ({
      'Company Name': companyName,
      'Card Type': doc.cardType,
      'File Name': doc.fileName,
      'Quantity': doc.quantity,
      'Upload Date': new Date(doc.uploadDate).toLocaleDateString(),
      'Uploaded By': doc.uploadedByName
    }));

    const workbook = XLSX.utils.book_new();
    
    // Add summary sheet
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Add detailed sheet
    const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Details');

    const filename = `${companyName}-Documentation`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
  } catch (err) {
    console.error('Error exporting company summary:', err);
    res.status(500).json({ message: 'Error exporting summary' });
  }
});

// Delete document (soft delete - move to recycle bin)
router.delete('/:documentId', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const document = await ClientDocument.findByIdAndUpdate(
      req.params.documentId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
        deletedByName: req.user.name
      },
      { new: true }
    );
    res.json({ message: 'Document moved to recycle bin', document });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ message: 'Error deleting document' });
  }
});

// Permanently delete a document
router.delete('/:documentId/permanent', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await ClientDocument.findByIdAndDelete(req.params.documentId);
    res.json({ message: 'Document permanently deleted' });
  } catch (err) {
    console.error('Error permanently deleting document:', err);
    res.status(500).json({ message: 'Error permanently deleting document' });
  }
});

// Manual entry
router.post('/manual-entry', verifyUser, async (req, res) => {
  try {
    const { companyId, quantity, fileName, cardType } = req.body;
    console.log('📝 Manual entry request:', { companyId, quantity, fileName, cardType });
    
    if (!companyId || !quantity || !cardType) {
      return res.status(400).json({ message: 'Company, card type, and quantity are required' });
    }

    const company = await CompanyMapping.findById(companyId);
    console.log('🔍 Company found:', company);
    
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // If not admin, check access
    if (req.user.role !== 'admin' && !company.assignedStaff.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this company.' });
    }

    const clientDoc = await ClientDocument.create({
      companyId,
      companyName: company.companyName || 'Unknown',
      fileName: fileName || `Manual Entry - ${new Date().toLocaleDateString()}`,
      cardType,
      quantity: parseInt(quantity),
      uploadedBy: req.user.id,
      uploadedByName: req.user.name,
      history: [{
        action: 'created',
        quantity: parseInt(quantity),
        previousQuantity: 0,
        newQuantity: parseInt(quantity),
        performedBy: req.user.id,
        performedByName: req.user.name,
        timestamp: new Date()
      }]
    });

    console.log('✅ Manual entry created:', clientDoc);
    res.json({ message: 'Entry added successfully', document: clientDoc });
  } catch (err) {
    console.error('❌ Error adding manual entry:', err);
    res.status(500).json({ message: 'Error adding entry: ' + err.message });
  }
});

// Update document (add or remove cards) with history tracking
router.put('/:documentId/update', verifyUser, async (req, res) => {
  try {
    const { action, quantity } = req.body;
    if (!action || !quantity) {
      return res.status(400).json({ message: 'Action and quantity are required' });
    }

    const document = await ClientDocument.findById(req.params.documentId);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // If not admin, check if user has access to this document
    if (req.user.role !== 'admin') {
      const company = await CompanyMapping.findById(document.companyId);
      const isAssignedToCompany = company && company.assignedStaff.some(id => id.toString() === req.user.id);
      const isUploader = document.uploadedBy.toString() === req.user.id.toString();
      const isAssignedToDoc = document.assignedStaff && document.assignedStaff.some(id => id.toString() === req.user.id);

      if (!isAssignedToCompany && !isUploader && !isAssignedToDoc) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const quantityNum = parseInt(quantity);
    const previousQuantity = document.quantity;
    let newQuantity = previousQuantity;
    
    if (action === 'add') {
      newQuantity = previousQuantity + quantityNum;
      document.quantity = newQuantity;
    } else if (action === 'remove') {
      if (previousQuantity < quantityNum) {
        return res.status(400).json({ message: 'Cannot remove more than available' });
      }
      newQuantity = previousQuantity - quantityNum;
      document.quantity = newQuantity;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Add to history
    document.history.push({
      action: action === 'add' ? 'added' : 'removed',
      quantity: quantityNum,
      previousQuantity,
      newQuantity,
      performedBy: req.user.id,
      performedByName: req.user.name,
      timestamp: new Date()
    });

    await document.save();

    res.json({ message: 'Document updated successfully', document });
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ message: 'Error updating document: ' + err.message });
  }
});

// Assign job to document
router.put('/:documentId/assign-job', verifyUser, async (req, res) => {
  try {
    const document = await ClientDocument.findById(req.params.documentId);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // If not admin, check if user has access to this document
    if (req.user.role !== 'admin') {
      const company = await CompanyMapping.findById(document.companyId);
      const isAssignedToCompany = company && company.assignedStaff.some(id => id.toString() === req.user.id);
      const isUploader = document.uploadedBy.toString() === req.user.id.toString();

      if (!isAssignedToCompany && !isUploader) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const { job } = req.body;
    if (!job) return res.status(400).json({ message: 'Job is required' });

    document.assignedJob = job;
    await document.save();
    
    res.json({ message: 'Job assigned', document });
  } catch (err) {
    console.error('Error assigning job:', err);
    res.status(500).json({ message: 'Error assigning job' });
  }
});

// Assign staff to document
router.put('/:documentId/assign-staff', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const { staffIds, staffNames } = req.body;
    if (!staffIds || !Array.isArray(staffIds)) {
      return res.status(400).json({ message: 'Staff IDs array is required' });
    }

    const document = await ClientDocument.findByIdAndUpdate(
      req.params.documentId,
      { 
        assignedStaff: staffIds,
        assignedStaffNames: staffNames || []
      },
      { new: true }
    ).populate('assignedStaff', 'name email');
    
    res.json({ message: 'Staff assigned', document });
  } catch (err) {
    console.error('Error assigning staff:', err);
    res.status(500).json({ message: 'Error assigning staff' });
  }
});

// Get document history
router.get('/:documentId/history', verifyUser, async (req, res) => {
  try {
    const document = await ClientDocument.findById(req.params.documentId)
      .populate('history.performedBy', 'name email');
    
    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    // Handle documents without history (backward compatibility)
    const history = document.history && document.history.length > 0 
      ? document.history 
      : [{
          action: 'created',
          quantity: document.quantity,
          previousQuantity: 0,
          newQuantity: document.quantity,
          performedByName: document.uploadedByName,
          timestamp: document.uploadDate
        }];
    
    res.json({ 
      companyName: document.companyName,
      cardType: document.cardType,
      currentQuantity: document.quantity,
      history
    });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

module.exports = router;

// Get card usage report for a company
router.get('/card-usage-report/:companyId', verifyUser, async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Get all documents for this company
    const documents = await ClientDocument.find({ 
      companyId: companyId,
      isDeleted: false 
    }).sort({ uploadDate: 1 });

    if (documents.length === 0) {
      return res.json({
        companyName: 'Unknown Company',
        cardTypes: [],
        history: []
      });
    }

    const companyName = documents[0].companyName;
    
    // Group by card type and calculate usage
    const cardTypeMap = {};
    const allHistory = [];

    documents.forEach(doc => {
      const cardType = doc.cardType;
      
      if (!cardTypeMap[cardType]) {
        cardTypeMap[cardType] = {
          cardType: cardType,
          totalQuantity: 0,
          cardsUsed: 0,
          remaining: 0
        };
      }

      // Calculate total quantity from all entries (created + added)
      if (doc.history && doc.history.length > 0) {
        doc.history.forEach(entry => {
          if (entry.action === 'created' || entry.action === 'added') {
            cardTypeMap[cardType].totalQuantity += entry.quantity;
          }
          if (entry.action === 'removed') {
            cardTypeMap[cardType].cardsUsed += entry.quantity;
          }
          
          // Add to all history
          allHistory.push({
            cardType: cardType,
            action: entry.action,
            quantity: entry.quantity,
            timestamp: entry.timestamp
          });
        });
      } else {
        // If no history, use current quantity as total
        cardTypeMap[cardType].totalQuantity += doc.quantity;
      }

      // Current remaining
      cardTypeMap[cardType].remaining = doc.quantity;
    });

    // Convert map to array
    const cardTypes = Object.values(cardTypeMap);

    // Sort history by date
    allHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      companyName: companyName,
      cardTypes: cardTypes,
      history: allHistory
    });
  } catch (err) {
    console.error('Error generating card usage report:', err);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Public endpoint for viewing card usage report (no auth required)
router.get('/public/card-usage-report/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Get all documents for this company
    const documents = await ClientDocument.find({ 
      companyId: companyId,
      isDeleted: false 
    }).sort({ uploadDate: 1 });

    if (documents.length === 0) {
      return res.json({
        companyName: 'Unknown Company',
        cardTypes: [],
        history: []
      });
    }

    const companyName = documents[0].companyName;
    
    // Group by card type and calculate usage
    const cardTypeMap = {};
    const allHistory = [];

    documents.forEach(doc => {
      const cardType = doc.cardType;
      
      if (!cardTypeMap[cardType]) {
        cardTypeMap[cardType] = {
          cardType: cardType,
          totalQuantity: 0,
          cardsUsed: 0,
          remaining: 0
        };
      }

      // Calculate total quantity from all entries (created + added)
      if (doc.history && doc.history.length > 0) {
        doc.history.forEach(entry => {
          if (entry.action === 'created' || entry.action === 'added') {
            cardTypeMap[cardType].totalQuantity += entry.quantity;
          }
          if (entry.action === 'removed') {
            cardTypeMap[cardType].cardsUsed += entry.quantity;
          }
          
          // Add to all history
          allHistory.push({
            cardType: cardType,
            action: entry.action,
            quantity: entry.quantity,
            timestamp: entry.timestamp
          });
        });
      } else {
        // If no history, use current quantity as total
        cardTypeMap[cardType].totalQuantity += doc.quantity;
      }

      // Current remaining
      cardTypeMap[cardType].remaining = doc.quantity;
    });

    // Convert map to array
    const cardTypes = Object.values(cardTypeMap);

    // Sort history by date
    allHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      companyName: companyName,
      cardTypes: cardTypes,
      history: allHistory
    });
  } catch (err) {
    console.error('Error generating public card usage report:', err);
    res.status(500).json({ message: 'Error generating report' });
  }
});

module.exports = router;
