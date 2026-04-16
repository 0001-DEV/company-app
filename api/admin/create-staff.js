const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
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
    await runMiddleware(req, res, upload.single('profilePicture'));

    const { name, email, phone, password, departmentId, birthday } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = new ObjectId();
    let profilePicturePath = '';

    if (req.file) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      await req.db.collection('stored_files').insertOne({
        _id: new ObjectId(),
        filename: filename,
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
        data: req.file.buffer,
        uploadedBy: new ObjectId(req.user.id),
        uploadedAt: new Date()
      });
      profilePicturePath = `/uploads/${filename}`;
    }

    const newUser = {
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      password: hashedPassword,
      plainPassword: password,
      role: 'staff',
      department: departmentId ? new ObjectId(departmentId) : null,
      profilePicture: profilePicturePath,
      birthday: birthday && birthday !== '' ? new Date(birthday) : undefined,
      createdAt: new Date(),
      assignedJobs: []
    };

    await req.db.collection('users').insertOne(newUser);

    const populatedUser = await req.db.collection('users').aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true
        }
      }
    ]).next();

    res.status(201).json(populatedUser);

  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ message: error.message });
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
