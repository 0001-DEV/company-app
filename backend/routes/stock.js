const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');
const Stock = require('../models/Stock');
const User = require('../models/User');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Get all stocks
router.get('/all', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const stocks = await Stock.find().populate('monitor', 'name email').sort({ createdAt: -1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stocks' });
  }
});

// Create new stock
router.post('/create', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { name, quantity, unit } = req.body;
    
    if (!name || quantity === undefined) {
      return res.status(400).json({ message: 'Name and quantity are required' });
    }
    
    // Check if stock already exists
    const existing = await Stock.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Stock with this name already exists' });
    }
    
    const stock = await Stock.create({
      name: name.trim(),
      currentQuantity: parseInt(quantity),
      unit: unit || 'pcs',
      transactions: [{
        type: 'add',
        quantity: parseInt(quantity),
        reason: 'Initial stock',
        addedBy: req.user.id,
        addedByName: req.user.name
      }]
    });
    
    res.json(stock);
  } catch (err) {
    console.error('Error creating stock:', err);
    res.status(500).json({ message: 'Error creating stock: ' + err.message });
  }
});

// Add stock
router.post('/:stockId/add', verifyUser, async (req, res) => {
  try {
    const { quantity, reason } = req.body;
    const stock = await Stock.findById(req.params.stockId);
    
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    
    stock.currentQuantity += quantity;
    stock.transactions.push({
      type: 'add',
      quantity,
      reason,
      addedBy: req.user.id,
      addedByName: req.user.name
    });
    stock.updatedAt = new Date();
    
    await stock.save();
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Error adding stock' });
  }
});

// Deduct stock
router.post('/:stockId/deduct', verifyUser, async (req, res) => {
  try {
    const { quantity, reason } = req.body;
    const stock = await Stock.findById(req.params.stockId);
    
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    if (stock.currentQuantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });
    
    stock.currentQuantity -= quantity;
    stock.transactions.push({
      type: 'deduct',
      quantity,
      reason,
      addedBy: req.user.id,
      addedByName: req.user.name
    });
    stock.updatedAt = new Date();
    
    await stock.save();
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Error deducting stock' });
  }
});

// Assign monitor
router.put('/:stockId/assign-monitor', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { monitorId } = req.body;
    
    const monitor = await User.findById(monitorId);
    if (!monitor) return res.status(404).json({ message: 'User not found' });
    
    const stock = await Stock.findByIdAndUpdate(
      req.params.stockId,
      { monitor: monitorId, monitorName: monitor.name },
      { new: true }
    ).populate('monitor', 'name email');
    
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Error assigning monitor' });
  }
});

// Update stock name
router.put('/:stockId/update-name', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Stock name is required' });
    }
    
    // Check if name already exists
    const existing = await Stock.findOne({ name: name.trim(), _id: { $ne: req.params.stockId } });
    if (existing) {
      return res.status(400).json({ message: 'Stock with this name already exists' });
    }
    
    const stock = await Stock.findByIdAndUpdate(
      req.params.stockId,
      { name: name.trim() },
      { new: true }
    );
    
    res.json(stock);
  } catch (err) {
    console.error('Error updating stock name:', err);
    res.status(500).json({ message: 'Error updating stock name' });
  }
});

// Upload stocks from Excel
router.post('/upload-excel', verifyUser, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload Excel endpoint hit');
    
    if (req.user.role !== 'admin') {
      console.log('❌ User is not admin');
      return res.status(403).json({ message: 'Admin only' });
    }
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('✅ File received:', req.file.filename);
    
    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('✅ Excel data parsed, rows:', data.length);
    console.log('Sample row:', data[0]);
    
    const createdStocks = [];
    for (const row of data) {
      const { name, quantity, unit } = row;
      console.log('Processing row:', { name, quantity, unit });
      
      if (!name || quantity === undefined) {
        console.log('⚠️ Skipping row - missing name or quantity');
        continue;
      }
      
      let stock = await Stock.findOne({ name: String(name).trim() });
      if (!stock) {
        console.log('Creating new stock:', name);
        stock = await Stock.create({
          name: String(name).trim(),
          currentQuantity: parseInt(quantity),
          unit: unit || 'pcs',
          transactions: [{
            type: 'add',
            quantity: parseInt(quantity),
            reason: 'Imported from Excel',
            addedBy: req.user.id,
            addedByName: req.user.name
          }]
        });
        console.log('✅ Stock created:', stock.name);
      } else {
        console.log('Updating existing stock:', name);
        stock.currentQuantity += parseInt(quantity);
        stock.transactions.push({
          type: 'add',
          quantity: parseInt(quantity),
          reason: 'Imported from Excel',
          addedBy: req.user.id,
          addedByName: req.user.name
        });
        await stock.save();
        console.log('✅ Stock updated:', stock.name);
      }
      createdStocks.push(stock);
    }
    
    console.log('✅ Import complete, created/updated:', createdStocks.length, 'stocks');
    res.json({ message: 'Stocks imported successfully', count: createdStocks.length });
  } catch (err) {
    console.error('❌ Error uploading stocks:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: 'Error uploading stocks: ' + err.message });
  }
});

// Export stocks to Excel
router.get('/export/:month/:year', verifyUser, async (req, res) => {
  try {
    console.log('🔍 Export endpoint hit');
    console.log('User role:', req.user?.role);
    console.log('Params:', req.params);
    
    if (req.user.role !== 'admin') {
      console.log('❌ User is not admin');
      return res.status(403).json({ message: 'Admin only' });
    }
    
    const { month, year } = req.params;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (isNaN(monthNum) || isNaN(yearNum)) {
      console.log('❌ Invalid month/year:', { month, year });
      return res.status(400).json({ message: 'Invalid month or year' });
    }
    
    console.log('✅ Fetching stocks...');
    const stocks = await Stock.find();
    console.log('✅ Found', stocks.length, 'stocks');
    
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
    
    const data = [];
    
    for (const stock of stocks) {
      const transactions = stock.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
      });
      
      let added = 0, deducted = 0;
      transactions.forEach(t => {
        if (t.type === 'add') added += t.quantity;
        else if (t.type === 'deduct') deducted += t.quantity;
      });
      
      if (transactions.length > 0) {
        data.push({
          'Stock Name': stock.name,
          'Unit': stock.unit,
          'Added': added,
          'Deducted': deducted,
          'Current Quantity': stock.currentQuantity,
          'Monitor': stock.monitorName || 'Unassigned',
          'Transactions': transactions.length
        });
      }
    }
    
    if (data.length === 0) {
      data.push({
        'Stock Name': 'No transactions found for this period',
        'Unit': '-',
        'Added': 0,
        'Deducted': 0,
        'Current Quantity': 0,
        'Monitor': '-',
        'Transactions': 0
      });
    }
    
    console.log('✅ Creating Excel file with', data.length, 'rows');
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Report');
    
    const filename = `stock-report-${monthNum}-${yearNum}.xlsx`;
    console.log('✅ Filename:', filename);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    console.log('✅ Headers set');
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    console.log('✅ Buffer created, size:', buffer.length, 'bytes');
    
    console.log('✅ Sending buffer...');
    res.send(buffer);
  } catch (err) {
    console.error('❌ Error exporting stocks:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: 'Error exporting stocks: ' + err.message });
  }
});

// Delete stock
router.delete('/:stockId', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await Stock.findByIdAndDelete(req.params.stockId);
    res.json({ message: 'Stock deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting stock' });
  }
});

module.exports = router;
