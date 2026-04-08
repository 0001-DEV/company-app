# Quick Start - 3 Steps to Test

## Terminal 1: Backend
```bash
cd backend
npm start
```
Wait for: `✅ Server running on port 5000`

## Terminal 2: Frontend
```bash
cd frontend
npm start
```
Automatically opens: `http://localhost:3000`

## Test Login
- Email: `admin@xtremecr8ivity.com`
- Password: `admin123`

---

## If You See Errors

### "Cannot find module"
```bash
npm install
```

### "Unexpected token '<'"
- Backend not running
- Check Terminal 1 for errors

### "bad auth: Authentication failed"
- MongoDB credentials wrong
- Check MongoDB Atlas user: `admin` / `Opulence16`

### "Proxy error: Could not proxy request"
- Backend not running on port 5000
- Check Terminal 1

---

## Verify Backend Works
```
http://localhost:5000/api/test
```

Should show JSON response with collections list.

---

## Test Logout
1. After login, you'll see admin dashboard
2. Go back to `http://localhost:3000`
3. Click "Logout" button
4. Confirm logout
5. Login page appears again
