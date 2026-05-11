const mongoose = require('mongoose');

const pinnedMessageSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  conversationId: { type: String, required: true }, // Can be userId, "department:deptId", or "all" for team chat
  pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pinnedByName: { type: String, required: true },
  reason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PinnedMessage", pinnedMessageSchema);
