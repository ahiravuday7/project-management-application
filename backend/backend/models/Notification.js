const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["SUPPORT_REQUEST"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: {
      supportId: { type: mongoose.Schema.Types.ObjectId, ref: "Support" },
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
