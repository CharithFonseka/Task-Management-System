const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendPasswordResetEmail } = require('../utils/emailHelper');

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error_code: 401,
        message: 'Invalid credentials',
        description: 'No account found with this email'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        error_code: 403,
        message: 'Account deactivated',
        description: 'Contact your administrator'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error_code: 401,
        message: 'Invalid credentials',
        description: 'Incorrect password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        must_reset_password: user.must_reset_password
      }
    });

  } catch (error) {
    res.status(500).json({
      error_code: 500,
      message: 'Internal server error',
      description: error.message
    });
  }
};

// RESET PASSWORD (first login)
const resetPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    const userId = req.user.id;

    // Hash new password
    const hashed = await bcrypt.hash(new_password, 10);

    await User.update(
      { password: hashed, must_reset_password: false },
      { where: { id: userId } }
    );

    // ✅ Send confirmation email
    const user = await User.findByPk(userId);
    await sendPasswordResetEmail(user.email, user.name);

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({
      error_code: 500,
      message: 'Internal server error',
      description: error.message
    });
  }
};

// UPDATE PROFILE (self-service — any authenticated user)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, current_password, new_password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error_code: 404, message: 'User not found' });
    }

    const updates = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error_code: 400, message: 'Current password is required to set a new password' });
      }
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error_code: 401, message: 'Current password is incorrect' });
      }
      if (new_password.length < 8) {
        return res.status(400).json({ error_code: 400, message: 'New password must be at least 8 characters' });
      }
      updates.password = await bcrypt.hash(new_password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error_code: 400, message: 'No changes provided' });
    }

    await User.update(updates, { where: { id: userId } });
    const updated = await User.findByPk(userId);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        must_reset_password: updated.must_reset_password,
      },
    });
  } catch (error) {
    res.status(500).json({ error_code: 500, message: 'Internal server error', description: error.message });
  }
};

module.exports = { login, resetPassword, updateProfile };