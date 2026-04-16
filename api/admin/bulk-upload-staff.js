const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
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

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames?.[0];
    if (!sheetName) {
      return res.status(400).json({ message: 'Invalid Excel file: no sheet found' });
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    let createdCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const name = (row.Name || row.FullName || row.name || '').toString().trim();
      const email = (row.Email || row.email || '').toString().trim().toLowerCase();
      const phone = (row.Phone || row.phone || row.PhoneNumber || row['Phone Number'] || '').toString().trim();
      const password = (row.Password || row.password || '').toString().trim() || '123456';
      const deptName = (row.Department || row.DepartmentName || row.department || '').toString().trim();
      const birthdayRaw = row.Birthday || row.birthday || row.DOB || row.dob || '';
      const picture = (row.Picture || row.ProfilePicture || row.picture || row.profilePicture || '').toString().trim();

      if (!name || !email) {
        skippedCount++;
        continue;
      }

      const existing = await req.db.collection('users').findOne({ email });
      if (existing) {
        skippedCount++;
        continue;
      }

      let departmentId = undefined;
      if (deptName) {
        let dept = await req.db.collection('departments').findOne({ name: deptName });
        if (!dept) {
          const deptResult = await req.db.collection('departments').insertOne({ name: deptName, createdAt: new Date() });
          departmentId = deptResult.insertedId;
        } else {
          departmentId = dept._id;
        }
      }

      let birthday = undefined;
      if (birthdayRaw) {
        const d = new Date(birthdayRaw);
        if (!Number.isNaN(d.getTime())) {
          birthday = d;
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await req.db.collection('users').insertOne({
        name,
        email,
        phone,
        password: hashedPassword,
        plainPassword: password,
        role: 'staff',
        department: departmentId,
        birthday: birthday,
        profilePicture: picture,
        assignedJobs: [],
        createdAt: new Date()
      });

      createdCount++;
    }

    res.json({ message: 'Bulk upload completed', createdCount, skippedCount });
  } catch (error) {
    console.error('Bulk upload staff error:', error);
    res.status(500).json({ message: error.message || 'Bulk upload failed' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
