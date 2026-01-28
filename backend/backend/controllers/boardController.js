const Board = require("../models/Board");

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

        res.json(boards)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}
