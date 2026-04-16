const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const XLSX = require('xlsx');

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('file'));

    const { companyId, cardType } = req.body || {};
    if (!companyId) {
      return res.status(400).json({ message: 'Please select a company' });
    }

    // Verify company exists and user has access
    const company = await req.db.collection('companymappings').findOne({ _id: new ObjectId(companyId) });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // If not admin, check if assigned to company
    const isAssigned = company.assignedStaff && company.assignedStaff.some(id => id.toString() === req.user.id.toString());
    if (req.user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this company.' });
    }

    if (!cardType) {
      return res.status(400).json({ message: 'Please select a card type' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Count valid rows
    const validRows = data.filter(row => {
      return Object.values(row).some(cell => cell !== null && cell !== undefined && cell !== '');
    });

    const quantity = validRows.length;
    if (quantity === 0) {
      return res.status(400).json({ message: 'No valid data found in the Excel sheet' });
    }

    // Save to database
    const clientDoc = {
      companyId: new ObjectId(companyId),
      companyName: company.companyName,
      fileName: req.file.originalname,
      cardType,
      quantity,
      uploadedBy: new ObjectId(req.user.id),
      uploadedByName: req.user.name,
      uploadDate: new Date(),
      isDeleted: false,
      history: [{
        action: 'created',
        quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        performedBy: new ObjectId(req.user.id),
        performedByName: req.user.name,
        timestamp: new Date()
      }]
    };

    const result = await req.db.collection('clientdocuments').insertOne(clientDoc);
    
    res.json({ 
      message: 'File uploaded successfully',
      document: { ...clientDoc, _id: result.insertedId },
      quantity
    });
  } catch (error) {
    console.error('Error uploading client document:', error);
    res.status(500).json({ message: 'Error uploading file: ' + error.message });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
