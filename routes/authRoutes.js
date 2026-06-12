const express = require('express');
const router = express.Router();
const { login, changePassword, refresh, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

// validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validateRequest,
  login
);

// Reset password
router.post('/reset-password', authenticate, changePassword);

// Refresh token
router.post('/refresh-token', refresh);

// Logout
router.post('/logout', logout);

module.exports = router;