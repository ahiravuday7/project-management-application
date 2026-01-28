const Column = require("../models/Column");

// Create column
// POST:
exports.createColumn = async (req, res) => {
  const { name, boardId } = req.body;

  try {
    const count = await Column.countDocuments({ boardId });

    const column = await Column.create({
      name,
      boardId,
      order: count + 1,
    });

    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get columns by Board
// GET:
exports.getColumns = async (req, res) => {
  try {
    const columns = await Column.find({
      boardId: req.params.boardId,
    }).sort("order");

    res.json(columns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
