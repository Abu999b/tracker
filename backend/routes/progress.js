// ============================================
// PROGRESS ROUTES
// ============================================

const express = require('express');
const Progress = require('../models/Progress');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes are protected - require authentication
// ============================================

// ============================================
// GET ALL PROGRESS FOR LOGGED-IN USER
// GET /api/progress
// ============================================
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Find all progress entries for this user
    const progress = await Progress.find({ userId: req.userId })
      .sort({ lastUpdated: -1 }); // Most recent first

    res.json(progress);

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      message: 'Server error fetching progress', 
      error: error.message 
    });
  }
});

// ============================================
// ADD OR UPDATE PROGRESS
// POST /api/progress
// ============================================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { platform, problemsSolved, totalProblems } = req.body;

    // Validate input
    if (!platform || problemsSolved === undefined || totalProblems === undefined) {
      return res.status(400).json({ 
        message: 'Please provide platform, problemsSolved, and totalProblems' 
      });
    }

    // Validate numbers
    if (problemsSolved < 0 || totalProblems < 0) {
      return res.status(400).json({ 
        message: 'Problems cannot be negative' 
      });
    }

    if (problemsSolved > totalProblems) {
      return res.status(400).json({ 
        message: 'Problems solved cannot exceed total problems' 
      });
    }

    // Check if progress exists for this platform
    let progress = await Progress.findOne({ 
      userId: req.userId, 
      platform: platform.trim() 
    });

    if (progress) {
      // Update existing progress
      progress.problemsSolved = problemsSolved;
      progress.totalProblems = totalProblems;
      progress.lastUpdated = Date.now();
      await progress.save();
    } else {
      // Create new progress entry
      progress = new Progress({
        userId: req.userId,
        platform: platform.trim(),
        problemsSolved,
        totalProblems
      });
      await progress.save();
    }

    res.json({ 
      progress,
      message: 'Progress updated successfully' 
    });

  } catch (error) {
    console.error('Add/Update progress error:', error);
    res.status(500).json({ 
      message: 'Server error updating progress', 
      error: error.message 
    });
  }
});

// ============================================
// DELETE PROGRESS ENTRY
// DELETE /api/progress/:id
// ============================================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Find and delete progress entry
    // Make sure it belongs to the logged-in user
    const progress = await Progress.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!progress) {
      return res.status(404).json({ 
        message: 'Progress entry not found or unauthorized' 
      });
    }

    res.json({ 
      message: 'Progress deleted successfully' 
    });

  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ 
      message: 'Server error deleting progress', 
      error: error.message 
    });
  }
});

module.exports = router;