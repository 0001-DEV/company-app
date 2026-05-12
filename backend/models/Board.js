const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  backgroundImage: {
    type: String
  },
  canvasSettings: {
    width: {
      type: Number,
      default: 2000
    },
    height: {
      type: Number,
      default: 2000
    },
    gridSize: {
      type: Number,
      default: 20
    },
    showGrid: {
      type: Boolean,
      default: true
    }
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'edit'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
boardSchema.index({ workspaceId: 1 });
boardSchema.index({ createdBy: 1 });
boardSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Board', boardSchema);