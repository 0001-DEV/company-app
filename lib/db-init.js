const connectDB = require('./mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    await connectDB();
    console.log('🔄 Initializing database...');

    // Create default departments if they don't exist
    const departments = [
      { name: 'Administration', description: 'Administrative staff and management' },
      { name: 'Development', description: 'Software development team' },
      { name: 'Design', description: 'Creative and design team' },
      { name: 'Marketing', description: 'Marketing and business development' },
      { name: 'Support', description: 'Customer support and maintenance' }
    ];

    for (const dept of departments) {
      const existingDept = await Department.findOne({ name: dept.name });
      if (!existingDept) {
        await Department.create(dept);
        console.log(`✅ Created department: ${dept.name}`);
      }
    }

    // Create default admin user if no admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminDept = await Department.findOne({ name: 'Administration' });
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await User.create({
        name: 'System Administrator',
        email: 'admin@xtremecr8ivity.com',
        password: hashedPassword,
        plainPassword: 'admin123',
        role: 'admin',
        department: adminDept._id,
        canViewOthersWork: true
      });
      console.log('✅ Created default admin user');
      console.log('   Email: admin@xtremecr8ivity.com');
      console.log('   Password: admin123');
    }

    // Create test staff user if no staff exists
    const staffExists = await User.findOne({ role: 'staff' });
    if (!staffExists) {
      const devDept = await Department.findOne({ name: 'Development' });
      const hashedPassword = await bcrypt.hash('staff123', 12);
      
      await User.create({
        name: 'Test Staff Member',
        email: 'staff@xtremecr8ivity.com',
        password: hashedPassword,
        plainPassword: 'staff123',
        role: 'staff',
        department: devDept._id,
        canViewOthersWork: false
      });
      console.log('✅ Created default staff user');
      console.log('   Email: staff@xtremecr8ivity.com');
      console.log('   Password: staff123');
    }

    console.log('✅ Database initialization complete');
    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { initializeDatabase };