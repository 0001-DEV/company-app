# MongoDB Setup Checklist

## ✅ What's Working
- MongoDB Atlas cluster exists: `company-app.8xwuqud.mongodb.net`
- MongoDB user exists: `admin` with password `Opulence16`
- Database exists: `company-app`
- Connection works locally ✅

## ⏳ What's NOT Working
- MONGODB_URI is NOT set in Vercel environment variables
- That's why you're getting "bad auth : authentication failed"

---

## REQUIRED: Set MONGODB_URI in Vercel

### Step 1: Go to Vercel
https://vercel.com/dashboard

### Step 2: Select Project
Click `company-app`

### Step 3: Settings
Click **Settings** (top menu)

### Step 4: Environment Variables
Click **Environment Variables** (left sidebar)

### Step 5: Add Variable

**Click "Add New"**

| Field | Value |
|-------|-------|
| Name | `MONGODB_URI` |
| Value | `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority` |
| Environments | ✅ Production, ✅ Preview, ✅ Development |

**Click "Save"**

### Step 6: Redeploy
1. Go to **Deployments**
2. Click three dots (...) on latest
3. Click **Redeploy**
4. Wait 2-3 minutes

### Step 7: Test
Visit: https://company-app-sand.vercel.app/api/test

Should show:
```json
{
  "success": true,
  "message": "MongoDB Atlas connection successful!"
}
```

---

## If Still Getting "bad auth" Error

### Check 1: Is MONGODB_URI Set?
1. Go to Vercel Settings → Environment Variables
2. Look for `MONGODB_URI`
3. If not there, add it!

### Check 2: Is Value Correct?
Copy-paste this exactly:
```
mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority
```

### Check 3: Did You Redeploy?
1. After adding variable, go to Deployments
2. Click Redeploy
3. Wait for build to complete

### Check 4: MongoDB Network Access
1. Go to MongoDB Atlas
2. Click **Network Access**
3. Verify `0.0.0.0/0` is whitelisted
4. If not, add it

---

## MongoDB Credentials (Verified ✅)

- **Cluster**: `company-app.8xwuqud.mongodb.net`
- **Username**: `admin`
- **Password**: `Opulence16`
- **Database**: `company-app`
- **Connection String**: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`

---

## Status

❌ MONGODB_URI not set in Vercel  
⏳ Waiting for you to add it

Once you add it and redeploy, everything will work!
