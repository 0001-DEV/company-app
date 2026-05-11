const mongoose = require('mongoose');

const typingIndicatorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  conversationId: { type: String, required: true }, // Can be userId, "department:deptId", or "all" for team chat
  isTyping: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, expires: 5 } // Auto-delete after 5 seconds
});

module.exports = mongoose.model("TypingIndicator", typingIndicatorSchema);
