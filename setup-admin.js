const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
  const uri = "mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority";
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('company-app');
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'admin@xtremecr8ivity.com' 
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      name: 'System Administrator',
      email: 'admin@xtremecr8ivity.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      active: true,
      department: null,
      profilePicture: '',
      phone: '',
      canViewOthersWork: true
    };
    
    await db.collection('users').insertOne(adminUser);
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@xtremecr8ivity.com');
    console.log('Password: admin123');
    
    // Create default departments
    const departments = [
      { name: 'Design', description: 'Creative design team', createdAt: new Date() },
      { name: 'Development', description: 'Software development team', createdAt: new Date() },
      { name: 'Marketing', description: 'Marketing and promotion team', createdAt: new Date() },
      { name: 'Management', description: 'Administrative team', createdAt: new Date() }
    ];
    
    for (const dept of departments) {
      const exists = await db.collection('departments').findOne({ name: dept.name });
      if (!exists) {
        await db.collection('departments').insertOne(dept);
        console.log(`✅ Created department: ${dept.name}`);
      }
    }
    
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await client.close();
  }
}

setupAdmin();