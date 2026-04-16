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
    console.log('Submitting weekly report for user:', req.user.id);
    const { progress, plans, problems } = req.body;
    const { weekNumber, year } = getCurrentWeekAndYear();

    // Check if report already exists for this week
    let report = await WeeklyReport.findOne({
      userId: req.user.id,
      weekNumber,
      year
    });

    if (report) {
      console.log('Updating existing report');
      // Update existing report
      report.progress = progress || '';
      report.plans = plans || '';
      report.problems = problems || '';
      report.updatedAt = new Date();
      await report.save();
    } else {
      console.log('Creating new report');
      // Create new report
      report = new WeeklyReport({
        userId: req.user.id,
        weekNumber,
        year,
        progress: progress || '',
        plans: plans || '',
        problems: problems || ''
      });
      await report.save();
    }

    res.status(201).json({ message: 'Report saved successfully', report });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json({ message: 'Error submitting report', error: err.message });
  }
});

// GET - Fetch current week report for logged-in user
router.get('/current', verifyUser, async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeekAndYear();
    console.log(`Fetching report for user ${req.user.id}, week ${weekNumber}, year ${year}`);

    const report = await WeeklyReport.findOne({
      userId: req.user.id,
      weekNumber,
      year
    });

    if (!report) {
      console.log('No report found for this week');
      return res.json({ report: null, weekNumber, year });
    }

    console.log('Report found:', report._id);
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

    // Do NOT delete reports here, it's not the right place and can lead to data loss
    // (Optional) We could have a separate maintenance job for this if needed.

    const reports = await WeeklyReport.find({
      weekNumber,
      year
    }).populate({
      path: 'userId',
      select: 'name email department profilePicture',
      populate: { path: 'department', select: 'name' }
    });

    // Map userId to user for frontend compatibility
    const formattedReports = reports.map(report => ({
      ...report.toObject(),
      user: report.userId
    }));

    res.json({ reports: formattedReports, weekNumber, year });
  } catch (err) {
    console.error('Error fetching all reports:', err);
    res.status(500).json({ message: 'Error fetching reports', error: err.message });
  }
});

module.exports = router;
