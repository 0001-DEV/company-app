const { withMiddleware } = require('./middleware');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  console.log('🔍 Test login endpoint called');
  console.log('📝 Email:', email);
  console.log('📝 Password:', password ? '***' : 'missing');
  console.log('📝 Request body:', req.body);

  try {
    // Try to get database
    console.log('🔄 Attempting to get database...');
    const { db } = await require('./db-connection').connectToDatabase();
    console.log('✅ Database connected');

    // Try to find user
    console.log('🔍 Looking for user with email:', email);
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    console.log('📊 User found:', user ? 'yes' : 'no');
    
    if (user) {
      console.log('📊 User details:', { id: user._id, name: user.name, role: user.role });
    }

    return res.status(200).json({
      success: true,
      message: 'Test login endpoint working',
      userFound: !!user,
      user: user ? { id: user._id, name: user.name, email: user.email, role: user.role } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test login endpoint error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = withMiddleware(handler, { requireDb: true });
