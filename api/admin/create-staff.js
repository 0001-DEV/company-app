const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, password, departmentId, birthday } = req.body || {};

  if (!name || !email || !password || !departmentId) {
    return res.status(400).json({ message: 'Name, email, password and department are required' });
  }

  try {
    const existing = await req.db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staffDoc = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      password: hashedPassword,
      plainPassword: password,
      role: 'staff',
      department: new ObjectId(departmentId),
      profilePicture: '',
      birthday: birthday && birthday !== '' ? new Date(birthday) : undefined,
      createdAt: new Date()
    };

    const insertResult = await req.db.collection('users').insertOne(staffDoc);

    const staff = await req.db.collection('users').aggregate([
      { $match: { _id: insertResult.insertedId } },
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

    return res.status(201).json(staff);
  } catch (error) {
    console.error('Error creating staff:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});

