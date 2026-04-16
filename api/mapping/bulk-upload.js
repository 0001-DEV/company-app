const { withMiddleware } = require('../middleware');
const xlsx = require('xlsx');
const multer = require('multer');

// Helper to process multipart form data in serverless environment
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

const upload = multer({ storage: multer.memoryStorage() });

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Group rows by company name, handling empty company names (continuation rows)
    const groupedByCompany = {};
    let currentCompany = null;

    data.forEach(row => {
      let companyName = row['MAPPED CLIENT'] || row['Company Name'] || row.companyName || row.Name || row.Company;
      
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

    const companies = Object.entries(groupedByCompany).map(([companyName, rows]) => {
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

      const firstRow = rows[0];

      return {
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
        assignedStaff: [],
        monthUploaded: new Date().toLocaleString('en-US', { month: 'long' }),
        yearUploaded: new Date().getFullYear(),
        fullDateUploaded: new Date()
      };
    });

    if (companies.length === 0) {
      return res.status(400).json({ message: 'No valid company data found in file' });
    }

    const result = await req.db.collection('companymappings').insertMany(companies);
    
    res.status(201).json({ 
      message: `${result.insertedCount} companies uploaded successfully`, 
      companies: result.insertedIds 
    });
    
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: `Error processing bulk upload: ${error.message}` });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});

// Configure body parser for multer
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
