// Role check middleware — roles pass an array 
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        errorCode: 'FORBIDDEN',
        message: 'Forbidden',
        description: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };