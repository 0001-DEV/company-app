const connectDB = require('../lib/mongoose');
const clientPromise = require('../lib/mongodb');
const User = require('../lib/models/User');
const Department = require('../lib/models/Department');

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
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    const performanceResults = {};
    
    // Test 1: Connection establishment time
    const connectionStart = Date.now();
    await connectDB();
    const client = await clientPromise;
    const connectionTime = Date.now() - connectionStart;
    performanceResults.connectionTime = `${connectionTime}ms`;

    // Test 2: Simple query performance (native driver)
    const nativeStart = Date.now();
    const db = client.db("company-app");
    const userCount = await db.collection("users").countDocuments();
    const nativeQueryTime = Date.now() - nativeStart;
    performanceResults.nativeQueryTime = `${nativeQueryTime}ms`;

    // Test 3: Mongoose query performance
    const mongooseStart = Date.now();
    const users = await User.find().limit(10);
    const mongooseQueryTime = Date.now() - mongooseStart;
    performanceResults.mongooseQueryTime = `${mongooseQueryTime}ms`;

    // Test 4: Complex aggregation query
    const aggregationStart = Date.now();
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          avgCreatedAt: { $avg: "$createdAt" }
        }
      }
    ]);
    const aggregationTime = Date.now() - aggregationStart;
    performanceResults.aggregationTime = `${aggregationTime}ms`;

    // Test 5: Join query performance
    const joinStart = Date.now();
    const usersWithDepts = await User.find().populate('department').limit(5);
    const joinTime = Date.now() - joinStart;
    performanceResults.joinQueryTime = `${joinTime}ms`;

    // Test 6: Multiple concurrent queries
    const concurrentStart = Date.now();
    const [deptCount, messageCount, totalUsers] = await Promise.all([
      db.collection("departments").countDocuments(),
      db.collection("messages").countDocuments(),
      User.countDocuments()
    ]);
    const concurrentTime = Date.now() - concurrentStart;
    performanceResults.concurrentQueryTime = `${concurrentTime}ms`;

    // Performance assessment
    const assessment = {
      connectionSpeed: connectionTime < 1000 ? 'Excellent' : connectionTime < 2000 ? 'Good' : 'Needs Improvement',
      querySpeed: mongooseQueryTime < 100 ? 'Excellent' : mongooseQueryTime < 300 ? 'Good' : 'Needs Improvement',
      overallRating: connectionTime < 1000 && mongooseQueryTime < 300 ? 'Production Ready' : 'Optimization Recommended'
    };

    res.status(200).json({
      success: true,
      message: 'Database performance test completed',
      timestamp: new Date().toISOString(),
      performance: performanceResults,
      assessment: assessment,
      dataStats: {
        totalUsers: userCount,
        departments: deptCount,
        messages: messageCount,
        usersByRole: userStats,
        sampleUsers: users.length,
        usersWithDepartments: usersWithDepts.length
      },
      recommendations: {
        connectionPooling: 'Enabled (10 connections)',
        indexing: 'Ensure indexes on email, role, department fields',
        caching: 'Consider Redis for frequently accessed data',
        monitoring: 'Set up performance monitoring for production'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database performance test failed',
      timestamp: new Date().toISOString()
    });
  }
};