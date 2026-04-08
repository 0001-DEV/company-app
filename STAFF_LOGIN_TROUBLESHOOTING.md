# Staff Login Troubleshooting

## Problem: "Access Denied" Error on Staff Login

When trying to login as staff, you get an "Access denied" error message.

## Diagnosis Steps

### Step 1: Check Staff Exists in Database

Run this command to verify the staff member was created:

```bash
cd backend
node check-staff.js
```

**Expected output:**
```
✅ Found 1 staff member(s):

📋 Staff: John Doe
   Email: john@example.com
   Role: staff
   Department: None
   Password 'staff123': ✅ Correct
```

**If you see:**
- ❌ No staff members found → Staff wasn't created
- ❌ Password 'staff123': ❌ Incorrect → Password hash is wrong

### Step 2: Check Backend Terminal

When you try to login, check the backend terminal for logs:

```
Auth header: Bearer eyJhbGc...
Token: eyJhbGc1NiIsInR5cCI...
Decoded token: { id: '...', role: 'staff' }
Staff found: John Doe Role: staff
```

**If you see:**
- `No token provided` → Token not sent
- `Access denied - not a staff member` → Staff role is wrong
- `Staff found: undefined` → Staff ID doesn't exist

### Step 3: Check Browser Console

Press F12 and click "Console" tab. Look for:
- Network errors
- JSON parse errors
- Login response errors

### Step 4: Check Network Tab

Press F12 and click "Network" tab. Then:
1. Try to login
2. Look for `/api/staff/login` request
3. Click on it
4. Check "Response" tab

**Expected response:**
```json
{
  "message": "Staff login successful",
  "token": "eyJhbGc...",
  "staff": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**If you see error:**
```json
{
  "message": "Staff not found"
}
```
→ Staff doesn't exist in database

```json
{
  "message": "Incorrect password"
}
```
→ Password is wrong

```json
{
  "message": "Not a staff account"
}
```
→ User exists but role is not "staff"

## Common Issues and Fixes

### Issue 1: Staff Not Found

**Error:** `"Staff not found"`

**Causes:**
- Staff wasn't created
- Wrong email used
- Staff was deleted

**Fix:**
1. Go to Staff Directory
2. Click "➕ Add Staff"
3. Create staff with email and password
4. Try login again

### Issue 2: Incorrect Password

**Error:** `"Incorrect password"`

**Causes:**
- Wrong password entered
- Password wasn't hashed correctly when created
- Password changed

**Fix:**
1. Go to Staff Directory
2. Find the staff member
3. Click "✏️" (edit)
4. Update password
5. Try login again

### Issue 3: Not a Staff Account

**Error:** `"Not a staff account"`

**Causes:**
- User was created as admin instead of staff
- User role was changed

**Fix:**
1. Check database: `node backend/check-staff.js`
2. If role is "admin", delete and recreate as staff
3. Or edit the user in database to change role to "staff"

### Issue 4: Access Denied (After Login)

**Error:** `"Access denied"` (after successful login)

**Causes:**
- Trying to access staff-only route
- Token is invalid
- Staff role changed after login

**Fix:**
1. Logout and login again
2. Check backend terminal for errors
3. Verify staff role is "staff"

## How to Create Staff Correctly

### Via UI (Recommended)

1. Login as admin: `admin@xtremecr8ivity.com` / `admin123`
2. Go to **"🆔 Staff Directory"**
3. Click **"➕ Add Staff"**
4. Fill in:
   - **Name**: Staff name
   - **Email**: Unique email
   - **Password**: Password (will be hashed)
   - **Department**: Select department
5. Click **"Save"**

### Via Script

```bash
cd backend
node add-test-staff.js
```

This creates 4 test staff with password `staff123`

## Test Staff Credentials

If you ran the test script:

```
Email: john@example.com, Password: staff123
Email: jane@example.com, Password: staff123
Email: michael@example.com, Password: staff123
Email: sarah@example.com, Password: staff123
```

## Verify Staff Login Works

1. **Check staff exists**: `node backend/check-staff.js`
2. **Check password**: Should show `✅ Correct`
3. **Try login**: Use email and password from check-staff output
4. **Check backend logs**: Should show successful token generation

## If Still Not Working

1. **Restart backend**: `npm start` in backend folder
2. **Clear browser cache**: Ctrl+Shift+Delete
3. **Refresh page**: F5
4. **Try again**: Login with staff credentials

## Debug Commands

```bash
# Check all staff
node backend/check-staff.js

# Check admin
node backend/verify-admin-user.js

# Add test staff
node backend/add-test-staff.js
```

## File Created

- `backend/check-staff.js` - Script to verify staff in database

## Next Steps

1. Run: `node backend/check-staff.js`
2. Check if staff exists and password is correct
3. If not, recreate staff via UI or script
4. Try login again
5. Check backend terminal for error messages
