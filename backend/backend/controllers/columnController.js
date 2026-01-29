const Column = require("../models/Column");
const Task = require("../models/Task");

// ✅ Create column
// POST: /columns
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

// ✅ Get columns by board
// GET: /columns/:boardId
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

// ✅ UPDATE column
// PUT: /columns/:id
exports.updateColumn = async (req, res) => {
  try {
    // Your frontend sends { name }
    const { name } = req.body;

    const column = await Column.findByIdAndUpdate(
      req.params.id,
      { name }, // ✅ update correct field
      { new: true },
    );

    if (!column) return res.status(404).json({ message: "Column not found" });

    res.json(column);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE column (+ delete tasks inside it)
// DELETE: /columns/:id
exports.deleteColumn = async (req, res) => {
  try {
    const column = await Column.findById(req.params.id);
    if (!column) return res.status(404).json({ message: "Column not found" });

    // ✅ delete tasks linked to this column
    await Task.deleteMany({ columnId: column._id });

    // ✅ delete column
    await Column.findByIdAndDelete(column._id);

    res.json({ message: "Column deleted successfully", columnId: column._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
