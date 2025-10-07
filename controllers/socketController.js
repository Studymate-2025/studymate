// controllers/socketController.js

const socketModel = require('../models/socketModel');

exports.getSocketIdByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "이메일 누락" });
  }

  try {
    const socketId = await socketModel.getSocketId(email);  // <-- ✅ async/await 적용
    console.log('✅ [API] 소켓 요청 이메일:', email);
    console.log('🟡 [API] Redis에서 가져온 socketId:', socketId);

    if (!socketId) {
      return res.status(404).json({ message: "해당 사용자의 socketId 없음" });
    }

    return res.json({ socketId });
  } catch (err) {
    console.error('❌ [API] Redis getSocketId 오류:', err);
    return res.status(500).json({ message: "서버 오류" });
  }
};
