const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

module.exports = async (req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ message: 'Database configuration error' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("company-app");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find staff user in database
    const staff = await db.collection('users').findOne({ 
      email: email.toLowerCase(),
      role: 'staff'
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: staff._id, role: 'staff' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return success response
    res.status(200).json({
      message: 'Staff login successful',
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email
      }
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ message: 'Server error during staff login' });
  } finally {
    await client.close();
  }
};