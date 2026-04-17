// routes/features.js — Polls, Announcements, Status, Tasks
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { verifyUser } = require("../middleware/auth");
const User = require("../models/User");
const { sendEmail, sendWhatsApp } = require("../utils/notifications");

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

// Poll
delete mongoose.models.Poll;
const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ text: String, votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdByName: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  scope: { type: String, enum: ["department", "all"], default: "department" },
  closed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Poll = mongoose.model("Poll", pollSchema);

// Announcement
delete mongoose.models.Announcement;
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  priority: { type: String, enum: ["normal", "important", "urgent"], default: "normal" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdByName: String,
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reactions: [{ emoji: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, userName: String }],
  createdAt: { type: Date, default: Date.now },
});
const Announcement = mongoose.model("Announcement", announcementSchema);

// Task
delete mongoose.models.Task;
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: { type: String, enum: ["todo", "inprogress", "done"], default: "todo" },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  assignedToNames: [String],
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  dueDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdByName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Task = mongoose.model("Task", taskSchema);

// ─────────────────────────────────────────────
// STATUS ROUTES
// ─────────────────────────────────────────────
const userStatuses = {}; // { userId: { status, emoji, updatedAt } }

router.post("/status", verifyUser, (req, res) => {
  const { status, emoji } = req.body;
  userStatuses[req.user.id] = { status: status || "", emoji: emoji || "🟢", updatedAt: Date.now() };
  res.json({ ok: true });
});

router.get("/status", verifyUser, (req, res) => {
  const ids = (req.query.ids || "").split(",").filter(Boolean);
  const result = {};
  ids.forEach(id => { result[id] = userStatuses[id] || null; });
  res.json(result);
});

router.get("/status/me", verifyUser, (req, res) => {
  res.json(userStatuses[req.user.id] || { status: "", emoji: "🟢" });
});

// ─────────────────────────────────────────────
// POLL ROUTES
// ─────────────────────────────────────────────

// Create poll (admin or group admin)
router.post("/polls", verifyUser, async (req, res) => {
  try {
    const { question, options, departmentId, scope } = req.body;
    if (!question || !options || options.length < 2) return res.status(400).json({ message: "Need question + 2+ options" });
    const poll = await Poll.create({
      question, options: options.map(t => ({ text: t, votes: [] })),
      createdBy: req.user.id, createdByName: req.user.name,
      departmentId: departmentId || null, scope: scope || "department",
    });
    res.status(201).json(poll);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get polls for a department (or all)
router.get("/polls", verifyUser, async (req, res) => {
  try {
    const { departmentId } = req.query;
    let query = {};
    if (departmentId) {
      query = { $or: [{ departmentId }, { scope: "all" }] };
    } else {
      query = { scope: "all" };
    }
    const polls = await Poll.find(query).sort({ createdAt: -1 }).limit(30);
    res.json(polls);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Vote on a poll
router.post("/polls/:pollId/vote", verifyUser, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.pollId);
    if (!poll || poll.closed) return res.status(400).json({ message: "Poll not found or closed" });
    // Remove existing vote from all options
    poll.options.forEach(opt => { opt.votes = opt.votes.filter(v => v.toString() !== req.user.id.toString()); });
    // Add vote to chosen option
    if (optionIndex >= 0 && optionIndex < poll.options.length) {
      poll.options[optionIndex].votes.push(req.user.id);
    }
    await poll.save();
    res.json(poll);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Close/delete poll (admin only)
router.delete("/polls/:pollId", verifyUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    await Poll.findByIdAndDelete(req.params.pollId);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─────────────────────────────────────────────
// ANNOUNCEMENT ROUTES
// ─────────────────────────────────────────────

router.get("/announcements", verifyUser, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(50);
    res.json(announcements);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/announcements", verifyUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const { title, body, priority } = req.body;
    if (!title || !body) return res.status(400).json({ message: "Title and body required" });
    const ann = await Announcement.create({ title, body, priority: priority || "normal", createdBy: req.user.id, createdByName: req.user.name });

    // Send notifications to ALL users (staff and admins)
    const allUsers = await User.find().select("email phone name role");
    const emails = allUsers.map(u => u.email).filter(e => !!e);

    if (emails.length > 0) {
      const emailSubject = `Announcement: ${title}`;
      const emailBody = `Hello,\n\nA new announcement has been posted:\n\nTitle: ${title}\nPriority: ${priority || "normal"}\n\n${body}\n\nBest regards,\nCompany Admin`;
      sendEmail(emails, emailSubject, emailBody);
      console.log(`📧 Announcement email sent to ${emails.length} users`);
    }

    // Send WhatsApp to all users with phone numbers
    const whatsappMessage = `📢 *Announcement: ${title}*\n\n${body}\n\n_Priority: ${priority || "normal"}_`;
    for (const user of allUsers) {
      if (user.phone) {
        sendWhatsApp(user.phone, whatsappMessage);
      }
    }

    res.status(201).json(ann);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/announcements/:id/read", verifyUser, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/announcements/:id/react", verifyUser, async (req, res) => {
  try {
    const { emoji } = req.body;
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Not found" });
    const idx = ann.reactions.findIndex(r => r.userId.toString() === req.user.id.toString() && r.emoji === emoji);
    if (idx > -1) { ann.reactions.splice(idx, 1); }
    else {
      ann.reactions = ann.reactions.filter(r => r.userId.toString() !== req.user.id.toString());
      ann.reactions.push({ emoji, userId: req.user.id, userName: req.user.name });
    }
    await ann.save();
    res.json({ reactions: ann.reactions });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/announcements/:id", verifyUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─────────────────────────────────────────────
// TASK ROUTES
// ─────────────────────────────────────────────

router.get("/tasks", verifyUser, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "staff") query = { assignedTo: req.user.id };
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/tasks", verifyUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const { title, description, priority, assignedTo, assignedToNames, departmentId, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });
    const task = await Task.create({
      title, description, priority, assignedTo, assignedToNames, departmentId, dueDate,
      createdBy: req.user.id, createdByName: req.user.name,
    });
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/tasks/:id", verifyUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    // Staff can only update status of their own tasks
    if (req.user.role === "staff") {
      if (!task.assignedTo.map(id => id.toString()).includes(req.user.id.toString())) {
        return res.status(403).json({ message: "Not your task" });
      }
      task.status = req.body.status || task.status;
    } else {
      // Admin can update everything
      Object.assign(task, req.body);
    }
    task.updatedAt = new Date();
    await task.save();
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/tasks/:id", verifyUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
