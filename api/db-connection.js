const { MongoClient } = require('mongodb');

// Global connection cache for serverless functions
let cachedClient = null;
let cachedDb = null;

// Connection options optimized for serverless
const mongoOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
  useNewUrlParser: true,
  useUnifiedTopology: true
};

async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable not set');
  }

  // Check for placeholder values
  if (uri.includes('xxxx') || uri.includes('your_') || uri.includes('localhost')) {
    throw new Error('MongoDB URI contains placeholder values. Please update with actual Atlas connection string.');
  }

  try {
    // Create new connection
    const client = new MongoClient(uri, mongoOptions);
    await client.connect();
    
    const db = client.db('company-app');
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    console.log('MongoDB connected successfully');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Initialize database collections and indexes
async function initializeDatabase() {
  const { db } = await connectToDatabase();
  
  try {
    // Create indexes for better performance
    await Promise.all([
      // User collection indexes
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('users').createIndex({ role: 1 }),
      
      // Message collection indexes
      db.collection('messages').createIndex({ senderId: 1 }),
      db.collection('messages').createIndex({ receiverId: 1 }),
      db.collection('messages').createIndex({ createdAt: -1 }),
      
      // Staff collection indexes
      db.collection('staff').createIndex({ email: 1 }, { unique: true }),
      db.collection('staff').createIndex({ department: 1 }),
      
      // Department collection indexes
      db.collection('departments').createIndex({ name: 1 }, { unique: true }),
      
      // Client documents indexes
      db.collection('clientdocuments').createIndex({ companyId: 1 }),
      db.collection('clientdocuments').createIndex({ cardType: 1 }),
      
      // Company mapping indexes
      db.collection('companymappings').createIndex({ companyName: 1 })
    ]);
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.log('Index creation warning:', error.message);
    // Don't throw error for index creation failures
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