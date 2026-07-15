const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized: User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware token verify error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized: Token expired or invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized: No token provided' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized: Please log in first' });
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const normalizedRoles = roles.map(r => r.toLowerCase());

    if (normalizedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Access Denied: Insufficient permissions' });
    }
  };
};

const optionalAuthenticateUser = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error('Optional auth middleware token verify error:', error);
    }
  }
  next();
};

module.exports = { authenticateUser, authorizeRoles, optionalAuthenticateUser };


