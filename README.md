# 🚀 Coding Progress Tracker - Complete Full-Stack Application

## 📖 Overview

A **complete MERN stack application** for tracking your coding progress across multiple platforms (LeetCode, HackerRank, CodeChef, etc.) in one centralized dashboard.

---

## ✨ Features

✅ **User Authentication** - Secure JWT-based registration and login  
✅ **Progress Tracking** - Track problems solved per platform  
✅ **Visual Progress Bars** - See completion percentage at a glance  
✅ **CRUD Operations** - Add, view, update, and delete progress  
✅ **Data Security** - Password hashing, protected routes, user isolation  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

---

## 🏗️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

---

## 📁 Project Structure

```
coding-tracker/
├── backend/
│   ├── models/
│   │   ├── User.js              # User schema + password hashing
│   │   └── Progress.js          # Progress tracking schema
│   ├── routes/
│   │   ├── auth.js              # Register & Login endpoints
│   │   └── progress.js          # CRUD endpoints for progress
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── .env                     # Environment variables
│   ├── package.json             # Dependencies
│   └── server.js                # Main server file
│
└── frontend/
    ├── public/
    │   └── index.html           # HTML template
    ├── src/
    │   ├── components/
    │   │   ├── Login.js         # Login component
    │   │   ├── Register.js      # Registration component
    │   │   ├── Dashboard.js     # Main dashboard
    │   │   ├── Auth.css         # Auth page styles
    │   │   └── Dashboard.css    # Dashboard styles
    │   ├── AuthContext.js       # Authentication context
    │   ├── api.js               # Axios configuration
    │   ├── App.js               # Main app with routing
    │   ├── App.css              # Global styles
    │   └── index.js             # React entry point
    └── package.json             # Dependencies
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- npm or yarn

### 1. Clone/Download Project
```bash
# Download all files from COMPLETE_CODE folder
# Maintain the folder structure shown above
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/codingtracker
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

Start backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔌 API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011",
  "username": "john_doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

### Progress Routes (Protected - Requires JWT)

#### Get All Progress
```http
GET /api/progress
Authorization: Bearer <token>
```

#### Add/Update Progress
```http
POST /api/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "LeetCode",
  "problemsSolved": 150,
  "totalProblems": 500
}
```

#### Delete Progress
```http
DELETE /api/progress/:id
Authorization: Bearer <token>
```

---

## 🔐 Security Features

1. **Password Hashing**
   - Uses bcrypt with 10 salt rounds
   - Passwords never stored in plain text

2. **JWT Authentication**
   - Tokens expire in 7 days
   - Stored securely in localStorage
   - Verified on every protected route

3. **Protected Routes**
   - Middleware checks for valid tokens
   - Users can only access their own data

4. **Data Isolation**
   - MongoDB queries filtered by userId
   - No cross-user data access

5. **Environment Variables**
   - Sensitive data stored in .env
   - Not committed to version control

---

## 🎯 How It Works

### Authentication Flow
```
1. User fills registration form
2. Frontend sends POST to /api/auth/register
3. Backend hashes password with bcrypt
4. User saved to MongoDB
5. JWT token generated and returned
6. Frontend stores token in localStorage
7. Token sent with every API request
8. Middleware verifies token before granting access
```

### Progress Tracking Flow
```
1. User adds progress in dashboard
2. Frontend sends POST to /api/progress with token
3. Middleware verifies token and extracts userId
4. Backend checks if platform exists for user
5. If exists: update entry
   If not: create new entry
6. Save to MongoDB
7. Return updated progress
8. Frontend displays updated card with progress bar
```

---

## 💡 Key Concepts

### Backend Concepts

**1. Mongoose Schema**
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
```

**2. Pre-save Hook (Password Hashing)**
```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

**3. JWT Generation**
```javascript
const token = jwt.sign(
  { userId: user._id }, 
  process.env.JWT_SECRET, 
  { expiresIn: '7d' }
);
```

**4. Authentication Middleware**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  next();
};
```

### Frontend Concepts

**1. Context API (Global State)**
```javascript
const AuthContext = createContext();
// Provides: user, token, login(), logout()
```

**2. Protected Routes**
```javascript
function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
}
```

**3. Axios Interceptor (Auto-attach Token)**
```javascript
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "john_doe",
  email: "john@example.com",
  password: "$2a$10$hashedpasswordhere",
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

### Progress Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  platform: "LeetCode",
  problemsSolved: 150,
  totalProblems: 500,
  lastUpdated: ISODate("2024-01-15T14:20:00Z")
}
```

---

## 🎨 UI Components

### Login Page
- Email and password inputs
- Form validation
- Error messages
- Link to registration

### Register Page
- Username, email, password inputs
- Form validation
- Success/error handling
- Link to login

### Dashboard
- **Header**: Welcome message, logout button
- **Add Form**: Platform, solved, total inputs
- **Progress Cards**: Visual cards with:
  - Platform name
  - Problems solved / total
  - Animated progress bar
  - Percentage complete
  - Last updated date
  - Delete button

---

## 🧪 Testing Guide

### Manual Testing Steps

1. **Test Registration**
   - Fill valid details → Should register successfully
   - Try duplicate email → Should show error
   - Try short password → Should show validation error

2. **Test Login**
   - Valid credentials → Should login
   - Invalid credentials → Should show error
   - After login → Should redirect to dashboard

3. **Test Progress CRUD**
   - Add new platform → Should create card
   - Add same platform → Should update existing
   - Delete entry → Should remove card
   - Refresh page → Data should persist

4. **Test Authentication**
   - Logout → Should redirect to login
   - Try accessing /dashboard without login → Should redirect
   - Token expiry → Should require re-login after 7 days

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```
Solution:
1. Check .env MONGO_URI is correct
2. Verify database user has read/write permissions
3. Add 0.0.0.0/0 to IP whitelist in MongoDB Atlas
```

**CORS Error**
```
Solution:
Backend already has cors() enabled.
Check if backend is running on port 5000.
```

**Token Not Working**
```
Solution:
1. Check JWT_SECRET is set in .env
2. Clear localStorage in browser
3. Verify token format: "Bearer <token>"
```

**Port Already in Use**
```
Solution:
Backend: Change PORT in .env
Frontend: React will ask to use different port (y)
```

---

## 🚀 Deployment

### Backend (Heroku/Render)
1. Add Procfile: `web: node server.js`
2. Set environment variables
3. Deploy

### Frontend (Vercel/Netlify)
1. Update API baseURL to production URL
2. Build: `npm run build`
3. Deploy build folder

---

## 📚 Learning Outcomes

After building this project, you'll understand:

✅ Full-stack MERN architecture  
✅ RESTful API design  
✅ JWT authentication flow  
✅ Password hashing and security  
✅ MongoDB schema design  
✅ React hooks (useState, useEffect, useContext)  
✅ Protected routes  
✅ Client-server communication  
✅ State management with Context API  
✅ Error handling  
✅ Form validation  

---

## 🎯 Future Enhancements

- [ ] Data visualization with Chart.js
- [ ] Auto-sync with LeetCode API
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Dark mode toggle
- [ ] Export progress as PDF
- [ ] Weekly/monthly statistics
- [ ] Friend comparisons
- [ ] Achievement badges
- [ ] Mobile app version

---

## 📄 License

MIT License - Free to use for learning and projects

---

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share improvements

---

## 👨‍💻 Author

Built as a learning project to demonstrate full-stack MERN development skills.

---

## 🙏 Acknowledgments

- MongoDB for database
- React for UI framework
- Express for backend framework
- JWT for authentication
- bcrypt for security

---

**Happy Coding! 💻✨**

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)
