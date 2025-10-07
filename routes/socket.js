// routes/socket.js

const express = require('express');
const router = express.Router();
const socketController = require('../controllers/socketController');

router.get('/socket-id', socketController.getSocketIdByEmail);

module.exports = router;
