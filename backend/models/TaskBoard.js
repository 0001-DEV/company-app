const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const dayColumnSchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g. "MONDAY"
  tasks: [taskSchema]
});

const memberColumnSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true }, // display name
  color: { type: String, default: '#e53e3e' }, // column accent color
  days: [dayColumnSchema]
});

const taskBoardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekLabel: { type: String, default: '' }, // e.g. "Week of May 12"
  days: [{ type: String }], // ordered list of days shown
  members: [memberColumnSchema]
}, { timestamps: true });

taskBoardSchema.index({ createdBy: 1 });

module.exports = mongoose.model('TaskBoard', taskBoardSchema);
