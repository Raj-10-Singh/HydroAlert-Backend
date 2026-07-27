const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*' },
    pingTimeout: 60000
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User joins their flood zone room
    socket.on('join-zone', (zoneId) => {
      socket.join(zoneId);
      console.log(`📍 Socket ${socket.id} joined zone: ${zoneId}`);
      socket.emit('zone-joined', { zoneId, message: `Watching zone: ${zoneId}` });
    });

    // User leaves a zone
    socket.on('leave-zone', (zoneId) => {
      socket.leave(zoneId);
      console.log(`👋 Socket ${socket.id} left zone: ${zoneId}`);
    });

    // Rescue team broadcasts their location
    socket.on('rescue-location', (data) => {
      const { zoneId, latitude, longitude, rescueId } = data;
      io.to(zoneId).emit('rescue-update', { rescueId, latitude, longitude });
    });

    // Water level update from sensor/admin
    socket.on('water-level-update', (data) => {
      const { zoneId, waterLevel, riskLevel } = data;
      io.to(zoneId).emit('zone-status-update', { zoneId, waterLevel, riskLevel });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };