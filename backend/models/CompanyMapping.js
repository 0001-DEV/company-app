const mongoose = require('mongoose');

const companyMappingSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyType: { type: String, default: '' },
  isDesigned: { type: Boolean, default: false },
  isDesignedAt: { type: Date },
  isDesignedBy: { type: String },
  isDesignedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPackageSent: { type: Boolean, default: false },
  isPackageSentAt: { type: Date },
  isPackageSentBy: { type: String },
  isPackageSentById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPackageReceived: { type: Boolean, default: false },
  isPackageReceivedAt: { type: Date },
  isPackageReceivedBy: { type: String },
  isPackageReceivedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cardType: { type: String, default: '' }, // JSON array: [{ type: 'Classic Lustre', quantity: 1 }]
  cardsProduced: { type: Number, default: 0 },
  businessCardType: { type: String, default: '' }, // JSON array: [{ type: 'Classic Lustre', quantity: 1 }]
  businessCardNo: { type: Number, default: 0 },
  cardHolderType: { type: String, default: '' },
  cardHolderNumber: { type: Number, default: 0 },
  lanyard: { type: String, default: '' },
  dateSent: { type: Date },
  delivered: { type: Boolean, default: false },
  reachedOut: { type: String, default: '' },
  clientComment: { type: String, default: '' },
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  yearUploaded: { type: Number, default: () => new Date().getFullYear() },
  monthUploaded: { type: String, default: () => new Date().toLocaleString('en-US', { month: 'long' }) },
  fullDateUploaded: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedByName: { type: String }
});

companyMappingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CompanyMapping', companyMappingSchema);
