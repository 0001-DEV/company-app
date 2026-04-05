// Debug MongoDB connection issues
const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    return res.status(200).json({
      error: 'MONGODB_URI not set',
      env_vars_available: Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB'))
    });
  }

  try {
    // Log the connection attempt (without password)
    const uriWithoutPassword = uri.replace(/:[^@]*@/, ':****@');
    console.log('Attempting to connect to:', uriWithoutPassword);

    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    await client.connect();
    console.log('Connected successfully');

    // Test basic operations
    const db = client.db('company-app');
    const adminResult = await db.admin().ping();
    
    const collections = await db.listCollections().toArray();
    
    await client.close();

    res.status(200).json({
      success: true,
      message: 'MongoDB connection successful',
      connectionString: uriWithoutPassword,
      collections: collections.map(c => c.name),
      ping: adminResult
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    res.status(200).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      connectionString: uri.replace(/:[^@]*@/, ':****@'),
      suggestions: [
        'Check if username and password are correct',
        'Verify the database name is correct',
        'Ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access',
        'Check if the user has access to the database'
      ]
    });
  }
};
