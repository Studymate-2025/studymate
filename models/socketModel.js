// models/socketModel.js

const client = require('../utils/redis'); // 외부 redis 인스턴스 사용

exports.setSocketId = async (email, socketId) => {
  try {
    await client.set(`email:${email}`, socketId);
    await client.set(`socket:${socketId}`, email);
    console.log(`✅ Redis 저장 완료: ${email} -> ${socketId}`);
  } catch (err) {
    console.error("❌ Redis setSocketId 오류:", err);
  }
};

exports.getSocketId = async (email) => {
  try {
    const socketId = await client.get(`email:${email}`);
    console.log(`📡 Redis에서 socketId 조회: ${email} -> ${socketId}`);
    return socketId;
  } catch (err) {
    console.error("❌ Redis getSocketId 오류:", err);
    return null;
  }
};

exports.removeSocketId = async (socketId) => {
  try {
    const email = await client.get(`socket:${socketId}`);
    if (email) {
      await client.del(`email:${email}`);
      await client.del(`socket:${socketId}`);
      console.log(`🗑️ Redis에서 제거 완료: ${email}, ${socketId}`);
    }
  } catch (err) {
    console.error("❌ Redis removeSocketId 오류:", err);
  }
};
