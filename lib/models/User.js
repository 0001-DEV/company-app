const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  plainPassword: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'staff'], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  profilePicture: { type: String, default: '' },
  birthday: { type: Date },
  assignedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  uploadedFiles: [{
    path: String,
    originalName: String,
    displayName: { type: String, default: '' },
    comment: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  recycleBin: [{
    path: String,
    originalName: String,
    comment: { type: String, default: '' },
    uploadedAt: Date,
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  canViewOthersWork: { type: Boolean, default: false },
  starredMessages: [{
    messageId: { type: mongoose.Schema.Types.ObjectId },
    text: String,
    senderName: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Prevent re-compilation in serverless environment
module.exports = mongoose.models.User || mongoose.model('User', userSchema);