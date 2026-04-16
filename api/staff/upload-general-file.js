const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');
const multer = require('multer');

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.array('files', 10));

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const userId = new ObjectId(req.user.id);
    
    const uploadedFilesMetadata = [];
    
    for (const file of req.files) {
      const fileId = new ObjectId();
      const filename = `${Date.now()}-${file.originalname}`;
      
      // Store file content in a separate collection to avoid hitting document size limit
      await req.db.collection('stored_files').insertOne({
        _id: fileId,
        filename: filename,
        originalName: file.originalname,
        contentType: file.mimetype,
        data: file.buffer,
        uploadedBy: userId,
        uploadedAt: new Date()
      });
      
      uploadedFilesMetadata.push({
        _id: fileId,
        path: `uploads/${filename}`, // This will be intercepted by vercel.json
        originalName: file.originalname,
        displayName: file.originalname,
        comment: '',
        uploadedAt: new Date()
      });
    }
    
    await req.db.collection('users').updateOne(
      { _id: userId },
      { $push: { uploadedFiles: { $each: uploadedFilesMetadata } } }
    );

    res.json({ 
      message: 'Files uploaded successfully', 
      count: req.files.length 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed: ' + error.message });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
