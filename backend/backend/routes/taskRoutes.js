const express = require("express");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  startTimer,
  stopTimer,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create Task
router.post("/", protect, createTask);

// Get Tasks
router.get("/:boardId", protect, getTasks);

// Update the Task
router.put("/:id", protect, updateTask);

// Delete the Task
router.delete("/:id", protect, deleteTask);

// Start timer
router.post("/:id/start", protect, startTimer);

// Stop Timer
router.post("/:id/stop", protect, stopTimer);

module.exports = router;
