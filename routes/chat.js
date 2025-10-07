const express = require("express");
const multer = require('multer');
const upload = multer();
const router = express.Router();
const chatController = require("../controllers/chatController");
const videoController = require('../controllers/videoController');

// 메시지 조회
router.get("/messages/:roomId", chatController.getMessagesByRoom);
router.get("/rooms", chatController.getUserChatRooms);
router.get('/socket-id', videoController.getSocketIdByEmail);
router.post('/upload', upload.single('file'), chatController.uploadChatFile);

module.exports = router;
