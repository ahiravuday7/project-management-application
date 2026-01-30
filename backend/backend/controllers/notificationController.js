const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  try {
    console.log(req.user.id);
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notif)
      return res.status(404).json({ message: "Notification not found" });

    if (!notif.isRead) {
      notif.isRead = true;
      notif.readAt = new Date();
      await notif.save();
    }

    res.json({ notification: notif });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
