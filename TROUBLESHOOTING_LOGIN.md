# Troubleshooting Login Issues

## What Was Fixed

The frontend was calling the wrong API endpoints:
- ❌ Was calling: `/api/admin-login` and `/api/staff-login`
- ✅ Now calling: `/api/admin/login` and `/api/staff/login`

## Before You Test

### 1. Verify Admin User Exists

Run this script to check if admin user exists in MongoDB:

```bash
cd backend
node verify-admin-user.js
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Admin user found
   Name: Admin User
   Email: admin@xtremecr8ivity.com
   Role: admin
✅ Password is correct
```

If admin user doesn't exist, the script will create it automatically.

### 2. Rebuild Frontend

The frontend needs to be rebuilt to use the new API endpoints:

```bash
cd frontend
npm run build
```

## Testing Steps

### Terminal 1: Start Backend

```bash
cd backend
npm start
```

**Expected output:**
```
✅ MongoDB connected
✅ Server running on port 5000
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm start
```

This will open `http://localhost:3000` automatically.

### Test Admin Login

1. Click "Admin Login"
2. Enter:
   - Email: `admin@xtremecr8ivity.com`
   - Password: `admin123`
3. Click "Sign In as Admin"

**Expected result:**
- Login succeeds
- Redirects to admin dashboard
- No error messages

## Debugging

### If Login Still Fails

#### Step 1: Check Backend Terminal

Look for error messages like:
```
POST /api/admin/login
Admin login error: [error message]
```

Copy the error message and check below.

#### Step 2: Check Browser Console

Press F12 and click "Console" tab. Look for:
- Red error messages
- Network errors
- JSON parse errors

#### Step 3: Check Network Tab

Press F12 and click "Network" tab. Then:
1. Try to login
2. Look for `/api/admin/login` request
3. Click on it
4. Check the "Response" tab

**Expected response:**
```json
{
  "message": "Admin login successful",
  "token": "eyJhbGc...",
  "admin": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@xtremecr8ivity.com",
    "role": "admin"
  }
}
```

### Common Errors and Fixes

#### Error: "Admin not found"
- Admin user doesn't exist in MongoDB
- Fix: Run `node backend/verify-admin-user.js`

#### Error: "Incorrect password"
- Password is wrong
- Fix: Run `node backend/verify-admin-user.js` to reset password

#### Error: "Cannot POST /api/admin/login"
- Backend not running
- Fix: Check Terminal 1 for "✅ Server running on port 5000"

#### Error: "Unexpected token '<'"
- Backend returning HTML instead of JSON
- Fix: Backend crashed, check Terminal 1 for errors

#### Error: "bad auth: Authentication failed"
- MongoDB connection failed
- Fix: Check MongoDB Atlas credentials in `backend/.env`

#### Error: "MONGODB_URI not set"
- Environment variable not configured
- Fix: Check `backend/.env` has MONGODB_URI

#### Error: "Cannot find module"
- Dependencies not installed
- Fix: Run `npm install` in backend folder

## Verify Backend Endpoints

Test the backend endpoints directly:

```bash
# Test admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@xtremecr8ivity.com","password":"admin123"}'

# Test staff login
curl -X POST http://localhost:5000/api/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"password123"}'

# Test MongoDB connection
curl http://localhost:5000/api/test
```

## Verify Frontend Configuration

Check that frontend is configured correctly:

1. **Proxy configured**: `frontend/package.json` should have:
   ```json
   "proxy": "http://localhost:5000"
   ```

2. **API endpoints correct**: `frontend/src/contexts/AuthContext.js` should have:
   ```javascript
   const endpoint = loginType === 'admin' ? '/api/admin/login' : '/api/staff/login';
   ```

## Complete Restart

If nothing works, try a complete restart:

```bash
# Kill all Node processes
# Windows:
taskkill /F /IM node.exe

# Mac/Linux:
pkill -f node

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install

# Rebuild frontend
npm run build

# Start backend
cd ../backend && npm start

# In new terminal, start frontend
cd frontend && npm start
```

## Still Not Working?

1. Check all error messages in backend terminal
2. Check all error messages in browser console (F12)
3. Check Network tab response for `/api/admin/login`
4. Verify admin user exists: `node backend/verify-admin-user.js`
5. Verify MongoDB connection: `http://localhost:5000/api/test`
6. Verify backend is running: `http://localhost:5000/api/staff/test`

## Files Modified

- `frontend/src/contexts/AuthContext.js` - Fixed API endpoints
- `backend/verify-admin-user.js` - New script to verify admin user

## Next Steps

1. Run `node backend/verify-admin-user.js` to ensure admin user exists
2. Rebuild frontend: `npm run build`
3. Start backend: `npm start`
4. Start frontend: `npm start`
5. Test login at `http://localhost:3000`
