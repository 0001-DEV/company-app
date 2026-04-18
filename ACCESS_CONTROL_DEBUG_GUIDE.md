# Access Control Debugging Guide

## Problem
Staff members who have been assigned to access Stock Management or Work Bank pages are still seeing "Access Denied" messages.

## Root Cause Analysis

The access control system works as follows:

### Stock Management Access
1. Admin assigns a staff member via the "Assign Manager" button
2. This creates a record in the `StockManager` collection with the staff's ID
3. When the staff logs in, the frontend checks `/api/stock-manager/check`
4. The backend queries the `StockManager` collection for a record matching the user's ID
5. If found, the staff sees the Stock Management link in their dashboard
6. If they click it, the `/api/stock/all` endpoint checks if they're an admin or stock manager

### Work Bank Access
1. Admin selects staff members and clicks "Save Access"
2. This creates/updates a record in the `WorkBankAccess` collection with an array of staff IDs
3. When the staff logs in, the frontend checks `/api/admin/workbank/access/check`
4. The backend queries the `WorkBankAccess` collection and checks if the user's ID is in the `staffIds` array
5. If found, the staff sees the Work Bank link in their dashboard

## Debugging Steps

### Step 1: Verify Backend Server is Running
```bash
# In the backend folder, run:
npm start

# You should see:
# ✅ MongoDB connected
# ✅ Server running on port 5000
```

**CRITICAL**: The backend server MUST be running for any of this to work. If you see connection errors, check your `.env` file for `MONGODB_URI`.

### Step 2: Check Database State

#### For Stock Management Access:
Open your browser and go to:
```
http://localhost:5000/api/stock-manager/debug/all
```

You should see a JSON response like:
```json
{
  "count": 1,
  "managers": [
    {
      "staffId": "507f1f77bcf86cd799439011",
      "staffName": "Aremu Nathaniel",
      "staffEmail": "aremu@example.com",
      "assignedAt": "2026-04-18T10:30:00.000Z"
    }
  ]
}
```

If `count` is 0, no staff members have been assigned as stock managers.

#### For Work Bank Access:
Open your browser and go to:
```
http://localhost:5000/api/admin/workbank/debug/all
```

You should see a JSON response like:
```json
{
  "count": 1,
  "records": [
    {
      "staffIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
      "updatedAt": "2026-04-18T10:30:00.000Z"
    }
  ]
}
```

If `count` is 0, no work bank access has been granted.

### Step 3: Check Console Logs

When a staff member tries to access the pages, check the backend console for debug logs:

#### For Stock Management:
```
🔍 Checking access for userId: 507f1f77bcf86cd799439011
👤 User found: Aremu Nathaniel Role: staff
📋 StockManager record: { staffId: ..., staffName: ... }
✅ User is stock manager
```

#### For Work Bank:
```
Work Bank Access Check:
User ID: 507f1f77bcf86cd799439011
Access record exists: true
Staff IDs in access: 507f1f77bcf86cd799439011,507f1f77bcf86cd799439012
Comparing 507f1f77bcf86cd799439011 === 507f1f77bcf86cd799439011: true
Final result - Has access: true
```

### Step 4: Verify Assignment Process

When assigning a staff member:

1. Check the console for:
```
📝 Assign stock manager request
Admin check - req.user.role: admin
📌 Assigning staffId: 507f1f77bcf86cd799439011
👤 Staff found: Aremu Nathaniel ID: 507f1f77bcf86cd799439011
🔍 Existing manager record: null
💾 Saving manager: { staffId: ..., staffName: ... }
✅ Manager saved successfully: 507f1f77bcf86cd799439012
```

2. Then immediately check the debug endpoint to verify it was saved

## Common Issues and Solutions

### Issue 1: Backend Server Not Running
**Symptom**: Proxy error or connection refused
**Solution**: 
```bash
cd backend
npm start
```

### Issue 2: Staff Member Not Found
**Symptom**: "Staff member not found" error when assigning
**Solution**: 
- Verify the staff member exists in the database
- Check that you're selecting the correct staff member from the dropdown
- Refresh the page and try again

### Issue 3: Assignment Saved But Access Still Denied
**Symptom**: Debug endpoint shows the assignment, but staff still sees "Access Denied"
**Solution**:
- The staff member needs to log out and log back in
- The frontend caches the access status on login
- Clear browser cache if needed

### Issue 4: ObjectId Mismatch
**Symptom**: Debug logs show different IDs being compared
**Solution**:
- This is usually a database issue
- Try removing the assignment and re-assigning
- Check that the staff member's ID in the User collection matches the staffId in StockManager

## Manual Testing

### Test Stock Manager Assignment:
1. Log in as admin
2. Go to Stock Management page
3. Click "Assign Manager" button
4. Select a staff member
5. Click "Assign"
6. Check the debug endpoint: `http://localhost:5000/api/stock-manager/debug/all`
7. Verify the staff member appears in the list
8. Log out and log in as that staff member
9. Check if "Stock Management" appears in their dashboard

### Test Work Bank Assignment:
1. Log in as admin
2. Go to Work Bank page
3. Click "Manage Staff" button
4. Select staff members
5. Click "Save Access"
6. Check the debug endpoint: `http://localhost:5000/api/admin/workbank/debug/all`
7. Verify the staff IDs appear in the list
8. Log out and log in as those staff members
9. Check if "Work Bank" appears in their dashboard

## If Still Not Working

1. **Restart the backend server**: `npm start` in the backend folder
2. **Check MongoDB connection**: Verify `MONGODB_URI` in `.env`
3. **Check browser console**: Look for any error messages
4. **Check backend console**: Look for any error logs
5. **Clear browser cache**: Sometimes old data is cached
6. **Try a different staff member**: Verify the process works with someone else
7. **Check database directly**: Use MongoDB Compass or similar tool to verify records exist

## Important Notes

- The backend server must be running for the frontend to communicate with it
- Changes to the backend code require restarting the server
- Staff members must log out and log back in for access changes to take effect
- The debug endpoints are only accessible to admins (for workbank) or anyone (for stock manager)
