// Script to add test staff members to MongoDB
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Department = require('./models/Department');
const bcrypt = require('bcryptjs');

async function addTestStaff() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create departments if they don't exist
    console.log('\nCreating departments...');
    const departments = await Department.find({});
    
    let deptIds = {};
    if (departments.length === 0) {
      const deptNames = ['ICT Department', 'Design Department', 'Marketing Department', 'HR Department'];
      for (const name of deptNames) {
        const dept = await Department.create({ name, description: `${name} description` });
        deptIds[name] = dept._id;
        console.log(`✅ Created department: ${name}`);
      }
    } else {
      departments.forEach(dept => {
        deptIds[dept.name] = dept._id;
      });
      console.log(`✅ Found ${departments.length} existing departments`);
    }

    // Test staff data
    const testStaff = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+234 123 456 7890',
        password: 'staff123',
        department: deptIds['ICT Department'],
        birthday: new Date('1990-01-15')
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+234 987 654 3210',
        password: 'staff123',
        department: deptIds['Design Department'],
        birthday: new Date('1992-05-20')
      },
      {
        name: 'Michael Johnson',
        email: 'michael@example.com',
        phone: '+234 555 666 7777',
        password: 'staff123',
        department: deptIds['Marketing Department'],
        birthday: new Date('1988-03-10')
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        phone: '+234 444 333 2222',
        password: 'staff123',
        department: deptIds['HR Department'],
        birthday: new Date('1995-07-25')
      }
    ];

    console.log('\nAdding test staff members...');
    for (const staffData of testStaff) {
      // Check if staff already exists
      const existing = await User.findOne({ email: staffData.email });
      if (existing) {
        console.log(`⏭️  Skipping ${staffData.name} (already exists)`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(staffData.password, 10);
      
      // Create staff
      const staff = await User.create({
        ...staffData,
        password: hashedPassword,
        role: 'staff'
      });

      console.log(`✅ Created staff: ${staff.name} (${staff.email})`);
    }

    // List all staff
    const allStaff = await User.find({ role: 'staff' }).populate('department');
    console.log('\n📋 All staff members:');
    allStaff.forEach(staff => {
      console.log(`   - ${staff.name} (${staff.email}) - Department: ${staff.department?.name || 'None'}`);
    });

    console.log(`\n✅ Total staff: ${allStaff.length}`);
    console.log('\n🔐 Test Staff Login Credentials:');
    console.log('   Email: john@example.com, Password: staff123');
    console.log('   Email: jane@example.com, Password: staff123');
    console.log('   Email: michael@example.com, Password: staff123');
    console.log('   Email: sarah@example.com, Password: staff123');

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestStaff();
