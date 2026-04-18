const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// -----------------------------
// CREATE NEW DEPARTMENT
// -----------------------------
router.post('/create-department', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: `Department "${name}" already exists` });
    }

    const department = new Department({ name, description: req.body.description || '' });
    await department.save();

    // Return the saved department object
    return res.status(201).json(department);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});



// -----------------------------
// GET ALL DEPARTMENTS
// -----------------------------
router.get('/fixed-department', async (req, res) => {
  try {
    const department = await Department.find().sort({ name: 1 });
    return res.json(department);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------
// EDIT DEPARTMENT
// -----------------------------
router.put('/edit-department/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Department name cannot be empty' });
    }

    const updatedDept = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description: req.body.description ?? undefined },
      { new: true }
    );

    if (!updatedDept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json(updatedDept);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------
// DELETE DEPARTMENT
// -----------------------------
router.delete('/delete-department/:id', async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json({ message: 'Department deleted successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET DEPARTMENT MEMBERS
// -----------------------------
router.get('/department-members/:deptId', async (req, res) => {
  try {
    const dept = await Department.findById(req.params.deptId)
      .populate('members', 'name email')
      .populate('groupAdmins', 'name email');

    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json({
      members: dept.members || [],
      groupAdmins: dept.groupAdmins || [],
      onlyAdminsCanSend: dept.onlyAdminsCanSend || false,
      disappearAfterDays: dept.disappearAfterDays || 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ADD MEMBER TO DEPARTMENT
router.post('/department/:deptId/add-member', async (req, res) => {
  try {
    const { staffId } = req.body;
    const dept = await Department.findById(req.params.deptId);
    
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (!dept.members.includes(staffId)) {
      dept.members.push(staffId);
      await dept.save();
    }

    return res.json(dept);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// REMOVE MEMBER FROM DEPARTMENT
router.post('/department/:deptId/remove-member', async (req, res) => {
  try {
    const { staffId } = req.body;
    const dept = await Department.findById(req.params.deptId);
    
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    dept.members = dept.members.filter(m => m.toString() !== staffId);
    dept.groupAdmins = dept.groupAdmins.filter(a => a.toString() !== staffId);
    await dept.save();

    return res.json(dept);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// MAKE MEMBER AN ADMIN
router.post('/department/:deptId/make-admin', async (req, res) => {
  try {
    const { staffId } = req.body;
    const dept = await Department.findById(req.params.deptId);
    
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (!dept.groupAdmins.includes(staffId)) {
      dept.groupAdmins.push(staffId);
      await dept.save();
    }

    return res.json(dept);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// REMOVE ADMIN ROLE
router.post('/department/:deptId/remove-admin', async (req, res) => {
  try {
    const { staffId } = req.body;
    const dept = await Department.findById(req.params.deptId);
    
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    dept.groupAdmins = dept.groupAdmins.filter(a => a.toString() !== staffId);
    await dept.save();

    return res.json(dept);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE DEPARTMENT SETTINGS (who can send messages, disappear after days)
router.put('/department/:deptId/settings', async (req, res) => {
  try {
    const { onlyAdminsCanSend, disappearAfterDays } = req.body;
    const dept = await Department.findByIdAndUpdate(
      req.params.deptId,
      { onlyAdminsCanSend, disappearAfterDays },
      { new: true }
    );

    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.json(dept);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
