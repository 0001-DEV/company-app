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
    // Validate credentials (any role)
    const user = await validateCredentials(req.db, email, password);
    
    // Log successful login
    await logAuthEvent(req.db, user._id, 'login', {
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      role: user.role
    });

    // Return success response with token
    const response = createUserResponse(user, true);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Login error:', error);
    
    // Log failed login attempt
    await logAuthEvent(req.db, null, 'login_failed', {
      email: email.toLowerCase(),
      error: error.message,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    });

    const statusCode = error.message === 'User not found' ? 404 : 
                      error.message === 'Invalid password' ? 401 : 
                      error.message === 'User account is deactivated' ? 403 : 500;

    return res.status(statusCode).json({ 
      message: error.message === 'User account is deactivated' ? 
        'Account has been deactivated' : 
        'Invalid credentials'
    });
  }
};

module.exports = withMiddleware(handler, { requireDb: true });