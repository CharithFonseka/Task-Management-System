const { loginUser, resetPassword, refreshAccessToken, logoutUser } = require('../services/authService');
const { validationResult } = require('express-validator');

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errorCode: 'VALIDATION_ERROR', message: 'Validation failed', description: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ errorCode: 'LOGIN_FAILED', message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    await resetPassword(req.user.id, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ errorCode: 'PASSWORD_RESET_FAILED', message: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
    const result = await refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await logoutUser(refreshToken);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

module.exports = { login, changePassword, refresh, logout };