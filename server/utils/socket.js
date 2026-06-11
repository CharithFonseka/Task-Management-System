let io;

const initSocket = (server) => {
  const { Server } = require('socket.io');

  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // React frontend
      methods: ['GET', 'POST']
    }
  });

  // Store connected users
  // key = userId, value = socketId
  const connectedUsers = {};

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // When user logs in — register their socket
    socket.on('register', (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    });

    // When user disconnects
    socket.on('disconnect', () => {
      // Remove user from connected users
      Object.keys(connectedUsers).forEach((userId) => {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
          console.log(`❌ User ${userId} disconnected`);
        }
      });
    });
  });

  // Function to send notification to specific user
  io.sendNotification = (userId, notification) => {
    const socketId = connectedUsers[userId];
    if (socketId) {
      // User is online — send immediately
      io.to(socketId).emit('notification', notification);
      console.log(`✅ Notification sent to user ${userId}`);
    } else {
      // User is offline — will be stored in DB
      console.log(`⚠️ User ${userId} is offline — notification stored in DB`);
    }
  };

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };