// ============================================
// PROGRESS MODEL
// ============================================

const mongoose = require('mongoose');

// Progress Schema Definition
const progressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  platform: { 
    type: String, 
    required: true,
    trim: true
    // Examples: LeetCode, HackerRank, CodeChef, Codeforces
  },
  problemsSolved: { 
    type: Number, 
    default: 0,
    min: 0
  },
  totalProblems: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index to ensure one entry per user per platform
progressSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);