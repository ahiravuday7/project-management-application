const Task = require("../models/Task");
const Board = require("../models/Board");
const { getIO } = require("../socket/socket");

/**
 * Helper: check board access
 */
async function canAccessBoard(boardId, user) {
  if (user.role === "Admin" || user.role === "Manager") return true;

  // Member: must have task assigned in this board
  const count = await Task.countDocuments({
    boardId,
    assignedTo: user.id,
  });

  return count > 0;
}

/**
 * Create Task
 * Admin, Manager
 */
exports.createTask = async (req, res) => {
  if (!["Admin", "Manager"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const { title, description, boardId, columnId, assignedTo } = req.body;

  if (!title || !boardId || !columnId) {
    return res.status(400).json({ message: "Missing required fields!" });
  }

  try {
    const task = await Task.create({
      title,
      description,
      boardId,
      columnId,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
    });

    const populatedTask = await task.populate("assignedTo", "name email");

    const io = getIO();
    io.to(boardId.toString()).emit("taskCreated", populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get Tasks by Board
 * Admin, Manager → all tasks
 * Member → only assigned tasks
 */
exports.getTasks = async (req, res) => {
  try {
    const { boardId } = req.params;

    const hasAccess = await canAccessBoard(boardId, req.user);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    let query = { boardId };

    if (req.user.role === "Member") {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .sort("createdAt");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update Task
 * Admin, Manager
 */
exports.updateTask = async (req, res) => {
  if (!["Admin", "Manager"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const existing = await Task.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const prevColumnId = String(existing.columnId);

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignedTo", "name email");

    const io = getIO();

    if (req.body.columnId && String(req.body.columnId) !== prevColumnId) {
      io.to(task.boardId.toString()).emit("taskMoved", {
        taskId: task._id,
        columnId: task.columnId,
        boardId: task.boardId,
      });
    }

    io.to(task.boardId.toString()).emit("taskUpdated", task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Task
 * Admin, Manager
 */
exports.deleteTask = async (req, res) => {
  if (!["Admin", "Manager"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.findByIdAndDelete(req.params.id);

    const io = getIO();
    io.to(task.boardId.toString()).emit("taskDeleted", {
      taskId: task._id,
      boardId: task.boardId,
    });

    res.json({ message: "Task deleted successfully", taskId: task._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Start Timer
 * Admin, Manager
 */
exports.startTimer = async (req, res) => {
  if (!["Admin", "Manager"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const task = await Task.findById(req.params.id);

  if (!task.timer.isRunning) {
    task.timer.isRunning = true;
    task.timer.startedAt = new Date();
    await task.save();
  }

  res.json(task);
};

/**
 * Stop Timer
 * Admin, Manager
 */
exports.stopTimer = async (req, res) => {
  if (!["Admin", "Manager"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const task = await Task.findById(req.params.id);

  if (task.timer.isRunning) {
    const diff = (Date.now() - task.timer.startedAt.getTime()) / 1000;
    task.timer.totalSeconds += Math.floor(diff);
    task.timer.isRunning = false;
    task.timer.startedAt = null;
    await task.save();
  }

  res.json(task);
};
