// Script to fix corrupted staff password hashes
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function fixStaffPasswordHash() {
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

    console.log(`🔧 Fixing Staff Password Hashes:\n`);
    
    for (const staff of allStaff) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Staff: ${staff.name}`);
      console.log(`Email: ${staff.email}`);
      
      // Check if password hash is valid
      if (staff.plainPassword) {
        try {
          const isMatch = await bcrypt.compare(staff.plainPassword, staff.password);
          
          if (isMatch) {
            console.log(`✅ Password hash is CORRECT - No fix needed`);
          } else {
            console.log(`❌ Password hash is WRONG - Fixing...`);
            
            // Re-hash the password
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(staff.plainPassword, salt);
            staff.password = newHash;
            await staff.save();
            
            console.log(`✅ Password hash fixed!`);
            console.log(`   New hash: ${newHash.substring(0, 30)}...`);
          }
        } catch (err) {
          console.log(`❌ Error checking password: ${err.message}`);
        }
      } else {
        console.log(`⚠️  No plain password stored - Cannot fix`);
      }
      
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔐 Updated Login Credentials:\n');
    const updatedStaff = await User.find({ role: 'staff' });
    for (const staff of updatedStaff) {
      console.log(`Email: ${staff.email}`);
      console.log(`Password: ${staff.plainPassword || '(unknown)'}`);
      console.log('');
    }

    await mongoose.connection.close();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixStaffPasswordHash();
