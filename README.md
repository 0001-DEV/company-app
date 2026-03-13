# Company Management System

A full-stack web application for managing company staff, departments, file uploads, and internal communication.

## Features

### Admin Features
- 👥 Staff management and ID generation
- 🏢 Department management
- 📤 View all staff uploaded works
- 🔑 Manage staff permissions
- 💬 Team chat and private messaging
- 🗑️ Recycle bin for deleted files
- 🎂 Birthday notifications for all staff

### Staff Features
- 📁 Upload work files with comments
- 🔍 Search uploaded files
- ⏰ Delete files within 1.5 hours of upload
- 💬 Chat with admin and team members
- 👥 View other staff works (if permitted by admin)
- 🎊 Birthday notifications and wishes

### Chat System
- Team chat for all staff
- Department-specific chats
- Private messaging
- File sharing in chats
- Edit/delete messages within 5 minutes
- Unread message indicators
- Real-time message sorting

### Birthday System
- Automatic birthday notifications (3, 2, 1 days before)
- Special birthday wishes on the actual day
- Celebrants see personalized messages
- Colleagues get reminders to wish happy birthday

## Tech Stack

### Frontend
- React.js
- React Router
- CSS3 with modern gradients and animations

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- bcryptjs for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd Company-app
```

2. Install dependencies for backend
```bash
cd backend
npm install
```

3. Install dependencies for frontend
```bash
cd ../frontend
npm install
```

4. Create environment variables

Backend `.env` file:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Frontend `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
```

5. Run the application

Start backend server:
```bash
cd backend
npm start
```

Start frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
Company-app/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # Uploaded files storage
│   └── server.js        # Express server
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       └── App.js       # Main app component
└── README.md
```

## API Endpoints

### Authentication
- POST `/api/admin/login` - Admin login
- POST `/api/staff/login` - Staff login

### Admin Routes
- GET `/api/admin/all-staff` - Get all staff
- POST `/api/admin/create-staff` - Create new staff
- GET `/api/admin/uploaded-works` - View all uploaded works
- PUT `/api/admin/toggle-permission/:staffId` - Toggle staff permissions
- GET `/api/admin/upcoming-birthdays` - Get birthday notifications

### Staff Routes
- GET `/api/staff/my-profile` - Get staff profile
- POST `/api/staff/upload-general-file` - Upload work files
- GET `/api/staff/my-files` - Get uploaded files
- DELETE `/api/staff/delete-file/:fileId` - Delete file (within 1.5 hours)
- GET `/api/staff/upcoming-birthdays` - Get birthday notifications

### Chat Routes
- GET `/api/chat/conversations` - Get all conversations
- POST `/api/chat/send` - Send message
- PUT `/api/chat/edit/:messageId` - Edit message
- DELETE `/api/chat/delete/:messageId` - Delete message

## Features in Detail

### File Upload System
- Multiple file upload support (up to 10 files)
- File comments and descriptions
- Search functionality
- Automatic pagination (4 files per page)
- Time-limited deletion (1.5 hours for staff, unlimited for admin)

### Permission System
- Admin can grant/revoke permission to view others' work
- Purple button appears for permitted staff
- Folder-based view of all staff files

### Birthday Notification System
- Pseudo birthdays for testing
- 3-day advance notifications
- Special messages for celebrants
- Collapsible notification widget
- Separate counts for today and upcoming birthdays

## Security
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Secure file upload handling

## Contributing
Feel free to submit issues and enhancement requests!

## License
MIT License

## Author
Xtreme Cr8ivity

---
Built with ❤️ for efficient company management
