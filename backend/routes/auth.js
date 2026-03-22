<<<<<<< HEAD
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'mysecret';

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, jwtSecret);

    // Attach user info to request (lightweight)
    req.user = { id: payload.id, role: payload.role };

    // optional: fetch full user if you need more than id/role
    // const user = await User.findById(payload.id);
    // if (!user) return res.status(401).json({ message: 'Invalid token (user not found)' });
    // req.user = user;

    // require admin role
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};
=======
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'mysecret';

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, jwtSecret);

    // Attach user info to request (lightweight)
    req.user = { id: payload.id, role: payload.role };

    // optional: fetch full user if you need more than id/role
    // const user = await User.findById(payload.id);
    // if (!user) return res.status(401).json({ message: 'Invalid token (user not found)' });
    // req.user = user;

    // require admin role
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};
>>>>>>> 500de3921b8b68c26e46441c078fdc0e74f56b00
