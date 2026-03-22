// routes/extras.js — Audit Log, Schedules, Reports, Org Chart, Message Scheduling
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { verifyUser } = require("../middleware/auth");
const User = require("../models/User");

// ─── AUDIT LOG ───────────────────────────────────────────────────────────────
delete mongoose.models.AuditLog;
const auditSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  userRole: String,
  action:   String,   // e.g. "login", "upload", "delete_file", "send_message"
  detail:   String,   // extra context
  ip:       String,
  createdAt: { type: Date, default: Date.now },
});
const AuditLog = mongoose.model("AuditLog", auditSchema);

// Helper — called internally from other routes via req.app.locals.audit
const logAudit = async (userId, userName, userRole, action, detail = "", ip = "") => {
  try { await AuditLog.create({ userId, userName, userRole, action, detail, ip }); } catch (_) {}
};

// GET /api/extras/audit  (admin only)
router.get("/audit", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filter = req.query.filter || "";
    const query = filter ? { action: { $regex: filter, $options: "i" } } : {};
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      AuditLog.countDocuments(query),
    ]);
    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/extras/audit  (internal — any authenticated user can log)
router.post("/audit", verifyUser, async (req, res) => {
  const { action, detail } = req.body;
  await logAudit(req.user.id, req.user.name, req.user.role, action, detail, req.ip);
  res.json({ ok: true });
});

// ─── SCHEDULE BOARD ──────────────────────────────────────────────────────────
delete mongoose.models.Schedule;
const scheduleSchema = new mongoose.Schema({
  weekLabel:    String,   // e.g. "Week of 17 Mar 2026"
  weekStart:    Date,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  departmentName: String,
  rows: [{
    staffId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    staffName: String,
    shifts: {
      mon: String, tue: String, wed: String,
      thu: String, fri: String, sat: String, sun: String,
    },
  }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdByName: String,
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});
const Schedule = mongoose.model("Schedule", scheduleSchema);

router.get("/schedules", verifyUser, async (req, res) => {
  try {
    const { departmentId } = req.query;
    const query = departmentId ? { departmentId } : {};
    const schedules = await Schedule.find(query).sort({ weekStart: -1 }).limit(20);
    res.json(schedules);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/schedules", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    const { weekLabel, weekStart, departmentId, departmentName, rows } = req.body;
    const sched = await Schedule.create({
      weekLabel, weekStart, departmentId, departmentName, rows,
      createdBy: req.user.id, createdByName: req.user.name,
    });
    res.status(201).json(sched);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/schedules/:id", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    const sched = await Schedule.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    res.json(sched);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/schedules/:id", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── DAILY REPORTS ───────────────────────────────────────────────────────────
delete mongoose.models.DailyReport;
const reportSchema = new mongoose.Schema({
  staffId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  staffName: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  departmentName: String,
  reportType: { type: String, enum: ["daily", "weekly"], default: "daily" },
  workedOn:  String,
  challenges: String,
  nextSteps:  String,
  createdAt:  { type: Date, default: Date.now },
});
const DailyReport = mongoose.model("DailyReport", reportSchema);

router.get("/reports", verifyUser, async (req, res) => {
  try {
    const query = req.user.role === "staff" ? { staffId: req.user.id } : {};
    const reports = await DailyReport.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(reports);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/reports", verifyUser, async (req, res) => {
  try {
    const { workedOn, challenges, nextSteps, reportType } = req.body;
    if (!workedOn?.trim()) return res.status(400).json({ message: "workedOn is required" });
    const user = await User.findById(req.user.id).populate("department", "name");
    const report = await DailyReport.create({
      staffId: req.user.id, staffName: req.user.name,
      departmentId: user?.department?._id, departmentName: user?.department?.name,
      reportType: reportType || "daily", workedOn, challenges, nextSteps,
    });
    res.status(201).json(report);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/reports/:id", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    await DailyReport.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── SCHEDULED MESSAGES ──────────────────────────────────────────────────────
delete mongoose.models.ScheduledMessage;
const scheduledMsgSchema = new mongoose.Schema({
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  senderName:  String,
  receiverId:  String,   // same format as chat messages
  text:        String,
  scheduledAt: Date,
  sent:        { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
});
const ScheduledMessage = mongoose.model("ScheduledMessage", scheduledMsgSchema);

router.get("/scheduled-messages", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    const msgs = await ScheduledMessage.find({ sent: false }).sort({ scheduledAt: 1 });
    res.json(msgs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/scheduled-messages", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    const { receiverId, text, scheduledAt } = req.body;
    if (!text || !scheduledAt) return res.status(400).json({ message: "text and scheduledAt required" });
    const msg = await ScheduledMessage.create({
      senderId: req.user.id, senderName: req.user.name,
      receiverId: receiverId || "all", text, scheduledAt: new Date(scheduledAt),
    });
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/scheduled-messages/:id", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    await ScheduledMessage.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── ANNOUNCEMENT READ-BY LIST ────────────────────────────────────────────────
// GET /api/extras/announcements/:id/readers  (admin only)
router.get("/announcements/:id/readers", verifyUser, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  try {
    const { Announcement } = require("./features"); // won't work cross-module, use mongoose directly
    // Re-query from the Announcement model registered in features.js
    const ann = await mongoose.model("Announcement").findById(req.params.id).populate("readBy", "name email");
    if (!ann) return res.status(404).json({ message: "Not found" });
    const allStaff = await User.find({ role: "staff" }).select("name email _id");
    const readIds = new Set((ann.readBy || []).map(u => u._id.toString()));
    const readers = (ann.readBy || []).map(u => ({ _id: u._id, name: u.name, email: u.email, read: true }));
    const notRead = allStaff.filter(s => !readIds.has(s._id.toString())).map(s => ({ _id: s._id, name: s.name, email: s.email, read: false }));
    res.json({ readers, notRead, total: allStaff.length, readCount: readers.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
module.exports.logAudit = logAudit;
