/**
 * Test script to verify access control is working correctly
 * Run with: node test-access-control.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const StockManager = require('./models/StockManager');
const WorkBankAccess = require('./models/WorkBankAccess');
const User = require('./models/User');

async function testAccessControl() {
  try {
    console.log('🔍 Testing Access Control System...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Check StockManager collection
    console.log('📋 Test 1: StockManager Collection');
    const stockManagers = await StockManager.find().populate('staffId', 'name email');
    console.log(`   Found ${stockManagers.length} stock managers:`);
    stockManagers.forEach(m => {
      console.log(`   - ${m.staffName} (${m.staffId?._id})`);
    });
    console.log();

    // Test 2: Check WorkBankAccess collection
    console.log('📋 Test 2: WorkBankAccess Collection');
    const workBankAccess = await WorkBankAccess.find();
    console.log(`   Found ${workBankAccess.length} work bank access records:`);
    workBankAccess.forEach(record => {
      console.log(`   - ${record.staffIds.length} staff members have access`);
      record.staffIds.forEach(id => {
        console.log(`     - ${id.toString()}`);
      });
    });
    console.log();

    // Test 3: Verify staff members exist
    console.log('📋 Test 3: Verify Staff Members');
    const allStaff = await User.find({ role: 'staff' }).select('_id name email');
    console.log(`   Found ${allStaff.length} staff members:`);
    allStaff.forEach(s => {
      console.log(`   - ${s.name} (${s._id})`);
    });
    console.log();

    // Test 4: Check for mismatches
    console.log('📋 Test 4: Check for ID Mismatches');
    let mismatches = 0;
    
    for (const manager of stockManagers) {
      const staffExists = allStaff.some(s => s._id.toString() === manager.staffId.toString());
      if (!staffExists) {
        console.log(`   ⚠️  StockManager references non-existent staff: ${manager.staffId}`);
        mismatches++;
      }
    }

    for (const record of workBankAccess) {
      for (const staffId of record.staffIds) {
        const staffExists = allStaff.some(s => s._id.toString() === staffId.toString());
        if (!staffExists) {
          console.log(`   ⚠️  WorkBankAccess references non-existent staff: ${staffId}`);
          mismatches++;
        }
      }
    }

    if (mismatches === 0) {
      console.log('   ✅ No ID mismatches found');
    }
    console.log();

    // Test 5: Summary
    console.log('📊 Summary:');
    console.log(`   - Stock Managers: ${stockManagers.length}`);
    console.log(`   - Work Bank Access Records: ${workBankAccess.length}`);
    console.log(`   - Total Staff: ${allStaff.length}`);
    console.log(`   - ID Mismatches: ${mismatches}`);
    console.log();

    if (stockManagers.length === 0 && workBankAccess.length === 0) {
      console.log('⚠️  No access assignments found. Please assign staff members first.');
    } else {
      console.log('✅ Access control system appears to be working correctly.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Test complete');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testAccessControl();
