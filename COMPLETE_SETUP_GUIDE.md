# Complete Setup Guide - Localhost Testing

## What Was Fixed

I found and fixed the issue causing the "Unexpected token '<'" error:

1. **Backend environment variable mismatch**: 
   - Backend was looking for `MONGO_URI` but we set `MONGODB_URI`
   - Fixed in `backend/server.js` to check both variables
   - Updated `backend/.env` to use `MONGODB_URI` with MongoDB Atlas connection

2. **MongoDB connection string**:
   - Updated to use MongoDB Atlas: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`
   - JWT secret updated to production value

## How to Test Locally

### Terminal 1: Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
✅ MongoDB connected
✅ Server running on port 5000
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm start
```

This will automatically open `http://localhost:3000`

### Test the Login Flow

1. **First Visit**: You'll see the login page with two options:
   - Admin Login
   - Staff Login

2. **Click Admin Login** and enter:
   - Email: `admin@xtremecr8ivity.com`
   - Password: `admin123`

3. **Expected Result**: 
   - Login succeeds
   - Redirects to admin dashboard
   - Token stored in localStorage

4. **Next Visit to localhost:3000**:
   - You'll see a "Logout" button (because you're already logged in)
   - Click it to clear the session and test login again

## Verify Backend is Working

Open a new browser tab and go to:
```
http://localhost:5000/api/test
```

You should see JSON response:
```json
{
  "success": true,
  "message": "MongoDB connection successful",
  "collections": [...]
}
```

## Troubleshooting

### Error: "Cannot find module"
```bash
cd backend
npm install
```

### Error: "MONGODB_URI not set"
- Check `backend/.env` file exists
- Verify it has: `MONGODB_URI=mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`

### Error: "bad auth: Authentication failed"
- MongoDB credentials are wrong
- Verify in MongoDB Atlas:
  - User: `admin`
  - Password: `Opulence16`
  - Network Access: `0.0.0.0/0` is whitelisted

### Error: "Proxy error: Could not proxy request"
- Backend not running on port 5000
- Check Terminal 1 for "✅ Server running on port 5000"

### Error: "Unexpected token '<'"
- Backend is returning HTML instead of JSON
- This means backend server crashed or isn't running
- Check Terminal 1 for error messages

### Login page blinks and goes to dashboard
- This is normal if you're already logged in
- Click the "Logout" button to test login again

## Files Modified

- `backend/server.js` - Fixed MongoDB URI environment variable handling
- `backend/.env` - Updated to use MongoDB Atlas connection string
- `frontend/src/pages/LoginSelector.js` - Added logout functionality

## Next Steps

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Test login at `http://localhost:3000`
4. Verify admin dashboard loads
5. Test logout and login again

## Important Notes

- **Two terminals required**: One for backend, one for frontend
- **Backend must start first**: Frontend proxy needs it ready
- **Port 5000**: Backend (don't change)
- **Port 3000**: Frontend (can change if needed)
- **MongoDB Atlas**: Using cloud database, not local MongoDB

## Quick Commands

```bash
# Test backend API
curl http://localhost:5000/api/test

# Test frontend can reach backend
curl http://localhost:3000/api/test

# Check if ports are in use (Windows)
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process on port 5000 (Windows)
taskkill /PID <PID> /F

# Kill process on port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9
```

## Still Having Issues?

1. Check browser DevTools Console (F12) for errors
2. Check browser DevTools Network tab for failed requests
3. Check terminal output for backend errors
4. Verify MongoDB connection: `http://localhost:5000/api/test`
5. Make sure both terminals are running
