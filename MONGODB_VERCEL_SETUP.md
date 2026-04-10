# Set MongoDB URI in Vercel - Final Step

## Your MongoDB Connection String

```
mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority
```

## Steps to Add to Vercel

### 1. Open Vercel Dashboard
https://vercel.com/dashboard

### 2. Select Your Project
Click on `company-app`

### 3. Go to Settings
Click **Settings** (top menu)

### 4. Click Environment Variables
Left sidebar → **Environment Variables**

### 5. Add MONGODB_URI

**For Production:**
- Name: `MONGODB_URI`
- Value: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`
- Click **Add**

**For Preview:**
- Name: `MONGODB_URI`
- Value: `mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority`
- Click **Add**

### 6. Redeploy
1. Go to **Deployments** tab
2. Click three dots (...) on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

### 7. Test
Visit: https://company-app-sand.vercel.app

You should see:
- ✅ Your React app (Identifiner login page)
- ✅ Admin Login button
- ✅ Staff Login button
- ✅ "API Offline" message should disappear

### 8. Test Login
Click **Admin Login**
- Email: `admin@xtremecr8ivity.com`
- Password: `admin123`

Should redirect to Admin Dashboard!

---

## MongoDB Credentials (Verified ✅)

- **Username**: `admin`
- **Password**: `Opulence16`
- **Database**: `company-app`
- **Cluster**: `company-app.8xwuqud.mongodb.net`

---

## If It Still Shows "API Offline"

1. Check Vercel build logs for errors
2. Verify MONGODB_URI is set correctly
3. Try redeploying
4. Check MongoDB Atlas Network Access includes `0.0.0.0/0`

---

## Done! 🎉

Once you set MONGODB_URI and redeploy, your app will be fully live!
