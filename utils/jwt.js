const jwt = require('jsonwebtoken');

/**
 * JWT 토큰을 생성하는 함수
 * @param {Object} payload - 토큰에 담을 사용자 정보 (ex: { email: 'user@example.com' })
 * @returns {string} 생성된 JWT 토큰
 */
exports.signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN // .env에서 만료시간 설정 (예: '1d')
  });
};

/**
 * JWT 토큰을 검증하는 함수
 * @param {string} token - 클라이언트가 보낸 토큰
 * @returns {Object} 디코딩된 payload 정보 (성공 시) 또는 에러 발생
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
