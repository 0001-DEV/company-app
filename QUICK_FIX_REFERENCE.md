# Quick Fix Reference

## The Problem
Frontend was calling wrong API endpoints:
- ❌ `/api/admin-login` → ✅ `/api/admin/login`
- ❌ `/api/staff-login` → ✅ `/api/staff/login`

## The Fix Applied
Updated `frontend/src/contexts/AuthContext.js` to use correct endpoints.

## Before Testing

### 1. Verify Admin User Exists
```bash
cd backend
node verify-admin-user.js
```

### 2. Rebuild Frontend
```bash
cd frontend
npm run build
```

## Testing

### Terminal 1: Backend
```bash
cd backend
npm start
```
Wait for: `✅ Server running on port 5000`

### Terminal 2: Frontend
```bash
cd frontend
npm start
```
Opens: `http://localhost:3000`

## Login Test
- Email: `admin@xtremecr8ivity.com`
- Password: `admin123`

## If It Fails

1. Check backend terminal for errors
2. Check browser console (F12)
3. Check Network tab for `/api/admin/login` response
4. Run: `node backend/verify-admin-user.js`
5. Check: `http://localhost:5000/api/test`

## Files Changed
- `frontend/src/contexts/AuthContext.js` - API endpoints fixed
- `backend/server.js` - MongoDB URI handling improved
- `backend/.env` - Connection string updated
- `frontend/src/pages/LoginSelector.js` - Logout added
- `backend/verify-admin-user.js` - New verification script

## Expected Result
✅ Login succeeds → Redirects to admin dashboard
