const express = require('express');
const router = express.Router();
const {
  getAttachmentsByTask,
  createAttachment,
  deleteAttachment
} = require('../controllers/attachmentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateCreateAttachment } = require('../middleware/validationMiddleware');

// Get all attachments for a task
router.get('/task/:task_id', verifyToken, getAttachmentsByTask);

// Create attachment
router.post('/', verifyToken, validateCreateAttachment, createAttachment);

// Delete attachment
router.delete('/:id', verifyToken, deleteAttachment);

module.exports = router;