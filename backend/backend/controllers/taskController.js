const Task = require("../models/Task");
const { getIO } = require("../socket/socket");

// Create Task
// Post:
exports.createTask = async (req, res) => {
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

    // Populate before sending
    const populatedTask = await task.populate("assignedTo", "name email");

    // Socket EMIT
    const io = getIO();
    io.to(boardId.toString()).emit("taskCreated", populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Task by Board
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      boardId: req.params.boardId,
    })
      .populate("assignedTo", "name email")
      .sort("createdAt");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the task (move, assign, edit)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const io = getIO();
    io.to(task.boardId.toString()).emit("taskUpdated", task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    const io = getIO();
    io.to(task.boardId.toString()).emit("taskDeleted", task._id);

    res.json({ message: "Task Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start Timer
exports.startTimer = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task.timer.isRunning) {
    task.timer.isRunning = true;
    task.timer.startedAt = new Date();
    await task.save();
  }

  res.json(task);
};

// Stop Timer
exports.stopTimer = async (req, res) => {
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
