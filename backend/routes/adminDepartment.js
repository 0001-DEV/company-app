<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// -----------------------------
// CREATE NEW DEPARTMENT
// -----------------------------
// -----------------------------
// CREATE NEW DEPARTMENT
// -----------------------------
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

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// -----------------------------
// CREATE NEW DEPARTMENT
// -----------------------------
// -----------------------------
// CREATE NEW DEPARTMENT
// -----------------------------
// -----------------------------
// CREATE NEW DEPARTMENT
// -----------------------------
router.post('/create-department', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Check if a department with this name already exists
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: `Department "${name}" already exists` });
    }

    // Create new department
    const department = new Department({ name });
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
      { name },
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

module.exports = router;
>>>>>>> 500de3921b8b68c26e46441c078fdc0e74f56b00
