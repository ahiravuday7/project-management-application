const express = require("express");

const {
  createBoard,
  getBoards,
  updateBoard,
  deleteBoard,
} = require("../controllers/boardController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin & Manager only
//POST:  /api/boards/
router.post("/", protect, authorizeRoles("Admin", "Manager"), createBoard);

// All logged in users
// GET: /api/boards/
router.get("/", protect, getBoards);

// edit
//  PUT: /api/boards/:id
router.put("/:id", protect, authorizeRoles("Admin", "Manager"), updateBoard);

//  DELETE: /api/boards/:id
router.delete("/:id", protect, authorizeRoles("Admin", "Manager"), deleteBoard);

module.exports = router;
