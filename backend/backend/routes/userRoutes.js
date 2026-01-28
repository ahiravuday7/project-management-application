const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getAllUsers, getMyProfile } = require("../controllers/userController");

const router = express.Router();

// Team page – get all registered users
router.get("/", protect, getAllUsers);

// Logged-in user profile
router.get("/me", protect, getMyProfile);

module.exports = router;
