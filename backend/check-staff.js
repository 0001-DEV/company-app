// Script to check staff members in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkStaff() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all staff
    const allStaff = await User.find({ role: 'staff' });
    
    if (allStaff.length === 0) {
      console.log('❌ No staff members found in database');
    } else {
      console.log(`\n✅ Found ${allStaff.length} staff member(s):\n`);
      
      for (const staff of allStaff) {
        console.log(`📋 Staff: ${staff.name}`);
        console.log(`   Email: ${staff.email}`);
        console.log(`   Role: ${staff.role}`);
        console.log(`   Department: ${staff.department || 'None'}`);
        console.log(`   Password Hash: ${staff.password.substring(0, 20)}...`);
        
        // Test password
        try {
          const isMatch = await bcrypt.compare('staff123', staff.password);
          console.log(`   Password 'staff123': ${isMatch ? '✅ Correct' : '❌ Incorrect'}`);
        } catch (err) {
          console.log(`   Password test: ❌ Error - ${err.message}`);
        }
        
        console.log('');
      }
    }

    // Also check admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`\n👑 Admin: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStaff();
