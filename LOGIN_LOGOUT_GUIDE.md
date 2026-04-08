# Login & Logout Guide

## How to Login

### Admin Login

1. Go to `http://localhost:3000`
2. Click **"Admin Login"** button
3. Enter credentials:
   - **Email**: `admin@xtremecr8ivity.com`
   - **Password**: `admin123`
4. Click **"Sign In as Admin"**
5. You'll be redirected to the admin dashboard

### Staff Login

1. Go to `http://localhost:3000`
2. Click **"Staff Login"** button
3. Enter staff credentials:
   - **Email**: `john@example.com` (or any staff email)
   - **Password**: `staff123` (or the staff password)
4. Click **"Sign In as Staff"**
5. You'll be redirected to the staff dashboard

## How to Logout

### From Admin Dashboard

1. Look for the **logout button** in the top-right corner
2. Click the **"⏻"** (power) icon
3. Confirm logout if prompted
4. You'll be redirected to the login page

### From Staff Dashboard

1. Look for the **logout button** in the sidebar footer
2. Click the **"⏻"** (power) icon
3. Confirm logout if prompted
4. You'll be redirected to the login page

### From Login Page (If Already Logged In)

1. Go to `http://localhost:3000`
2. If you see a **"Logout"** button instead of login options
3. Click **"Logout"**
4. Confirm logout
5. Login page will appear

## Login Flow

```
http://localhost:3000
    ↓
LoginSelector (Choose Admin or Staff)
    ↓
AdminLogin or StaffLogin (Enter credentials)
    ↓
Backend validates credentials
    ↓
Token generated and stored in localStorage
    ↓
Redirected to Dashboard (Admin or Staff)
```

## Logout Flow

```
Click Logout Button
    ↓
Confirm logout (if prompted)
    ↓
Clear localStorage (token and user data)
    ↓
Redirect to LoginSelector
    ↓
Can login again with any credentials
```

## Session Management

### How Sessions Work

1. **Login**: Credentials sent to backend → Token generated → Stored in localStorage
2. **Authenticated Requests**: Token sent in Authorization header
3. **Logout**: Token and user data removed from localStorage
4. **Auto-Redirect**: If no token, redirected to login page

### Token Storage

- **Location**: Browser localStorage
- **Key**: `token`
- **Expiration**: 7 days (set in backend)
- **Cleared on**: Logout or manual localStorage clear

### User Data Storage

- **Location**: Browser localStorage
- **Key**: `user`
- **Contains**: Name, email, role, department, etc.
- **Cleared on**: Logout or manual localStorage clear

## Troubleshooting

### Can't Login

1. **Check credentials**: Email and password are correct
2. **Check backend**: Verify backend is running on port 5000
3. **Check MongoDB**: Verify user exists in database
4. **Check browser console**: Look for error messages (F12)

### Can't Logout

1. **Click logout button**: Should be in top-right (admin) or sidebar (staff)
2. **Confirm logout**: Click "Yes" if prompted
3. **Check browser console**: Look for errors (F12)
4. **Manual logout**: Clear localStorage:
   ```javascript
   // Open browser console (F12) and run:
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   location.reload();
   ```

### Stuck on Dashboard After Logout

1. **Refresh page**: Press F5
2. **Clear cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
3. **Manual logout**: Use console command above

### Login Page Blinks and Goes to Dashboard

1. **Already logged in**: You have a valid token in localStorage
2. **Click logout**: Use the logout button to clear session
3. **Or manually clear**: Use console command above

## Quick Reference

| Action | Location | Button |
|--------|----------|--------|
| Admin Logout | Top-right corner | ⏻ |
| Staff Logout | Sidebar footer | ⏻ |
| Logout from Login Page | Center of screen | 🚪 Logout |

## Test Credentials

### Admin
- Email: `admin@xtremecr8ivity.com`
- Password: `admin123`

### Test Staff
- Email: `john@example.com`
- Password: `staff123`

(Other staff: jane@example.com, michael@example.com, sarah@example.com)

## Session Timeout

- **Token Expiration**: 7 days
- **Auto-Logout**: After 7 days, you'll need to login again
- **Manual Logout**: Anytime using logout button

## Security Notes

- Tokens are stored in localStorage (accessible to JavaScript)
- For production, consider using httpOnly cookies
- Always logout on shared computers
- Clear browser cache if having login issues

## Next Steps

1. Login as admin: `admin@xtremecr8ivity.com` / `admin123`
2. Explore admin dashboard
3. Logout using the logout button
4. Login as staff: `john@example.com` / `staff123`
5. Explore staff dashboard
6. Logout and login again to verify it works
