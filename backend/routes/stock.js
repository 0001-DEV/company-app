const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/auth');
const Stock = require('../models/Stock');
const User = require('../models/User');
const StockManager = require('../models/StockManager');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Helper function to check if user is admin or stock manager
const isAdminOrStockManager = async (userId) => {
  console.log('🔍 Checking access for userId:', userId);
  const user = await User.findById(userId);
  console.log('👤 User found:', user?.name, 'Role:', user?.role);
  if (user?.role === 'admin') {
    console.log('✅ User is admin');
    return true;
  }
  const manager = await StockManager.findOne({ staffId: userId });
  console.log('📋 StockManager record:', manager);
  if (manager) {
    console.log('✅ User is stock manager');
    return true;
  }
  console.log('❌ User is neither admin nor stock manager');
  return false;
};

// Get all stocks
router.get('/all', verifyUser, async (req, res) => {
  try {
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }
    const stocks = await Stock.find().populate('monitor', 'name email').sort({ createdAt: -1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stocks' });
  }
});

// Create new stock
router.post('/create', verifyUser, async (req, res) => {
  try {
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }
    const { name, quantity, unit } = req.body;
    
    if (!name || quantity === undefined) {
      return res.status(400).json({ message: 'Name and quantity are required' });
    }
    
    const stockName = String(name).trim();

    // Check if stock already exists
    let existing = await Stock.findOne({ name: { $regex: new RegExp('^' + stockName + '$', 'i') } });
    
    if (existing) {
      return res.status(400).json({ message: `Stock with name "${stockName}" already exists` });
    }
    
    const stock = await Stock.create({
      name: stockName,
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

// Upload stocks from Excel
router.post('/upload-excel', verifyUser, upload.single('file'), async (req, res) => {
  try {
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }
    console.log('📤 Upload Excel endpoint hit');
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('✅ File received:', req.file.filename);
    
    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('✅ Excel data parsed, rows:', data.length);
    
    const createdStocks = [];
    for (const row of data) {
      const name = row.name || row.Name || row.NAME || row['Stock Name'] || row['Item Name'];
      const quantity = row.quantity || row.Quantity || row.QTY || row.Qty || row.Amount;
      const unit = row.unit || row.Unit || row.UNIT || 'pcs';
      
      if (!name || quantity === undefined) {
        continue;
      }
      
      const stockName = String(name).trim();
      const qtyNum = parseInt(quantity);
      
      let stock = await Stock.findOne({ name: { $regex: new RegExp('^' + stockName + '$', 'i') } });
      if (!stock) {
        stock = await Stock.create({
          name: stockName,
          currentQuantity: qtyNum,
          unit: unit,
          transactions: [{
            type: 'add',
            quantity: qtyNum,
            reason: 'Imported from Excel',
            addedBy: req.user.id,
            addedByName: req.user.name
          }]
        });
      } else {
        stock.currentQuantity += qtyNum;
        stock.transactions.push({
          type: 'add',
          quantity: qtyNum,
          reason: 'Imported from Excel',
          addedBy: req.user.id,
          addedByName: req.user.name
        });
        await stock.save();
      }
      createdStocks.push(stock);
    }
    
    res.json({ message: 'Stocks imported successfully', count: createdStocks.length });
  } catch (err) {
    console.error('❌ Error uploading stocks:', err.message);
    res.status(500).json({ message: 'Error uploading stocks: ' + err.message });
  }
});

// ===== SPECIFIC EXPORT ROUTES (MUST BE BEFORE GENERIC /:stockId ROUTES) =====

// Export stocks for month range to Excel
router.get('/export-range/:startMonth/:endMonth/:year', verifyUser, async (req, res) => {
  try {
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }
    console.log('🔍 Range export endpoint hit');
    
    const { startMonth, endMonth, year } = req.params;
    const startMonthNum = parseInt(startMonth);
    const endMonthNum = parseInt(endMonth);
    const yearNum = parseInt(year);
    
    if (isNaN(startMonthNum) || isNaN(endMonthNum) || isNaN(yearNum)) {
      return res.status(400).json({ message: 'Invalid month or year' });
    }

    if (startMonthNum < 1 || startMonthNum > 12 || endMonthNum < 1 || endMonthNum > 12) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }

    if (startMonthNum > endMonthNum) {
      return res.status(400).json({ message: 'Start month cannot be after end month' });
    }
    
    const stocks = await Stock.find();
    
    const startDate = new Date(yearNum, startMonthNum - 1, 1);
    const endDate = new Date(yearNum, endMonthNum, 0, 23, 59, 59);
    
    const data = [];
    let totalAdded = 0;
    let totalDeducted = 0;
    
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
      
      totalAdded += added;
      totalDeducted += deducted;
      
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
    
    if (data.length === 0) {
      data.push({
        'Stock Name': 'No stocks found',
        'Unit': '-',
        'Added': 0,
        'Deducted': 0,
        'Current Quantity': 0,
        'Monitor': '-',
        'Transactions': 0
      });
    } else {
      // Add totals row
      data.push({});
      data.push({
        'Stock Name': 'TOTALS',
        'Unit': '',
        'Added': totalAdded,
        'Deducted': totalDeducted,
        'Current Quantity': totalAdded - totalDeducted,
        'Monitor': '',
        'Transactions': ''
      });
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Report');
    
    const startMonthName = new Date(yearNum, startMonthNum - 1).toLocaleString('default', { month: 'long' });
    const endMonthName = new Date(yearNum, endMonthNum - 1).toLocaleString('default', { month: 'long' });
    const filename = `stock-report-${startMonthName}-to-${endMonthName}-${yearNum}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
  } catch (err) {
    console.error('❌ Error exporting range stocks:', err.message);
    res.status(500).json({ message: 'Error exporting stocks: ' + err.message });
  }
});

// Export stocks to Excel (single month)
router.get('/export/:month/:year', verifyUser, async (req, res) => {
  try {
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }
    
    const { month, year } = req.params;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (isNaN(monthNum) || isNaN(yearNum)) {
      return res.status(400).json({ message: 'Invalid month or year' });
    }
    
    const stocks = await Stock.find();
    
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
    
    const data = [];
    let totalAdded = 0;
    let totalDeducted = 0;
    
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
        totalAdded += added;
        totalDeducted += deducted;
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
    } else {
      // Add totals row
      data.push({});
      data.push({
        'Stock Name': 'TOTALS',
        'Unit': '',
        'Added': totalAdded,
        'Deducted': totalDeducted,
        'Current Quantity': totalAdded - totalDeducted,
        'Monitor': '',
        'Transactions': ''
      });
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Report');
    
    const filename = `stock-report-${monthNum}-${yearNum}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
  } catch (err) {
    console.error('❌ Error exporting stocks:', err.message);
    res.status(500).json({ message: 'Error exporting stocks: ' + err.message });
  }
});

// Export stocks for entire year to Excel
router.get('/export/year/:year', verifyUser, async (req, res) => {
  try {
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }
    
    const { year } = req.params;
    const yearNum = parseInt(year);
    
    if (isNaN(yearNum)) {
      return res.status(400).json({ message: 'Invalid year' });
    }
    
    const stocks = await Stock.find();
    
    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59);
    
    const data = [];
    let totalAdded = 0;
    let totalDeducted = 0;
    
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
        totalAdded += added;
        totalDeducted += deducted;
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
        'Stock Name': 'No transactions found for this year',
        'Unit': '-',
        'Added': 0,
        'Deducted': 0,
        'Current Quantity': 0,
        'Monitor': '-',
        'Transactions': 0
      });
    } else {
      // Add totals row
      data.push({});
      data.push({
        'Stock Name': 'TOTALS',
        'Unit': '',
        'Added': totalAdded,
        'Deducted': totalDeducted,
        'Current Quantity': totalAdded - totalDeducted,
        'Monitor': '',
        'Transactions': ''
      });
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Report');
    
    const filename = `stock-report-${yearNum}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
  } catch (err) {
    console.error('❌ Error exporting year stocks:', err.message);
    res.status(500).json({ message: 'Error exporting stocks: ' + err.message });
  }
});

// Export single stock to Excel
router.get('/export-stock/:stockId', verifyUser, async (req, res) => {
  try {
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }

    const stock = await Stock.findById(req.params.stockId);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const data = [{
      'Stock Name': stock.name,
      'Unit': stock.unit,
      'Current Quantity': stock.currentQuantity,
      'Monitor': stock.monitorName || 'Unassigned',
      'Total Transactions': stock.transactions?.length || 0
    }];

    // Add transaction details
    if (stock.transactions && stock.transactions.length > 0) {
      data.push({});
      data.push({ 'Stock Name': 'Transaction History' });
      
      let totalAdded = 0;
      let totalDeducted = 0;
      
      stock.transactions.forEach((t, idx) => {
        if (t.type === 'add') totalAdded += t.quantity;
        else if (t.type === 'deduct') totalDeducted += t.quantity;
        
        data.push({
          'Stock Name': `${idx + 1}. ${t.type === 'add' ? 'Added' : 'Used'}`,
          'Unit': t.quantity,
          'Current Quantity': t.reason || '-',
          'Monitor': t.addedByName || 'Unknown',
          'Total Transactions': new Date(t.date).toLocaleDateString()
        });
      });
      
      // Add totals row
      data.push({});
      data.push({
        'Stock Name': 'TOTALS',
        'Unit': totalAdded + totalDeducted,
        'Current Quantity': `Added: ${totalAdded} | Deducted: ${totalDeducted}`,
        'Monitor': `Current: ${stock.currentQuantity}`,
        'Total Transactions': ''
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Details');

    const filename = `${stock.name}-details.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
  } catch (err) {
    console.error('Error exporting stock:', err);
    res.status(500).json({ message: 'Error exporting stock: ' + err.message });
  }
});

// ===== GENERIC /:stockId ROUTES (MUST BE AFTER SPECIFIC ROUTES) =====

// Add stock
router.post('/:stockId/add', verifyUser, async (req, res) => {
  try {
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }
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
    const isAllowed = await isAdminOrStockManager(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Admin or Stock Manager only' });
    }
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
