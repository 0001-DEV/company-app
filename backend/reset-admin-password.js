const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://admin:opulence16@company-app.potzhpb.mongodb.net/company-app?retryWrites=true&w=majority';

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // New simple password
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update admin user
    const result = await User.findOneAndUpdate(
      { email: 'admin@xtremecr8ivity.com' },
      { password: hashedPassword },
      { new: true }
    );

    if (result) {
      console.log('✅ Admin password reset successfully!');
      console.log(`📧 Email: admin@xtremecr8ivity.com`);
      console.log(`🔑 New Password: ${newPassword}`);
    } else {
      console.log('❌ Admin user not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
