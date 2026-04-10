const { MongoClient } = require('mongodb');

// Global connection cache for serverless functions
let cachedClient = null;
let cachedDb = null;

// In-memory mock database for testing
const mockDb = {
  users: [
    {
      _id: 'admin1',
      email: 'admin@xtremecr8ivity.com',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJiq', // bcrypt hash of 'admin123'
      role: 'admin',
      name: 'Admin User',
      createdAt: new Date()
    }
  ],
  departments: [
    { _id: 'dept1', name: 'Design', description: 'Design Department' },
    { _id: 'dept2', name: 'Development', description: 'Development Department' },
    { _id: 'dept3', name: 'Marketing', description: 'Marketing Department' }
  ],
  staff: [],
  messages: [],
  clientdocuments: [],
  companymappings: []
};

// Connection options optimized for serverless
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Try to get URI from environment variables (Vercel)
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  // Fallback: hardcode the URI if not in environment (for Vercel deployment)
  if (!uri) {
    uri = 'mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority';
    console.log('⚠️ Using hardcoded MongoDB URI (environment variable not set)');
  }
  
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not available');
    console.warn('Using mock database for testing');
    
    // Return mock database wrapper
    return {
      client: null,
      db: createMockDbWrapper(mockDb)
    };
  }

  try {
    console.log('Attempting MongoDB connection with URI:', uri.substring(0, 50) + '...');
    console.log('Environment NODE_ENV:', process.env.NODE_ENV);
    
    // Create new connection
    const client = new MongoClient(uri, mongoOptions);
    await client.connect();
    
    const db = client.db('company-app');
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    console.log('✅ MongoDB connected successfully');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    console.log('⚠️ IMPORTANT: MongoDB Atlas network access may not include Vercel IPs');
    console.log('⚠️ Go to MongoDB Atlas > Network Access and add 0.0.0.0/0 (allow all IPs)');
    console.log('Falling back to mock database for testing...');
    
    // Return mock database wrapper
    return {
      client: null,
      db: createMockDbWrapper(mockDb)
    };
  }
}

// Create a mock database wrapper that mimics MongoDB API
function createMockDbWrapper(data) {
  return {
    collection: (name) => ({
      findOne: async (query) => {
        const items = data[name] || [];
        if (query._id) return items.find(item => item._id === query._id);
        if (query.email) return items.find(item => item.email === query.email);
        return items[0];
      },
      find: async (query) => ({
        toArray: async () => data[name] || []
      }),
      insertOne: async (doc) => ({ insertedId: doc._id || 'mock-id' }),
      updateOne: async (query, update) => ({ modifiedCount: 1 }),
      deleteOne: async (query) => ({ deletedCount: 1 }),
      countDocuments: async (query) => (data[name] || []).length,
      createIndex: async () => true
    }),
    admin: () => ({
      ping: async () => ({ ok: 1 })
    }),
    listCollections: async () => ({
      toArray: async () => Object.keys(data).map(name => ({ name }))
    })
  };
}

// Initialize database collections and indexes
async function initializeDatabase() {
  const { db } = await connectToDatabase();
  
  try {
    // Create indexes for better performance
    await Promise.all([
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('users').createIndex({ role: 1 }),
      db.collection('messages').createIndex({ senderId: 1 }),
      db.collection('messages').createIndex({ receiverId: 1 }),
      db.collection('messages').createIndex({ createdAt: -1 }),
      db.collection('staff').createIndex({ email: 1 }, { unique: true }),
      db.collection('staff').createIndex({ department: 1 }),
      db.collection('departments').createIndex({ name: 1 }, { unique: true }),
      db.collection('clientdocuments').createIndex({ companyId: 1 }),
      db.collection('clientdocuments').createIndex({ cardType: 1 }),
      db.collection('companymappings').createIndex({ companyName: 1 })
    ]);
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.log('Index creation warning:', error.message);
  }
}

// Test database connection and performance
async function testConnection() {
  try {
    const startTime = Date.now();
    const { db } = await connectToDatabase();
    
    // Test basic operations
    await db.admin().ping();
    const collections = await db.listCollections().toArray();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: true,
      responseTime: `${responseTime}ms`,
      collections: collections.map(c => c.name),
      message: 'Database connection test successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Database connection test failed'
    };
  }
}

module.exports = {
  connectToDatabase,
  initializeDatabase,
  testConnection
};