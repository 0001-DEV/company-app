// Vercel serverless function to handle SPA routing
// This serves the React app for all non-API routes

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Don't handle API routes here - let them be handled by specific API files
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }

  try {
    // Serve the React app's index.html
    const indexPath = path.join(__dirname, '../frontend/build/index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.status(200).send(indexContent);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
