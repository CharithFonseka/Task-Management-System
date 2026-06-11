const express = require('express');
const router = express.Router();
const {
  getCommentsByTask,
  createComment,
  deleteComment
} = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateCreateComment } = require('../middleware/validationMiddleware');

// Get all comments for a task
router.get('/task/:task_id', verifyToken, getCommentsByTask);

// Create comment
router.post('/', verifyToken, validateCreateComment, createComment);

// Delete comment
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;