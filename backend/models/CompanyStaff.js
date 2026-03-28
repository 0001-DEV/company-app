const mongoose = require('mongoose');

const companyStaffSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyMapping', required: true, unique: true },
  companyName: { type: String, required: true },
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedStaffNames: [{ type: String }],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedByName: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

delete mongoose.models.CompanyStaff;
module.exports = mongoose.model('CompanyStaff', companyStaffSchema);
