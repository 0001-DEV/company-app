const mongoose = require('mongoose');

const stockManagerSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  staffName: { type: String, required: true },
  staffEmail: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

delete mongoose.models.StockManager;

module.exports = mongoose.model('StockManager', stockManagerSchema);
