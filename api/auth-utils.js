const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash a password using bcrypt with 12 rounds (as per security requirements)
 */
const hashPassword = async (password) => {
  const saltRounds = 12; // Minimum 12 rounds as per requirements
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against a hash
 */
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token with user information and permissions
 */
const generateToken = (user) => {
  const permissions = user.role === 'admin' 
    ? ['admin_access', 'staff_management', 'system_config', 'chat_access', 'workbank_access']
    : ['staff_access', 'chat_access', 'workbank_access'];

  const tokenPayload = {
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
    department: user.department || null,
    permissions
  };

  return jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

/**
 * Verify and decode JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

/**
 * Validate user credentials and return user data
 */
const validateCredentials = async (db, email, password, role = null) => {
  const query = { email: email.toLowerCase() };
  if (role) {
    query.role = role;
  }

  const user = await db.collection('users').findOne(query);
  
  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  // Check if user is active (if active field exists)
  if (user.active === false) {
    throw new Error('User account is deactivated');
  }

  return user;
};

/**
 * Create standardized user response object
 */
const createUserResponse = (user, includeToken = true) => {
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || null,
    profilePicture: user.profilePicture || '',
    phone: user.phone || '',
    canViewOthersWork: user.canViewOthersWork || false
  };

  const response = {
    message: `${user.role === 'admin' ? 'Admin' : 'Staff'} login successful`,
    user: userResponse
  };

  if (includeToken) {
    response.token = generateToken(user);
  }

  return response;
};

/**
 * Log authentication events for audit purposes
 */
const logAuthEvent = async (db, userId, action, details = {}) => {
  try {
    await db.collection('audit_logs').insertOne({
      userId,
      action,
      timestamp: new Date(),
      details,
      ip: details.ip || null,
      userAgent: details.userAgent || null
    });
  } catch (error) {
    console.error('Failed to log auth event:', error);
    // Don't throw error - logging failure shouldn't break auth flow
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  validateCredentials,
  createUserResponse,
  logAuthEvent
};