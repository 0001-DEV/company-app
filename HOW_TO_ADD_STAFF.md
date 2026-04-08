# How to Add Staff Members

## Where to Find Staff Management

1. Login as admin: `admin@xtremecr8ivity.com` / `admin123`
2. Go to admin dashboard
3. Click on **"🆔 Staff Directory"** in the sidebar

## Three Ways to Add Staff

### Method 1: Add Staff Manually (One at a Time)

1. Click **"➕ Add Staff"** button
2. Fill in the form:
   - **Name**: Staff member's full name
   - **Email**: Unique email address
   - **Phone**: Phone number (optional)
   - **Password**: Initial password for login
   - **Department**: Select from dropdown
   - **Birthday**: Date of birth (optional)
   - **Profile Picture**: Upload a photo (optional)
3. Click **"Save"**

### Method 2: Bulk Upload (Multiple Staff at Once)

1. Click **"📋 Download Template"** button
2. This downloads an Excel file with the correct format
3. Fill in the template with staff details:
   - Name
   - Email
   - Phone
   - Password
   - Department
   - Birthday
4. Save the Excel file
5. Click **"📥 Bulk Upload (CSV/Excel)"** button
6. Select your filled Excel file
7. Click upload

**Template Format:**
```
Name          | Email              | Phone           | Password | Department      | Birthday
John Doe      | john@example.com   | +234 123 456    | 123456   | ICT Department  | 1990-01-15
Jane Smith    | jane@example.com   | +234 987 654    | 123456   | Design Dept     | 1992-05-20
```

### Method 3: Create Department First (If Needed)

1. Click **"🏢 Add Department"** button
2. Enter department name
3. Click **"Create"**
4. Now you can assign staff to this department

## After Adding Staff

### Staff Can Login With:
- **Email**: The email you provided
- **Password**: The password you set

### Staff Can Access:
- Staff Dashboard
- Chat
- Work Bank
- Job assignments
- File uploads

## Verify Staff Was Added

1. Go to **"🆔 Staff Directory"**
2. You should see the staff member in the list
3. Click on their card to view/edit details

## Edit Staff Details

1. Find the staff member in the directory
2. Click the **"✏️"** (edit) button
3. Update the information
4. Click **"Save"**

## Delete Staff

1. Find the staff member in the directory
2. Click the **"🗑️"** (delete) button
3. Confirm deletion

## Search Staff

1. Use the search box at the top
2. Search by name or email
3. Results update in real-time

## Export Staff List

1. Click **"📋 Export"** button (if available)
2. Downloads staff list as Excel file

## Troubleshooting

### Error: "Email already exists"
- The email is already used by another staff member
- Use a different email address

### Error: "Department not found"
- Create the department first using **"🏢 Add Department"**
- Then assign staff to it

### Error: "Failed to add staff"
- Check all required fields are filled
- Check backend is running
- Check browser console for error details

### Staff Not Appearing in List
- Refresh the page (F5)
- Check backend is running
- Check MongoDB connection: `http://localhost:5000/api/test`

## Next Steps

1. Go to Staff Directory
2. Click "➕ Add Staff" or "📥 Bulk Upload"
3. Add your staff members
4. Share login credentials with them
5. They can login at `http://localhost:3000` and select "Staff Login"

## Staff Login Credentials

Once you add staff, they can login with:
- **URL**: `http://localhost:3000`
- **Select**: "Staff Login"
- **Email**: The email you provided
- **Password**: The password you set

## Default Test Staff (Optional)

If you want to quickly test, you can create:
- **Name**: Test Staff
- **Email**: staff@example.com
- **Password**: staff123
- **Department**: Any department

Then login with these credentials to test the staff portal.
