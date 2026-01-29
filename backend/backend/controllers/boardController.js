const Board = require("../models/Board");
const Column = require("../models/Column");
const Task = require("../models/Task");

// Create Board
exports.createBoard = async (req, res) => {
  try {
    const board = await Board.create({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.user.id,
      members: [req.user.id],
    });
    console.log("USER: ", req.user);
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Board
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      members: req.user.id,
    }).populate("createdBy", "name email");

    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Board (rename / update description)
exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    // must be member
    const isMember = (board.members || []).some(
      (m) => String(m) === String(req.user.id),
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    board.name = req.body.name ?? board.name;
    board.description = req.body.description ?? board.description;

    const updated = await board.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete Board + cascade delete columns + tasks
exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);
    if (!board) return res.status(404).json({ message: "Board not found" });

    // must be member
    const isMember = (board.members || []).some(
      (m) => String(m) === String(req.user.id),
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    await Promise.all([
      Task.deleteMany({ boardId: id }),
      Column.deleteMany({ boardId: id }),
    ]);

    await Board.findByIdAndDelete(id);

    res.json({ message: "Board deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
