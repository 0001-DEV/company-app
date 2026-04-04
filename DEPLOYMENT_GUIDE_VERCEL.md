# Deployment Guide - Vercel & Railway

This guide explains how to deploy your Company App on Vercel (frontend) and Railway (backend).

## Prerequisites

- GitHub account with your repository pushed
- Vercel account (https://vercel.com)
- Railway account (https://railway.app)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

## Step 1: Deploy Backend on Railway

### 1.1 Create MongoDB Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user and get the connection string
4. Copy the connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### 1.2 Deploy Backend on Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Select your `company-app` repository
5. Railway will auto-detect the backend (it has `railway.json`)
6. Add environment variables:
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Any random string (e.g., `your-secret-key-12345`)
   - `TWILIO_ACCOUNT_SID` = Your Twilio account SID
   - `TWILIO_AUTH_TOKEN` = Your Twilio auth token
   - `TWILIO_PHONE_NUMBER` = Your Twilio phone number
   - `SMTP_HOST` = Your email SMTP host (e.g., `smtp.gmail.com`)
   - `SMTP_PORT` = Your email SMTP port (e.g., `587`)
   - `SMTP_USER` = Your email address
   - `SMTP_PASS` = Your email password or app password
7. Click "Deploy"
8. Wait for deployment to complete
9. Copy your backend URL (e.g., `https://company-app-backend.railway.app`)

## Step 2: Deploy Frontend on Vercel

### 2.1 Update Frontend API URL

1. In your repository, update `frontend/.env.production`:
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app
   ```
   Replace with your actual Railway backend URL

2. Commit and push to GitHub:
   ```
   git add frontend/.env.production
   git commit -m "Update API URL for production"
   git push origin main
   ```

### 2.2 Deploy on Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Select "Import Git Repository"
4. Select your `company-app` repository
5. Vercel will auto-detect the configuration from `vercel.json`
6. Click "Deploy"
7. Wait for deployment to complete
8. Your frontend will be available at `https://your-project-name.vercel.app`

## Step 3: Configure CORS

Your backend needs to allow requests from your Vercel frontend.

1. Go to `backend/server.js`
2. Update the CORS origins to include your Vercel URL:
   ```javascript
   const corsOptions = {
     origin: [
       'http://localhost:3000',
       'http://127.0.0.1:3000',
       'https://your-project-name.vercel.app',  // Add your Vercel URL
       /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/,
       /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/,
       /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:3000$/
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   };
   ```
3. Commit and push:
   ```
   git add backend/server.js
   git commit -m "Update CORS for production"
   git push origin main
   ```
4. Railway will auto-redeploy

## Step 4: Test Deployment

1. Go to your Vercel frontend URL
2. Try logging in
3. Test all features (create staff, import companies, etc.)
4. Check browser console for any errors

## Troubleshooting

### 404 Error on Vercel
- Make sure `vercel.json` is in the root directory
- Check that `frontend/build` folder exists
- Verify API routes are correctly configured

### Backend Connection Issues
- Check MongoDB connection string in Railway environment variables
- Verify CORS settings include your Vercel URL
- Check backend logs in Railway dashboard

### API Calls Failing
- Verify `REACT_APP_API_URL` is set correctly in frontend
- Check that backend URL is accessible
- Look at browser Network tab to see actual requests

## Environment Variables Checklist

**Backend (Railway):**
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] TWILIO_ACCOUNT_SID
- [ ] TWILIO_AUTH_TOKEN
- [ ] TWILIO_PHONE_NUMBER
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_USER
- [ ] SMTP_PASS

**Frontend (Vercel):**
- [ ] REACT_APP_API_URL (set in `.env.production`)

## Useful Links

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Twilio: https://www.twilio.com
