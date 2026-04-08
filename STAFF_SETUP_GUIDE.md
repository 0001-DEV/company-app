# Staff Setup Guide

## Problem: No Staff Members Found

When you login as admin and go to "🆔 Staff Directory", you see an empty list because there are no staff members in the database yet.

## Solution: Add Staff Members

You have two options:

### Option 1: Quick Setup with Test Staff (Recommended for Testing)

Run this command to automatically add 4 test staff members:

```bash
cd backend
node add-test-staff.js
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Created department: ICT Department
✅ Created department: Design Department
✅ Created department: Marketing Department
✅ Created department: HR Department
✅ Created staff: John Doe (john@example.com)
✅ Created staff: Jane Smith (jane@example.com)
✅ Created staff: Michael Johnson (michael@example.com)
✅ Created staff: Sarah Williams (sarah@example.com)

📋 All staff members:
   - John Doe (john@example.com) - Department: ICT Department
   - Jane Smith (jane@example.com) - Department: Design Department
   - Michael Johnson (michael@example.com) - Department: Marketing Department
   - Sarah Williams (sarah@example.com) - Department: HR Department

✅ Total staff: 4

🔐 Test Staff Login Credentials:
   Email: john@example.com, Password: staff123
   Email: jane@example.com, Password: staff123
   Email: michael@example.com, Password: staff123
   Email: sarah@example.com, Password: staff123
```

### Option 2: Add Staff Manually Through UI

1. Login as admin: `admin@xtremecr8ivity.com` / `admin123`
2. Go to **"🆔 Staff Directory"**
3. Click **"➕ Add Staff"** button
4. Fill in the form and click **"Save"**

## After Adding Staff

### Verify Staff Was Added

1. Go to **"🆔 Staff Directory"**
2. You should see staff members in the list
3. Each staff member shows:
   - Name
   - Email
   - Phone
   - Department
   - Number of assigned jobs

### Test Staff Login

1. Go to `http://localhost:3000`
2. Click **"Staff Login"**
3. Enter staff credentials:
   - Email: `john@example.com`
   - Password: `staff123`
4. Should redirect to staff dashboard

### What Staff Can Do

Once logged in, staff can:
- View assigned jobs
- Upload files
- Chat with other staff
- View work bank
- Update profile
- View announcements

## Bulk Upload Staff

If you have many staff members:

1. Click **"📋 Download Template"** in Staff Directory
2. Fill in the Excel file with staff details
3. Click **"📥 Bulk Upload (CSV/Excel)"**
4. Select your file and upload

**Template columns:**
- Name
- Email
- Phone
- Password
- Department
- Birthday

## Departments

Before adding staff, you might want to create departments:

1. Click **"🏢 Add Department"** in Staff Directory
2. Enter department name
3. Click **"Create"**

**Default departments created by test script:**
- ICT Department
- Design Department
- Marketing Department
- HR Department

## Troubleshooting

### Error: "Cannot find module"
```bash
cd backend
npm install
```

### Error: "MONGODB_URI not set"
- Check `backend/.env` has MONGODB_URI
- Verify MongoDB connection: `http://localhost:5000/api/test`

### Error: "Email already exists"
- The email is already used
- Use a different email address

### Staff Not Appearing After Adding
- Refresh the page (F5)
- Check backend is running
- Check MongoDB connection

### Can't Login as Staff
- Verify staff email and password are correct
- Check staff role is "staff" (not "admin")
- Check backend is running

## Quick Checklist

- [ ] Backend running: `npm start` in backend folder
- [ ] Frontend running: `npm start` in frontend folder
- [ ] Admin logged in: `admin@xtremecr8ivity.com` / `admin123`
- [ ] Add test staff: `node backend/add-test-staff.js`
- [ ] Go to Staff Directory: See staff list
- [ ] Test staff login: `john@example.com` / `staff123`
- [ ] Verify staff dashboard loads

## Next Steps

1. **Add test staff**: `node backend/add-test-staff.js`
2. **Verify in UI**: Go to Staff Directory
3. **Test staff login**: Login with `john@example.com` / `staff123`
4. **Explore staff features**: Chat, jobs, work bank, etc.

## Files Created

- `backend/add-test-staff.js` - Script to add test staff
- `HOW_TO_ADD_STAFF.md` - Detailed staff management guide
- `STAFF_SETUP_GUIDE.md` - This file

## Need Help?

1. Check backend terminal for errors
2. Check browser console (F12) for errors
3. Verify MongoDB connection: `http://localhost:5000/api/test`
4. Run test staff script: `node backend/add-test-staff.js`
