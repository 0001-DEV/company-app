const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  progress: {
    type: String,
    default: ''
  },
  plans: {
    type: String,
    default: ''
  },
  problems: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one report per user per week per year
weeklyReportSchema.index({ userId: 1, weekNumber: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
