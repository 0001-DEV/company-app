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
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all localhost variants and specific ports
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Also allow any localhost with any port for development
      if (origin && origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Routes
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const adminDepartmentRoutes = require('./routes/adminDepartment');
const staffRoutes = require('./routes/staff');
const noticeRoutes = require('./routes/notices');
const mappingRoutes = require('./routes/mapping');
const nodemailer = require('nodemailer');

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

const stockRoutes = require('./routes/stock');
app.use('/api/stock', stockRoutes);

const stockManagerRoutes = require('./routes/stockManager');
app.use('/api/stock-manager', stockManagerRoutes);

const clientDocumentRoutes = require('./routes/clientDocuments');
app.use('/api/client-documents', clientDocumentRoutes);

const weeklyReportRoutes = require('./routes/weeklyReports');
app.use('/api/reports', weeklyReportRoutes);

const companyStaffRoutes = require('./routes/companyStaff');
app.use('/api/company-staff', companyStaffRoutes);

const configRoutes = require('./routes/config');
app.use('/api/config', configRoutes);

// ── Test MongoDB Connection ──
app.get('/api/test', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const collections = await db.listCollections().toArray();
    const testCollection = await db.collection('test').find().toArray();
    res.status(200).json({ 
      success: true, 
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name),
      testData: testCollection 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Scheduled message dispatcher (runs every 30s) ──
setInterval(async () => {
  try {
    const ScheduledMessage = mongoose.model('ScheduledMessage');
    const Message = require('./models/Message');
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

// ── Birthday Email Dispatcher (Runs at 12:01 AM every day) ──
// Sends birthday email exactly once per day at 12:01 AM
// Uses database to track sent emails to prevent duplicates on server restart

// Function to check and send birthday emails
const checkAndSendBirthdayEmails = async () => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const todayStr = `${now.getMonth() + 1}-${now.getDate()}`;
    
    console.log(`🎂 Birthday check running at ${now.toLocaleTimeString()}`);
    
    const User = mongoose.model('User');
    const BirthdayLog = require('./models/BirthdayLog');
    const staff = await User.find({ role: 'staff' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-password'
      }
    });

    for (const user of staff) {
      if (!user.birthday || !user.email) continue;
      
      const bday = new Date(user.birthday);
      const bdayStr = `${bday.getMonth() + 1}-${bday.getDate()}`;
      
      // Only send if it's their birthday today
      if (todayStr === bdayStr) {
        // Check if we already sent this year
        const alreadySent = await BirthdayLog.findOne({ userId: user._id, year: currentYear });
        
        if (alreadySent) {
          console.log(`⏭️  Birthday email already sent to ${user.name} this year`);
          continue;
        }
        
        console.log(`🎂 Sending birthday email to ${user.name} (${user.email})`);
        
        const mailOptions = {
          from: `"Xtreme Cr8ivity" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `Happy Birthday, ${user.name.split(' ')[0]}! 🎂✨`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 32px; letter-spacing: 1px;">Happy Birthday! 🎊</h1>
              </div>
              <div style="padding: 40px 30px; background: white; color: #1e293b; line-height: 1.6;">
                <p style="font-size: 18px; margin-bottom: 24px;">Dear <strong>${user.name}</strong>,</p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  On this special day, the entire team at <strong>Xtreme Cr8ivity</strong> wishes you an amazing year ahead! 
                </p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  We are incredibly grateful for your dedication and the unique energy you bring to our workplace. May your day be filled with joy, laughter, and everything that makes you happy.
                </p>
                <div style="margin: 40px 0; text-align: center; font-size: 50px;">🎂✨🎁</div>
                <p style="font-size: 16px; margin-top: 30px; border-top: 1px solid #f1f5f9; pt: 20px;">
                  Best Wishes,<br />
                  <strong>The Xtreme Cr8ivity Team</strong>
                </p>
              </div>
              <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                &copy; 2026 Xtreme Cr8ivity. All rights reserved.
              </div>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          // Log the successful send in database
          await BirthdayLog.create({
            userId: user._id,
            email: user.email,
            year: currentYear,
            status: 'sent'
          });
          console.log(`✅ Birthday email sent to ${user.email}`);
        } catch (mailErr) {
          // Log the failed send in database
          try {
            await BirthdayLog.create({
              userId: user._id,
              email: user.email,
              year: currentYear,
              status: 'failed'
            });
          } catch (logErr) {
            console.error('Failed to log birthday email attempt:', logErr.message);
          }
          console.error(`❌ Failed to send birthday email to ${user.email}:`, mailErr.message);
          console.log(`⚠️ Email marked as attempted. Will not retry for ${user.name} this year.`);
        }
      }
    }
  } catch (err) {
    console.error('🔥 Birthday Dispatcher Error:', err);
  }
};

// Schedule birthday email check to run at 12:01 AM every day
const scheduleBirthdayEmails = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 1, 0, 0); // Set to 12:01 AM (1 minute after midnight)
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  console.log(`⏰ Birthday email scheduler initialized. Next check at ${tomorrow.toLocaleString()}`);
  
  // First check at 12:01 AM
  setTimeout(() => {
    checkAndSendBirthdayEmails();
    // Then check every 24 hours at 12:01 AM
    setInterval(checkAndSendBirthdayEmails, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
};

// Start the birthday email scheduler
scheduleBirthdayEmails();

// Test route
app.get('/api/staff/test', (req, res) => {
  res.json({ message: 'Staff routes are working!' });
});

// 🟢 MOCK LOGIN FOR LOCAL TESTING (bypasses MongoDB)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock credentials for testing
  if (email === 'admin@xtremecr8ivity.com' && password === 'password123') {
    const token = 'mock-token-' + Date.now();
    return res.json({
      message: 'Admin login successful',
      token,
      admin: { 
        id: 'mock-admin-1', 
        name: 'Admin User', 
        email: 'admin@xtremecr8ivity.com', 
        role: 'admin', 
        profilePicture: '' 
      }
    });
  }
  
  res.status(404).json({ message: 'Admin not found' });
});

app.post('/api/staff/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock credentials for testing
  const staffUsers = [
    { email: 'loveolaoye@gmail.com', password: 'LOVEOLAOYE', name: 'Love Olaoye' },
    { email: 'love@xtremecr8ivity.com', password: 'love', name: 'Love Staff' }
  ];
  
  const user = staffUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = 'mock-token-' + Date.now();
    return res.json({
      message: 'Staff login successful',
      token,
      staff: { 
        id: 'mock-staff-1', 
        name: user.name, 
        email: user.email, 
        role: 'staff', 
        profilePicture: '' 
      }
    });
  }
  
  res.status(404).json({ message: 'Staff not found' });
});

// Database connection
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable not set');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));

// Global Error Handler - Ensure JSON response instead of HTML
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err);
  console.error('🔥 Error Stack:', err.stack);
  console.error('🔥 Request URL:', req.url);
  console.error('🔥 Request Method:', req.method);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
