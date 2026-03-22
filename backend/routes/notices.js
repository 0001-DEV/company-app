const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const User = require('../models/User');
const { verifyUser } = require('../middleware/auth');
const { sendEmail, sendWhatsApp } = require('../utils/notifications');

// Get all notices (staff + admin)
router.get('/', verifyUser, async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(20);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post a notice (admin only)
router.post('/', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { title, body, priority } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body required' });
    
    const notice = await Notice.create({ title, body, priority: priority || 'normal' });

    // Send notifications to all staff members
    const staff = await User.find({ role: 'staff' }).select('email phone name');
    const emails = staff.map(s => s.email).filter(e => !!e);
    
    if (emails.length > 0) {
      const emailSubject = `Announcement: ${title}`;
      const emailBody = `Hello,\n\nA new announcement has been posted:\n\nTitle: ${title}\nPriority: ${priority || 'normal'}\n\n${body}\n\nBest regards,\nCompany Admin`;
      sendEmail(emails, emailSubject, emailBody);
    }

    // Send WhatsApp to each staff member if phone is available
    const whatsappMessage = `📢 *Announcement: ${title}*\n\n${body}\n\n_Priority: ${priority || 'normal'}_`;
    for (const member of staff) {
      if (member.phone) {
        sendWhatsApp(member.phone, whatsappMessage);
      }
    }

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a notice (admin only)
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
