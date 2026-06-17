const { Notification } = require('../models');
const { getIO } = require('./socket');

const sendNotification = async (userId, message) => {
  try {
    // Save notification to database
    // This ensures offline users get it when they reconnect
    const notification = await Notification.create({
      user_id: userId,
      message,
      is_read: false
    });

    // Send real-time notification if user is online
    try {
      const io = getIO();
      io.sendNotification(userId, {
        id: notification.id,
        message,
        is_read: false,
        createdAt: notification.createdAt
      });
    } catch (err) {
      // Socket not initialized yet — that's ok
      console.log('Socket not ready:', err.message);
    }

    return notification;

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

module.exports = { sendNotification };