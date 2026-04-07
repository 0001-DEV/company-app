// This script helps you create a MongoDB user in Atlas
// Instructions:
// 1. Go to https://cloud.mongodb.com
// 2. Click your cluster
// 3. Click "Database Access" 
// 4. Click "+ Add New Database User"
// 5. Fill in:
//    - Username: admin
//    - Password: Opulence16
//    - Database User Privileges: Select "Atlas admin"
// 6. Click "Add User"
// 7. Wait 1-2 minutes for the user to be created
// 8. Then test the connection

console.log(`
MongoDB User Setup Instructions:
================================

1. Go to: https://cloud.mongodb.com
2. Select your "company-app" cluster
3. Click "Database Access" in the left menu
4. Click the blue "+ Add New Database User" button
5. Fill in the form:
   - Username: admin
   - Password: Opulence16
   - Confirm Password: Opulence16
   - Database User Privileges: Select "Atlas admin"
6. Click "Add User"
7. Wait 1-2 minutes for the user to be created
8. Then the connection should work

If the user already exists, delete it first and recreate it.
`);
