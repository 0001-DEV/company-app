const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['add', 'deduct'], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addedByName: { type: String, required: true }
});

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentQuantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'pcs' },
  monitor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  monitorName: { type: String, default: '' },
  transactions: [stockTransactionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create unique index with sparse option to handle null values
stockSchema.index({ name: 1 }, { unique: true, sparse: true });

// Delete cached model so schema updates always take effect
delete mongoose.models.Stock;

module.exports = mongoose.model('Stock', stockSchema);
