const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error_code: 400,
      message: 'Bad Request',
      description: errors.array()
    });
  }
  next();
};

// Login validation rules
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation
];

// Reset password validation rules
const validateResetPassword = [
  body('new_password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number')
    .matches(/[!@#$%^&*]/).withMessage('Must contain a special character'),
  handleValidation
];
// Create user validation
const validateCreateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role')
    .isIn(['Admin', 'Project Manager', 'Collaborator'])
    .withMessage('Role must be Admin, Project Manager, or Collaborator'),
  handleValidation
];

// Update user validation
const validateUpdateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('role')
    .isIn(['Admin', 'Project Manager', 'Collaborator'])
    .withMessage('Role must be Admin, Project Manager, or Collaborator'),
  handleValidation
];

// Create task validation
const validateCreateTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('priority')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .isIn(['To Do', 'In Progress', 'Completed'])
    .withMessage('Status must be To Do, In Progress, or Completed'),
  body('due_date')
    .optional()
    .isDate()
    .withMessage('Due date must be a valid date'),
  handleValidation
];

// Update task validation
const validateUpdateTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('priority')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .isIn(['To Do', 'In Progress', 'Completed'])
    .withMessage('Status must be To Do, In Progress, or Completed'),
  body('due_date')
    .optional()
    .isDate()
    .withMessage('Due date must be a valid date'),
  handleValidation
];

// Update task status validation — for Collaborators
const validateUpdateStatus = [
  body('status')
    .isIn(['To Do', 'In Progress', 'Completed'])
    .withMessage('Status must be To Do, In Progress, or Completed'),
  handleValidation
];

// Comment validation
const validateCreateComment = [
  body('content').notEmpty().withMessage('Comment content is required'),
  body('task_id').notEmpty().withMessage('Task ID is required'),
  handleValidation
];

// Attachment validation
const validateCreateAttachment = [
  body('task_id').notEmpty().withMessage('Task ID is required'),
  body('file_url').notEmpty().withMessage('File URL is required'),
  body('file_name').notEmpty().withMessage('File name is required'),
  handleValidation
];

module.exports = {
  validateLogin,
  validateResetPassword,
  validateCreateUser,
  validateUpdateUser,
  validateCreateTask,
  validateUpdateTask,
  validateUpdateStatus,
  validateCreateComment,
  validateCreateAttachment
};