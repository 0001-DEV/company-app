const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendEmail } = require('../utils/notifications');
const bcrypt = require('bcryptjs');
const { verifyUser } = require('../middleware/auth');

// Request password reset
router.post('/request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by login email or functional email
    const user = await User.findOne({
      $or: [
        { email: email },
        { functionalEmail: email }
      ]
    });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.json({ message: 'If email exists, reset link will be sent' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save reset token
    await PasswordReset.create({
      userId: user._id,
      email: email,
      token: hashedToken,
      expiresAt: expiresAt
    });

    // Send reset email in background (non-blocking)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"Xtreme Cr8ivity" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Xtreme Cr8ivity',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">Password Reset Request</h1>
          </div>
          <div style="padding: 40px 30px; background: white; color: #1e293b; line-height: 1.6;">
            <p style="font-size: 16px; margin-bottom: 24px;">Hello,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">
              This link will expire in 1 hour.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #64748b; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              If you didn't request this, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
            &copy; 2026 Xtreme Cr8ivity. All rights reserved.
          </div>
        </div>
      `
    };

    // Send email in background without blocking response
    sendEmail(mailOptions)
      .then(() => console.log(`✅ Password reset email sent to ${email}`))
      .catch(err => console.error(`❌ Failed to send reset email to ${email}:`, err.message));

    res.json({ message: 'If email exists, reset link will be sent' });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify reset token
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    res.json({ message: 'Token is valid', email: resetRecord.email });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with token
router.post('/reset/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    // Find user and update password
    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark reset token as used
    resetRecord.used = true;
    await resetRecord.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update functional email (authenticated users only)
router.post('/update-functional-email', verifyUser, async (req, res) => {
  try {
    const { functionalEmail } = req.body;

    if (!functionalEmail) {
      return res.status(400).json({ message: 'Functional email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(functionalEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ 
      functionalEmail: functionalEmail,
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'This email is already in use' });
    }

    // Update user's functional email
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { functionalEmail: functionalEmail },
      { new: true }
    );

    res.json({ 
      message: 'Functional email updated successfully',
      functionalEmail: user.functionalEmail
    });
  } catch (err) {
    console.error('Update functional email error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
