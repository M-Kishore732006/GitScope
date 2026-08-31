const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token without password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
         return res.status(401).json({ message: 'User not found' });
      }

      if (req.user.status === 'deactivated' || req.user.status === 'inactive') {
        return res.status(403).json({ message: 'Your account is deactivated or inactive. Access denied.' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Support both 'staff' and 'teacher' interchangeably for staff role authorization
    const userRole = req.user.role;
    const expandedRoles = roles.flatMap(r => r === 'staff' ? ['staff', 'teacher'] : r === 'teacher' ? ['teacher', 'staff'] : [r]);

    if (!expandedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `User role ${userRole} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
