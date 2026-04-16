const { withMiddleware } = require('../../middleware');
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
  limits: { fileSize: 10 * 1024 * 1024 }
});

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { jobId } = req.query || {};
  if (!jobId) {
    return res.status(400).json({ message: 'Job ID is required' });
  }

  try {
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const job = await req.db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const userId = new ObjectId(req.user.id);
    
    // Check if staff is assigned to this job
    const isAssigned = job.assignedStaff && job.assignedStaff.some(id => id.toString() === userId.toString());
    if (req.user.role !== 'admin' && !isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this job' });
    }

    const fileId = new ObjectId();
    const filename = `${Date.now()}-${req.file.originalname}`;
    
    // Store file content in database
    await req.db.collection('stored_files').insertOne({
      _id: fileId,
      filename: filename,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
      uploadedBy: userId,
      uploadedAt: new Date(),
      jobId: new ObjectId(jobId)
    });
    
    const fileMetadata = {
      _id: fileId,
      path: `uploads/${filename}`,
      originalName: req.file.originalname,
      uploadedBy: userId,
      uploadedAt: new Date()
    };
    
    await req.db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { $push: { files: fileMetadata } }
    );

    res.json({ message: 'File uploaded successfully', file: fileMetadata });
  } catch (error) {
    console.error('Error uploading job file:', error);
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
