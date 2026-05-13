const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query || {};
  const { name, email, phone, password, departmentId, departments, birthday } = req.body || {};

  if (!id) {
    return res.status(400).json({ message: 'Staff ID is required' });
  }

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Staff ID format' });
    }

    const update = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      updatedAt: new Date()
    };

    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
      update.plainPassword = password;
    }

    // Process departments - handle both single departmentId and departments array
    if (departments && Array.isArray(departments) && departments.length > 0) {
      // Use departments array if provided
      const departmentsArray = departments.map(d => new ObjectId(d));
      update.departments = departmentsArray;
      update.department = departmentsArray[0]; // Set first as primary for backward compatibility
    } else if (departmentId) {
      // Fall back to single departmentId
      update.department = new ObjectId(departmentId);
      update.departments = [update.department];
    }

    if (birthday) {
      update.birthday = new Date(birthday);
    }

    const result = await req.db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id), role: 'staff' },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const staff = await req.db.collection('users').aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'departments',
          foreignField: '_id',
          as: 'departments'
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
