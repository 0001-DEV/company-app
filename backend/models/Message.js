const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true },
  text: { type: String, default: "" },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reactions: [{
    emoji: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: String,
  }],
  replyTo: {
    messageId: { type: mongoose.Schema.Types.ObjectId },
    senderName: String,
    text: String,
  },
  forwardedFrom: { type: String, default: null },
  isMissedCall: { type: Boolean, default: false },
  files: [{
    path: String,
    originalName: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);