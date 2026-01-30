const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} = require("../controllers/notificationController");

router.use(protect, authorizeRoles("Admin", "Manager"));

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/mark-all-read", markAllRead);
router.patch("/:id/read", markAsRead);

module.exports = router;
