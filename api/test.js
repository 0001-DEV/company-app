const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

module.exports = async function handler(req, res) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("company-app");
    const collections = await db.listCollections().toArray();
    const testData = await db.collection("test").find().toArray();
    
    res.status(200).json({ 
      success: true, 
      message: "MongoDB connection successful",
      collections: collections.map(c => c.name),
      testData: testData 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};