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

// ── Birthday Email Dispatcher (Runs once every 24 hours) ──
// For testing purposes, we can set a shorter interval or trigger manually.
// We'll keep a record of who we've already sent emails to today.
const sentBirthdaysToday = new Set();
setInterval(async () => {
  try {
    const now = new Date();
    const todayStr = `${now.getMonth() + 1}-${now.getDate()}`;
    
    // Clear the set at midnight
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      sentBirthdaysToday.clear();
    }

    const User = mongoose.model('User');
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
      
      if (todayStr === bdayStr && !sentBirthdaysToday.has(user.email)) {
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
          sentBirthdaysToday.add(user.email);
          console.log(`✅ Birthday email sent to ${user.email}`);
        } catch (mailErr) {
          console.error(`❌ Failed to send email to ${user.email}:`, mailErr.message);
        }
      }
    }
  } catch (err) {
    console.error('🔥 Birthday Dispatcher Error:', err);
  }
}, 3600000); // Check every hour

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
