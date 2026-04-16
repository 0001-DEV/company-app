const { getDbConnection } = require('./middleware');

module.exports = async (req, res) => {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).send('Filename is required');
  }

  try {
    const { db } = await getDbConnection();
    const file = await db.collection('stored_files').findOne({ filename: filename });

    if (!file) {
      // Fallback: check if it's a static file in public/uploads (if any were deployed)
      return res.status(404).send('File not found');
    }

    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // file.data is a Binary object in MongoDB, which has a buffer property
    return res.send(file.data.buffer || file.data);
  } catch (error) {
    console.error('Error serving file:', error);
    return res.status(500).send('Server error');
  }
};
