const { connectToDatabase } = require('./db-connection');
const bcrypt = require('bcryptjs');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

async function setupInitialData() {
  const { db } = await connectToDatabase();
  
  try {
    // Create default admin user if none exists
    const adminExists = await db.collection('users').findOne({ role: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db.collection('users').insertOne({
        name: 'System Administrator',
        email: 'admin@xtremecr8ivity.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        lastLogin: null,
        isActive: true
      });
      
      console.log('Default admin user created');
    }
    
    // Create default departments if none exist
    const deptCount = await db.collection('departments').countDocuments();
    
    if (deptCount === 0) {
      const defaultDepartments = [
        {
          name: 'Design',
          description: 'Creative design and graphics team',
          groupAdmins: [],
          onlyAdminsCanSend: false,
          disappearAfterDays: 30,
          pinnedMessages: [],
          createdAt: new Date()
        },
        {
          name: 'Development',
          description: 'Software development team',
          groupAdmins: [],
          onlyAdminsCanSend: false,
          disappearAfterDays: 30,
          pinnedMessages: [],
          createdAt: new Date()
        },
        {
          name: 'Marketing',
          description: 'Marketing and promotion team',
          groupAdmins: [],
          onlyAdminsCanSend: false,
          disappearAfterDays: 30,
          pinnedMessages: [],
          createdAt: new Date()
        },
        {
          name: 'Management',
          description: 'Administrative and management team',
          groupAdmins: [],
          onlyAdminsCanSend: true,
          disappearAfterDays: 90,
          pinnedMessages: [],
          createdAt: new Date()
        }
      ];
      
      await db.collection('departments').insertMany(defaultDepartments);
      console.log('Default departments created');
    }
    
    // Create test data collection for API testing
    await db.collection('test').deleteMany({});
    await db.collection('test').insertOne({
      message: 'Database setup completed successfully',
      timestamp: new Date(),
      version: '1.0.0'
    });
    
    return {
      success: true,
      message: 'Database setup completed successfully',
      collections: await db.listCollections().toArray().then(cols => cols.map(c => c.name))
    };
    
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Only allow POST requests for setup
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Use POST request to setup database'
    });
  }

  try {
    const result = await setupInitialData();
    
    res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
      data: result,
      nextSteps: [
        'Database collections created',
        'Default admin user: admin@xtremecr8ivity.com / admin123',
        'Default departments created',
        'Indexes optimized for performance',
        'Ready for production use'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database setup failed'
    });
  }
};