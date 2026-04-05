const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
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

// Prevent re-compilation in serverless environment
module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);