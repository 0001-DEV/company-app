# Quick Staff Login Fix

## The Problem
Staff login shows "Access denied" error

## Quick Diagnosis

### Step 1: Check if Staff Exists
```bash
cd backend
node check-staff.js
```

Look for:
- ✅ Staff found with correct password
- ❌ No staff members found
- ❌ Password incorrect

### Step 2: Check Backend Logs
When you try to login, check the backend terminal for error messages.

### Step 3: Check Network Response
1. Press F12 (DevTools)
2. Click "Network" tab
3. Try to login
4. Look for `/api/staff/login` request
5. Check "Response" tab for error

## Common Fixes

### If Staff Not Found
```bash
# Add test staff
cd backend
node add-test-staff.js

# Then login with:
# Email: john@example.com
# Password: staff123
```

### If Password Incorrect
1. Go to Staff Directory (as admin)
2. Find the staff member
3. Click "✏️" (edit)
4. Update password
5. Try login again

### If Role is Wrong
```bash
# Check role
node backend/check-staff.js

# If role is "admin" instead of "staff", delete and recreate
```

## Test Credentials

After running `node add-test-staff.js`:

```
Email: john@example.com
Password: staff123
```

## Verify It Works

1. Run: `node backend/check-staff.js`
2. Should show: `Password 'staff123': ✅ Correct`
3. Try login with those credentials
4. Should redirect to staff dashboard

## Still Not Working?

1. Restart backend: `npm start`
2. Clear browser cache: Ctrl+Shift+Delete
3. Refresh page: F5
4. Try again

## Files to Check

- `backend/check-staff.js` - Verify staff exists
- `backend/add-test-staff.js` - Create test staff
- `backend/routes/staff.js` - Staff login endpoint
