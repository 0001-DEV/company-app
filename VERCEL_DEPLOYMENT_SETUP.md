# Vercel Deployment Setup Guide

## Overview

This guide will help you deploy the Company App to Vercel with the React frontend and serverless backend API.

**Current Architecture:**
- **Frontend**: React app deployed on Vercel
- **Backend**: Serverless functions (Node.js) deployed on Vercel
- **Database**: MongoDB Atlas

---

## Step 1: Verify GitHub Push

The latest code has been pushed to GitHub with the following changes:
- ✅ Enabled Vercel serverless functions for backend API
- ✅ Created API utility for environment-specific URLs
- ✅ Updated `.vercelignore` to include `/api` folder

**Latest commit**: `1c4bddd`

---

## Step 2: Set Up Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `company-app` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables for **Production** environment:

```
MONGODB_URI=mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority
JWT_SECRET=xtreme-cr8ivity-jwt-secret-2024-production
NODE_ENV=production
```

5. Also add these for **Preview** environment (for testing):

```
MONGODB_URI=mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority
JWT_SECRET=xtreme-cr8ivity-jwt-secret-2024-production
NODE_ENV=development
```

---

## Step 3: Trigger New Deployment

1. Go to Vercel Dashboard
2. Select your `company-app` project
3. Click **Deployments**
4. Click **Redeploy** on the latest commit
5. Wait for the build to complete (usually 2-3 minutes)

---

## Step 4: Verify Deployment

### Check Frontend
1. Visit https://company-app-sand.vercel.app
2. You should see the **Login Selector** page with animated cards
3. If you see a blank page or error, check the browser console for errors

### Check Backend API
1. Visit https://company-app-sand.vercel.app/api/test
2. You should see a JSON response with MongoDB connection status
3. If you see an error, check the Vercel function logs

### Test Login
1. Go to https://company-app-sand.vercel.app
2. Click **Admin Login**
3. Enter credentials:
   - Email: `admin@xtremecr8ivity.com`
   - Password: `admin123`
4. You should be redirected to the Admin Dashboard

---

## Troubleshooting

### React App Not Displaying
- **Issue**: Blank page or template page
- **Solution**: 
  1. Check browser console for JavaScript errors
  2. Verify the build completed successfully in Vercel logs
  3. Clear browser cache and reload

### API Calls Failing (401/404 errors)
- **Issue**: Login fails or API endpoints return errors
- **Solution**:
  1. Verify `MONGODB_URI` is set correctly in Vercel environment variables
  2. Check MongoDB Atlas Network Access includes `0.0.0.0/0`
  3. Check Vercel function logs for database connection errors

### MongoDB Connection Error
- **Issue**: "MONGODB_URI not set" or connection timeout
- **Solution**:
  1. Go to Vercel Settings → Environment Variables
  2. Verify `MONGODB_URI` is set for both Production and Preview
  3. Verify MongoDB user credentials are correct
  4. Check MongoDB Atlas Network Access whitelist

### Build Fails
- **Issue**: Deployment fails during build
- **Solution**:
  1. Check Vercel build logs for specific error
  2. Verify `frontend/package.json` has all dependencies
  3. Verify no syntax errors in code
  4. Try redeploying from a fresh commit

---

## Environment Variables Reference

### Frontend (React)
- `REACT_APP_API_URL` - Backend API URL (optional, uses relative paths by default)

### Backend (Serverless Functions)
- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` - JWT signing secret (required)
- `NODE_ENV` - Environment (production/development)

---

## Testing Credentials

### Admin Account
- Email: `admin@xtremecr8ivity.com`
- Password: `admin123`

### Staff Accounts
- Email: `loveolaoye@gmail.com`
- Password: `LOVEOLAOYE`

OR

- Email: `love@xtremecr8ivity.com`
- Password: `love`

---

## Next Steps

1. ✅ Verify deployment is successful
2. ✅ Test login functionality
3. ✅ Test API endpoints
4. ✅ Monitor Vercel logs for errors
5. ✅ Set up custom domain (optional)

---

## Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Project Repository](https://github.com/0001-DEV/company-app)

---

## Support

If you encounter any issues:
1. Check the Vercel build logs
2. Check the Vercel function logs
3. Check the browser console for errors
4. Verify all environment variables are set correctly
5. Verify MongoDB connection string is correct
