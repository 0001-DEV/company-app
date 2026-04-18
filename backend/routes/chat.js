// routes/chat.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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
const Message = require("../models/Message");

// Get current user info
router.get("/me", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('department', 'name');
    res.json({
      name: req.user.name,
      role: req.user.role,
      id: req.user.id,
      department: user?.department || null,
      profilePicture: user?.profilePicture || ''
    });
  } catch (err) {
    res.json({
      name: req.user.name,
      role: req.user.role,
      id: req.user.id,
      department: null,
      profilePicture: ''
    });
  }
});

// Get staff list (admin only)
router.get("/users", verifyUser, async (req, res) => {
  try {
    console.log("Fetching users list for:", req.user.role);
    
    if (req.user.role === "admin") {
      // Admin sees all staff members
      let staff = await User.find({ role: "staff" }).select("name email role profilePicture");
      
      if (staff.length === 0) {
        staff = await User.find({ role: { $ne: "admin" } }).select("name email role profilePicture");
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
      }).select("name email role profilePicture");
      
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
    const myId = req.user.id.toString();

    if (req.user.role === "admin") {
      if (userId) {
        // Private message between admin and specific user
        query = {
          $or: [
            { senderId: req.user.id, receiverId: userId },
            { senderId: req.user.id, receiverId: userId.toString() },
            { senderId: new mongoose.Types.ObjectId(userId), receiverId: myId },
            { senderId: new mongoose.Types.ObjectId(userId), receiverId: req.user.id }
          ]
        };
      } else if (departmentId) {
        // Department messages
        query = { receiverId: `department:${departmentId}` };
      } else {
        // Team chat - only messages with receiverId "all"
        query = { receiverId: "all" };
      }
    } else if (req.user.role === "staff") {
      if (userId) {
        // Private message between staff and specific user
        query = {
          $or: [
            { senderId: req.user.id, receiverId: userId },
            { senderId: req.user.id, receiverId: userId.toString() },
            { senderId: new mongoose.Types.ObjectId(userId), receiverId: myId },
            { senderId: new mongoose.Types.ObjectId(userId), receiverId: req.user.id }
          ]
        };
      } else if (departmentId) {
        // Department messages - verify staff belongs to department
        const staffUser = await User.findById(req.user.id);
        const staffDeptId = staffUser?.department?.toString();
        if (staffDeptId !== departmentId) {
          return res.status(403).json({ message: 'You can only view your own department chat' });
        }
        query = { receiverId: `department:${departmentId}` };
      } else {
        // Team chat - only messages with receiverId "all"
        query = { receiverId: "all" };
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(100);

    // Filter disappearing messages for department chats
    let result = messages;
    if (req.query.departmentId) {
      const Department = require('../models/Department');
      const dept = await Department.findById(req.query.departmentId).lean();
      if (dept?.disappearAfterDays > 0) {
        const cutoff = new Date(Date.now() - dept.disappearAfterDays * 24 * 60 * 60 * 1000);
        result = messages.filter(m => new Date(m.createdAt) > cutoff);
      }
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching messages:', err);
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

    // Validate: must have either text or files
    if (!text?.trim() && files.length === 0) {
      return res.status(400).json({ message: "Message must contain text or files" });
    }

    // If staff is sending to a department, verify it's their own
    if (req.user.role === 'staff' && receiverId?.startsWith('department:')) {
      const deptId = receiverId.replace('department:', '');
      const staffUser = await User.findById(req.user.id);
      if (staffUser?.department?.toString() !== deptId) {
        return res.status(403).json({ message: 'You can only message your own department' });
      }
      // Check onlyAdminsCanSend restriction
      const Department = require('../models/Department');
      const dept = await Department.findById(deptId).lean();
      if (dept?.onlyAdminsCanSend) {
        const isGroupAdmin = (dept.groupAdmins || []).map(id => id.toString()).includes(req.user.id.toString());
        if (!isGroupAdmin) {
          return res.status(403).json({ message: 'Only group admins can send messages in this group' });
        }
      }
    }

    let replyTo = null;
    if (req.body.replyToId) {
      const original = await Message.findById(req.body.replyToId);
      if (original) {
        replyTo = {
          messageId: original._id,
          senderName: original.senderName,
          text: original.isDeleted ? 'Message deleted' : (original.text || '').substring(0, 80),
        };
      }
    }

    const msg = await Message.create({
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      receiverId: receiverId,
      text: text || '',
      files: files,
      replyTo: replyTo || undefined,
      forwardedFrom: req.body.forwardedFrom || null,
    });

    console.log(`[message saved] senderId=${req.user.id} receiverId=${receiverId} text="${msg.text?.substring(0,20)}" files=${files.length}`);
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
    const { userId, departmentId, teamChat } = req.body;
    const myId = req.user.id.toString();
    let query = {};

    if (departmentId) {
      // Department chat — mark all messages in this dept as read by me
      query = {
        receiverId: `department:${departmentId}`,
        senderId: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      };
    } else if (teamChat) {
      // Team chat — mark all "all" messages as read by me
      query = {
        receiverId: "all",
        senderId: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      };
    } else if (userId) {
      // Private chat
      query = {
        senderId: new mongoose.Types.ObjectId(userId),
        receiverId: myId,
        readBy: { $ne: req.user.id }
      };
    } else {
      return res.status(400).json({ message: "Missing userId, departmentId, or teamChat" });
    }

    await Message.updateMany(query, { $addToSet: { readBy: req.user.id } });
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

// Get unread message counts
router.get("/unread-counts", verifyUser, async (req, res) => {
  try {
    const myId = req.user.id.toString();
    const unreadCounts = {};

    // Private messages: only count messages sent TO this user
    const privateMessages = await Message.find({
      receiverId: myId,
      readBy: { $ne: req.user.id }
    }).select("senderId");

    for (const msg of privateMessages) {
      const sid = msg.senderId?.toString();
      if (!sid) continue;
      unreadCounts[sid] = (unreadCounts[sid] || 0) + 1;
    }

    // Department messages: only if user is member
    if (req.user.role === "staff") {
      const staffUser = await User.findById(req.user.id);
      if (staffUser?.department) {
        const deptMessages = await Message.find({
          receiverId: `department:${staffUser.department}`,
          senderId: { $ne: req.user.id },
          readBy: { $ne: req.user.id }
        }).select("receiverId");
        if (deptMessages.length > 0) {
          unreadCounts[`department:${staffUser.department}`] = deptMessages.length;
        }
      }
    }

    // Team chat: only for admins
    if (req.user.role === "admin") {
      const teamMessages = await Message.find({
        receiverId: "all",
        senderId: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      }).select("receiverId");
      if (teamMessages.length > 0) {
        unreadCounts["all"] = teamMessages.length;
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
    const myId = req.user.id.toString();

    // Fetch all messages involving this user, sorted newest first
    const msgs = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: { $ne: "all", $not: /^department:/ } },
        { receiverId: myId },
        ...(req.user.role === "admin" ? [{ receiverId: "all" }] : []),
        ...(req.user.role === "staff" ? [{ receiverId: `department:${(await User.findById(req.user.id)).department}` }] : [])
      ]
    }).sort({ createdAt: -1 }).limit(500);

    for (const msg of msgs) {
      const sid = msg.senderId?.toString();
      const rid = msg.receiverId?.toString();
      
      // Handle private messages - only if I'm the receiver
      if (rid === myId) {
        if (!lastMessages[sid]) {
          lastMessages[sid] = {
            text: msg.text,
            createdAt: msg.createdAt,
            senderId: sid
          };
        }
      }
      // Handle team chat messages
      else if (rid === "all" && req.user.role === "admin") {
        if (!lastMessages["all"]) {
          lastMessages["all"] = {
            text: msg.text,
            createdAt: msg.createdAt,
            senderId: sid
          };
        }
      }
      // Handle department messages
      else if (rid && rid.startsWith("department:")) {
        const deptId = rid.replace("department:", "");
        if (!lastMessages[`department:${deptId}`]) {
          lastMessages[`department:${deptId}`] = {
            text: msg.text,
            createdAt: msg.createdAt,
            senderId: sid
          };
        }
      }
    }

    res.json(lastMessages);
  } catch (err) {
    console.error("Error fetching last messages:", err);
    res.status(500).json({ message: "Error fetching last messages" });
  }
});

// Get latest unread messages for browser notifications (admin only)
router.get("/latest-messages", verifyUser, async (req, res) => {
  try {
    // Get the 20 most recent unread messages sent TO this user
    const messages = await Message.find({
      receiverId: req.user.id,
      readBy: { $ne: req.user.id }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('senderId', 'name');

    const result = messages.map(msg => ({
      _id: msg._id.toString(),
      senderName: msg.senderId?.name || 'Someone',
      content: msg.text || '',
      createdAt: msg.createdAt
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching latest messages" });
  }
});

// Toggle emoji reaction on a message
router.post("/messages/:messageId/react", verifyUser, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existing = message.reactions.findIndex(
      r => r.userId.toString() === req.user.id.toString() && r.emoji === emoji
    );
    if (existing > -1) {
      // Remove reaction (toggle off)
      message.reactions.splice(existing, 1);
    } else {
      // Remove any other emoji from this user first (one reaction per user)
      const userIdx = message.reactions.findIndex(r => r.userId.toString() === req.user.id.toString());
      if (userIdx > -1) message.reactions.splice(userIdx, 1);
      message.reactions.push({ emoji, userId: req.user.id, userName: req.user.name });
    }
    await message.save();
    res.json({ reactions: message.reactions });
  } catch (err) {
    res.status(500).json({ message: "Error updating reaction" });
  }
});

// In-memory typing & online state (resets on server restart — fine for local use)
const typingUsers = {}; // { conversationKey: { userId: { name, expires } } }
const onlineUsers = {}; // { userId: lastSeen }

// Heartbeat — staff/admin call this every 20s to mark themselves online
router.post("/heartbeat", verifyUser, async (req, res) => {
  onlineUsers[req.user.id] = Date.now();
  res.json({ ok: true });
});

// Get online status for a list of userIds
router.get("/online-status", verifyUser, async (req, res) => {
  const ids = (req.query.ids || '').split(',').filter(Boolean);
  const now = Date.now();
  const result = {};
  ids.forEach(id => {
    const last = onlineUsers[id];
    result[id] = last ? { online: (now - last) < 30000, lastSeen: last } : { online: false, lastSeen: null };
  });
  res.json(result);
});

// Set typing indicator
router.post("/typing", verifyUser, async (req, res) => {
  const { conversationKey, isTyping } = req.body;
  if (!conversationKey) return res.json({ ok: true });
  if (!typingUsers[conversationKey]) typingUsers[conversationKey] = {};
  if (isTyping) {
    typingUsers[conversationKey][req.user.id] = { name: req.user.name, expires: Date.now() + 4000 };
  } else {
    delete typingUsers[conversationKey][req.user.id];
  }
  res.json({ ok: true });
});

// Get who is typing in a conversation
router.get("/typing", verifyUser, async (req, res) => {
  const { conversationKey } = req.query;
  if (!conversationKey || !typingUsers[conversationKey]) return res.json([]);
  const now = Date.now();
  const active = Object.entries(typingUsers[conversationKey])
    .filter(([uid, data]) => data.expires > now && uid !== req.user.id.toString())
    .map(([, data]) => data.name);
  res.json(active);
});

// ── Pin a message (admin or group admin only) ────────────────────────────────
router.put("/messages/:messageId/pin", verifyUser, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only works for department messages
    if (!message.receiverId?.startsWith('department:')) {
      return res.status(400).json({ message: "Can only pin department messages" });
    }
    const deptId = message.receiverId.replace('department:', '');
    const Department = require('../models/Department');
    const dept = await Department.findById(deptId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const isGroupAdmin = (dept.groupAdmins || []).map(id => id.toString()).includes(req.user.id.toString());
    if (req.user.role !== 'admin' && !isGroupAdmin) {
      return res.status(403).json({ message: "Only admin or group admin can pin messages" });
    }

    // Toggle: if already pinned, unpin
    const alreadyIdx = dept.pinnedMessages.findIndex(p => p.messageId?.toString() === req.params.messageId);
    if (alreadyIdx > -1) {
      dept.pinnedMessages.splice(alreadyIdx, 1);
    } else {
      dept.pinnedMessages.push({
        messageId: message._id,
        text: message.isDeleted ? 'Message deleted' : (message.text || '').substring(0, 120),
        pinnedBy: req.user.name,
        pinnedAt: new Date()
      });
    }
    await dept.save();
    res.json({ pinnedMessages: dept.pinnedMessages });
  } catch (err) {
    res.status(500).json({ message: "Error pinning message" });
  }
});

// ── Get pinned messages ───────────────────────────────────────────────────────
router.get("/pins", verifyUser, async (req, res) => {
  try {
    const { departmentId } = req.query;
    const Department = require('../models/Department');
    if (departmentId) {
      const dept = await Department.findById(departmentId);
      return res.json(dept?.pinnedMessages || []);
    }
    // Return all pins across all departments (admin only)
    const depts = await Department.find({}, 'name pinnedMessages');
    const all = depts.flatMap(d => (d.pinnedMessages || []).map(p => ({ ...p.toObject(), departmentName: d.name })));
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pins" });
  }
});

// ── Star a message ────────────────────────────────────────────────────────────
router.post("/messages/:messageId/star", verifyUser, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadyIdx = (user.starredMessages || []).findIndex(s => s.messageId?.toString() === req.params.messageId);
    if (alreadyIdx > -1) {
      user.starredMessages.splice(alreadyIdx, 1);
      await user.save();
      return res.json({ starred: false, starredMessages: user.starredMessages });
    }
    if (!user.starredMessages) user.starredMessages = [];
    user.starredMessages.push({
      messageId: message._id,
      text: message.isDeleted ? 'Message deleted' : message.text,
      senderName: message.senderName,
      createdAt: message.createdAt
    });
    await user.save();
    res.json({ starred: true, starredMessages: user.starredMessages });
  } catch (err) {
    res.status(500).json({ message: "Error starring message" });
  }
});

// ── Get starred messages ──────────────────────────────────────────────────────
router.get("/starred", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user?.starredMessages || []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching starred messages" });
  }
});

// ── Get read-by list for a message ───────────────────────────────────────────
router.get("/messages/:messageId/read-by", verifyUser, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId).populate('readBy', 'name');
    if (!message) return res.status(404).json({ message: "Message not found" });
    const names = (message.readBy || []).map(u => u.name || u.toString());
    res.json({ names });
  } catch (err) {
    res.status(500).json({ message: "Error fetching read-by" });
  }
});

