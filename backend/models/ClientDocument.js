const mongoose = require('mongoose');

const clientDocumentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyMapping', required: true },
  companyName: { type: String, required: true, default: 'Unknown' },
  fileName: { type: String, required: true },
  cardType: { type: String, enum: ['Business Card', 'Smart Card', 'Duplex Card', 'De-Titan Card'], required: true },
  quantity: { type: Number, required: true, default: 0 },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedByName: { type: String, required: true },
  
  // History tracking (optional for backward compatibility)
  history: [{
    action: { type: String, enum: ['created', 'added', 'removed'], required: true },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, default: 0 },
    newQuantity: { type: Number, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    performedByName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedByName: { type: String },
  
  // Job assignment
  assignedJob: { type: String, default: '' },
  
  // Staff assignment
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedStaffNames: [{ type: String }]
});

delete mongoose.models.ClientDocument;
module.exports = mongoose.model('ClientDocument', clientDocumentSchema);
