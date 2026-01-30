const Support = require("../models/Support");
const User = require("../models/User");

const Notification = require("../models/Notification");
const { getIO } = require("../socket/socket");

exports.createSupportRequest = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const ticket = await Support.create({
      name,
      email,
      message,
    });

    // ✅ Notify Admins and Managers
    const receivers = await User.find({
      role: { $in: ["Admin", "Manager"] },
    }).select("_id");
    console.log("receivers:", receivers);

    if (receivers.length) {
      const title = "New Contact Support Request";
      const body = `${name} (${email}) submitted a support request.`;

      const docs = receivers.map((u) => ({
        recipient: u._id,
        type: "SUPPORT_REQUEST",
        title,
        body,
        data: { supportId: ticket._id },
      }));

      const created = await Notification.insertMany(docs);
      console.log("created:", created);
      // ✅ realtime push
      try {
        const io = getIO();
        created.forEach((n) => {
          io.to(`user:${n.recipient.toString()}`).emit("notification:new", n);
        });
      } catch (_) {}
    }

    res.status(201).json({
      message: "Support request submitted successfully",
      ticket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin/Manager: list all support tickets
exports.getSupportRequests = async (req, res) => {
  try {
    const tickets = await Support.find().sort({ createdAt: -1 }).limit(200);
    res.json({ tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin/Manager: get one support ticket
exports.getSupportRequestById = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json({ ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
