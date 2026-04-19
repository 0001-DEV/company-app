const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
const User = require('../models/User');
const ClientProject = require('../models/ClientProject');
const { sendEmail } = require('../utils/notifications');
const multer = require('multer');
const path = require('path');


// STAFF LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const staff = await User.findOne({ email });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (staff.role !== "staff") {
      return res.status(403).json({ message: "Not a staff account" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: staff._id, role: "staff" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Staff login successful",
      token,
      staff: { id: staff._id, name: staff.name, email: staff.email, role: "staff" }
    });

  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all staff (for admin to assign)
router.get('/all', async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('_id name email').sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Error fetching staff' });
  }
});

// ----------------------
// Configure file upload (support multiple files)
// ----------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ----------------------
// Middleware for staff authentication
// ----------------------
const staffAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const staff = await User.findById(decoded.id);
    
    // Allow both 'staff' and 'admin' for staff routes if they have a valid token
    if (!staff || (staff.role !== 'staff' && staff.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.staff = staff;
    req.user = { id: staff._id, name: staff.name, role: staff.role }; // Compatibility with verifyUser
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ----------------------
// Get all jobs assigned to this staff
// ----------------------
router.get('/my-jobs', staffAuth, async (req, res) => {
  try {
    const jobs = await Job.find({ assignedStaff: req.staff._id })
      .populate('department', 'name')
      .populate('assignedStaff', 'name email');

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Upload file for a job
// ----------------------
router.post('/upload-file/:jobId', staffAuth, upload.single('file'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if staff is assigned to this job
    if (!job.assignedStaff.includes(req.staff._id)) {
      return res.status(403).json({ message: 'You are not assigned to this job' });
    }

    // Add uploaded file path
job.files.push({
  path: req.file.path,
  uploadedBy: req.staff._id
});
    await job.save();

    res.json({ message: 'File uploaded successfully', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Add a comment to a job
// ----------------------
router.post('/add-comment/:jobId', staffAuth, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ message: 'Comment is required' });

    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if staff is assigned to this job
    if (!job.assignedStaff.includes(req.staff._id)) {
      return res.status(403).json({ message: 'You are not assigned to this job' });
    }

job.comments.push({
  staff: req.staff._id,
  text: comment
});
    await job.save();

    res.json({ message: 'Comment added successfully', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Upload general file(s) - support multiple files
// ----------------------
router.post('/upload-general-file', staffAuth, upload.array('files', 10), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Staff:', req.staff?.name);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files in request');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    console.log('Files received:', req.files.map(f => f.originalname));

    const user = await User.findById(req.staff._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.uploadedFiles) {
      user.uploadedFiles = [];
    }
    
    // Add all uploaded files
    req.files.forEach(file => {
      user.uploadedFiles.push({
        path: file.path,
        originalName: file.originalname,
        displayName: file.originalname, // Add default displayName
        comment: '',
        uploadedAt: new Date()
      });
    });
    
    await user.save();
    console.log('Files saved successfully to user:', user.name);

    // Automatically grant Work Bank access to staff who upload files
    try {
      const WorkBankAccess = require('../models/WorkBankAccess');
      let access = await WorkBankAccess.findOne();
      if (!access) {
        access = new WorkBankAccess({ staffIds: [] });
      }
      
      // Add staff ID if not already present
      if (!access.staffIds.includes(req.staff._id)) {
        access.staffIds.push(req.staff._id);
        await access.save();
        console.log('✅ Work Bank access granted to:', user.name);
      }
    } catch (err) {
      console.error('Error granting Work Bank access:', err);
      // Don't fail the upload if access grant fails
    }

    res.json({ 
      message: 'Files uploaded successfully', 
      files: req.files,
      count: req.files.length 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed: ' + err.message });
  }
});

// ----------------------
// Delete uploaded file (within 1.5 hours)
// ----------------------
router.delete('/delete-file/:fileId', staffAuth, async (req, res) => {
  try {
    const user = await User.findById(req.staff._id);
    const fileIndex = user.uploadedFiles.findIndex(f => f._id.toString() === req.params.fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const file = user.uploadedFiles[fileIndex];
    const uploadTime = new Date(file.uploadedAt);
    const now = new Date();
    const hoursDiff = (now - uploadTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 1.5) {
      return res.status(403).json({ message: 'Cannot delete file after 1.5 hours' });
    }
    
    // Delete physical file
    const fs = require('fs');
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Remove from database
    user.uploadedFiles.splice(fileIndex, 1);
    await user.save();
    
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Add/Update comment on uploaded file
// ----------------------
router.put('/file-comment/:fileId', staffAuth, async (req, res) => {
  try {
    const { comment } = req.body;
    const user = await User.findById(req.staff._id);
    const file = user.uploadedFiles.id(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    file.comment = comment;
    await user.save();
    
    res.json({ message: 'Comment updated successfully', file });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get staff's uploaded files
// ----------------------
router.get('/my-files', staffAuth, async (req, res) => {
  try {
    const user = await User.findById(req.staff._id);
    res.json(user.uploadedFiles || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get staff's own profile (including permissions)
// ----------------------
router.get('/my-profile', staffAuth, async (req, res) => {
  try {
    const user = await User.findById(req.staff._id).select('name email canViewOthersWork department');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get all staff uploaded files (if staff has permission)
// ----------------------
router.get('/all-staff-files', staffAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.staff._id);
    
    if (!currentUser.canViewOthersWork) {
      return res.status(403).json({ message: 'You do not have permission to view others work' });
    }
    
    const staff = await User.find({ role: 'staff' })
      .select('name email uploadedFiles department')
      .populate('department', 'name');
    
    const allFiles = [];
    staff.forEach(s => {
      if (s.uploadedFiles && s.uploadedFiles.length > 0) {
        s.uploadedFiles.forEach(file => {
          allFiles.push({
            fileId: file._id,
            staffId: s._id,
            staffName: s.name,
            staffEmail: s.email,
            department: s.department?.name || 'N/A',
            fileName: file.displayName || file.originalName,
            filePath: file.path,
            comment: file.comment,
            uploadedAt: file.uploadedAt
          });
        });
      }
    });
    
    allFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    res.json(allFiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Helper function to send birthday wish email
// ----------------------
const sendBirthdayWishEmail = async (staffName, staffEmail) => {
  try {
    const subject = `🎉 Happy Birthday, ${staffName}! - Xtreme Cr8ivity`;
    
    const emailBody = `Dear ${staffName},

On this special day, we at Xtreme Cr8ivity want to take a moment to celebrate YOU!

Your dedication, creativity, and positive energy have made a wonderful impact on our team. We truly appreciate everything you bring to the table, and we're grateful to have you as part of our Xtreme Cr8ivity family.

As you celebrate another year of life, we wish you:
✨ A year filled with joy, laughter, and unforgettable moments
✨ Success in all your endeavors and personal goals
✨ Good health, happiness, and endless possibilities
✨ Continued growth and amazing achievements

May this birthday bring you closer to your dreams and fill your heart with warmth and contentment.

Enjoy your special day to the fullest!

With warm wishes and best regards,

🎨 The Xtreme Cr8ivity Team
"Creating Excellence, One Day at a Time"

---
This is an automated birthday wish from Xtreme Cr8ivity. We hope you have a fantastic day!`;

    await sendEmail([staffEmail], subject, emailBody);
    console.log(`✅ Birthday wish email sent to ${staffName} (${staffEmail})`);
  } catch (err) {
    console.error(`❌ Error sending birthday email to ${staffName}:`, err.message);
  }
};

// ----------------------
// Get upcoming birthdays for staff view
// ----------------------
router.get('/upcoming-birthdays', staffAuth, async (req, res) => {
  try {
    const allStaff = await User.find({ role: 'staff' }).select('name email birthday');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingBirthdays = [];
    const currentUser = req.staff;
    
    allStaff.forEach(staff => {
      if (staff.birthday) {
        const birthday = new Date(staff.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        const diffTime = thisYearBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const isCurrentUser = staff._id.toString() === currentUser._id.toString();
        
        if (diffDays >= 0 && diffDays <= 3) {
          upcomingBirthdays.push({
            staffId: staff._id,
            name: staff.name,
            email: staff.email,
            birthday: staff.birthday,
            daysUntil: diffDays,
            isCurrentUser: isCurrentUser
          });
        }
      }
    });
    
    // Check if current user has birthday today
    const currentUserBirthdayToday = upcomingBirthdays.find(b => b.isCurrentUser && b.daysUntil === 0);
    
    // If current user's birthday is today, send them a birthday wish email
    if (currentUserBirthdayToday) {
      sendBirthdayWishEmail(currentUserBirthdayToday.name, currentUserBirthdayToday.email);
      return res.json([currentUserBirthdayToday]);
    }
    
    // For other staff: show upcoming birthdays (1-3 days) AND today's birthdays of others
    // Exclude current user's own birthday from the list
    const filteredBirthdays = upcomingBirthdays.filter(b => !b.isCurrentUser);
    
    // Send birthday wish emails to staff members with birthdays today
    filteredBirthdays.forEach(birthday => {
      if (birthday.daysUntil === 0) {
        sendBirthdayWishEmail(birthday.name, birthday.email);
      }
    });
    
    res.json(filteredBirthdays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/staff/department-members/:deptId
const Department = require('../models/Department');
const { verifyUser } = require('../middleware/auth');
router.get('/department-members/:deptId', verifyUser, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.deptId).lean();
    const members = await User.find({ department: req.params.deptId, role: 'staff' })
      .select('name email _id').lean();
    const groupAdmins = (dept?.groupAdmins || []).map(id => id.toString());
    res.json({ members, groupAdmins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get monitored client projects
// ----------------------
router.get('/my-client-projects', staffAuth, async (req, res) => {
  try {
    const projects = await ClientProject.find({ monitors: req.staff._id })
      .populate('monitors', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Staff updates an assigned client project (deduct cards, add paid, update status)
// ----------------------
router.put('/my-client-project/:id', staffAuth, async (req, res) => {
  try {
    const { addCardsUsed, addTotalCardsPaid, deductionNote, status } = req.body;
    
    const project = await ClientProject.findOne({ _id: req.params.id, monitors: req.staff._id });
    if (!project) {
        return res.status(404).json({ message: 'Project not found or you are not an assigned monitor' });
    }

    if (status) project.status = status;

    // Handle adding paid cards (Monitors can do this)
    if (addTotalCardsPaid) {
      const amount = Number(addTotalCardsPaid);
      if (!isNaN(amount) && amount > 0) {
        const paymentLog = {
          amount,
          date: new Date(),
          performedBy: req.staff.name || 'Staff (Monitor)',
          _id: new mongoose.Types.ObjectId()
        };

        await ClientProject.collection.updateOne(
          { _id: project._id },
          { 
            $inc: { totalCardsPaid: amount },
            $push: { paymentHistory: paymentLog },
            $set: { updatedAt: new Date() }
          }
        );
        
        const refreshed = await ClientProject.findById(project._id).populate('monitors', 'name email');
        return res.json(refreshed);
      }
      return res.status(400).json({ message: 'Invalid amount for payment' });
    }

    // Handle deducting cards
    if (addCardsUsed) {
      const amount = Number(addCardsUsed);
      if (!isNaN(amount) && amount !== 0) {
        const newLog = {
          amount,
          note: deductionNote || '',
          date: new Date(),
          performedBy: req.staff.name || 'Staff',
          _id: new mongoose.Types.ObjectId()
        };

        // Bypassing Mongoose for reliable array persistence
        await ClientProject.collection.updateOne(
          { _id: project._id },
          { 
            $inc: { cardsUsed: amount },
            $push: { deductionHistory: newLog },
            $set: { updatedAt: new Date() }
          }
        );
        
        const refreshed = await ClientProject.findById(project._id).populate('monitors', 'name email');
        return res.json(refreshed);
      }
    }

    const savedProject = await project.save();
    await savedProject.populate('monitors', 'name email');
    res.json(savedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get my client projects (assigned only)
// ----------------------
router.get('/my-client-projects', staffAuth, async (req, res) => {
  try {
    const projects = await ClientProject.find({ monitors: req.staff._id }).populate('monitors', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Update my assigned client project
// ----------------------
router.put('/my-client-project/:id', staffAuth, async (req, res) => {
  try {
    const { addCardsUsed, addTotalCardsPaid, deductionNote } = req.body;
    const project = await ClientProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Verify assignment
    const isMonitor = project.monitors.some(m => m.toString() === req.staff._id.toString());
    if (!isMonitor) return res.status(403).json({ message: 'Not assigned to this client' });

    if (addCardsUsed) {
      const amount = Number(addCardsUsed);
      project.cardsUsed = (project.cardsUsed || 0) + amount;
      project.deductionHistory.push({
        amount,
        note: deductionNote || 'Staff deduction',
        date: new Date(),
        performedBy: req.staff.name
      });
    }

    if (addTotalCardsPaid) {
      const amount = Number(addTotalCardsPaid);
      project.totalCardsPaid = (project.totalCardsPaid || 0) + amount;
      project.paymentHistory.push({
        amount,
        date: new Date(),
        performedBy: req.staff.name
      });
    }

    await project.save();
    const populated = await ClientProject.findById(project._id).populate('monitors', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get staff profile
// ----------------------
router.get('/my-profile', staffAuth, async (req, res) => {
  try {
    const staff = await User.findById(req.staff._id).populate('department');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get staff files
// ----------------------
router.get('/my-files', staffAuth, async (req, res) => {
  try {
    const staff = await User.findById(req.staff._id).select('uploadedFiles');
    res.json(staff.uploadedFiles || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
