// Catch-all handler for SPA routing
// This ensures all non-API routes serve the React app

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // If it's an API route, return 404 (it should be handled by specific API files)
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }

  // For all other routes, serve the React app's index.html
  try {
    const indexPath = path.join(__dirname, '../frontend/build/index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(indexContent);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
