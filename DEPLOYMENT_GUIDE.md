# Deployment Guide - Company App

This guide will help you deploy the Company App to production using Vercel (Frontend), Railway (Backend), and MongoDB Atlas (Database).

---

## **Prerequisites**
- GitHub account (already have)
- Vercel account (free)
- Railway account (free)
- MongoDB Atlas account (free)

---

## **Step 1: Set Up MongoDB Atlas (Database)**

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Sign up with email or GitHub
4. Create a new project (name it "company-app")

### 1.2 Create a Cluster
1. Click "Create" → Select "Free" tier
2. Choose cloud provider (AWS recommended)
3. Choose region closest to you
4. Click "Create Cluster"
5. Wait 5-10 minutes for cluster to be ready

### 1.3 Create Database User
1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Username: `admin`
4. Password: Generate secure password (save it!)
5. Click "Add User"

### 1.4 Get Connection String
1. Go to "Clusters" → Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your password
5. Replace `myFirstDatabase` with `company-app`
6. Save this URL (you'll need it for Railway)

**Example:**
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/company-app?retryWrites=true&w=majority
```

---

## **Step 2: Deploy Backend to Railway**

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start Project"
3. Sign up with GitHub

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `company-app` repository
4. Click "Deploy"

### 2.3 Configure Backend Service
1. In Railway dashboard, click on your project
2. Click "New" → "Service" → "GitHub Repo"
3. Select the repo again
4. In the settings, set:
   - **Root Directory:** `backend`
   - **Start Command:** `node server.js`

### 2.4 Add Environment Variables
1. In Railway, go to "Variables"
2. Add these variables:
   ```
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/company-app?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
   NODE_ENV=production
   PORT=5000
   ```
3. Click "Deploy"

### 2.5 Get Backend URL
1. In Railway, go to "Deployments"
2. Click on your deployment
3. Look for "Public URL" or "Domain"
4. Copy the URL (looks like: `https://company-app-production.railway.app`)
5. **Save this URL** - you'll need it for the frontend

---

## **Step 3: Deploy Frontend to Vercel**

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub

### 3.2 Import Project
1. Click "New Project"
2. Click "Import Git Repository"
3. Select your `company-app` repo
4. Click "Import"

### 3.3 Configure Frontend
1. In the configuration screen:
   - **Framework Preset:** React
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

### 3.4 Add Environment Variables
1. Before deploying, click "Environment Variables"
2. Add:
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app
   ```
   (Replace with your actual Railway URL from Step 2.5)
3. Click "Deploy"

### 3.5 Get Frontend URL
1. After deployment completes, you'll see your live URL
2. It looks like: `https://company-app.vercel.app`
3. **This is your public link to share!**

---

## **Step 4: Update Backend CORS (If Needed)**

If you get CORS errors:

1. Go to Railway dashboard
2. Click on your backend service
3. Go to "Variables"
4. Add/Update:
   ```
   CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
   ```
5. Redeploy

---

## **Step 5: Test the Deployment**

1. Open your Vercel URL in browser
2. Try logging in
3. Test a few features:
   - Upload a file
   - Create a new client
   - Submit a weekly report
4. Check browser console for errors (F12)

---

## **Troubleshooting**

### **"Cannot connect to backend"**
- Check CORS_ORIGIN in Railway matches your Vercel URL
- Verify MONGODB_URI is correct
- Check Railway logs for errors

### **"Database connection failed"**
- Verify MongoDB Atlas connection string
- Check username/password are correct
- Ensure IP whitelist includes Railway's IP (set to 0.0.0.0/0 for testing)

### **"Build failed on Vercel"**
- Check `frontend/package.json` has all dependencies
- Run `npm install` locally and test
- Check for TypeScript errors

### **"502 Bad Gateway"**
- Backend service might be starting
- Wait 30 seconds and refresh
- Check Railway logs for errors

---

## **Updating Your App**

After deployment, to update:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add -A
   git commit -m "Your message"
   git push
   ```
3. **Vercel** automatically redeploys on push
4. **Railway** automatically redeploys on push
5. Changes live in 2-5 minutes

---

## **Important Security Notes**

1. **Never commit `.env` files** - they're in `.gitignore`
2. **Use strong JWT_SECRET** - at least 32 characters
3. **Enable MongoDB IP Whitelist** - restrict to Railway IP
4. **Use HTTPS only** - both Vercel and Railway provide it
5. **Rotate secrets regularly** - especially JWT_SECRET

---

## **Sharing Your App**

Share this link with others:
```
https://your-app.vercel.app
```

They can:
- Create accounts
- Upload files
- Use all features
- No installation needed!

---

## **Next Steps (Optional)**

- Set up custom domain (Vercel/Railway support this)
- Enable email notifications
- Set up automated backups
- Monitor performance with Railway/Vercel dashboards

---

## **Support**

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Docs: https://docs.mongodb.com

Good luck! 🚀
