# Staff Credentials Page - Password Guide

## The Issue

When you click on **"🔒 Staff Credentials"** page, a modal pops up asking for a password. You tried using `123456` (the staff password) but it says "Incorrect password".

## The Solution

The modal is asking for your **ADMIN PASSWORD**, not the staff password.

**Correct Password**: `admin123`

## Why?

The Staff Credentials page is a sensitive page that shows all staff login credentials. To access it, you need to verify your identity as an admin by entering your admin password.

## How to Access Staff Credentials

1. Login as admin: `admin@xtremecr8ivity.com` / `admin123`
2. Go to **"🔒 Staff Credentials"** page
3. A modal pops up asking for password
4. Enter your **admin password**: `admin123`
5. Click "Unlock"
6. Now you can see all staff credentials

## Password Types

| Password | Used For | Value |
|----------|----------|-------|
| Admin Password | Login as admin, Staff Credentials gate | `admin123` |
| Staff Password | Login as staff, Edit staff credentials | `123456` (or whatever you set) |

## Common Mistakes

❌ Using staff password (`123456`) on Staff Credentials page
✅ Use admin password (`admin123`) on Staff Credentials page

❌ Using admin password to login as staff
✅ Use staff password to login as staff

## If You Forgot Admin Password

1. Run: `node backend/verify-admin-user.js`
2. This will reset admin password to `admin123`
3. Try again

## Security Note

The Staff Credentials page requires admin password verification because it displays sensitive information (all staff login credentials). This is a security feature to prevent unauthorized access.

## Next Steps

1. Go to Staff Credentials page
2. Enter admin password: `admin123`
3. View all staff credentials
4. Edit or manage staff as needed
