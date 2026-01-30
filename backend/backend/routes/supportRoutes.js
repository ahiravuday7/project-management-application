const express = require("express");
const router = express.Router();

const {
  createSupportRequest,
  getSupportRequests,
  getSupportRequestById,
} = require("../controllers/supportController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// ✅ Any logged-in user (Admin/Manager/Member) can submit support
router.post("/", protect, createSupportRequest);

// Admin/Manager views
router.get(
  "/",
  protect,
  authorizeRoles("Admin", "Manager"),
  getSupportRequests,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("Admin", "Manager"),
  getSupportRequestById,
);

module.exports = router;
