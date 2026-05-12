const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');
const TaskBoard = require('../models/TaskBoard');
const User = require('../models/User');

// Helper: check if user has workspace admin powers
const isWorkspaceAdmin = (req) =>
  req.user.role === 'admin' || req.user.isWorkspaceManager === true;

// Middleware: attach isWorkspaceManager from DB to req.user
const attachWsManager = async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id).select('isWorkspaceManager');
    req.user.isWorkspaceManager = u?.isWorkspaceManager || false;
    next();
  } catch (e) { next(); }
};

// GET all boards
router.get('/', verifyUser, attachWsManager, async (req, res) => {
  try {
    let boards;
    if (isWorkspaceAdmin(req)) {
      boards = await TaskBoard.find().sort({ createdAt: -1 });
    } else {
      boards = await TaskBoard.find({ 'members.userId': req.user.id }).sort({ createdAt: -1 });
    }
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching boards' });
  }
});

// GET single board
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const board = await TaskBoard.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching board' });
  }
});

// POST create board
router.post('/', verifyUser, attachWsManager, async (req, res) => {
  try {
    if (!isWorkspaceAdmin(req)) return res.status(403).json({ message: 'Not authorized' });

    const { name, description, weekLabel, days, memberIds } = req.body;
    if (!name) return res.status(400).json({ message: 'Board name is required' });

    const boardDays = (days && days.length > 0)
      ? days : ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'];

    let members = [];
    if (memberIds && memberIds.length > 0) {
      const users = await User.find({ _id: { $in: memberIds } });
      const colors = ['#e53e3e','#dd6b20','#d69e2e','#38a169','#3182ce','#805ad5','#d53f8c','#00b5d8'];
      members = users.map((u, i) => ({
        userId: u._id, name: u.name,
        color: colors[i % colors.length],
        days: boardDays.map(d => ({ day: d, tasks: [] }))
      }));
    }

    const board = await TaskBoard.create({
      name, description: description || '', weekLabel: weekLabel || '',
      days: boardDays, members, createdBy: req.user.id
    });
    res.status(201).json(board);
  } catch (err) {
    console.error('POST /task-boards error:', err);
    res.status(500).json({ message: 'Error creating board', error: err.message });
  }
});

// POST reset week
router.post('/:id/reset-week', verifyUser, attachWsManager, async (req, res) => {
  try {
    if (!isWorkspaceAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    const { weekLabel } = req.body;
    const board = await TaskBoard.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    board.members.forEach(m => m.days.forEach(d => { d.tasks = []; }));
    if (weekLabel) board.weekLabel = weekLabel;
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error resetting week' });
  }
});

// PUT update board meta
router.put('/:id', verifyUser, attachWsManager, async (req, res) => {
  try {
    if (!isWorkspaceAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    const board = await TaskBoard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error updating board' });
  }
});

// DELETE board
router.delete('/:id', verifyUser, attachWsManager, async (req, res) => {
  try {
    if (!isWorkspaceAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    await TaskBoard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Board deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting board' });
  }
});

// POST add task
router.post('/:boardId/task', verifyUser, attachWsManager, async (req, res) => {
  try {
    const { memberId, day, text } = req.body;
    const board = await TaskBoard.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const memberCol = board.members.id(memberId);
    if (!memberCol) return res.status(404).json({ message: 'Member column not found' });
    const isOwner = memberCol.userId?.toString() === req.user.id?.toString();
    if (!isWorkspaceAdmin(req) && !isOwner)
      return res.status(403).json({ message: 'You can only add tasks to your own column' });
    let dayCol = memberCol.days.find(d => d.day === day);
    if (!dayCol) { memberCol.days.push({ day, tasks: [] }); dayCol = memberCol.days[memberCol.days.length - 1]; }
    dayCol.tasks.push({ text, completed: false });
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error adding task' });
  }
});

// PUT toggle task
router.put('/:boardId/task/:taskId/toggle', verifyUser, attachWsManager, async (req, res) => {
  try {
    const { memberId, day } = req.body;
    const board = await TaskBoard.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const memberCol = board.members.id(memberId);
    if (!memberCol) return res.status(404).json({ message: 'Member not found' });
    const isOwner = memberCol.userId?.toString() === req.user.id?.toString();
    if (!isWorkspaceAdmin(req) && !isOwner) return res.status(403).json({ message: 'Not authorized' });
    const dayCol = memberCol.days.find(d => d.day === day);
    if (!dayCol) return res.status(404).json({ message: 'Day not found' });
    const task = dayCol.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.completed = !task.completed;
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error toggling task' });
  }
});

// DELETE task
router.delete('/:boardId/task/:taskId', verifyUser, attachWsManager, async (req, res) => {
  try {
    const { memberId, day } = req.body;
    const board = await TaskBoard.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const memberCol = board.members.id(memberId);
    if (!memberCol) return res.status(404).json({ message: 'Member not found' });
    const isOwner = memberCol.userId?.toString() === req.user.id?.toString();
    if (!isWorkspaceAdmin(req) && !isOwner) return res.status(403).json({ message: 'Not authorized' });
    const dayCol = memberCol.days.find(d => d.day === day);
    if (dayCol) dayCol.tasks = dayCol.tasks.filter(t => t._id.toString() !== req.params.taskId);
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// POST add member to board
router.post('/:boardId/member', verifyUser, attachWsManager, async (req, res) => {
  try {
    if (!isWorkspaceAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    const { userId, name } = req.body;
    const board = await TaskBoard.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const colors = ['#e53e3e','#dd6b20','#d69e2e','#38a169','#3182ce','#805ad5','#d53f8c','#00b5d8'];
    board.members.push({ userId, name, color: colors[board.members.length % colors.length], days: board.days.map(d => ({ day: d, tasks: [] })) });
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error adding member' });
  }
});

// DELETE member from board
router.delete('/:boardId/member/:memberId', verifyUser, attachWsManager, async (req, res) => {
  try {
    if (!isWorkspaceAdmin(req)) return res.status(403).json({ message: 'Not authorized' });
    const board = await TaskBoard.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    board.members = board.members.filter(m => m._id.toString() !== req.params.memberId);
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Error removing member' });
  }
});

module.exports = router;
