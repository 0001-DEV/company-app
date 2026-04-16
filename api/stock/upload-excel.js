const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');
const xlsx = require('xlsx');
const multer = require('multer');

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
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let count = 0;
    for (const row of data) {
      const name = (row['Name'] || row['Stock Name'] || row['Item'] || '').toString().trim();
      const quantity = parseInt(row['Quantity'] || row['Qty'] || row['Initial Qty'] || 0);
      const unit = (row['Unit'] || 'pcs').toString().trim();

      if (name) {
        // Check if stock already exists
        const existing = await req.db.collection('stocks').findOne({ 
          name: { $regex: new RegExp('^' + name + '$', 'i') } 
        });
        
        if (!existing) {
          await req.db.collection('stocks').insertOne({
            name,
            currentQuantity: quantity,
            unit,
            createdAt: new Date(),
            updatedAt: new Date(),
            transactions: [{
              type: 'add',
              quantity,
              reason: 'Imported from Excel',
              addedBy: new ObjectId(req.user.id),
              addedByName: req.user.name,
              date: new Date()
            }]
          });
          count++;
        }
      }
    }

    res.json({ message: `${count} stocks imported successfully`, count });
  } catch (error) {
    console.error('Error uploading stock excel:', error);
    res.status(500).json({ message: 'Error uploading excel: ' + error.message });
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
