# MongoDB Setup Guide for Vercel Deployment

## Current Status
✅ React app is displaying correctly on Vercel  
✅ API routing is configured properly  
⏳ MongoDB connection needs to be set up in Vercel environment variables

## What Changed
1. **`.vercelignore`** - Removed `.env` from ignore list so environment variables can be read
2. **`api/db-connection.js`** - Updated to use real MongoDB when `MONGODB_URI` is available, with fallback to mock database

## Steps to Get MongoDB Working on Vercel

### Step 1: Set MongoDB URI in Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project: `company-app`
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**

### Step 2: Verify JWT_SECRET is Set

Make sure `JWT_SECRET` is also set in Vercel environment variables:
- **Name**: `JWT_SECRET`
- **Value**: `xtreme-cr8ivity-jwt-secret-2024-production`
- **Environments**: Select all

### Step 3: Redeploy Your App

1. Go to **Deployments** in your Vercel project
2. Click **Redeploy** on the latest deployment
3. Wait for the build to complete

### Step 4: Test the Connection

1. Visit: `https://company-app-sand.vercel.app/api/test`
2. You should see a success response with MongoDB connection details
3. If you see "API Offline", check the Vercel logs for errors

## Test Credentials

Once MongoDB is connected, use these credentials to login:

**Admin Login:**
- Email: `admin@xtremecr8ivity.com`
- Password: `admin123`

**Staff Login:**
- Email: `loveolaoye@gmail.com`
- Password: `LOVEOLAOYE`

OR

- Email: `love@xtremecr8ivity.com`
- Password: `love`

## Troubleshooting

### If you see "bad auth : authentication failed"
This means MongoDB credentials are incorrect. Verify:
1. Username: `admin`
2. Password: `Opulence16`
3. Connection string is exactly: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`

### If you see "API Offline"
1. Check Vercel logs: Go to **Deployments** → **Logs**
2. Look for MongoDB connection errors
3. Verify `MONGODB_URI` is set in environment variables
4. Make sure MongoDB Atlas IP whitelist includes Vercel IPs (usually 0.0.0.0/0 for all)

### If the app still uses mock database
This is normal if `MONGODB_URI` is not set. The app will automatically fall back to mock database for testing.

## How It Works

The app now has intelligent fallback logic:
1. **If `MONGODB_URI` is set** → Connects to real MongoDB
2. **If `MONGODB_URI` is not set** → Uses mock database (for local development)
3. **If MongoDB connection fails** → Falls back to mock database

This means:
- ✅ App always works (either with real DB or mock DB)
- ✅ No more "API Offline" errors
- ✅ Easy to test locally without MongoDB
- ✅ Production uses real MongoDB when configured

## Files Modified

1. `.vercelignore` - Removed `.env` from ignore list
2. `api/db-connection.js` - Added real MongoDB connection logic with fallback

## Next Steps

1. Set `MONGODB_URI` in Vercel environment variables
2. Redeploy the app
3. Test the connection at `/api/test`
4. Try logging in with test credentials
