const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error_code: 401,
      message: 'Unauthorized',
      description: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error_code: 401,
      message: 'Unauthorized',
      description: 'Invalid or expired token'
    });
  }
};

// Check role — pass allowed roles as array
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error_code: 403,
        message: 'Forbidden',
        description: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };