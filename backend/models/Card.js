const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'video', 'link', 'todo', 'file', 'comment', 'moodboard', 'embed']
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Position and size
  x: {
    type: Number,
    required: true,
    default: 0
  },
  y: {
    type: Number,
    required: true,
    default: 0
  },
  width: {
    type: Number,
    required: true,
    default: 200
  },
  height: {
    type: Number,
    required: true,
    default: 150
  },
  rotation: {
    type: Number,
    default: 0
  },
  zIndex: {
    type: Number,
    default: 1
  },
  
  // Content
  content: {
    type: String,
    default: ''
  },
  
  // Rich content for different card types
  richContent: {
    // For text cards
    html: String,
    
    // For image/video cards
    url: String,
    thumbnailUrl: String,
    
    // For link cards
    linkUrl: String,
    linkTitle: String,
    linkDescription: String,
    linkImage: String,
    
    // For todo cards
    todos: [{
      id: String,
      text: String,
      completed: Boolean,
      createdAt: Date
    }],
    
    // For file cards
    fileName: String,
    fileSize: Number,
    fileType: String,
    filePath: String
  },
  
  // Styling
  style: {
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    textColor: {
      type: String,
      default: '#000000'
    },
    borderColor: {
      type: String,
      default: 'transparent'
    },
    borderWidth: {
      type: Number,
      default: 0
    },
    borderRadius: {
      type: Number,
      default: 8
    },
    fontSize: {
      type: Number,
      default: 14
    },
    fontFamily: {
      type: String,
      default: 'Inter'
    },
    opacity: {
      type: Number,
      default: 1,
      min: 0,
      max: 1
    }
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  // Comments
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Collaboration
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Version history
  version: {
    type: Number,
    default: 1
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
cardSchema.index({ boardId: 1 });
cardSchema.index({ createdBy: 1 });
cardSchema.index({ type: 1 });
cardSchema.index({ tags: 1 });
cardSchema.index({ 'content': 'text', 'richContent.linkTitle': 'text' });

// Virtual for card bounds (for collision detection)
cardSchema.virtual('bounds').get(function() {
  return {
    left: this.x,
    top: this.y,
    right: this.x + this.width,
    bottom: this.y + this.height
  };
});

module.exports = mongoose.model('Card', cardSchema);