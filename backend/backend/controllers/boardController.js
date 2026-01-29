const Board = require("../models/Board");
const Column = require("../models/Column");
const Task = require("../models/Task");

/**
 * Create Board
 * Admin, Manager
 */
exports.createBoard = async (req, res) => {
  try {
    const board = await Board.create({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get Boards
 * Admin, Manager → all boards
 * Member → only boards having tasks assigned to him
 */
exports.getBoards = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    // ✅ Admin & Manager → see all boards
    if (role === "Admin" || role === "Manager") {
      const boards = await Board.find({}).populate("createdBy", "name email");
      return res.json(boards);
    }

    // ✅ Member → boards where tasks are assigned to him
    const boardIds = await Task.distinct("boardId", {
      assignedTo: userId,
    });

    const boards = await Board.find({ _id: { $in: boardIds } }).populate(
      "createdBy",
      "name email",
    );

    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update Board
 * Admin, Manager
 */
exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    // ✅ Role check
    if (!["Admin", "Manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    board.name = req.body.name ?? board.name;
    board.description = req.body.description ?? board.description;

    const updated = await board.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Board
 * Admin only
 * Cascade delete columns & tasks
 */
exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only Admin can delete board" });
    }

    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    await Promise.all([
      Task.deleteMany({ boardId: id }),
      Column.deleteMany({ boardId: id }),
    ]);

    await Board.findByIdAndDelete(id);

    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
