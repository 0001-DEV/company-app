# Vercel Environment Variables Setup

## Quick Setup (2 minutes)

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Click on your `company-app` project
3. Go to **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add Environment Variables

Add these variables for **Production** environment:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority` |
| `JWT_SECRET` | `xtreme-cr8ivity-jwt-secret-2024-production` |
| `NODE_ENV` | `production` |

### Step 3: Add for Preview Environment

Repeat the same variables for **Preview** environment (for testing pull requests).

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait for build to complete

---

## Verification

### Test API Connection
Visit: https://company-app-sand.vercel.app/api/test

You should see:
```json
{
  "success": true,
  "message": "MongoDB connection test successful",
  "responseTime": "XXXms",
  "collections": [...]
}
```

### Test Login
1. Go to https://company-app-sand.vercel.app
2. Click **Admin Login**
3. Enter:
   - Email: `admin@xtremecr8ivity.com`
   - Password: `admin123`
4. You should see the Admin Dashboard

---

## Troubleshooting

### "MongoDB connection error: bad auth"
- **Cause**: Environment variables not set in Vercel
- **Solution**: 
  1. Go to Vercel Settings → Environment Variables
  2. Verify `MONGODB_URI` is set correctly
  3. Redeploy

### "Cannot find module 'mongodb'"
- **Cause**: Dependencies not installed
- **Solution**: 
  1. Check Vercel build logs
  2. Verify `package.json` has mongodb dependency
  3. Try redeploying

### "Blank page or template"
- **Cause**: React app not building
- **Solution**:
  1. Check Vercel build logs for errors
  2. Verify `frontend/package.json` is correct
  3. Try redeploying from a fresh commit

---

## Environment Variables Explained

### MONGODB_URI
- **What**: MongoDB connection string
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database`
- **Current**: Points to MongoDB Atlas cluster `company-app`
- **User**: `admin` with password `Opulence16`

### JWT_SECRET
- **What**: Secret key for signing JWT tokens
- **Used for**: Authentication tokens
- **Current**: `xtreme-cr8ivity-jwt-secret-2024-production`
- **Security**: Keep this secret!

### NODE_ENV
- **What**: Environment mode
- **Values**: `production` or `development`
- **Current**: `production` for Vercel

---

## Fallback Behavior

If environment variables are not set:
- ✅ React app will still display
- ✅ Mock database will be used for testing
- ✅ Login will work with mock data
- ❌ Real MongoDB data won't be accessible

To use real MongoDB, environment variables MUST be set.

---

## Security Notes

⚠️ **Important**: The `.env.production` file contains sensitive credentials. In a real production environment:
1. Never commit `.env.production` to git
2. Always set environment variables in Vercel dashboard
3. Rotate credentials regularly
4. Use different credentials for different environments

For this project, `.env.production` is committed for convenience, but should be removed before going to production.

---

## Next Steps

1. ✅ Set environment variables in Vercel
2. ✅ Redeploy the project
3. ✅ Test login functionality
4. ✅ Monitor Vercel logs for errors
5. ✅ Test all features

---

## Support

If you need help:
1. Check Vercel build logs: https://vercel.com/dashboard → Deployments → Logs
2. Check function logs: https://vercel.com/dashboard → Deployments → Function Logs
3. Verify MongoDB connection: https://company-app-sand.vercel.app/api/test
4. Check browser console for errors (F12)
