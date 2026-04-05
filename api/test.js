export default async function handler(req, res) {
  try {
    // Simple test without MongoDB first
    res.status(200).json({ 
      success: true, 
      message: "API endpoint is working!",
      timestamp: new Date().toISOString(),
      env: process.env.MONGODB_URI ? "MongoDB URI is set" : "MongoDB URI is missing"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}