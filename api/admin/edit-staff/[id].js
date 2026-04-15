const { withMiddleware } = require('../../middleware');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { name, email, phone, password, departmentId, birthday } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Staff ID is required' });
  }

  if (!name || !email || !departmentId) {
    return res.status(400).json({ message: 'Name, email and department are required' });
  }

  try {
    const update = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      department: new ObjectId(departmentId),
      birthday: birthday && birthday !== '' ? new Date(birthday) : undefined
    };

    if (!update.birthday) {
      delete update.birthday;
    }

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      update.password = hashedPassword;
      update.plainPassword = password;
    }

    const result = await req.db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id), role: 'staff' },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const staff = await req.db.collection('users').aggregate([
      { $match: { _id: result.value._id } },
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

    return res.json(staff);
  } catch (error) {
    console.error('Error editing staff:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireRole: 'admin',
  requireDb: true
});

