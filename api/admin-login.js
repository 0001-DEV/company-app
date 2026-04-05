const { withMiddleware } = require('./middleware');
const { validateCredentials, createUserResponse, logAuthEvent } = require('./auth-utils');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Validate admin credentials specifically
    const admin = await validateCredentials(req.db, email, password, 'admin');
    
    // Log successful admin login
    await logAuthEvent(req.db, admin._id, 'admin_login', {
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Return success response with token
    const response = createUserResponse(admin, true);
    response.admin = response.user; // Keep backward compatibility
    delete response.user;
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('Admin login error:', error);
    
    // Log failed admin login attempt
    await logAuthEvent(req.db, null, 'admin_login_failed', {
      email: email.toLowerCase(),
      error: error.message,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    });

    const statusCode = error.message === 'User not found' ? 404 : 
                      error.message === 'Invalid password' ? 401 : 
                      error.message === 'User account is deactivated' ? 403 : 500;

    return res.status(statusCode).json({ 
      message: error.message === 'User not found' ? 'Admin not found' :
               error.message === 'User account is deactivated' ? 
                 'Admin account has been deactivated' : 
                 'Invalid admin credentials'
    });
  }
};

module.exports = withMiddleware(handler, { requireDb: true });