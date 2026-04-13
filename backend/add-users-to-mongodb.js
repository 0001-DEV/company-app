const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://admin:opulence16@company-app.potzhpb.mongodb.net/company-app?retryWrites=true&w=majority';

// Define User schema matching backend model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  plainPassword: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'staff'], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  profilePicture: { type: String, default: '' },
  birthday: { type: Date },
  assignedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  uploadedFiles: [],
  recycleBin: [],
  canViewOthersWork: { type: Boolean, default: false },
  starredMessages: [],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function addUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const staffPassword = await bcrypt.hash('LOVEOLAOYE', 12);
    const staffPassword2 = await bcrypt.hash('love', 12);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@xtremecr8ivity.com',
      password: adminPassword,
      role: 'admin',
      phone: '',
      profilePicture: ''
    });

    // Create staff users
    const staffUser1 = new User({
      name: 'Love Olaoye',
      email: 'loveolaoye@gmail.com',
      password: staffPassword,
      role: 'staff',
      phone: '',
      profilePicture: ''
    });

    const staffUser2 = new User({
      name: 'Love Staff',
      email: 'love@xtremecr8ivity.com',
      password: staffPassword2,
      role: 'staff',
      phone: '',
      profilePicture: ''
    });

    // Save users
    await adminUser.save();
    console.log('✅ Admin user created: admin@xtremecr8ivity.com / admin123');

    await staffUser1.save();
    console.log('✅ Staff user created: loveolaoye@gmail.com / LOVEOLAOYE');

    await staffUser2.save();
    console.log('✅ Staff user created: love@xtremecr8ivity.com / love');

    console.log('\n✅ All users added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUsers();
