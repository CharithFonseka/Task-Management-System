const { verifyAccessToken } = require('../utils/jwtUtils');

const authenticate = (req, res, next) => {
  // Authorization take tokens from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      errorCode: 'NO_TOKEN',
      message: 'Unauthorized',
      description: 'Access token is required',
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, role } middleware
    next();
  } catch (err) {
    return res.status(401).json({
      errorCode: 'INVALID_TOKEN',
      message: 'Unauthorized',
      description: 'Token is invalid or expired',
    });
  }
};

module.exports = { authenticate };