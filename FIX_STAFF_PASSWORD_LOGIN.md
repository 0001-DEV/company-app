# Fix Staff Password Login Issue

## Problem

You changed a staff password in the Staff Credentials page, but when trying to login as that staff, it says "Incorrect password".

## Root Cause

The password might not be getting hashed correctly when saved, or there's a mismatch between what's stored and what you're entering.

## Diagnosis Steps

### Step 1: Check What's in the Database

Run this command to see what passwords are stored:

```bash
cd backend
node debug-staff-password.js
```

**Expected output:**
```
📋 Found 1 staff member(s):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: John Doe
Email: john@example.com
Role: staff
Password Hash: $2b$10$LQv3c1yqBWVHxkd0LHAkCO...
Plain Password: (not stored)

Password Tests:
  staff123: ❌ no match
  123456: ❌ no match
  password: ❌ no match
  admin123: ❌ no match
```

If all tests show "no match", the password hash is corrupted or not saved correctly.

### Step 2: Reset Staff Password

If the password is corrupted, reset it:

```bash
cd backend
node reset-staff-password.js
```

This will reset all staff passwords to `staff123`.

### Step 3: Try Login Again

1. Go to Staff Login
2. Enter email and password: `staff123`
3. Should work now

## Common Issues and Fixes

### Issue 1: Password Hash is Corrupted

**Sign:** All password tests show "no match"

**Fix:**
```bash
node reset-staff-password.js
```

Then login with: `staff123`

### Issue 2: Password Wasn't Saved

**Sign:** Plain password shows but hash doesn't match

**Fix:**
1. Go to Staff Credentials page
2. Edit the staff member
3. Enter new password
4. Click "Save Changes"
5. Run `node debug-staff-password.js` to verify
6. Try login again

### Issue 3: Wrong Password Entered

**Sign:** Password tests show one password matches

**Fix:**
Use the password that shows "✅ MATCH" in the debug output

## How to Update Staff Password Correctly

### Via Staff Credentials Page (Recommended)

1. Login as admin: `admin@xtremecr8ivity.com` / `admin123`
2. Go to **"🔒 Staff Credentials"**
3. Enter admin password: `admin123`
4. Find the staff member
5. Click "✏️ Edit"
6. Enter new password
7. Click "💾 Save Changes"
8. Verify with: `node debug-staff-password.js`

### Via Edit Staff Page

1. Go to **"🆔 Staff Directory"**
2. Find the staff member
3. Click "✏️ Edit"
4. Scroll down to password field
5. Enter new password
6. Click "Save"
7. Verify with: `node debug-staff-password.js`

### Via Script (Quick Reset)

```bash
cd backend
node reset-staff-password.js
```

This resets all staff passwords to `staff123`

## Verify Password Works

After updating password:

```bash
cd backend
node debug-staff-password.js
```

Look for:
```
Password Tests:
  staff123: ✅ MATCH
```

If you see "✅ MATCH", the password is correct and login should work.

## Test Login

1. Go to Staff Login page
2. Enter email and the password that showed "✅ MATCH"
3. Should redirect to staff dashboard

## If Still Not Working

1. **Check backend is running**: `http://localhost:5000/api/test`
2. **Check browser console**: Press F12 and look for errors
3. **Check Network tab**: Look at `/api/staff/login` response
4. **Run debug script**: `node debug-staff-password.js`
5. **Reset password**: `node reset-staff-password.js`
6. **Try login again**: Use `staff123`

## Files Created

- `backend/debug-staff-password.js` - Debug password issues
- `backend/reset-staff-password.js` - Reset all staff passwords
- `FIX_STAFF_PASSWORD_LOGIN.md` - This guide

## Quick Fix Steps

1. Run: `node backend/debug-staff-password.js`
2. Check if any password shows "✅ MATCH"
3. If not, run: `node backend/reset-staff-password.js`
4. Try login with: `staff123`
5. Should work now!
