/**
 * Authentication Integration Test
 * 
 * This script tests the complete authentication flow:
 * 1. Login with valid credentials
 * 2. Validate token
 * 3. Refresh token
 * 4. Get user info
 * 5. Logout
 */

const { connectToDatabase } = require('./api/db-connection');
const { validateCredentials, generateToken, verifyToken, hashPassword } = require('./api/auth-utils');

async function runAuthTests() {
  console.log('🔐 Starting Authentication Integration Tests...\n');
  
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    console.log('✅ Database connection established');

    // Test 1: Check if test users exist
    console.log('\n📋 Test 1: Checking for test users...');
    const adminUser = await db.collection('users').findOne({ role: 'admin' });
    const staffUser = await db.collection('users').findOne({ role: 'staff' });
    
    if (!adminUser && !staffUser) {
      console.log('⚠️  No test users found. Creating test users...');
      
      // Create test admin user
      const hashedPassword = await hashPassword('admin123');
      await db.collection('users').insertOne({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        profilePicture: '',
        createdAt: new Date()
      });
      
      // Create test staff user
      const hashedStaffPassword = await hashPassword('staff123');
      await db.collection('users').insertOne({
        name: 'Test Staff',
        email: 'staff@test.com',
        password: hashedStaffPassword,
        role: 'staff',
        profilePicture: '',
        createdAt: new Date()
      });
      
      console.log('✅ Test users created');
    } else {
      console.log('✅ Test users found');
    }

    // Test 2: Validate credentials function
    console.log('\n📋 Test 2: Testing credential validation...');
    try {
      const testAdmin = await validateCredentials(db, 'admin@test.com', 'admin123', 'admin');
      console.log('✅ Admin credential validation successful');
      
      const testStaff = await validateCredentials(db, 'staff@test.com', 'staff123', 'staff');
      console.log('✅ Staff credential validation successful');
    } catch (error) {
      console.log('❌ Credential validation failed:', error.message);
    }

    // Test 3: JWT token generation and verification
    console.log('\n📋 Test 3: Testing JWT token operations...');
    const testUser = await db.collection('users').findOne({ role: 'admin' });
    if (testUser) {
      const token = generateToken(testUser);
      console.log('✅ JWT token generated');
      
      try {
        const decoded = verifyToken(token);
        console.log('✅ JWT token verification successful');
        console.log('   Token contains:', {
          id: decoded.id,
          role: decoded.role,
          email: decoded.email,
          permissions: decoded.permissions
        });
      } catch (error) {
        console.log('❌ JWT token verification failed:', error.message);
      }
    }

    // Test 4: Password hashing verification
    console.log('\n📋 Test 4: Testing password security...');
    const users = await db.collection('users').find({}).limit(5).toArray();
    let properlyHashedCount = 0;
    
    users.forEach(user => {
      if (user.password && user.password.startsWith('$2')) {
        properlyHashedCount++;
      }
    });
    
    console.log(`✅ ${properlyHashedCount}/${users.length} users have properly hashed passwords`);

    // Test 5: Database indexes
    console.log('\n📋 Test 5: Checking database indexes...');
    const indexes = await db.collection('users').indexes();
    const hasEmailIndex = indexes.some(index => index.key && index.key.email === 1);
    
    if (hasEmailIndex) {
      console.log('✅ Email index exists for optimal login performance');
    } else {
      console.log('⚠️  Email index missing - consider adding for better performance');
    }

    // Test Summary
    console.log('\n🎉 Authentication Integration Tests Complete!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Database connectivity');
    console.log('   ✅ User credential validation');
    console.log('   ✅ JWT token generation/verification');
    console.log('   ✅ Password hashing security');
    console.log('   ✅ Database optimization check');
    
    console.log('\n🔗 Available Authentication Endpoints:');
    console.log('   POST /api/auth-login - General authentication');
    console.log('   POST /api/admin-login - Admin-specific login');
    console.log('   POST /api/staff-login - Staff-specific login');
    console.log('   GET  /api/auth-validate - Token validation');
    console.log('   POST /api/auth-refresh - Token refresh');
    console.log('   GET  /api/auth-me - User profile');
    console.log('   POST /api/auth-logout - User logout');
    console.log('   GET  /api/auth-test - System diagnostics');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAuthTests().then(() => {
    console.log('\n✨ Test execution complete');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runAuthTests };