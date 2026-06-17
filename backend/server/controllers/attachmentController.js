const { Attachment, User, Task } = require('../models');

// GET ALL ATTACHMENTS FOR A TASK
const getAttachmentsByTask = async (req, res, next) => {
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

    const attachments = await Attachment.findAll({
      where: { task_id },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Attachments fetched successfully',
      data: attachments
    });

  } catch (error) {
    next(error);
  }
};

// CREATE ATTACHMENT
const createAttachment = async (req, res, next) => {
  try {
    const { task_id, file_url, file_name } = req.body;

    // Check task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({
        error_code: 404,
        message: 'Task not found',
        description: `No task with id ${task_id}`
      });
    }

    // Collaborator can only attach to their assigned tasks
    if (req.user.role === 'Collaborator' && task.assigned_to !== req.user.id) {
      return res.status(403).json({
        error_code: 403,
        message: 'Forbidden',
        description: 'You can only add attachments to tasks assigned to you'
      });
    }

    const attachment = await Attachment.create({
      task_id,
      uploaded_by: req.user.id,
      file_url,
      file_name
    });

    res.status(201).json({
      message: 'Attachment created successfully',
      data: attachment
    });

  } catch (error) {
    next(error);
  }
};

// DELETE ATTACHMENT
const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);

    if (!attachment) {
      return res.status(404).json({
        error_code: 404,
        message: 'Attachment not found',
        description: `No attachment with id ${req.params.id}`
      });
    }

    // Only uploader or Admin can delete
    if (attachment.uploaded_by !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        error_code: 403,
        message: 'Forbidden',
        description: 'You can only delete your own attachments'
      });
    }

    await attachment.destroy();

    res.status(200).json({
      message: 'Attachment deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttachmentsByTask,
  createAttachment,
  deleteAttachment
};