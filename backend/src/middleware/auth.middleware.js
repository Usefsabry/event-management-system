const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to authenticate JWT token
 * Protects routes that require authentication
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Check if token exists
    if (!token) {
      return next(new ApiError('Access denied. No token provided', 401));
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new ApiError('User no longer exists', 401));
      }

      // Add user info to request object
      req.user = {
        userId: user._id,
        email: user.email,
        name: user.name
      };

      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(new ApiError('Token expired', 401));
      } else if (jwtError.name === 'JsonWebTokenError') {
        return next(new ApiError('Invalid token', 401));
      }
      return next(new ApiError('Token verification failed', 401));
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Doesn't block the request if no token, but adds user info if token is valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          req.user = {
            userId: user._id,
            email: user.email,
            name: user.name
          };
        }
      } catch (jwtError) {
        // Ignore JWT errors for optional auth
      }
    }

    next();

  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuth
};