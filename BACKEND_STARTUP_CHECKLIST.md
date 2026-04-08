# Backend Startup Checklist

## Quick Diagnosis

The error you're seeing ("Unexpected token '<', "<!DOCTYPE"...") means the frontend is getting HTML instead of JSON from the API. This happens when:

1. **Backend server is NOT running** ❌
2. **Backend is running but on wrong port** ❌
3. **API endpoint doesn't exist** ❌

## Step-by-Step Startup

### 1. Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

You should see:
```
✅ Server running on port 5000
```

### 2. Verify Backend is Working

Open your browser and go to:
```
http://localhost:5000/api/test
```

You should see JSON response like:
```json
{
  "success": true,
  "message": "MongoDB Atlas connection successful! All systems operational.",
  "collections": [...]
}
```

If you see HTML or an error, the backend isn't running correctly.

### 3. Start the Frontend

In a NEW terminal window:

```bash
cd frontend
npm start
```

This will open `http://localhost:3000` automatically.

### 4. Test the Login

1. Go to `http://localhost:3000`
2. Click "Admin Login"
3. Enter credentials:
   - Email: `admin@xtremecr8ivity.com`
   - Password: `admin123`
4. Click "Sign In as Admin"

## Troubleshooting

### Error: "Cannot find module 'mongodb'"
```bash
cd backend
npm install
```

### Error: "MONGODB_URI not set"
- Check `.env.local` file exists in root
- Verify it contains: `MONGODB_URI="mongodb+srv://admin:Opulence16@company-app.8xwuqud.mongodb.net/company-app?retryWrites=true&w=majority"`

### Error: "bad auth: Authentication failed"
- MongoDB credentials are wrong
- Check MongoDB Atlas user: `admin` / `Opulence16`
- Verify `0.0.0.0/0` is whitelisted in Network Access

### Error: "Proxy error: Could not proxy request"
- Backend server not running on port 5000
- Check terminal for "✅ Server running on port 5000" message

### Error: "Unexpected token '<'"
- Backend is returning HTML instead of JSON
- This means backend server is NOT running
- Go back to Step 1 and start the backend

## Important Notes

- **Two separate terminals needed**: One for backend, one for frontend
- **Backend must start first**: Frontend proxy needs backend to be ready
- **Port 5000**: Backend uses this port (don't change it)
- **Port 3000**: Frontend uses this port (can be changed if needed)

## Quick Test Commands

```bash
# Test backend is running
curl http://localhost:5000/api/test

# Test frontend can reach backend
curl http://localhost:3000/api/test

# Check if ports are in use
# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :5000
lsof -i :3000
```

## Still Having Issues?

1. Check browser DevTools Console for errors
2. Check browser DevTools Network tab for failed requests
3. Check terminal output for backend errors
4. Verify MongoDB connection with: `http://localhost:5000/api/test`
