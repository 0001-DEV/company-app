// Script to reset staff password
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function resetStaffPassword() {
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
      console.log('❌ No staff members found');
      process.exit(1);
    }

    console.log(`\n📋 Found ${allStaff.length} staff member(s):\n`);
    allStaff.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.name} (${staff.email})`);
    });

    // Reset all staff passwords to 'staff123'
    const newPassword = 'staff123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`\n🔄 Resetting all staff passwords to: ${newPassword}\n`);

    for (const staff of allStaff) {
      staff.password = hashedPassword;
      staff.plainPassword = newPassword;
      await staff.save();
      console.log(`✅ Reset password for: ${staff.name} (${staff.email})`);
    }

    console.log(`\n✅ All staff passwords reset to: ${newPassword}`);
    console.log('\n🔐 Test Login Credentials:');
    allStaff.forEach(staff => {
      console.log(`   Email: ${staff.email}, Password: ${newPassword}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetStaffPassword();
