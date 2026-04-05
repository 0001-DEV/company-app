const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    return res.status(500).json({ 
      success: false, 
      error: 'MONGODB_URI environment variable not set' 
    });
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db("company-app");
    const collections = await db.listCollections().toArray();
    const testData = await db.collection("test").find().toArray();
    
    res.status(200).json({
      success: true,
      message: 'MongoDB connection successful!',
      timestamp: new Date().toISOString(),
      collections: collections.map(c => c.name),
      testData: testData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    await client.close();
  }
};