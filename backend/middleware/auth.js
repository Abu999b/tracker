// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes
 * Verifies JWT token and adds userId to request
 */
const authMiddleware = (req, res, next) => {
  // Get token from Authorization header
  // Format: "Bearer <token>"
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      message: 'No token provided, authorization denied' 
    });
  }

  try {
    // Verify token with secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add userId to request object
    req.userId = decoded.userId;
    
    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({ 
      message: 'Token is not valid or has expired' 
    });
  }
};

module.exports = authMiddleware;