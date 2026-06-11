const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error_code: statusCode,
    message: err.message || 'Internal Server Error',
    description: err.description || null
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    error_code: 404,
    message: 'Route not found',
    description: `Cannot ${req.method} ${req.originalUrl}`
  });
};

module.exports = { errorHandler, notFound };