// ── Get media messages ────────────────────────────────────────────────────────
router.get("/media", verifyUser, async (req, res) => {
  try {
    const { departmentId, userId } = req.query;
    let query = { 'files.0': { $exists: true } };
    if (departmentId) {
      query.receiverId = `department:${departmentId}`;
    } else if (userId) {
      const myId = req.user.id.toString();
      query.$or = [
        { senderId: req.user.id, receiverId: userId },
        { senderId: new mongoose.Types.ObjectId(userId), receiverId: myId }
      ];
    }
    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching media" });
  }
});

// ── Update department settings (disappearAfterDays) ───────────────────────────
router.put("/department-settings/:deptId", verifyUser, async (req, res) => {
  try {
    const Department = require('../models/Department');
    const dept = await Department.findById(req.params.deptId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const isGroupAdmin = (dept.groupAdmins || []).map(id => id.toString()).includes(req.user.id.toString());
    if (req.user.role !== 'admin' && !isGroupAdmin) {
      return res.status(403).json({ message: "Only admin or group admin can change settings" });
    }

    if (req.body.disappearAfterDays !== undefined) {
      dept.disappearAfterDays = req.body.disappearAfterDays;
    }
    await dept.save();
    res.json({ disappearAfterDays: dept.disappearAfterDays });
  } catch (err) {
    res.status(500).json({ message: "Error updating settings" });
  }
});

// ── In-memory call signaling ──────────────────────────────────────────────────
// { callId: { callerId, callerName, callType, receiverId, roomName, status, createdAt } }
const activeCalls = {};

// Initiate a call
router.post("/call/initiate", verifyUser, async (req, res) => {
  const { receiverId, callType, roomName } = req.body;
  // Cancel any existing call from this user
  Object.keys(activeCalls).forEach(k => { if (activeCalls[k].callerId === req.user.id.toString()) delete activeCalls[k]; });
  const callId = `${req.user.id}-${Date.now()}`;
  activeCalls[callId] = {
    callId, callerId: req.user.id.toString(), callerName: req.user.name,
    callType, receiverId: receiverId.toString(), roomName, status: "ringing", createdAt: Date.now(), 
    isDepartmentCall: receiverId.toString().startsWith('department:'),
    isTeamCall: receiverId.toString() === 'all'
  };
  // Auto-expire after 60s
  setTimeout(() => { if (activeCalls[callId]?.status === "ringing") delete activeCalls[callId]; }, 60000);
  res.json({ callId });
});

// Poll for incoming calls
router.get("/call/incoming", verifyUser, async (req, res) => {
  const myId = req.user.id.toString();
  let call = Object.values(activeCalls).find(c => c.receiverId === myId && c.status === "ringing");
  
  // Check for team chat calls (all staff members)
  if (!call && req.user.role === 'staff') {
    call = Object.values(activeCalls).find(c => c.isTeamCall && c.status === "ringing");
  }
  
  // Check for department calls
  if (!call) {
    try {
      const userDepts = await Department.find({ members: myId });
      for (const dept of userDepts) {
        const deptCall = Object.values(activeCalls).find(c => c.receiverId === dept._id.toString() && c.status === "ringing");
        if (deptCall) {
          call = deptCall;
          break;
        }
      }
    } catch (_) {}
  }
  
  res.json(call || null);
});

// Answer or decline
router.post("/call/respond", verifyUser, async (req, res) => {
  const { callId, action } = req.body; // action: "accept" | "decline"
  if (activeCalls[callId]) {
    if (action === "accept") activeCalls[callId].status = "accepted";
    else delete activeCalls[callId];
  }
  res.json({ ok: true });
});

// Poll call status (caller side — check if accepted/declined)
router.get("/call/status/:callId", verifyUser, async (req, res) => {
  const call = activeCalls[req.params.callId];
  res.json(call ? { status: call.status } : { status: "ended" });
});

// End/cancel a call
router.post("/call/end", verifyUser, async (req, res) => {
  const { callId } = req.body;
  const call = activeCalls[callId];
  // Only save missed call message if still ringing AND not already saved
  if (call && call.status === "ringing" && !call.missedSaved) {
    call.missedSaved = true; // guard against double-save
    try {
      const icon = call.callType === "video" ? "📹" : "📞";
      await Message.create({
        senderId: call.callerId,
        senderName: call.callerName,
        senderRole: "staff",
        receiverId: call.receiverId,
        text: `${icon} Missed ${call.callType} call`,
        isMissedCall: true,
      });
    } catch (_) {}
  }
  delete activeCalls[callId];
  res.json({ ok: true });
});

// Save call notification (picked up or declined)
router.post("/call/save-notification", verifyUser, async (req, res) => {
  try {
    const { receiverId, callType, status, duration } = req.body;
    let text = "";
    
    if (status === "picked") {
      const icon = callType === "video" ? "📹" : "📞";
      text = `${icon} ${callType} call - ${duration}s`;
    } else if (status === "declined") {
      const icon = callType === "video" ? "📹" : "📞";
      text = `${icon} Declined ${callType} call`;
    }
    
    if (text) {
      await Message.create({
        senderId: req.user.id,
        senderName: req.user.name,
        senderRole: req.user.role,
        receiverId: receiverId,
        text: text,
        isCallNotification: true,
      });
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error("Error saving call notification:", err);
    res.status(500).json({ message: "Error saving call notification" });
  }
});

module.exports = router;
