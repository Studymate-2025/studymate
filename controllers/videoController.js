const socketModel = require('../models/socketModel');

exports.getSocketIdByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: '이메일이 필요합니다.' });
  }

  try {
    const socketId = await socketModel.getSocketId(email);

    if (!socketId) {
      return res.status(404).json({ message: '소켓 ID를 찾을 수 없습니다.' });
    }

    res.status(200).json({ socketId });
  } catch (err) {
    console.error('❌ Redis 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};
