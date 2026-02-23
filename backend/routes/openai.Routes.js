const express = require("express");
const { chatWithBot } = require("../controllers/chatController");
const { verifyUser } = require("../middleware/authMiddleware");

const router = express.Router()

router.post("/chat", verifyUser, chatWithBot)

module.exports = router;