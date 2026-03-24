# Quick Start - Testing Chatbox Features

## What Was Fixed

**Context Menu Positioning Bug**: The right-click context menu on messages was appearing in the wrong location. This has been fixed.

---

## How to Test

### 1. Start the Application

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

### 2. Log In
- Use your test user credentials
- Navigate to the Chatbox

### 3. Test Each Feature

#### **Input Bar** (Bottom of chat)
- 📎 **File Upload**: Click to select and send files
- 🎤 **Voice Recording**: Click to record audio, click again to stop
- 😊 **Emoji Picker**: Click to open emoji selector

#### **Header Buttons** (Top right of chat)
- 🔍 **Search**: Click to search messages
- ⭐ **Starred**: Click to view starred messages
- ℹ️ **Group Info**: Click to see members and media (departments only)
- 🔔 **Mute**: Click to mute chat
- ⏰ **Schedule**: Click to schedule a message
- 📞 **Voice Call**: Click to start voice call
- 📹 **Video Call**: Click to start video call

#### **Right-Click Context Menu** (On any message)
- Click any emoji to react
- ⭐ Star - Add to starred messages
- 📌 Pin - Pin to top (admin only)
- ↗️ Forward - Forward to others
- 👁️ Read by - See who read it
- 🗑️ Delete - Delete your own messages

#### **Other Features**
- **Typing Indicators**: See "X is typing..." at bottom
- **Online Status**: Green dot = online, gray dot = offline
- **Pinned Messages**: Banner at top shows pinned count
- **Reply**: Click a message to reply (visual indicator shows)

---

## Expected Behavior

All buttons should be **visible and clickable**. When you click them:
- Modals should appear for Schedule, Forward, Group Info, etc.
- Context menu should appear at your cursor when right-clicking
- Features should work without errors

---

## If Something Doesn't Work

1. Check browser console for errors (F12 → Console tab)
2. Check backend logs for API errors
3. Verify backend is running on port 5000
4. Verify frontend is running on port 3000
5. Try refreshing the page

---

## Files Modified

- `frontend/src/pages/Chatbox.js` - Fixed context menu positioning

All other code is unchanged and verified to be working.

