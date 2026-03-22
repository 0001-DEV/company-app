<<<<<<< HEAD
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ Uploads folder created');
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Routes
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const adminDepartmentRoutes = require('./routes/adminDepartment');
const staffRoutes = require('./routes/staff');
const noticeRoutes = require('./routes/notices');
const mappingRoutes = require('./routes/mapping');

app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/departments', adminDepartmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/mapping', mappingRoutes);

const featuresRoutes = require('./routes/features');
app.use('/api/features', featuresRoutes);

const extrasRoutes = require('./routes/extras');
app.use('/api/extras', extrasRoutes);

// ── Scheduled message dispatcher (runs every 30s) ──
setInterval(async () => {
  try {
    const ScheduledMessage = mongoose.model('ScheduledMessage');
    const Message = mongoose.model('Message');
    const due = await ScheduledMessage.find({ sent: false, scheduledAt: { $lte: new Date() } });
    for (const sm of due) {
      await Message.create({
        senderId: sm.senderId, senderName: sm.senderName, senderRole: 'admin',
        receiverId: sm.receiverId, text: sm.text,
      });
      sm.sent = true;
      await sm.save();
    }
  } catch (_) {}
}, 30000);

// Test route
app.get('/api/staff/test', (req, res) => {
  res.json({ message: 'Staff routes are working!' });
});

// Database connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// Global Error Handler - Ensure JSON response instead of HTML
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
=======
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ Uploads folder created');
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Routes
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const adminDepartmentRoutes = require('./routes/adminDepartment');
const staffRoutes = require('./routes/staff');

app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/departments', adminDepartmentRoutes);
app.use('/api/staff', staffRoutes);

// Test route
app.get('/api/staff/test', (req, res) => {
  res.json({ message: 'Staff routes are working!' });
});

// Database connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
>>>>>>> 500de3921b8b68c26e46441c078fdc0e74f56b00
