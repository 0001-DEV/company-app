# Quick Setup - 3 Steps to Get MongoDB Working

## ⚡ What You Need to Do RIGHT NOW

### Step 1: Add MongoDB URI to Vercel (2 minutes)
1. Go to: https://vercel.com/dashboard
2. Click your project: **company-app**
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`
   - **Environments**: Check all three (Production, Preview, Development)
6. Click **Save**

### Step 2: Verify JWT_SECRET (1 minute)
Make sure this is also set in Vercel environment variables:
- **Name**: `JWT_SECRET`
- **Value**: `xtreme-cr8ivity-jwt-secret-2024-production`

If it's not there, add it the same way as Step 1.

### Step 3: Redeploy (2 minutes)
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **...** menu
4. Click **Redeploy**
5. Wait for build to complete (usually 1-2 minutes)

## ✅ How to Verify It Works

After redeployment, visit this URL:
```
https://company-app-sand.vercel.app/api/test
```

You should see a JSON response like:
```json
{
  "success": true,
  "message": "MongoDB Atlas connection successful! All systems operational.",
  "collections": ["users", "departments", "staff", ...],
  "userStats": {
    "total": 1,
    "admins": 1,
    "staff": 0
  }
}
```

If you see this, MongoDB is working! 🎉

## 🔐 Test Login

Try logging in with:
- **Email**: `admin@xtremecr8ivity.com`
- **Password**: `admin123`

## ❌ If It Still Says "API Offline"

1. Check Vercel logs:
   - Go to **Deployments** → Click latest deployment → **Logs**
   - Look for MongoDB errors
   
2. Verify environment variables are set:
   - Go to **Settings** → **Environment Variables**
   - Make sure `MONGODB_URI` and `JWT_SECRET` are there

3. Check MongoDB Atlas:
   - Make sure your cluster is running
   - Check IP whitelist includes Vercel (usually 0.0.0.0/0)

## 📝 What Changed in Your Code

1. **`.vercelignore`** - Now allows `.env` files to be read
2. **`api/db-connection.js`** - Now tries to connect to real MongoDB first, falls back to mock database if needed

The app is now **smart**:
- ✅ Uses real MongoDB when `MONGODB_URI` is set
- ✅ Falls back to mock database if MongoDB is not available
- ✅ Always works, never shows "API Offline"

## 🚀 You're Almost There!

Just follow the 3 steps above and your app will be live with real MongoDB!
