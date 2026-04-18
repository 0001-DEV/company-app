const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//  router.get('/test', (req, res) => {
//    res.send('Admin routes are working!');
//  });
// const Staff = require('../models/Staff');
const Department = require('../models/Department');
const Job = require('../models/Job');
const Admin = require('../models/Admin');
const User = require('../models/User');
const ClientProject = require('../models/ClientProject');
const { formatName } = require('../utils/nameFormatter');
const { sendEmail } = require('../utils/notifications');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'mysecret';
const adminAuth = require('../middleware/adminAuth');
const { verifyUser } = require('../middleware/auth');
const multer = require('multer');
const XLSX = require('xlsx');

// Excel upload (for bulk staff import)
const excelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const uploadExcel = multer({ storage: excelStorage });

// Image upload (for staff profile pictures)
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const uploadImage = multer({ storage: imageStorage });

// 🟢 Admin login

router.get('/admin-dashboard', adminAuth, (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

router.post("/login", async (req, res) => {

    const { email, password } = req.body;
  try {
    const admin = await User.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Not an admin account" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: 'admin', profilePicture: admin.profilePicture || '' }
    });

  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});


// 👑 Admin creates a new staff
router.post('/create-staff', uploadImage.single('profilePicture'), async (req, res) => {
  try {
    const { name, email, phone, password, departmentId, birthday } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: formatName(name),
      email,
      phone: phone || '',
      password: hashedPassword,
      plainPassword: password,
      role: 'staff',
      department: departmentId,
      profilePicture: req.file ? `/uploads/${req.file.filename}` : '',
      birthday: birthday && birthday !== '' ? birthday : undefined
    });

    await newUser.save();

    const populatedUser = await User.findById(newUser._id).populate('department');

    res.status(201).json(populatedUser);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.adminId = decoded.id;
    next();
  });
};

