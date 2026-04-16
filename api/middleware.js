const { connectToDatabase } = require('./db-connection');
const jwt = require('jsonwebtoken');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

// Apply CORS headers to response
const applyCors = (res) => {
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });
};

// Handle preflight OPTIONS request
const handleOptions = (req, res) => {
  if (req.method === 'OPTIONS') {
    applyCors(res);
    return res.status(200).json({});
  }
  return false;
};

// Verify JWT token and get user
const verifyToken = async (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  
  return { id: decoded.id, role: decoded.role, name: decoded.name };
};

// Get MongoDB connection using optimized connection pooling
const getDbConnection = async () => {
  return await connectToDatabase();
};

// Middleware wrapper for API routes
const withMiddleware = (handler, options = {}) => {
  return async (req, res) => {
    try {
      // Handle CORS preflight
      if (handleOptions(req, res)) return;
      
      // Apply CORS headers
      applyCors(res);
      
      // Check if authentication is required
      if (options.requireAuth) {
        try {
          req.user = await verifyToken(req);
        } catch (error) {
          return res.status(401).json({ message: 'Invalid or missing token' });
        }
      }
      
      // Check role requirements
      if (options.requireRole && req.user?.role !== options.requireRole) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      // Get database connection if needed (uses connection pooling)
      if (options.requireDb) {
        const { client, db } = await getDbConnection();
        req.db = db;
        req.dbClient = client; // Note: Don't close this as it's cached
      }
      
      // Call the actual handler
      const result = await handler(req, res);
      
      // Note: Don't close the database connection as it's cached for reuse
      
      return result;
      
    } catch (error) {
      console.error('Middleware error:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: 'Server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  };
};

module.exports = {
  corsHeaders,
  applyCors,
  handleOptions,
  verifyToken,
  getDbConnection,
  withMiddleware
};