# Localhost Login Testing Guide

## The Issue: Cached Authentication

When you load `http://localhost:3000`, the application checks `localStorage` for a stored authentication token and user data. If found, it automatically redirects you to the dashboard without showing the login page.

**This is expected behavior** for a logged-in user, but it prevents you from testing the login flow fresh.

## The Solution: Logout Button

The LoginSelector page now includes a **Logout button** that appears when you're already logged in. This allows you to:

1. Clear the cached authentication from localStorage
2. Reset the session
3. Return to the login page to test the login flow

## How to Use

### Testing Fresh Login Flow

1. Navigate to `http://localhost:3000`
2. If you see a "Logout" button instead of login options, click it
3. Confirm the logout when prompted
4. You'll now see the login page with Admin and Staff login options
5. Test the login with credentials:
   - **Email**: `admin@xtremecr8ivity.com`
   - **Password**: `admin123`

### What Happens

- **First Visit**: Shows login page (no cached auth)
- **After Login**: Redirects to dashboard automatically
- **Subsequent Visits**: Shows dashboard (cached auth)
- **Click Logout**: Clears cache and shows login page again

## Backend Requirements

For localhost testing, ensure:

1. **Backend Server Running**: `npm start` in the `backend/` directory
   - Should run on `http://localhost:5000`
   - Check with: `http://localhost:5000/api/test`

2. **MongoDB Connection**: 
   - Local MongoDB running, OR
   - MongoDB Atlas connection string in `.env.local`
   - Connection string: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`

3. **Frontend Proxy**: Already configured in `frontend/package.json`
   - Proxy: `http://localhost:5000`
   - Automatically routes `/api/*` requests to backend

## Troubleshooting

### "Proxy error: Could not proxy request"
- **Cause**: Backend server not running on port 5000
- **Solution**: Start backend with `npm start` in `backend/` directory

### "API Offline" message
- **Cause**: MongoDB connection failed
- **Solution**: 
  - Verify MongoDB is running locally, OR
  - Check MongoDB Atlas connection string in `.env.local`
  - Verify credentials: `admin` / `Opulence16`

### Login page blinks and redirects to dashboard
- **Cause**: Cached authentication from previous session
- **Solution**: Click the Logout button to clear cache

## Files Modified

- `frontend/src/pages/LoginSelector.js` - Added logout functionality and UI

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connection working
- [ ] Navigate to `http://localhost:3000`
- [ ] See login page or logout button
- [ ] Test logout (if already logged in)
- [ ] Test admin login with `admin@xtremecr8ivity.com` / `admin123`
- [ ] Verify admin dashboard loads
- [ ] Test logout from dashboard
- [ ] Verify login page appears again
