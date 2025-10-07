const express = require('express');
const router = express.Router();

const {
    sendCode,
    verifyCode,
    register,
    tempStore,
    login
  } = require('../controllers/authController');
  
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode); 
router.post('/register', register);
router.post('/temp-store', tempStore);
router.post('/login', login);

module.exports = router;
