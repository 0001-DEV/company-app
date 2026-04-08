// Script to verify admin user exists in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function verifyAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const admin = await User.findOne({ email: 'admin@xtremecr8ivity.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      console.log('\nCreating admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@xtremecr8ivity.com',
        password: hashedPassword,
        role: 'admin',
        phone: '',
        profilePicture: ''
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully');
      console.log('   Email: admin@xtremecr8ivity.com');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Admin user found');
      console.log('   Name:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      
      // Verify password
      const isPasswordValid = await admin.comparePassword('admin123');
      if (isPasswordValid) {
        console.log('✅ Password is correct');
      } else {
        console.log('❌ Password is incorrect');
        console.log('   Resetting password to admin123...');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        admin.password = hashedPassword;
        await admin.save();
        console.log('✅ Password reset successfully');
      }
    }

    // List all users
    const allUsers = await User.find({});
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAdminUser();
