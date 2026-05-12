const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');
const Workspace = require('../models/Workspace');
const Board = require('../models/Board');
const Card = require('../models/Card');

// ── WORKSPACES ──

// Get all workspaces for user
router.get('/workspaces', verifyUser, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(workspaces);
  } catch (err) {
    console.error('Error fetching workspaces:', err);
    res.status(500).json({ message: 'Error fetching workspaces' });
  }
});

// Create new workspace
router.post('/workspaces', verifyUser, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const workspace = await Workspace.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id]
    });
    
    res.status(201).json(workspace);
  } catch (err) {
    console.error('Error creating workspace:', err);
    res.status(500).json({ message: 'Error creating workspace' });
  }
});

// Update workspace
router.put('/workspaces/:id', verifyUser, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const workspace = await Workspace.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { createdBy: req.user.id },
          { members: req.user.id }
        ]
      },
      { name, description },
      { new: true }
    );
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    
    res.json(workspace);
  } catch (err) {
    console.error('Error updating workspace:', err);
    res.status(500).json({ message: 'Error updating workspace' });
  }
});

// Delete workspace
router.delete('/workspaces/:id', verifyUser, async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or not authorized' });
    }
    
    // Delete all boards and cards in this workspace
    const boards = await Board.find({ workspaceId: req.params.id });
    const boardIds = boards.map(board => board._id);
    
    await Card.deleteMany({ boardId: { $in: boardIds } });
    await Board.deleteMany({ workspaceId: req.params.id });
    
    res.json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    console.error('Error deleting workspace:', err);
    res.status(500).json({ message: 'Error deleting workspace' });
  }
});

// ── BOARDS ──

// Get all boards in workspace
router.get('/boards/:workspaceId', verifyUser, async (req, res) => {
  try {
    // Verify user has access to workspace
    const workspace = await Workspace.findOne({
      _id: req.params.workspaceId,
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    });
    
    if (!workspace) {
      return res.status(403).json({ message: 'Access denied to workspace' });
    }
    
    const boards = await Board.find({ workspaceId: req.params.workspaceId })
      .sort({ createdAt: -1 });
    
    res.json(boards);
  } catch (err) {
    console.error('Error fetching boards:', err);
    res.status(500).json({ message: 'Error fetching boards' });
  }
});

// Create new board
router.post('/boards', verifyUser, async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body;
    
    // Verify user has access to workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    });
    
    if (!workspace) {
      return res.status(403).json({ message: 'Access denied to workspace' });
    }
    
    const board = await Board.create({
      name,
      description,
      workspaceId,
      createdBy: req.user.id
    });
    
    res.status(201).json(board);
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ message: 'Error creating board' });
  }
});

// Update board
router.put('/boards/:id', verifyUser, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const board = await Board.findOneAndUpdate(
      { 
        _id: req.params.id,
        createdBy: req.user.id
      },
      { name, description },
      { new: true }
    );
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found or not authorized' });
    }
    
    res.json(board);
  } catch (err) {
    console.error('Error updating board:', err);
    res.status(500).json({ message: 'Error updating board' });
  }
});

// Delete board
router.delete('/boards/:id', verifyUser, async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found or not authorized' });
    }
    
    // Delete all cards in this board
    await Card.deleteMany({ boardId: req.params.id });
    
    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ message: 'Error deleting board' });
  }
});

// ── CARDS ──

// Get all cards in board
router.get('/cards/:boardId', verifyUser, async (req, res) => {
  try {
    // Verify user has access to board
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const workspace = await Workspace.findOne({
      _id: board.workspaceId,
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    });
    
    if (!workspace) {
      return res.status(403).json({ message: 'Access denied to board' });
    }
    
    const cards = await Card.find({ boardId: req.params.boardId })
      .sort({ createdAt: -1 });
    
    res.json(cards);
  } catch (err) {
    console.error('Error fetching cards:', err);
    res.status(500).json({ message: 'Error fetching cards' });
  }
});

// Create new card
router.post('/cards', verifyUser, async (req, res) => {
  try {
    const { type, x, y, width, height, content, boardId } = req.body;
    
    // Verify user has access to board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const workspace = await Workspace.findOne({
      _id: board.workspaceId,
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id }
      ]
    });
    
    if (!workspace) {
      return res.status(403).json({ message: 'Access denied to board' });
    }
    
    const card = await Card.create({
      type,
      x,
      y,
      width,
      height,
      content,
      boardId,
      createdBy: req.user.id
    });
    
    res.status(201).json(card);
  } catch (err) {
    console.error('Error creating card:', err);
    res.status(500).json({ message: 'Error creating card' });
  }
});

// Update card
router.put('/cards/:id', verifyUser, async (req, res) => {
  try {
    const updates = req.body;
    
    const card = await Card.findOneAndUpdate(
      { 
        _id: req.params.id,
        createdBy: req.user.id
      },
      updates,
      { new: true }
    );
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found or not authorized' });
    }
    
    res.json(card);
  } catch (err) {
    console.error('Error updating card:', err);
    res.status(500).json({ message: 'Error updating card' });
  }
});

// Delete card
router.delete('/cards/:id', verifyUser, async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found or not authorized' });
    }
    
    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Error deleting card:', err);
    res.status(500).json({ message: 'Error deleting card' });
  }
});

module.exports = router;