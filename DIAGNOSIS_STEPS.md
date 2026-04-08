# Diagnosis Steps - Login Not Working

## Step 1: Check Backend Terminal Output

When you run `npm start` in the backend folder, look for:

```
✅ MongoDB connected
✅ Server running on port 5000
```

OR

```
❌ MongoDB connection error: [error message]
✅ Server running on port 5000
```

**What to do:**
- If you see the error message, copy it and share it
- If MongoDB fails to connect, the backend should still start and use mock database

## Step 2: Test Backend API Directly

Open browser and go to:
```
http://localhost:5000/api/test
```

**Expected response:**
```json
{
  "success": true,
  "message": "MongoDB connection successful",
  "collections": [...]
}
```

OR (if MongoDB fails):
```json
{
  "success": false,
  "error": "bad auth: Authentication failed",
  "message": "Database connection test failed"
}
```

**What to do:**
- Copy the response and share it
- If you see HTML instead of JSON, backend isn't running

## Step 3: Check Browser Console

Press F12 and click "Console" tab. Look for:

1. **Network errors** - Red messages about failed requests
2. **JSON parse errors** - "Unexpected token" messages
3. **Auth errors** - "Invalid credentials" or similar

**What to do:**
- Take a screenshot or copy the error messages
- Share them with me

## Step 4: Check Network Tab

Press F12 and click "Network" tab. Then:

1. Try to login with: `admin@xtremecr8ivity.com` / `admin123`
2. Look for a request to `/api/admin-login`
3. Click on it and check the "Response" tab

**Expected response:**
```json
{
  "message": "Admin login successful",
  "token": "eyJhbGc...",
  "admin": {
    "id": "admin1",
    "email": "admin@xtremecr8ivity.com",
    "role": "admin",
    "name": "Admin User"
  }
}
```

**What to do:**
- If you see HTML, backend isn't running
- If you see error message, copy it
- Share the response with me

## Step 5: Check Backend Logs

Look at the terminal where you ran `npm start`. After trying to login, you should see:

```
POST /api/admin-login
Admin login successful
```

OR

```
POST /api/admin-login
Admin login error: [error message]
```

**What to do:**
- Copy any error messages
- Share them with me

---

## Common Issues and Fixes

### Issue: "Cannot POST /api/admin-login"
- Backend not running
- Fix: Run `cd backend && npm start`

### Issue: "Unexpected token '<'"
- Backend returning HTML instead of JSON
- Fix: Backend crashed or not running

### Issue: "Invalid admin credentials"
- User not found in database
- Fix: Check if admin user exists in MongoDB

### Issue: "bad auth: Authentication failed"
- MongoDB connection failed
- Fix: Check MongoDB Atlas credentials

### Issue: "Cannot find module"
- Dependencies not installed
- Fix: Run `npm install` in backend folder

---

## What I Need From You

Please run through these steps and tell me:

1. What does the backend terminal show when you start it?
2. What does `http://localhost:5000/api/test` return?
3. What error appears on the login page?
4. What does the browser console show (F12)?
5. What does the Network tab show for `/api/admin-login` request?

This will help me identify exactly what's wrong.
