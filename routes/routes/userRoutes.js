const express = require('express');
const router = express.Router();
const { create, getAll, getOne, update, deactivate } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { body } = require('express-validator');

router.use(authenticate, authorizeRoles('Admin'));

// Create user
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('role').isIn(['Admin', 'Project Manager', 'Collaborator']).withMessage('Invalid role'),
], create);

// Get all users (search + filter)
router.get('/', getAll);

// Get single user
router.get('/:id', getOne);

// Update user
router.put('/:id', update);

// Deactivate user
router.delete('/:id', deactivate);

module.exports = router;