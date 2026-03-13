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
