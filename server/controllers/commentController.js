const { Comment, User, Task } = require('../models');
const { sendNotification } = require('../utils/notificationHelper');

// GET ALL COMMENTS FOR A TASK
const getCommentsByTask = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    // Check task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({
        error_code: 404,
        message: 'Task not found',
        description: `No task with id ${task_id}`
      });
    }

    const comments = await Comment.findAll({
      where: { task_id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      message: 'Comments fetched successfully',
      data: comments
    });

  } catch (error) {
    next(error);
  }
};

// CREATE COMMENT
const createComment = async (req, res, next) => {
  try {
    const { task_id, content } = req.body;

    // Check task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({
        error_code: 404,
        message: 'Task not found',
        description: `No task with id ${task_id}`
      });
    }

    // Collaborator can only comment on their assigned tasks
    if (req.user.role === 'Collaborator' && task.assigned_to !== req.user.id) {
      return res.status(403).json({
        error_code: 403,
        message: 'Forbidden',
        description: 'You can only comment on tasks assigned to you'
      });
    }

    const comment = await Comment.create({
      task_id,
      user_id: req.user.id,
      content
    });

    // Notify task creator about new comment
    if (task.created_by && task.created_by !== req.user.id) {
      await sendNotification(
        task.created_by,
        `New comment on task "${task.title}"`
      );
    }

    // Fetch comment with user details
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Comment created successfully',
      data: commentWithUser
    });

  } catch (error) {
    next(error);
  }
};

// DELETE COMMENT
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        error_code: 404,
        message: 'Comment not found',
        description: `No comment with id ${req.params.id}`
      });
    }

    // Only comment owner or Admin can delete
    if (comment.user_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        error_code: 403,
        message: 'Forbidden',
        description: 'You can only delete your own comments'
      });
    }

    await comment.destroy();

    res.status(200).json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByTask,
  createComment,
  deleteComment
};