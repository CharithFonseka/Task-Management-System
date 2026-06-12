const db = require('../config/db');
const bcrypt = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwtUtils');

// Login service
const loginUser = async (email, password) => {
 
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

  if (rows.length === 0) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const user = rows[0];

  //  Check account activation
  if (!user.is_active) {
    throw { status: 403, message: 'Account is deactivated. Contact admin.' };
  }

  //  Compare Password 
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);


console.log("Access Token:", accessToken);
console.log("Refresh Token:", refreshToken);

  // Refresh token save in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, refreshToken, expiresAt]
  );

  return {
    accessToken,
    refreshToken,
    isFirstLogin: user.is_first_login,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

// Password reset (first login)
const resetPassword = async (userId, newPassword) => {
  // Validate password policy
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    throw {
      status: 400,
      message: 'Password must be 8+ chars with uppercase, lowercase, number and special character',
    };
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await db.query(
    'UPDATE users SET password = ?, is_first_login = FALSE WHERE id = ?',
    [hashed, userId]
  );
};


const refreshAccessToken = async (refreshToken) => {
  const [rows] = await db.query(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
    [refreshToken]
  );

  if (rows.length === 0) {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  const decoded = verifyRefreshToken(refreshToken);
  const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

  if (users.length === 0) {
    throw { status: 401, message: 'User not found' };
  }

  const newAccessToken = generateAccessToken(users[0]);
  return { accessToken: newAccessToken };
};

// Logout — delete refresh token 
const logoutUser = async (refreshToken) => {
  await db.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
};

module.exports = { loginUser, resetPassword, refreshAccessToken, logoutUser };