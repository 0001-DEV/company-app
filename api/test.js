module.exports = async function handler(req, res) {
  try {
    res.status(200).json({ 
      success: true, 
      message: "API endpoint is working!",
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};