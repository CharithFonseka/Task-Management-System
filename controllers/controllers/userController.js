const { createUser, getAllUsers, getUserById, updateUser, deactivateUser } = require('../services/userService');
const { validationResult } = require('express-validator');

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errorCode: 'VALIDATION_ERROR', message: 'Validation failed', description: errors.array() });
  }
  try {
    const user = await createUser(req.body);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const { search, role } = req.query;
    const users = await getAllUsers(search, role);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getOne = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const deactivate = async (req, res) => {
  try {
    await deactivateUser(req.params.id);
    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { create, getAll, getOne, update, deactivate };