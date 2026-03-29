# Quick Start - Deploy in 15 Minutes

## **TL;DR - Fast Track**

### **1. MongoDB Atlas (5 min)**
```
1. Go to mongodb.com/cloud/atlas
2. Sign up → Create free cluster
3. Create user: admin / [password]
4. Get connection string
5. Replace <password> and database name
```

### **2. Railway Backend (5 min)**
```
1. Go to railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub
4. Select company-app repo
5. Set Root Directory: backend
6. Add env variables:
   - MONGODB_URI=[from MongoDB]
   - JWT_SECRET=your_secret_key_here
   - NODE_ENV=production
7. Deploy
8. Copy public URL
```

### **3. Vercel Frontend (5 min)**
```
1. Go to vercel.com
2. Sign in with GitHub
3. New Project → Import company-app
4. Root Directory: frontend
5. Add env variable:
   - REACT_APP_API_URL=[Railway URL from step 2]
6. Deploy
7. Share the URL!
```

---

## **Your Live Links**

After deployment:
- **Frontend:** `https://your-app.vercel.app` ← Share this!
- **Backend:** `https://your-backend.railway.app`
- **Database:** MongoDB Atlas (cloud)

---

## **Common Issues**

| Issue | Fix |
|-------|-----|
| CORS error | Update CORS_ORIGIN in Railway to match Vercel URL |
| DB connection fails | Check MongoDB connection string and password |
| Build fails | Run `npm install` locally, check for errors |
| 502 error | Wait 30 seconds, backend might be starting |

---

## **Update Your App**

```bash
git add -A
git commit -m "Your changes"
git push
```

Both Vercel and Railway auto-deploy on push! ✨

---

## **Need Help?**

See `DEPLOYMENT_GUIDE.md` for detailed instructions.
