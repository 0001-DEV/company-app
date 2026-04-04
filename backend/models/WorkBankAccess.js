const mongoose = require('mongoose');

const workBankAccessSchema = new mongoose.Schema({
  staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('WorkBankAccess', workBankAccessSchema);
