# Set MONGODB_URI in Vercel - Final Step

## Status
✅ JWT_SECRET - Already set  
✅ NODE_ENV - Already set  
⏳ MONGODB_URI - **NEEDS TO BE SET**

---

## What to Do

### Step 1: Go to Vercel Dashboard
https://vercel.com/dashboard

### Step 2: Select Project
Click on `company-app` project

### Step 3: Go to Settings
Click **Settings** (top menu)

### Step 4: Environment Variables
Click **Environment Variables** (left sidebar)

### Step 5: Add MONGODB_URI

For **Production** environment, add:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority` |

For **Preview** environment, add the same value

### Step 6: Redeploy
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

---

## Verify It Works

### Test API
Visit: https://company-app-sand.vercel.app/api/test

Should show:
```json
{
  "success": true,
  "message": "MongoDB Atlas connection successful! All systems operational.",
  "userStats": {
    "total": 3,
    "admins": 1,
    "staff": 2
  }
}
```

### Test Login
1. Go to https://company-app-sand.vercel.app
2. Click **Admin Login**
3. Enter:
   - Email: `admin@xtremecr8ivity.com`
   - Password: `admin123`
4. Should see Admin Dashboard

---

## MongoDB Credentials (Verified ✅)

- **Connection String**: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`
- **Username**: `admin`
- **Password**: `Opulence16`
- **Database**: `company-app`
- **Cluster**: `company-app.8xwuqud.mongodb.net`

**Status**: ✅ Verified working locally

---

## Users in Database

| Email | Password | Role |
|-------|----------|------|
| `admin@xtremecr8ivity.com` | `admin123` | Admin |
| `loveolaoye@gmail.com` | `LOVEOLAOYE` | Staff |
| `love@xtremecr8ivity.com` | `love` | Staff |

---

## That's It!

Once you set MONGODB_URI and redeploy, your app will be fully functional with:
- ✅ React frontend
- ✅ Backend API
- ✅ MongoDB database
- ✅ Authentication
- ✅ All features

---

## Need Help?

If you get an error:

### "bad auth : authentication failed"
- Verify MONGODB_URI is set in Vercel
- Check the value is exactly: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`
- Redeploy

### "Cannot connect to MongoDB"
- Check MongoDB Atlas Network Access includes `0.0.0.0/0`
- Verify the connection string is correct
- Try redeploying

### "Blank page or error"
- Check browser console (F12)
- Check Vercel build logs
- Try refreshing the page

---

## Quick Copy-Paste

If you need to copy the MONGODB_URI:

```
mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority
```

Just paste this into the MONGODB_URI field in Vercel environment variables.

---

## Done! 🎉

Your app is ready to go live!
