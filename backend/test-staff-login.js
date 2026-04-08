// Script to test staff login with actual passwords
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testStaffLogin() {
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

    console.log(`📋 Testing Staff Login:\n`);
    
    for (const staff of allStaff) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Staff: ${staff.name}`);
      console.log(`Email: ${staff.email}`);
      console.log(`Plain Password Stored: ${staff.plainPassword || '(not stored)'}`);
      
      // Test with the plain password if it exists
      if (staff.plainPassword) {
        try {
          const isMatch = await bcrypt.compare(staff.plainPassword, staff.password);
          console.log(`\nTest with plain password "${staff.plainPassword}":`);
          console.log(`  Result: ${isMatch ? '✅ MATCH - Login should work!' : '❌ NO MATCH - Password hash is wrong'}`);
        } catch (err) {
          console.log(`  Error: ${err.message}`);
        }
      }
      
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔐 Login Credentials:\n');
    for (const staff of allStaff) {
      console.log(`Email: ${staff.email}`);
      console.log(`Password: ${staff.plainPassword || '(unknown - check database)'}`);
      console.log('');
    }

    await mongoose.connection.close();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testStaffLogin();
