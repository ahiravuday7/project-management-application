const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const authRoutes = require("./routes/authRoutes");
const boardRoutes = require("./routes/boardRoutes");
const columnRoutes = require("./routes/columnRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { initSocket } = require("./socket/socket");
const userRoutes = require("./routes/userRoutes");
const supportRoutes = require("./routes/supportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
dotenv.config();

const connectDB = require("./config/db");
connectDB();

const app = express();
const server = http.createServer(app);

// Add Socket
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/notifications", notificationRoutes);
// Test route
app.get("/", (req, res) => {
  res.send("Project Management API Running");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
