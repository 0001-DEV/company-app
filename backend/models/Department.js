const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groupAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  onlyAdminsCanSend: { type: Boolean, default: false },
  disappearAfterDays: { type: Number, default: 0 },
  pinnedMessages: [{
    messageId: { type: mongoose.Schema.Types.ObjectId },
    text: String,
    pinnedBy: String,
    pinnedAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Department', departmentSchema);
