const mongoose = require('mongoose');

const birthdayLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  year: { type: Number, required: true },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' }
});

// Create a unique index to prevent duplicate sends
birthdayLogSchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('BirthdayLog', birthdayLogSchema);
