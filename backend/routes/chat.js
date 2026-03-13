// routes/chat.js
const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middleware/auth");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Message model
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true },
  text: { type: String, required: true },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  files: [{
    path: String,
    originalName: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

// Get current user info
router.get("/me", verifyUser, (req, res) => {
  res.json({
    name: req.user.name,
    role: req.user.role,
    id: req.user.id
  });
});

// Get staff list (admin only)
router.get("/users", verifyUser, async (req, res) => {
  try {
    console.log("Fetching users list for:", req.user.role);
    
    if (req.user.role === "admin") {
      // Admin sees all staff members
      let staff = await User.find({ role: "staff" }).select("name email role");
      
      if (staff.length === 0) {
        staff = await User.find({ role: { $ne: "admin" } }).select("name email role");
        console.log("No staff with role='staff', fetching all non-admin users:", staff.length);
      }
      
      console.log("Found staff for admin:", staff.length);
      res.json(staff);
    } else if (req.user.role === "staff") {
      // Staff sees admin and other staff members
      const users = await User.find({ 
        $or: [
          { role: "admin" },
          { role: "staff", _id: { $ne: req.user.id } }
        ]
      }).select("name email role");
      
      console.log("Found users for staff:", users.length);
      res.json(users);
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get messages (filtered for admin by userId query param)
router.get("/messages", verifyUser, async (req, res) => {
  try {
    let query = {};
    const { userId, departmentId } = req.query;

    if (req.user.role === "admin") {
      if (userId) {
        // Private chat between admin and specific user
        query = {
          $or: [
            { senderId: req.user.id, receiverId: userId },
            { senderId: userId, receiverId: req.user.id }
          ]
        };
      } else if (departmentId) {
        // Department chat - messages sent to this department
        query = { receiverId: `department:${departmentId}` };
      }
      // If no filter, show all messages (team chat)
    } else if (req.user.role === "staff") {
      // Staff member viewing messages
      if (userId) {
        // Private chat between staff and specific user (usually admin)
        query = {
          $or: [
            { senderId: req.user.id, receiverId: userId },
            { senderId: userId, receiverId: req.user.id }
          ]
        };
      } else if (departmentId) {
        // Department chat
        query = { receiverId: `department:${departmentId}` };
      } else {
        // Team chat - only messages sent to "all"
        query = { receiverId: "all" };
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(100);
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// POST /api/chat/message
router.post("/message", verifyUser, upload.array('files', 10), async (req, res) => {
  try {
    const { text, receiverId } = req.body;
    
    const files = req.files ? req.files.map(file => ({
      path: file.path,
      originalName: file.originalname,
      uploadedAt: new Date()
    })) : [];

    const msg = await Message.create({
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      receiverId: receiverId,
      text: text || (files.length > 0 ? `Sent ${files.length} file(s)` : ''),
      files: files
    });

    res.json(msg);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: "Error sending message" });
  }
});

// Edit message
router.put("/messages/:messageId", verifyUser, async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    console.log('Edit check - Message senderId:', message.senderId.toString());
    console.log('Edit check - User id:', req.user.id.toString());
    
    if (message.senderId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }
    
    // Check if message is older than 5 minutes
    const messageAge = (new Date() - new Date(message.createdAt)) / (1000 * 60); // in minutes
    if (messageAge > 5) {
      return res.status(403).json({ message: "You can only edit messages within 5 minutes of sending" });
    }
    
    message.text = text;
    message.isEdited = true;
    message.updatedAt = new Date();
    await message.save();
    
    res.json({ message: "Message updated", data: message });
  } catch (err) {
    console.error('Edit error:', err);
    res.status(500).json({ message: "Error updating message" });
  }
});

// Delete message
router.delete("/messages/:messageId", verifyUser, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    console.log('Delete check - Message senderId:', message.senderId.toString());
    console.log('Delete check - User id:', req.user.id.toString());
    
    if (message.senderId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }
    
    // Check if message is older than 5 minutes
    const messageAge = (new Date() - new Date(message.createdAt)) / (1000 * 60); // in minutes
    if (messageAge > 5) {
      return res.status(403).json({ message: "You can only delete messages within 5 minutes of sending" });
    }
    
    message.isDeleted = true;
    message.text = "This message was deleted";
    message.updatedAt = new Date();
    await message.save();
    
    res.json({ message: "Message deleted" });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: "Error deleting message" });
  }
});

// Mark messages as read
router.post("/messages/mark-read", verifyUser, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Mark all messages from userId to current user as read
    await Message.updateMany(
      { 
        senderId: userId, 
        receiverId: req.user.id,
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );
    
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

// Get unread message counts
router.get("/unread-counts", verifyUser, async (req, res) => {
  try {
    const unreadCounts = {};
    
    if (req.user.role === "admin") {
      // Get all staff
      const staff = await User.find({ role: "staff" }).select("_id name");
      
      for (const s of staff) {
        const count = await Message.countDocuments({
          senderId: s._id,
          receiverId: req.user.id,
          readBy: { $ne: req.user.id }
        });
        if (count > 0) {
          unreadCounts[s._id] = count;
        }
      }
    } else {
      // Staff - check messages from admin
      const admins = await User.find({ role: "admin" }).select("_id");
      
      for (const admin of admins) {
        const count = await Message.countDocuments({
          senderId: admin._id,
          receiverId: req.user.id,
          readBy: { $ne: req.user.id }
        });
        if (count > 0) {
          unreadCounts[admin._id] = count;
        }
      }
    }
    
    res.json(unreadCounts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unread counts" });
  }
});

// Get last message for each user (for sorting conversations)
router.get("/last-messages", verifyUser, async (req, res) => {
  try {
    const lastMessages = {};
    
    if (req.user.role === "admin") {
      // Get all staff
      const staff = await User.find({ role: "staff" }).select("_id");
      
      for (const s of staff) {
        const lastMsg = await Message.findOne({
          $or: [
            { senderId: req.user.id, receiverId: s._id.toString() },
            { senderId: s._id, receiverId: req.user.id.toString() }
          ]
        }).sort({ createdAt: -1 }).limit(1);
        
        if (lastMsg) {
          lastMessages[s._id.toString()] = {
            text: lastMsg.text,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId.toString()
          };
        }
      }
    } else {
      // Staff - get last message with admin
      const admin = await User.findOne({ role: "admin" });
      if (admin) {
        const lastMsg = await Message.findOne({
          $or: [
            { senderId: req.user.id, receiverId: admin._id.toString() },
            { senderId: admin._id, receiverId: req.user.id.toString() }
          ]
        }).sort({ createdAt: -1 }).limit(1);
        
        if (lastMsg) {
          lastMessages[admin._id.toString()] = {
            text: lastMsg.text,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId.toString()
          };
        }
      }
    }
    
    res.json(lastMessages);
  } catch (err) {
    console.error('Error fetching last messages:', err);
    res.status(500).json({ message: "Error fetching last messages" });
  }
});

module.exports = router;