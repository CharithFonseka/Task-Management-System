const { Task, User, Project } = require('../models');
const { sendNotification } = require('../utils/notificationHelper');

// GET ALL TASKS
const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, assigned_to } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assigned_to) filter.assigned_to = assigned_to;

    // Collaborators can only see their own tasks
    if (req.user.role === 'Collaborator') {
      filter.assigned_to = req.user.id;
    }

    const tasks = await Task.findAll({
      where: filter,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Tasks fetched successfully',
      data: tasks
    });

  } catch (error) {
    next(error);
  }
};

// GET SINGLE TASK
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          attributes: ['id', 'title']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        error_code: 404,
        message: 'Task not found',
        description: `No task with id ${req.params.id}`
      });
    }

    // Collaborator can only see their own tasks
    if (req.user.role === 'Collaborator' && task.assigned_to !== req.user.id) {
      return res.status(403).json({
        error_code: 403,
        message: 'Forbidden',
        description: 'You can only view tasks assigned to you'
      });
    }

    res.status(200).json({
      message: 'Task fetched successfully',
      data: task
    });

  } catch (error) {
    next(error);
  }
};

// CREATE TASK — Project Manager only
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      project_id,
      assigned_to,
      priority,
      status,
      due_date
    } = req.body;

    // Check assigned user exists if provided
    if (assigned_to) {
      const assignedUser = await User.findByPk(assigned_to);
      if (!assignedUser) {
        return res.status(404).json({
          error_code: 404,
          message: 'Assigned user not found',
          description: `No user with id ${assigned_to}`
        });
      }
    }

    // Check project exists if provided
    if (project_id) {
      const project = await Project.findByPk(project_id);
      if (!project) {
        return res.status(404).json({
          error_code: 404,
          message: 'Project not found',
          description: `No project with id ${project_id}`
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project_id,
      assigned_to,
      created_by: req.user.id,
      priority: priority || 'Medium',
      status: status || 'To Do',
      due_date
    });

    res.status(201).json({
      message: 'Task created successfully',
      data: task
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE TASK — Project Manager only
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        error_code: 404,
        message: 'Task not found',
        description: `No task with id ${req.params.id}`
      });
    }

    const {
      title,
      description,
      assigned_to,
      priority,
      status,
      due_date
    } = req.body;

    await task.update({
      title,
      description,
      assigned_to,
      priority,
      status,
      due_date
    });

    res.status(200).json({
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE TASK STATUS ONLY — Collaborator
const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        error_code: 404,
        message: 'Task not found',
        description: `No task with id ${req.params.id}`
      });
    }

    // Collaborator can only update their own tasks
    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({
        error_code: 403,
        message: 'Forbidden',
        description: 'You can only update status of tasks assigned to you'
      });
    }

    await task.update({ status: req.body.status });

    res.status(200).json({
      message: 'Task status updated successfully',
      data: task
    });

  } catch (error) {
    next(error);
  }
};

// DELETE TASK — Project Manager only
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        error_code: 404,
        message: 'Task not found',
        description: `No task with id ${req.params.id}`
      });
    }

    await task.destroy();

    res.status(200).json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};