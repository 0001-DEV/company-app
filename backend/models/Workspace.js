const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  settings: {
    allowGuests: {
      type: Boolean,
      default: false
    },
    defaultPermissions: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'edit'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
workspaceSchema.index({ createdBy: 1 });
workspaceSchema.index({ members: 1 });
workspaceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Workspace', workspaceSchema);