// 🗑 Admin deletes a staff
// routes/admin.js
// Delete staff route
router.delete('/delete-staff/:id', adminAuth, async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// 📊 Admin gets all staff
router.get('/all-staff', async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' })
      .populate('department')
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📥 Export all staff as CSV
router.get('/export-staff', adminAuth, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).populate('department').sort({ name: 1 });

    const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const headers = ['Name', 'Email', 'Phone', 'Department', 'Date Joined'];
    const rows = staff.map(s => [
      escape(s.name),
      escape(s.email),
      escape(s.phone || ''),
      escape(s.department?.name || ''),
      escape(s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB') : ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const date = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Staff_Directory_${date}.csv"`);
    res.send('\uFEFF' + csvContent); // BOM for Excel UTF-8 compatibility
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





// 📝 Admin creates a new job
router.post('/create-job', async (req, res) => {
  try {
    const { title, company, description, departmentId, assignedStaffIds } = req.body;

    const newJob = new Job({
      title,
      company,
      description,
      department: departmentId,
      assignedStaff: assignedStaffIds // array of staff IDs
    });

    await newJob.save();

    // Add this job to each assigned staff
    if (assignedStaffIds && assignedStaffIds.length > 0) {
      for (let staffId of assignedStaffIds) {
        const staff = await User.findById(staffId);
        if (staff) {
          staff.assignedJobs.push(newJob._id);
          await staff.save();
        }
      }
    }

    const populated = await Job.findById(newJob._id)
  .populate('assignedStaff', 'name email')
  .populate('department', 'name');

res.status(201).json({ job: populated });
} catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✏️ Admin edits a job
router.put('/edit-job/:id', async (req, res) => {
  try {
    const { title, company, description, departmentId, assignedStaffIds } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.title = title || job.title;
    job.company = company || job.company;
    job.description = description || job.description;
    job.department = departmentId || job.department;
    job.assignedStaff = assignedStaffIds || job.assignedStaff;

    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🗑 Admin deletes a job
router.delete('/delete-job/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Remove job from assigned staff
    await Promise.all(
  assignedStaffIds.map(async id => {
    const staff = await User.findById(id);
    if (staff && !staff.assignedJobs.includes(newJob._id)) {
      staff.assignedJobs.push(newJob._id);
      await staff.save();
    }
  })
);

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 📊 Admin gets all jobs with assigned staff
router.get('/all-jobs', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('assignedStaff', 'name email')
      .populate('department', 'name');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ➕ Admin adds staff to an existing job (grouping)
router.put('/add-staff-to-job/:jobId', async (req, res) => {
  try {
    const { staffIds } = req.body; // array of staff IDs to add
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Add new staff IDs (avoid duplicates)
    staffIds.forEach(id => {
      if (!job.assignedStaff.includes(id)) {
        job.assignedStaff.push(id);
      }
    });

    await job.save();

    // Add job to each staff's assignedJobs
    for (let staffId of staffIds) {
      const staff = await User.findById(staffId);
      if (staff && !staff.assignedJobs.includes(job._id)) {
        staff.assignedJobs.push(job._id);
        await staff.save();
      }
    }

    res.json({ message: 'Staff added to job successfully', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📊 Admin sees job progress
router.get('/job-progress/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('assignedStaff', 'name email')
      .populate('department', 'name');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({
      jobId: job._id,
      title: job.title,
      company: job.company,
      status: job.status,
      assignedStaff: job.assignedStaff,
      filesUploaded: job.files,
      comments: job.comments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📊 Admin sees staff stats
router.get('/staff-stats/:staffId', async (req, res) => {
  try {
    const staff = await User.findById(req.params.staffId)
      .populate('assignedJobs');

    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const totalJobs = staff.assignedJobs.length;
    const completedJobs = staff.assignedJobs.filter(job => job.status === 'completed').length;
    const pendingJobs = totalJobs - completedJobs;

    // Get unique companies worked for
    const companiesWorkedFor = [...new Set(staff.assignedJobs.map(job => job.company))];

    res.json({
      staffId: staff._id,
      name: staff.name,
      department: staff.department,
      totalJobs,
      completedJobs,
      pendingJobs,
      companiesWorkedFor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all departments
router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});


// ✏️ Edit staff
router.put('/edit-staff/:id', uploadImage.single('profilePicture'), async (req, res) => {
  try {
    const { name, email, phone, departmentId, password, birthday, removePicture } = req.body;
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    staff.name = name ? formatName(name) : staff.name;
    staff.email = email || staff.email;
    if (phone !== undefined) staff.phone = phone;
    staff.department = departmentId || staff.department;
    if (birthday !== undefined && birthday !== null) {
      staff.birthday = birthday === '' ? null : new Date(birthday);
    }

    // Handle picture removal
    if (removePicture === 'true') {
      staff.profilePicture = '';
    } else if (req.file) {
      staff.profilePicture = `/uploads/${req.file.filename}`;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password, salt);
      staff.plainPassword = password;
    }

    await staff.save();

    const updatedStaff = await User.findById(req.params.id).populate('department');

    res.json({ 
      message: 'Staff updated successfully',
      staff: updatedStaff 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📋 Get fixed list of departments for dropdown
router.get('/fixed-departments', async (req, res) => {
  try {
    // This endpoint is deprecated - use /api/admin/departments instead
    // Simply return all existing departments without recreating deleted ones
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    console.error("Error in fixed-departments:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/department-members/:deptId — get all members + group admins + settings
router.get('/department-members/:deptId', async (req, res) => {
  try {
    const dept = await Department.findById(req.params.deptId).lean();
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const members = await User.find({ department: req.params.deptId, role: 'staff' })
      .select('name email _id').lean();
    const groupAdmins = (dept?.groupAdmins || []).map(id => id.toString());
    res.json({ members, groupAdmins, onlyAdminsCanSend: dept.onlyAdminsCanSend || false, disappearAfterDays: dept.disappearAfterDays || 0 });
  } catch (err) {
    console.error('department-members error:', err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/department-group-admin/:deptId — toggle group admin for a user
router.put('/department-group-admin/:deptId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    const dept = await Department.findById(req.params.deptId);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const admins = (dept.groupAdmins || []).map(id => id.toString());
    if (admins.includes(userId)) {
      dept.groupAdmins = dept.groupAdmins.filter(id => id.toString() !== userId);
    } else {
      dept.groupAdmins.push(userId);
    }
    await dept.save();
    res.json({ groupAdmins: dept.groupAdmins.map(id => id.toString()) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/department-settings/:deptId — toggle onlyAdminsCanSend (main admin or group admin)
router.put('/department-settings/:deptId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const dept = await Department.findById(req.params.deptId);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    const isMainAdmin = user.role === 'admin';
    const isGroupAdmin = (dept.groupAdmins || []).map(id => id.toString()).includes(user._id.toString());
    if (!isMainAdmin && !isGroupAdmin) return res.status(403).json({ message: 'Not authorized' });

    const { onlyAdminsCanSend } = req.body;
    dept.onlyAdminsCanSend = onlyAdminsCanSend;
    await dept.save();
    res.json({ onlyAdminsCanSend: dept.onlyAdminsCanSend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/staff/:id
router.get('/staff/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('department');
    if (!user) return res.status(404).json({ message: 'Staff not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/staffs?page=1&limit=10
router.get('/staffs', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const total = await User.countDocuments({ role: 'staff' });
    const staffs = await User.find({ role: 'staff' })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('department');

    res.json({ staffs, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create department
router.post('/create-department', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ message: `Department "${name}" already exists` });

    const newDept = new Department({ name, description: description || '' });
    await newDept.save();
    res.status(201).json(newDept);
  } catch (err) {
    console.error('create-department error:', err);
    // Handle mongo duplicate key
    if (err.code === 11000) return res.status(400).json({ message: 'A department with that name already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------
// Bulk upload staff via Excel
// ----------------------
// Expected columns (case-sensitive depends on your sheet):
// - Name (required)
// - Email (required, unique)
// - Password (optional, default: 123456)
// - Department (optional, will create if missing)
// - Birthday (optional, e.g. 1999-01-31)
router.post('/bulk-upload-staff', adminAuth, uploadExcel.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames?.[0];
    if (!sheetName) return res.status(400).json({ message: 'Invalid Excel file: no sheet found' });

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    console.log(`Processing ${rows.length} rows from bulk upload`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const name = (row.Name || row.FullName || row.name || '').toString().trim();
      const email = (row.Email || row.email || '').toString().trim().toLowerCase();
      const phone = (row.Phone || row.phone || row.PhoneNumber || row['Phone Number'] || '').toString().trim();
      const password = (row.Password || row.password || '').toString().trim() || '123456';
      const deptName = (row.Department || row.DepartmentName || row.department || '').toString().trim();
      const birthdayRaw = row.Birthday || row.birthday || row.DOB || row.dob || '';
      const picture = (row.Picture || row.ProfilePicture || row.picture || row.profilePicture || '').toString().trim();

      if (!name || !email) {
        console.log(`Skipping row due to missing name or email: name="${name}", email="${email}"`);
        skippedCount++;
        continue;
      }

      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`Skipping row due to existing email: ${email}`);
        skippedCount++;
        continue;
      }

      let departmentId = undefined;
      if (deptName) {
        let dept = await Department.findOne({ name: deptName });
        if (!dept) {
          console.log(`Creating new department: ${deptName}`);
          dept = await Department.create({ name: deptName });
        }
        departmentId = dept._id;
      }

      let birthday = undefined;
      if (birthdayRaw) {
        const d = new Date(birthdayRaw);
        if (!Number.isNaN(d.getTime())) {
          birthday = d;
        } else {
          console.log(`Invalid birthday format for ${name}: ${birthdayRaw}`);
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name: formatName(name),
        email,
        phone,
        password: hashedPassword,
        plainPassword: password,
        role: 'staff',
        department: departmentId,
        birthday: birthday,
        profilePicture: picture,
        assignedJobs: [] // Ensure assignedJobs is initialized as an empty array
      });

      console.log(`Created staff: ${newUser.name} (${newUser.email})`);
      createdCount++;
    }

    console.log(`Bulk upload finished: ${createdCount} created, ${skippedCount} skipped`);
    res.json({ message: 'Bulk upload completed', createdCount, skippedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Bulk upload failed' });
  }
});

// Edit department
router.put('/edit-department/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name cannot be empty' });

    // Check for duplicate name (excluding this document)
    const existing = await Department.findOne({ name, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ message: `A department named "${name}" already exists` });

    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description: description !== undefined ? description : '' } },
      { new: true, runValidators: false }
    );
    if (!updated) return res.status(404).json({ message: 'Department not found' });
    res.json(updated);
  } catch (err) {
    console.error('edit-department error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete department
router.delete('/delete-department/:id', async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get all uploaded files from all staff
// ----------------------
router.get('/all-uploaded-files', verifyUser, async (req, res) => {
  try {
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
    
    // Sort by upload date (newest first)
    allFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    res.json(allFiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Toggle staff permission to view others' work
// ----------------------
router.put('/toggle-view-permission/:staffId', adminAuth, async (req, res) => {
  try {
    const staff = await User.findById(req.params.staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    staff.canViewOthersWork = !staff.canViewOthersWork;
    await staff.save();
    
    res.json({ 
      message: `Permission ${staff.canViewOthersWork ? 'granted' : 'revoked'}`,
      canViewOthersWork: staff.canViewOthersWork 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get staff with view permissions
// ----------------------
router.get('/staff-with-permissions', adminAuth, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' })
      .select('name email canViewOthersWork department profilePicture')
      .populate('department', 'name');
    
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Admin delete any staff file (no time limit) - moves to recycle bin
// ----------------------
router.delete('/delete-staff-file/:staffId/:fileId', adminAuth, async (req, res) => {
  try {
    const { staffId, fileId } = req.params;
    const staff = await User.findById(staffId);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const fileIndex = staff.uploadedFiles.findIndex(f => f._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = staff.uploadedFiles[fileIndex];
    
    // Move to recycle bin
    staff.recycleBin.push({
      ...file.toObject(),
      deletedAt: new Date(),
      deletedBy: req.user.id
    });

    // Remove from uploaded files
    staff.uploadedFiles.splice(fileIndex, 1);
    await staff.save();

    res.json({ message: 'File moved to recycle bin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Rename a staff uploaded work (Work Bank label)
// Allowed for:
// - admin (role === 'admin')
// - staff with canViewOthersWork === true
// ----------------------
router.put('/rename-staff-file/:staffId/:fileId', verifyUser, async (req, res) => {
  try {
    const { staffId, fileId } = req.params;
    const { displayName } = req.body || {};

    const actor = await User.findById(req.user.id).select('role canViewOthersWork');
    if (!actor) return res.status(404).json({ message: 'Actor not found' });

    const canRename =
      actor.role === 'admin' ||
      (actor.role === 'staff' && actor.canViewOthersWork === true);

    if (!canRename) return res.status(403).json({ message: 'Not authorized to rename work' });

    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const file = staff.uploadedFiles.id(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.displayName = (displayName ?? '').toString().trim();
    await staff.save();

    res.json({ message: 'Work renamed successfully', file });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get recycle bin contents
// ----------------------
router.get('/recycle-bin', adminAuth, async (req, res) => {
  try {
    const allStaff = await User.find({ role: 'staff' }).select('name email recycleBin');
    
    const deletedFiles = [];
    allStaff.forEach(staff => {
      staff.recycleBin.forEach(file => {
        deletedFiles.push({
          staffId: staff._id,
          staffName: staff.name,
          staffEmail: staff.email,
          file: file
        });
      });
    });

    // Sort by deletion date (newest first)
    deletedFiles.sort((a, b) => new Date(b.file.deletedAt) - new Date(a.file.deletedAt));

    res.json(deletedFiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Restore file from recycle bin
// ----------------------
router.post('/restore-file/:staffId/:fileId', adminAuth, async (req, res) => {
  try {
    const { staffId, fileId } = req.params;
    const staff = await User.findById(staffId);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const fileIndex = staff.recycleBin.findIndex(f => f._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found in recycle bin' });
    }

    const file = staff.recycleBin[fileIndex];
    
    // Restore to uploaded files
    staff.uploadedFiles.push({
      path: file.path,
      originalName: file.originalName,
      displayName: file.displayName,
      comment: file.comment,
      uploadedAt: file.uploadedAt
    });

    // Remove from recycle bin
    staff.recycleBin.splice(fileIndex, 1);
    await staff.save();

    res.json({ message: 'File restored successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Permanently delete file from recycle bin
// ----------------------
router.delete('/permanent-delete/:staffId/:fileId', adminAuth, async (req, res) => {
  try {
    const { staffId, fileId } = req.params;
    const staff = await User.findById(staffId);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const fileIndex = staff.recycleBin.findIndex(f => f._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found in recycle bin' });
    }

    // Remove from recycle bin permanently
    staff.recycleBin.splice(fileIndex, 1);
    await staff.save();

    res.json({ message: 'File permanently deleted' });
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
// Get upcoming birthdays (within 3 days)
// ----------------------
router.get('/upcoming-birthdays', adminAuth, async (req, res) => {
  try {
    const allStaff = await User.find({ role: 'staff' }).select('name email birthday');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingBirthdays = [];
    
    allStaff.forEach(staff => {
      if (staff.birthday) {
        const birthday = new Date(staff.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        const diffTime = thisYearBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 3) {
          upcomingBirthdays.push({
            staffId: staff._id,
            name: staff.name,
            email: staff.email,
            birthday: staff.birthday,
            daysUntil: diffDays,
            isCurrentUser: false
          });
          
          // Send birthday wish email automatically for today's birthdays
          if (diffDays === 0) {
            sendBirthdayWishEmail(staff.name, staff.email);
          }
        }
      }
    });
    
    res.json(upcomingBirthdays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Update staff birthday
// ----------------------
router.put('/update-birthday/:staffId', adminAuth, async (req, res) => {
  try {
    const { birthday } = req.body;
    const staff = await User.findById(req.params.staffId);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    staff.birthday = birthday;
    await staff.save();
    
    res.json({ message: 'Birthday updated successfully', staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Send birthday wish email to a staff member
// ----------------------
router.post('/send-birthday-wish/:staffId', adminAuth, async (req, res) => {
  try {
    const staff = await User.findById(req.params.staffId);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (!staff.email) {
      return res.status(400).json({ message: 'Staff email not found' });
    }

    // Compose a well-written birthday wish email
    const subject = `🎉 Happy Birthday, ${staff.name}! - Xtreme Cr8ivity`;
    
    const emailBody = `Dear ${staff.name},

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

    // Send the email
    const emailSent = await sendEmail([staff.email], subject, emailBody);

    if (emailSent) {
      res.json({ 
        message: `Birthday wish email sent successfully to ${staff.name}!`,
        staffName: staff.name,
        staffEmail: staff.email
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send birthday wish email. Please check email configuration.',
        staffName: staff.name
      });
    }
  } catch (err) {
    console.error('Error sending birthday wish:', err);
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Verify admin password (for credential page gate)
// ----------------------
router.post('/verify-password', adminAuth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const match = await bcrypt.compare(req.body.password, admin.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Get all staff credentials (admin only)
// ----------------------
router.get('/staff-credentials', adminAuth, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' })
      .select('name email department createdAt')
      .populate('department', 'name');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// Update staff email/password (admin only)
// ----------------------
router.put('/staff-credentials/:id', adminAuth, async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') return res.status(404).json({ message: 'Staff not found' });

    if (email) staff.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password, salt);
      // plainPassword intentionally not stored
    }
    await staff.save();
    res.json({ message: 'Credentials updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// CLIENT WORK PROGRESS (CRM) ROUTES
// ==========================================

// GET all client projects
router.get('/client-projects', adminAuth, async (req, res) => {
  try {
    const projects = await ClientProject.find().populate('monitors', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET client projects for assigned staff (monitors)
router.get('/client-projects/staff/assigned', verifyUser, async (req, res) => {
  try {
    // If admin, return all projects
    if (req.user.role === 'admin') {
      const projects = await ClientProject.find().populate('monitors', 'name email').sort({ createdAt: -1 });
      return res.json(projects);
    }

    // If staff, return only projects they're assigned to
    const projects = await ClientProject.find({ monitors: req.user.id }).populate('monitors', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new client project
router.post('/client-project', adminAuth, async (req, res) => {
  try {
    const { companyName, planType, totalCardsPaid, dateReceived, dateStarted, status, monitors, cardMaterials } = req.body;
    
    if (!companyName || !planType || !dateReceived || !dateStarted) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const initialPaid = planType === 'Retainership' ? (Number(totalCardsPaid) || 0) : 0;
    
    const newProject = new ClientProject({
      companyName,
      planType,
      totalCardsPaid: initialPaid,
      cardsUsed: 0,
      cardMaterials: cardMaterials || [],
      dateReceived,
      dateStarted,
      status: status || 'Designed',
      monitors: monitors || [],
      paymentHistory: initialPaid > 0 ? [{
        amount: initialPaid,
        date: new Date(),
        performedBy: 'Admin (Initial)',
        _id: new mongoose.Types.ObjectId()
      }] : []
    });

    await newProject.save();
    
    const populatedProject = await ClientProject.findById(newProject._id).populate('monitors', 'name email');
    res.status(201).json(populatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update client project (Admin or Assigned Monitor)
router.put('/client-project/:id', verifyUser, async (req, res) => {
  try {
    const { 
      companyName, planType, totalCardsPaid, cardsUsed, 
      addCardsUsed, addTotalCardsPaid, deductionNote, 
      dateReceived, dateStarted, status, monitors, cardMaterials 
    } = req.body;
    
    console.log('PUT /client-project/:id called');
    console.log('User:', req.user);
    console.log('Payload:', { addTotalCardsPaid, addCardsUsed, deductionNote });
    
    const project = await ClientProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Client project not found' });

    // Check permissions: Admin or assigned monitor
    const isAdmin = req.user.role === 'admin';
    const isMonitor = project.monitors.some(m => m.toString() === req.user.id);

    console.log('isAdmin:', isAdmin, 'isMonitor:', isMonitor);
    console.log('Project monitors:', project.monitors);

    if (!isAdmin && !isMonitor) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to monitor this client.' });
    }

    // Admin-only fields
    if (isAdmin) {
      if (companyName) project.companyName = companyName;
      if (planType) project.planType = planType;
      if (dateReceived) project.dateReceived = dateReceived;
      if (dateStarted) project.dateStarted = dateStarted;
      if (monitors) project.monitors = monitors;
    }

    // Shared fields (Admin or Monitor)
    if (status) project.status = status;
    if (cardMaterials) project.cardMaterials = cardMaterials;
    
    if (totalCardsPaid !== undefined && (isAdmin || isMonitor)) {
      const newTotal = Number(totalCardsPaid);
      const oldTotal = project.totalCardsPaid || 0;
      if (newTotal !== oldTotal) {
        project.totalCardsPaid = newTotal;
        // Log the difference if increased
        if (newTotal > oldTotal) {
          project.paymentHistory.push({
            amount: newTotal - oldTotal,
            date: new Date(),
            performedBy: isAdmin ? 'Admin' : req.user.name,
            _id: new mongoose.Types.ObjectId()
          });
          project.markModified('paymentHistory');
        }
      }
    }

    if (cardsUsed !== undefined && (isAdmin || isMonitor)) project.cardsUsed = cardsUsed;

    // Logic for adding cards (Staff/Monitor can do this)
    if (addTotalCardsPaid && (isAdmin || isMonitor)) {
      const amount = Number(addTotalCardsPaid);
      console.log('Adding cards - amount:', amount, 'isNaN:', isNaN(amount));
      if (!isNaN(amount) && amount > 0) {
        console.log('Before update - totalCardsPaid:', project.totalCardsPaid);
        project.totalCardsPaid = (project.totalCardsPaid || 0) + amount;
        console.log('After update - totalCardsPaid:', project.totalCardsPaid);
        
        // Log payment history
        const paymentLog = {
          amount,
          date: new Date(),
          performedBy: isAdmin ? 'Admin' : req.user.name,
          _id: new mongoose.Types.ObjectId()
        };
        console.log('Payment log:', paymentLog);
        project.paymentHistory.push(paymentLog);
        project.markModified('paymentHistory');
        
        console.log('Saving project...');
        const savedProject = await project.save();
        console.log('Project saved, payment history:', savedProject.paymentHistory);
        await savedProject.populate('monitors', 'name email');
        return res.json(savedProject);
      }
    }

    if (addCardsUsed && (isAdmin || isMonitor)) {
      const amount = Number(addCardsUsed);
      if (!isNaN(amount) && amount !== 0) {
        const newLog = {
          amount,
          note: deductionNote || '',
          date: new Date(),
          performedBy: isAdmin ? 'Admin' : req.user.name,
          _id: new mongoose.Types.ObjectId()
        };

        const updateObj = { 
          $inc: { cardsUsed: amount },
          $set: { updatedAt: new Date() }
        };

        if (project.planType !== 'Pay as you go') {
          updateObj.$push = { deductionHistory: newLog };
        }

        await ClientProject.collection.updateOne(
          { _id: project._id },
          updateObj
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

// DELETE client project
router.delete('/client-project/:id', adminAuth, async (req, res) => {
  try {
    const project = await ClientProject.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Client project not found' });
    res.json({ message: 'Client project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── EXPORT CLIENT PROJECTS TO EXCEL ──
// GET /api/admin/export-client-projects?startDate=2024-01-01&endDate=2024-12-31&cardTypes=Business cards,Smart ID Card&companies=Company A,Company B
router.get('/export-client-projects', verifyUser, async (req, res) => {
  try {
    const { startDate, endDate, cardTypes, companies } = req.query;
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    // Parse filters
    const cardTypeFilter = cardTypes ? cardTypes.split(',').map(t => t.trim()) : [];
    const companyFilter = companies ? companies.split(',').map(c => c.trim()) : [];
    
    // Get all projects (admin sees all, staff sees only assigned)
    let projects;
    if (req.user.role === 'admin') {
      projects = await ClientProject.find().populate('monitors', 'name email');
    } else {
      projects = await ClientProject.find({ monitors: req.user.id }).populate('monitors', 'name email');
    }
    
    // Filter by company, date range, and card types
    const filtered = projects.filter(p => {
      // Filter by company
      const hasCompany = companyFilter.length === 0 || companyFilter.includes(p.companyName);
      
      // Filter by date range
      const hasDateRange = p.deductionHistory.some(d => new Date(d.date) >= start && new Date(d.date) <= end) ||
                          p.paymentHistory.some(d => new Date(d.date) >= start && new Date(d.date) <= end);
      
      // Filter by card type
      const hasCardType = cardTypeFilter.length === 0 || 
                         p.cardMaterials.some(m => cardTypeFilter.includes(m));
      
      return hasCompany && hasDateRange && hasCardType;
    });
    
    // Build Excel data
    const excelData = [];
    
    filtered.forEach(project => {
      // Filter history by date range
      const deductions = project.deductionHistory.filter(d => {
        const d_date = new Date(d.date);
        return d_date >= start && d_date <= end;
      });
      
      const payments = project.paymentHistory.filter(d => {
        const d_date = new Date(d.date);
        return d_date >= start && d_date <= end;
      });
      
      // Group deductions by card type (if available in note)
      const cardTypeUsage = {};
      deductions.forEach(d => {
        const cardType = d.note || 'General';
        if (!cardTypeUsage[cardType]) {
          cardTypeUsage[cardType] = 0;
        }
        cardTypeUsage[cardType] += d.amount;
      });
      
      // Create row for each card type
      const cardTypes = project.cardMaterials.length > 0 ? project.cardMaterials : ['General'];
      
      cardTypes.forEach(cardType => {
        const cardsUsed = cardTypeUsage[cardType] || 0;
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        
        excelData.push({
          'Company Name': project.companyName,
          'Card Type': cardType,
          'Plan Type': project.planType,
          'Cards Paid': totalPaid,
          'Cards Used': cardsUsed,
          'Cards Remaining': Math.max(0, totalPaid - cardsUsed),
          'Status': project.status,
          'Date Started': new Date(project.dateStarted).toLocaleDateString('en-GB'),
          'Date Received': new Date(project.dateReceived).toLocaleDateString('en-GB'),
          'Monitors': project.monitors.map(m => m.name).join(', ')
        });
      });
    });
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // Company Name
      { wch: 18 }, // Card Type
      { wch: 15 }, // Plan Type
      { wch: 12 }, // Cards Paid
      { wch: 12 }, // Cards Used
      { wch: 15 }, // Cards Remaining
      { wch: 12 }, // Status
      { wch: 15 }, // Date Started
      { wch: 15 }, // Date Received
      { wch: 20 }  // Monitors
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Client Projects');
    
    // Generate file
    const fileName = `Client_Projects_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filePath = `uploads/${fileName}`;
    
    XLSX.writeFile(workbook, filePath);
    
    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) console.error('Download error:', err);
    });
    
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 👥 Work Bank Access Management

// Get all staff for Work Bank access assignment
router.get('/workbank/staff-list', adminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const staff = await User.find({ role: 'staff' }).select('_id name email').sort({ name: 1 });
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Error fetching staff' });
  }
});

// Update Work Bank page access
router.post('/workbank/access/update', adminAuth, async (req, res) => {
  try {
    const WorkBankAccess = require('../models/WorkBankAccess');
    const mongoose = require('mongoose');
    const { staffIds } = req.body;
    
    console.log('Work Bank Access Update:');
    console.log('Received staffIds:', staffIds);
    
    // Convert staffIds to ObjectIds
    const objectIds = (staffIds || []).map(id => {
      if (typeof id === 'string') {
        return new mongoose.Types.ObjectId(id);
      }
      return id;
    });
    
    console.log('Converted ObjectIds:', objectIds.map(id => id.toString()));
    
    // Delete existing access and create new one
    await WorkBankAccess.deleteMany({});
    const access = new WorkBankAccess({
      staffIds: objectIds,
      updatedAt: new Date(),
      updatedBy: req.user.id
    });
    await access.save();
    
    console.log('Saved access:', access);
    
    res.json({ message: 'Work Bank access updated', access });
  } catch (err) {
    console.error('Error updating Work Bank access:', err);
    res.status(500).json({ message: 'Error updating Work Bank access' });
  }
});

// Grant Work Bank access to a staff member (called when assigning staff to upload work)
router.post('/workbank/access/grant/:staffId', adminAuth, async (req, res) => {
  try {
    const WorkBankAccess = require('../models/WorkBankAccess');
    const mongoose = require('mongoose');
    const { staffId } = req.params;
    
    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(staffId);
    
    // Get or create the access record
    let access = await WorkBankAccess.findOne();
    if (!access) {
      access = new WorkBankAccess({ staffIds: [] });
    }
    
    // Add staff ID if not already present (using string comparison for safety)
    const staffIdExists = access.staffIds.some(id => id.toString() === objectId.toString());
    if (!staffIdExists) {
      access.staffIds.push(objectId);
      await access.save();
    }
    
    res.json({ message: 'Work Bank access granted', access });
  } catch (err) {
    console.error('Error granting Work Bank access:', err);
    res.status(500).json({ message: 'Error granting Work Bank access' });
  }
});

// Get Work Bank page access
router.get('/workbank/access/get', adminAuth, async (req, res) => {
  try {
    const WorkBankAccess = require('../models/WorkBankAccess');
    const access = await WorkBankAccess.findOne().sort({ updatedAt: -1 });
    
    if (!access) {
      return res.json({ staffIds: [] });
    }
    
    res.json({ staffIds: access.staffIds || [] });
  } catch (err) {
    console.error('Error getting Work Bank access:', err);
    res.status(500).json({ message: 'Error getting Work Bank access' });
  }
});

// Check if user has Work Bank page access
router.get('/workbank/access/check', verifyUser, async (req, res) => {
  try {
    const WorkBankAccess = require('../models/WorkBankAccess');
    
    if (req.user.role === 'admin') {
      return res.json({ hasAccess: true });
    }
    
    const access = await WorkBankAccess.findOne().sort({ updatedAt: -1 });
    
    console.log('Work Bank Access Check:');
    console.log('User ID:', req.user.id);
    console.log('Access record:', access);
    console.log('Staff IDs in access:', access?.staffIds?.map(id => id.toString()));
    
    // Check if staff ID is in the access list (using string comparison for safety)
    const hasAccess = access && access.staffIds && access.staffIds.some(id => 
      id.toString() === req.user.id.toString()
    );
    
    console.log('Has access:', hasAccess);
    
    res.json({ hasAccess: hasAccess || false });
  } catch (err) {
    console.error('Error checking Work Bank access:', err);
    res.status(500).json({ message: 'Error checking Work Bank access' });
  }
});

module.exports = router;
