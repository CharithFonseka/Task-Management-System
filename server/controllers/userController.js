const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { sendWelcomeEmail } = require('../utils/emailHelper');

// GET ALL USERS — Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // never send password
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Users fetched successfully',
      data: users
    });

  } catch (error) {
    next(error);
  }
};

// GET SINGLE USER — Admin only
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        error_code: 404,
        message: 'User not found',
        description: `No user with id ${req.params.id}`
      });
    }

    res.status(200).json({
      message: 'User fetched successfully',
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// CREATE USER — Admin only
const createUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        error_code: 400,
        message: 'Email already exists',
        description: 'Please use a different email address'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + '@Tms1';
    const hashed = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      is_active: true,
      must_reset_password: true
    });

    // Send welcome email with temp password
    await sendWelcomeEmail(email, name, tempPassword);

    res.status(201).json({
      message: 'User created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        temp_password: tempPassword // remove this in production
      }
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE USER — Admin only
const updateUser = async (req, res, next) => {
  try {
    const { name, role } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        error_code: 404,
        message: 'User not found',
        description: `No user with id ${req.params.id}`
      });
    }

    await user.update({ name, role });

    res.status(200).json({
      message: 'User updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

// DEACTIVATE USER — Admin only
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error_code: 404,
        message: 'User not found',
        description: `No user with id ${req.params.id}`
      });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        error_code: 400,
        message: 'Cannot deactivate yourself',
        description: 'Ask another admin to deactivate your account'
      });
    }

    await user.update({ is_active: false });

    res.status(200).json({
      message: 'User deactivated successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser
};