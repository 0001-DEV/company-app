const express = require('express');
const router = express.Router();
const WeeklyReport = require('../models/WeeklyReport');
const { verifyUser } = require('../middleware/auth');

// Helper function to get ISO week number
const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Helper function to get current week and year
const getCurrentWeekAndYear = () => {
  const now = new Date();
  return {
    weekNumber: getISOWeek(now),
    year: now.getFullYear()
  };
};

// POST - Save weekly report
router.post('/submit', verifyUser, async (req, res) => {
  try {
    const { progress, plans, problems } = req.body;
    const { weekNumber, year } = getCurrentWeekAndYear();

    // Check if report already exists for this week
    const existing = await WeeklyReport.findOne({
      userId: req.user.id,
      weekNumber,
      year
    });

    if (existing) {
      // Update existing report
      existing.progress = progress || '';
      existing.plans = plans || '';
      existing.problems = problems || '';
      existing.updatedAt = new Date();
      await existing.save();
      return res.json({ message: 'Report updated successfully', report: existing });
    }

    // Create new report
    const newReport = new WeeklyReport({
      userId: req.user.id,
      weekNumber,
      year,
      progress: progress || '',
      plans: plans || '',
      problems: problems || ''
    });

    await newReport.save();
    res.status(201).json({ message: 'Report submitted successfully', report: newReport });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json({ message: 'Error submitting report', error: err.message });
  }
});

// GET - Fetch current week report for logged-in user
router.get('/current', verifyUser, async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeekAndYear();

    const report = await WeeklyReport.findOne({
      userId: req.user.id,
      weekNumber,
      year
    });

    if (!report) {
      return res.json({ report: null, weekNumber, year });
    }

    res.json({ report, weekNumber, year });
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ message: 'Error fetching report', error: err.message });
  }
});

// GET - Fetch all reports for current week (admin only)
router.get('/all-current', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const { weekNumber, year } = getCurrentWeekAndYear();

    const reports = await WeeklyReport.find({
      weekNumber,
      year
    }).populate('userId', 'name email department').populate('userId.department', 'name');

    res.json({ reports, weekNumber, year });
  } catch (err) {
    console.error('Error fetching all reports:', err);
    res.status(500).json({ message: 'Error fetching reports', error: err.message });
  }
});

module.exports = router;
