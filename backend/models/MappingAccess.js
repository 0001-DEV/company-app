const mongoose = require('mongoose');

const mappingAccessSchema = new mongoose.Schema({
  staffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('MappingAccess', mappingAccessSchema);
