const mongoose = require('mongoose');

const deductionLogSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  performedBy: { type: String, default: '' }
}, { _id: true });

const paymentLogSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  performedBy: { type: String, default: '' }
}, { _id: true });

const clientProjectSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  planType: { type: String, enum: ['Retainership', 'Pay as you go'], required: true },
  totalCardsPaid: { type: Number, default: 0 },
  cardsUsed: { type: Number, default: 0 },
  cardMaterials: [{ type: String }],
  deductionHistory: [deductionLogSchema],
  paymentHistory: [paymentLogSchema],
  dateReceived: { type: Date, required: true },
  dateStarted: { type: Date, required: true },
  status: { type: String, enum: ['Designed', 'Printed', 'Dispatched'], default: 'Designed' },
  monitors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

clientProjectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ClientProject', clientProjectSchema);
