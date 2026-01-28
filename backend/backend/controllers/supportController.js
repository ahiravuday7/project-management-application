const Support = require("../models/Support");

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

    res.status(201).json({
      message: "Support request submitted successfully",
      ticket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
