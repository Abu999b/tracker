# 🚀 COMPLETE SETUP GUIDE - Coding Progress Tracker

## 📋 Table of Contents
1. Prerequisites
2. Backend Setup
3. Frontend Setup
4. Running the Application
5. Testing the Application
6. Troubleshooting

---

## 1️⃣ Prerequisites

### Required Software:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Code Editor** (VS Code recommended)

### Check if installed:
```bash
node --version    # Should show v14.x.x or higher
npm --version     # Should show 6.x.x or higher
```

---

## 2️⃣ Backend Setup

### Step 1: Create Backend Folder Structure
```bash
mkdir coding-tracker
cd coding-tracker
mkdir backend
cd backend
```

### Step 2: Initialize Node.js Project
```bash
npm init -y
```

### Step 3: Install Dependencies
```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

### Step 4: Create Folder Structure
```bash
mkdir models routes middleware
```

### Step 5: Create All Backend Files

**File: backend/server.js**
```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Coding Progress Tracker API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**File: backend/.env**
```env
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/codingtracker
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
```

**File: backend/models/User.js**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

**File: backend/models/Progress.js**
```javascript
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, required: true, trim: true },
  problemsSolved: { type: Number, default: 0, min: 0 },
  totalProblems: { type: Number, default: 0, min: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
```

**File: backend/middleware/auth.js**
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
```

**File: backend/routes/auth.js**
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
```

**File: backend/routes/progress.js**
```javascript
const express = require('express');
const Progress = require('../models/Progress');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { platform, problemsSolved, totalProblems } = req.body;
    let progress = await Progress.findOne({ userId: req.userId, platform });
    if (progress) {
      progress.problemsSolved = problemsSolved;
      progress.totalProblems = totalProblems;
      progress.lastUpdated = Date.now();
      await progress.save();
    } else {
      progress = new Progress({ userId: req.userId, platform, problemsSolved, totalProblems });
      await progress.save();
    }
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    res.json({ message: 'Progress deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
```

### Step 6: Update package.json Scripts
Add this to your `package.json`:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Step 7: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a new cluster (Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Paste in `.env` file as `MONGO_URI`

Example:
```
MONGO_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/codingtracker
```

### Step 8: Start Backend Server
```bash
npm start
# OR for development with auto-reload:
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB connected
```

---

## 3️⃣ Frontend Setup

### Step 1: Create React App
```bash
# Go back to main project folder
cd ..
npx create-react-app frontend
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install react-router-dom axios
```

### Step 3: Create Folder Structure
```bash
mkdir src/components
```

### Step 4: Create All Frontend Files

**File: frontend/src/api.js**
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

**File: frontend/src/AuthContext.js**
```javascript
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const username = localStorage.getItem('username');
      setUser({ username });
    }
  }, [token]);

  const login = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setToken(token);
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Continue creating all other files as shown in the complete code...**

### Step 5: Start Frontend
```bash
npm start
```

Your browser should open to `http://localhost:3000`

---

## 4️⃣ Running the Application

### Terminal 1 - Backend:
```bash
cd backend
npm start
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

---

## 5️⃣ Testing the Application

### Test Registration:
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in:
   - Username: testuser
   - Email: test@example.com
   - Password: test123
4. Click Register
5. Should redirect to Dashboard

### Test Adding Progress:
1. In Dashboard, fill in:
   - Platform: LeetCode
   - Problems Solved: 50
   - Total Problems: 100
2. Click "Add Progress"
3. Card should appear with 50% progress bar

### Test Logout/Login:
1. Click Logout
2. Login with same credentials
3. Your progress should still be there

---

## 6️⃣ Troubleshooting

### Problem: MongoDB Connection Error
**Solution:**
- Check if MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify connection string in `.env`
- Ensure database password doesn't contain special characters

### Problem: CORS Error
**Solution:**
- Backend already has `cors()` enabled
- Make sure backend is running on port 5000
- Check if `baseURL` in `api.js` is correct

### Problem: Token Not Working
**Solution:**
- Clear browser localStorage
- Check if JWT_SECRET is set in `.env`
- Verify token is being sent in headers

### Problem: npm install fails
**Solution:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 Success!

If everything works, you should be able to:
✅ Register a new account
✅ Login successfully
✅ Add coding progress
✅ See progress bars
✅ Delete entries
✅ Logout and login again

---

## 📞 Need Help?

Common issues:
- Port 5000 already in use → Change PORT in `.env`
- Port 3000 already in use → React will ask to use 3001
- Module not found → Run `npm install` again

---

**Congratulations! Your full-stack MERN app is running! 🚀**
