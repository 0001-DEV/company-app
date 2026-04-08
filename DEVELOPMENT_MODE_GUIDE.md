# Development Mode - Fresh Login Each Time

## What Changed

I've added a **Development Mode** that clears cached authentication every time you start the React app. This means:

✅ Every time you run `npm start`, you start with a fresh login page
✅ No more auto-redirecting to dashboard
✅ You can manually login each time
✅ Perfect for testing login flow

## How It Works

When you start the React app:
1. App loads
2. Development mode detects startup
3. Clears localStorage (token and user data)
4. Shows login page
5. You manually login

## Enable/Disable Development Mode

### Development Mode (Fresh Login Each Time) - ENABLED BY DEFAULT

File: `frontend/src/contexts/AuthContext.js`

```javascript
const DEVELOPMENT_MODE = true; // ← Fresh login each time
```

When enabled:
- ✅ Login page shows every time
- ✅ No cached authentication
- ✅ Perfect for testing

### Production Mode (Remember Login)

To enable auto-login (remember session):

```javascript
const DEVELOPMENT_MODE = false; // ← Remember login
```

When disabled:
- ✅ Stays logged in after refresh
- ✅ Cached authentication works
- ✅ Better for production

## How to Use

### For Testing (Development Mode - Current)

1. Start backend: `npm start` (in backend folder)
2. Start frontend: `npm start` (in frontend folder)
3. You'll see login page
4. Login with credentials
5. Explore the app
6. Stop frontend (Ctrl+C)
7. Start frontend again: `npm start`
8. Fresh login page appears again

### For Production (Production Mode)

1. Edit `frontend/src/contexts/AuthContext.js`
2. Change `const DEVELOPMENT_MODE = true;` to `false`
3. Rebuild: `npm run build`
4. Now sessions are remembered

## Test Credentials

### Admin
- Email: `admin@xtremecr8ivity.com`
- Password: `admin123`

### Test Staff
- Email: `john@example.com`
- Password: `staff123`

(Other staff: jane@example.com, michael@example.com, sarah@example.com)

## What Gets Cleared

When Development Mode is enabled, these are cleared on startup:
- `localStorage.token` - JWT authentication token
- `localStorage.user` - User profile data (name, email, role, etc.)

## Browser Console Output

When you start the app in Development Mode, you'll see:
```
🔄 Development mode: Cleared cached authentication
```

This confirms the mode is working.

## Switching Modes

### To Enable Auto-Login (Production Mode)

1. Open `frontend/src/contexts/AuthContext.js`
2. Find line: `const DEVELOPMENT_MODE = true;`
3. Change to: `const DEVELOPMENT_MODE = false;`
4. Save file
5. React will auto-reload
6. Now sessions are remembered

### To Disable Auto-Login (Development Mode)

1. Open `frontend/src/contexts/AuthContext.js`
2. Find line: `const DEVELOPMENT_MODE = false;`
3. Change to: `const DEVELOPMENT_MODE = true;`
4. Save file
5. React will auto-reload
6. Now fresh login each time

## Troubleshooting

### Still Auto-Logging In?

1. Make sure `DEVELOPMENT_MODE = true` in AuthContext.js
2. Check browser console for: `🔄 Development mode: Cleared cached authentication`
3. If not showing, file wasn't saved
4. Refresh browser (F5)

### Can't Login After Changing Mode?

1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (F5)
3. Try logging in again

### Stuck on Login Page?

1. Check backend is running: `http://localhost:5000/api/test`
2. Check browser console for errors (F12)
3. Try different credentials

## File Modified

- `frontend/src/contexts/AuthContext.js` - Added DEVELOPMENT_MODE flag

## Next Steps

1. Start backend: `npm start` (in backend folder)
2. Start frontend: `npm start` (in frontend folder)
3. You'll see fresh login page
4. Login with admin or staff credentials
5. Explore the app
6. Stop and restart frontend to test fresh login again

## Production Deployment

When deploying to production:
1. Change `DEVELOPMENT_MODE = false` in AuthContext.js
2. Rebuild: `npm run build`
3. Deploy the build folder
4. Users will stay logged in across sessions

## Summary

- **Development Mode (Current)**: Fresh login each time ✅
- **Production Mode**: Remember login across sessions
- Easy to switch between modes
- Perfect for testing and development
