const { Notification } = require('../models');

// GET ALL NOTIFICATIONS FOR LOGGED IN USER
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20 // last 20 notifications
    });

    res.status(200).json({
      message: 'Notifications fetched successfully',
      data: notifications
    });

  } catch (error) {
    next(error);
  }
};

// MARK NOTIFICATION AS READ
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({
        error_code: 404,
        message: 'Notification not found',
        description: `No notification with id ${req.params.id}`
      });
    }

    // Only owner can mark as read
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        error_code: 403,
        message: 'Forbidden',
        description: 'You can only mark your own notifications as read'
      });
    }

    await notification.update({ is_read: true });

    res.status(200).json({
      message: 'Notification marked as read'
    });

  } catch (error) {
    next(error);
  }
};

// MARK ALL AS READ
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id } }
    );

    res.status(200).json({
      message: 'All notifications marked as read'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};