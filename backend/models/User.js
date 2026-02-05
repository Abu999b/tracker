// // ============================================
// // USER MODEL
// // ============================================

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // User Schema Definition
// const userSchema = new mongoose.Schema({
//   username: { 
//     type: String, 
//     required: true, 
//     unique: true,
//     trim: true,
//     minlength: 3
//   },
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: { 
//     type: String, 
//     required: true,
//     minlength: 6
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// // Hash password before saving to database
// userSchema.pre('save', async function(next) {
//   // Only hash if password is modified
//   if (!this.isModified('password')) return next();
  
//   // Hash password with salt rounds = 10
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Method to compare passwords during login
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);



// ============================================
// USER MODEL
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema Definition
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ============================================
// Hash password before saving
// ============================================

userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) return;

  // Hash password with salt rounds = 10
  this.password = await bcrypt.hash(this.password, 10);
});

// ============================================
// Compare password during login
// ============================================

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
