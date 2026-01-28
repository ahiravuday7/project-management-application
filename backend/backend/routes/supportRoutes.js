const express = require("express");
const router = express.Router();
const { createSupportRequest } = require("../controllers/supportController");

router.post("/", createSupportRequest);

module.exports = router;
