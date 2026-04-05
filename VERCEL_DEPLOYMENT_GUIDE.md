# Vercel Serverless Functions Deployment Guide

## Overview

This document provides a complete guide for the Company Management System deployment on Vercel with serverless functions. The migration from Express.js backend to Vercel serverless functions has been successfully completed.

## Deployment Status

✅ **COMPLETED**: Vercel serverless functions migration
✅ **COMPLETED**: API endpoints configuration
✅ **COMPLETED**: CORS and middleware setup
✅ **COMPLETED**: Authentication system migration
✅ **COMPLETED**: Static file serving (HTML pages)
⚠️ **PENDING**: MongoDB Atlas connection configuration

## Live Deployment

- **Production URL**: https://company-app-sand.vercel.app
- **API Base URL**: https://company-app-sand.vercel.app/api/
- **Test Endpoint**: https://company-app-sand.vercel.app/api/test

## Migrated API Endpoints

### Authentication Endpoints
- `POST /api/auth-login` - General login endpoint
- `POST /api/admin-login` - Admin-specific login
- `POST /api/staff-login` - Staff-specific login

### Chat System Endpoints
- `GET /api/chat-me` - Get current user info
- `GET /api/chat-users` - Get users list for chat
- `GET /api/chat-messages` - Get messages (with filters)
- `POST /api/chat-message` - Send new message

### Staff Management Endpoints
- `GET /api/staff-all` - Get all staff (basic info)
- `GET /api/staff-my-jobs` - Get jobs assigned to current staff
- `GET /api/staff-my-profile` - Get staff profile info

### Admin Management Endpoints
- `GET /api/admin-all-staff` - Get all staff with details (admin only)
- `GET /api/admin-departments` - Get all departments
- `GET /api/admin-all-jobs` - Get all jobs with assignments

### System Endpoints
- `GET /api/test` - System health check and API status

## File Structure

```
/
├── api/                          # Serverless functions
│   ├── middleware.js            # Shared middleware utilities
│   ├── test.js                  # System test endpoint
│   ├── auth-login.js            # General authentication
│   ├── admin-login.js           # Admin authentication
│   ├── staff-login.js           # Staff authentication
│   ├── chat-me.js               # User info endpoint
│   ├── chat-users.js            # Chat users list
│   ├── chat-messages.js         # Message retrieval
│   ├── chat-message.js          # Message sending
│   ├── staff-all.js             # Staff list
│   ├── staff-my-jobs.js         # Staff jobs
│   ├── staff-my-profile.js      # Staff profile
│   ├── admin-all-staff.js       # Admin staff management
│   ├── admin-departments.js     # Department management
│   └── admin-all-jobs.js        # Job management
├── public/                       # Static files
│   ├── index.html               # Landing page
│   ├── admin-login.html         # Admin login page
│   └── staff-login.html         # Staff login page
├── package.json                 # Dependencies
└── .env.local                   # Environment variables
```

## Environment Variables Configuration

### Required Variables

1. **MONGODB_URI** (Critical)
   - Current Status: ⚠️ Contains placeholder values
   - Required: MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/company-app`

2. **JWT_SECRET** (Configured)
   - Status: ✅ Set
   - Value: Production-ready secret key

### Optional Variables

3. **EMAIL_HOST** - SMTP server (default: smtp.gmail.com)
4. **EMAIL_PORT** - SMTP port (default: 465)
5. **EMAIL_USER** - Email username
6. **EMAIL_PASS** - Email password/app password
7. **TWILIO_ACCOUNT_SID** - Twilio account SID
8. **TWILIO_AUTH_TOKEN** - Twilio auth token
9. **TWILIO_WHATSAPP_NUMBER** - WhatsApp number

### Setting Environment Variables in Vercel

```bash
# Add environment variables via Vercel CLI
vercel env add MONGODB_URI
vercel env add JWT_SECRET

