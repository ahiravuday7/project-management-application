const Task = require("../models/Task");
const { getIO } = require("../socket/socket");

// ✅ Create Task
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
      createdBy: req.user?.id,
    });

    const populatedTask = await task.populate("assignedTo", "name email");

    const io = getIO();
    io.to(boardId.toString()).emit("taskCreated", populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Tasks by Board
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ boardId: req.params.boardId })
      .populate("assignedTo", "name email")
      .sort("createdAt");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Task (edit OR move column)
exports.updateTask = async (req, res) => {
  try {
    const existing = await Task.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const prevColumnId = String(existing.columnId);

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignedTo", "name email");

    const io = getIO();

    // ✅ If column changed, emit taskMoved
    if (req.body.columnId && String(req.body.columnId) !== prevColumnId) {
      io.to(task.boardId.toString()).emit("taskMoved", {
        taskId: task._id,
        columnId: task.columnId,
        boardId: task.boardId,
      });
    }

    // ✅ Always emit taskUpdated (for title/desc/assignedTo edits)
    io.to(task.boardId.toString()).emit("taskUpdated", task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Task
exports.deleteTask = async (req, res) => {
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

// ✅ Start Timer
exports.startTimer = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task.timer.isRunning) {
    task.timer.isRunning = true;
    task.timer.startedAt = new Date();
    await task.save();
  }

  res.json(task);
};

// ✅ Stop Timer
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
