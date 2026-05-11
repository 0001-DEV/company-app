const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const resetAdminPassword = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@xtremecr8ivity.com' });
    
    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    console.log(`✅ Found admin: ${admin.name} (${admin.email})`);

    // Hash new password
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    console.log('✅ Admin password reset successfully');
    console.log(`📧 Email: admin@xtremecr8ivity.com`);
    console.log(`🔑 New Password: admin123`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

resetAdminPassword();
