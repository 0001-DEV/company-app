const express = require('express');
const router = express.Router();
//  router.get('/test', (req, res) => {
//    res.send('Admin routes are working!');
//  });
// const Staff = require('../models/Staff');
const Department = require('../models/Department');
const Job = require('../models/Job');
const Admin = require('../models/Admin');
const User = require('../models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'mysecret';
const adminAuth = require('../middleware/adminAuth');



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
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });

  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});


// 👑 Admin creates a new staff
router.post('/create-staff', async (req, res) => {
  try {
    const { name, email, password, departmentId } = req.body;

    const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

const newUser = new User({
  name,
  email,
  password: hashedPassword,
  role: 'staff',
  department: departmentId
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
router.delete('/delete-staff/:id', verifyToken, async (req, res) => {
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
    const staff = await User.find({ role: 'staff' }).populate('department');
    res.json(staff);
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
router.put('/edit-staff/:id', async (req, res) => {
  try {
    const { name, email, departmentId, password } = req.body;
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.department = departmentId || staff.department;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password, salt);
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
    const departmentNames = [
      "ICT Department",
      "Design Department",
      "Production Department",
      "Marketing Department",
      "Human Resources",
      "Finance Department",
      "Sales Department",
      "Customer Service",
      "Operations Department",
      "Research & Development",
      "Quality Assurance",
      "Legal Department",
      "Administration",
      "Logistics Department"
    ];

    console.log("Creating/fetching departments...");
    
    // Get all existing departments
    let departments = await Department.find();
    console.log("Existing departments:", departments.length);
    
    // If we have fewer than expected, create missing ones
    if (departments.length < departmentNames.length) {
      for (let name of departmentNames) {
        let dept = await Department.findOne({ name });
        if (!dept) {
          dept = new Department({ name });
          await dept.save();
          console.log("Created department:", name);
        }
      }
      // Fetch all again
      departments = await Department.find();
    }

    console.log("Returning departments:", departments.length);
    res.json(departments);
  } catch (err) {
    console.error("Error in fixed-departments:", err);
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
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const newDept = new Department({ name });
    await newDept.save();

    // ✅ Important: return the department object, not just a message
    res.status(201).json(newDept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------
// Get all uploaded files from all staff
// ----------------------
router.get('/all-uploaded-files', adminAuth, async (req, res) => {
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
            fileName: file.originalName,
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
      .select('name email canViewOthersWork department')
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

    
 module.exports = router;