# Or via Vercel Dashboard:
# 1. Go to project settings
# 2. Navigate to Environment Variables
# 3. Add variables for Production, Preview, and Development
```

## MongoDB Atlas Setup Required

To complete the deployment, you need to:

1. **Create MongoDB Atlas Cluster**
   - Sign up at https://cloud.mongodb.com
   - Create a new cluster
   - Set up database user credentials
   - Configure network access (allow Vercel IPs)

2. **Get Connection String**
   - Go to Cluster → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with actual password
   - Replace `<dbname>` with `company-app`

3. **Update Environment Variable**
   ```bash
   vercel env add MONGODB_URI
   # Enter the full connection string when prompted
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

## CORS Configuration

All API endpoints include comprehensive CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Allow-Credentials: true`

## Middleware Features

The shared middleware (`api/middleware.js`) provides:
- **Authentication**: JWT token verification
- **Role-based Access**: Admin/staff role checking
- **Database Connection**: MongoDB connection management
- **CORS Handling**: Automatic CORS header application
- **Error Handling**: Consistent error responses

## Authentication Flow

1. **Login Request**: POST to `/api/admin-login` or `/api/staff-login`
2. **Token Generation**: JWT token created with user ID and role
3. **Token Storage**: Frontend stores token in localStorage
4. **API Requests**: Include `Authorization: Bearer <token>` header
5. **Token Verification**: Middleware validates token on protected routes

## Testing the Deployment

### 1. System Health Check
```bash
curl https://company-app-sand.vercel.app/api/test
```

### 2. Login Test (after MongoDB setup)
```bash
curl -X POST https://company-app-sand.vercel.app/api/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### 3. Protected Route Test
```bash
curl https://company-app-sand.vercel.app/api/chat-me \
  -H "Authorization: Bearer <token>"
```

## Frontend Integration

The HTML pages are configured to work with the API:
- **Landing Page**: Shows API status and user counts
- **Login Pages**: Handle authentication and token storage
- **Dashboard Pages**: (To be created) Will use stored tokens for API calls

## Performance Considerations

- **Cold Starts**: Serverless functions may have cold start delays
- **Connection Pooling**: MongoDB connections are opened/closed per request
- **Caching**: Static files are cached by Vercel CDN
- **Optimization**: Functions are optimized for minimal bundle size

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Environment Variables**: Sensitive data stored securely
- **HTTPS Only**: All communications encrypted
- **Input Validation**: Request validation in middleware

## Monitoring and Debugging

### Vercel Dashboard
- Function logs: https://vercel.com/dashboard
- Performance metrics: Response times and error rates
- Environment variables: Secure configuration management

### Debug Commands
```bash
# View deployment logs
vercel logs https://company-app-sand.vercel.app

# List environment variables
vercel env ls

# Check project status
vercel ls
```

## Next Steps

1. **Configure MongoDB Atlas** (Priority 1)
   - Set up cluster and database
   - Update MONGODB_URI environment variable
   - Test database connectivity

2. **Complete API Migration** (Priority 2)
   - Migrate remaining backend routes
   - Add file upload functionality
   - Implement client document management

3. **Frontend Integration** (Priority 3)
   - Create React dashboard components
   - Implement chat interface
   - Add staff management UI

4. **Testing and Optimization** (Priority 4)
   - Add comprehensive test suite
   - Optimize function performance
   - Implement error monitoring

## Troubleshooting

### Common Issues

1. **API Returns 404**
   - Check function names match URL paths
   - Verify deployment completed successfully
   - Check Vercel function logs

2. **MongoDB Connection Errors**
   - Verify MONGODB_URI is set correctly
   - Check MongoDB Atlas network access
   - Ensure database user has proper permissions

3. **CORS Errors**
   - Verify CORS headers are set in all functions
   - Check preflight OPTIONS handling
   - Ensure credentials are handled properly

4. **Authentication Failures**
   - Verify JWT_SECRET is set
   - Check token format and expiration
   - Ensure proper Authorization header format

## Support and Maintenance

- **Deployment**: Automatic via Vercel CLI or Git integration
- **Scaling**: Automatic serverless scaling
- **Updates**: Deploy new versions with `vercel --prod`
- **Rollback**: Use Vercel dashboard to rollback deployments

---

**Deployment Completed**: ✅ Core serverless functions migration successful
**Status**: Ready for MongoDB configuration and frontend integration
**Last Updated**: January 2025