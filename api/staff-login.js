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
    // Validate staff credentials specifically
    const staff = await validateCredentials(req.db, email, password, 'staff');
    
    // Log successful staff login
    await logAuthEvent(req.db, staff._id, 'staff_login', {
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      department: staff.department
    });

    // Return success response with token
    const response = createUserResponse(staff, true);
    response.staff = response.user; // Keep backward compatibility
    delete response.user;
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('Staff login error:', error);
    
    // Log failed staff login attempt
    await logAuthEvent(req.db, null, 'staff_login_failed', {
      email: email.toLowerCase(),
      error: error.message,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    });

    const statusCode = error.message === 'User not found' ? 404 : 
                      error.message === 'Invalid password' ? 401 : 
                      error.message === 'User account is deactivated' ? 403 : 500;

    return res.status(statusCode).json({ 
      message: error.message === 'User not found' ? 'Staff not found' :
               error.message === 'User account is deactivated' ? 
                 'Staff account has been deactivated' : 
                 'Invalid staff credentials'
    });
  }
};

module.exports = withMiddleware(handler, { requireDb: true });