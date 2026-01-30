const socketIO = require("socket.io");

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    // Join Board room
    socket.on("joinBoard", (boardId) => {
      socket.join(boardId);
      console.log(`User joined board ${boardId}`);
    });

    // ✅ Join per-user room for notifications
    socket.on("joinUser", (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      console.log(`User ${socket.id} joined room user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: ", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
