const mongoose = require('mongoose');

// Stores a frozen copy of a board's state at the end of a week
const weeklySnapshotSchema = new mongoose.Schema({
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskBoard', required: true, index: true },
  boardName: { type: String, required: true },
  weekLabel: { type: String, default: '' },
  days: [{ type: String }],
  members: { type: mongoose.Schema.Types.Mixed }, // full members array snapshot
  snapshotAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WeeklySnapshot', weeklySnapshotSchema);
