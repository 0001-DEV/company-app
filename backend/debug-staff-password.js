// Script to debug staff password issues
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function debugStaffPassword() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all staff
    const allStaff = await User.find({ role: 'staff' });
    
    if (allStaff.length === 0) {
      console.log('❌ No staff members found');
      process.exit(1);
    }

    console.log(`📋 Found ${allStaff.length} staff member(s):\n`);
    
    for (const staff of allStaff) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Name: ${staff.name}`);
      console.log(`Email: ${staff.email}`);
      console.log(`Role: ${staff.role}`);
      console.log(`Password Hash: ${staff.password.substring(0, 30)}...`);
      console.log(`Plain Password: ${staff.plainPassword || '(not stored)'}`);
      
      // Test common passwords
      const testPasswords = ['staff123', '123456', 'password', 'admin123'];
      console.log(`\nPassword Tests:`);
      
      for (const testPw of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPw, staff.password);
          console.log(`  ${testPw}: ${isMatch ? '✅ MATCH' : '❌ no match'}`);
        } catch (err) {
          console.log(`  ${testPw}: ❌ Error - ${err.message}`);
        }
      }
      
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test password hashing
    console.log('🔐 Testing Password Hashing:\n');
    const testPassword = 'testpass123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    
    console.log(`Original: ${testPassword}`);
    console.log(`Hashed: ${hashedPassword}`);
    
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`Verify: ${isMatch ? '✅ MATCH' : '❌ no match'}`);

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugStaffPassword();
